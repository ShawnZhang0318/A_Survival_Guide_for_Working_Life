import { cardsData } from "./cards.js?v=donation-free-2";

const METRICS = ["health", "money", "social", "hair"];
const STARTING_VALUE = 50;
const SWIPE_THRESHOLD = 84;

const METRIC_LABELS = {
  health: "健康",
  money: "存款",
  social: "人际",
  hair: "发量"
};

const ENDINGS = {
  health: {
    low: ["【ICU 守卫者】", "连续加班导致体能崩溃，被紧急送进 ICU。"],
    high: ["【脱离红尘去修仙】", "身体太棒了，决定辞职去终南山修身养性。"]
  },
  money: {
    low: ["【破产回老家种田】", "钱包比脸还干净，只能收拾行李回老家。"],
    high: ["【财务自由把老板炒了】", "存够了钱，直接把辞职信甩老板脸上！"]
  },
  social: {
    low: ["【孤勇者社恐】", "得罪了所有人，连公司门卫大爷都懒得理你。"],
    high: ["【职场交际花】", "光顾着到处聊天拉拢关系，被 HR 以无心工作开除。"]
  },
  hair: {
    low: ["【一尘不染光头强】", "头发掉光，因头顶反光过于刺眼被行政劝退。"],
    high: ["【金毛狮王假发代言人】", "头发过于浓密遮挡视线，被假发公司高价签约掏空。"]
  }
};

const DONATION_QR_PATHS = {
  wechat: {
    "0.01": ["微信收款", "0.01.jpg"],
    "1.88": ["微信收款", "1.88.jpg"],
    "10": ["微信收款", "10.jpg"],
    custom: ["微信收款", "自由打赏.jpg"]
  },
  alipay: {
    "0.01": ["支付宝收款", "0.01.jpg"],
    "1.88": ["支付宝收款", "1.88.jpg"],
    "10": ["支付宝收款", "10.jpg"],
    custom: ["支付宝收款", "自由打赏.jpg"]
  }
};

const PAYMENT_LABELS = { wechat: "微信", alipay: "支付宝" };

const ui = {
  card: document.querySelector("#event-card"),
  eventText: document.querySelector("#event-text"),
  leftText: document.querySelector("#left-choice-text"),
  rightText: document.querySelector("#right-choice-text"),
  day: document.querySelector("#day-count"),
  cardIndex: document.querySelector("#card-index"),
  leftButton: document.querySelector("#choose-left"),
  rightButton: document.querySelector("#choose-right"),
  dialog: document.querySelector("#ending-dialog"),
  endingTitle: document.querySelector("#ending-title"),
  endingCopy: document.querySelector("#ending-copy"),
  canvas: document.querySelector("#summary-canvas"),
  download: document.querySelector("#download-summary"),
  restart: document.querySelector("#restart-game"),
  close: document.querySelector("#close-dialog"),
  donationHint: document.querySelector("#donation-hint"),
  methodButtons: [...document.querySelectorAll(".payment-method")],
  amountButtons: [...document.querySelectorAll(".amount-button")],
  paymentDialog: document.querySelector("#payment-dialog"),
  paymentTitle: document.querySelector("#payment-title"),
  paymentDescription: document.querySelector("#payment-description"),
  paymentCodeImage: document.querySelector("#payment-code-image"),
  paymentAmount: document.querySelector("#payment-amount"),
  savePaymentCode: document.querySelector("#save-payment-code"),
  closePaymentDialog: document.querySelector("#close-payment-dialog"),
  returnToEnding: document.querySelector("#return-to-ending")
};

const state = {
  metrics: Object.fromEntries(METRICS.map((metric) => [metric, STARTING_VALUE])),
  daysSurvived: 0,
  currentCard: null,
  priorityStoryQueue: [],
  unplayedPool: [],
  locked: false,
  ended: false,
  drag: null,
  ending: null,
  donationMethod: null,
  donationAmount: null
};

const gameQrImage = new Image();
gameQrImage.src = new URL("./game-link-qr.png?v=auto-refresh-1", import.meta.url).href;
gameQrImage.addEventListener("load", () => {
  if (state.ending && ui.dialog.open) drawSummaryCard(state.ending, state.daysSurvived);
});

function shuffledCardIds() {
  const ids = cardsData.map(({ id }) => id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }
  return ids;
}

function removeFromPool(id) {
  const index = state.unplayedPool.indexOf(id);
  if (index !== -1) state.unplayedPool.splice(index, 1);
}

function drawNextCard() {
  let id = state.priorityStoryQueue.shift();
  if (id) {
    removeFromPool(id);
  } else {
    if (state.unplayedPool.length === 0) state.unplayedPool = shuffledCardIds();
    id = state.unplayedPool.shift();
  }
  return cardsData.find((card) => card.id === id) ?? cardsData[0];
}

function updateMetricDisplay(metric) {
  const value = state.metrics[metric];
  const visibleValue = Math.max(0, Math.min(100, value));
  const row = document.querySelector(`[data-metric="${metric}"]`);
  const bar = document.querySelector(`#bar-${metric}`);
  const output = document.querySelector(`#value-${metric}`);
  bar.style.width = `${visibleValue}%`;
  output.textContent = String(visibleValue);
  row.setAttribute("aria-label", `${METRIC_LABELS[metric]} ${visibleValue}`);
}

function updateMetricsDisplay() {
  for (const metric of METRICS) updateMetricDisplay(metric);
}

function showMetricPop(metric, delta) {
  if (!delta) return;
  const pop = document.querySelector(`[data-metric="${metric}"] .metric-pop`);
  pop.textContent = `${delta > 0 ? "+" : ""}${delta}`;
  pop.classList.toggle("is-negative", delta < 0);
  pop.classList.remove("is-popping");
  // Restart the small floating number animation for consecutive effects.
  void pop.offsetWidth;
  pop.classList.add("is-popping");
}

function setCue(metric, delta, active) {
  const cue = document.querySelector(`[data-metric="${metric}"] .metric-cue`);
  if (!active || !delta) {
    cue.classList.remove("is-visible", "is-negative");
    cue.textContent = "";
    return;
  }
  cue.textContent = delta > 0 ? "+" : "−";
  cue.classList.toggle("is-negative", delta < 0);
  cue.classList.add("is-visible");
}

function previewChoice(side) {
  if (!state.currentCard || state.ended) return;
  const effect = side === "left" ? state.currentCard.leftEffect : state.currentCard.rightEffect;
  for (const metric of METRICS) setCue(metric, effect[metric] ?? 0, true);
}

function clearPreview() {
  for (const metric of METRICS) setCue(metric, 0, false);
  ui.card.classList.remove("dragging-left", "dragging-right");
  ui.card.style.transform = "";
  ui.card.style.opacity = "";
}

function renderCard() {
  state.currentCard = drawNextCard();
  ui.card.classList.remove("is-exiting-left", "is-exiting-right", "is-dragging", "dragging-left", "dragging-right");
  ui.card.style.transform = "";
  ui.card.style.opacity = "";
  ui.eventText.textContent = state.currentCard.text;
  ui.leftText.textContent = state.currentCard.leftText;
  ui.rightText.textContent = state.currentCard.rightText;
  ui.day.textContent = String(state.daysSurvived + 1);
  ui.cardIndex.textContent = `DAY ${String(state.daysSurvived + 1).padStart(2, "0")}`;
  ui.leftButton.setAttribute("aria-label", `向左选择：${state.currentCard.leftText}`);
  ui.rightButton.setAttribute("aria-label", `向右选择：${state.currentCard.rightText}`);
  clearPreview();
}

function getEnding() {
  for (const metric of METRICS) {
    const value = state.metrics[metric];
    if (value <= 0) return { metric, direction: "low", title: ENDINGS[metric].low[0], reason: ENDINGS[metric].low[1] };
    if (value >= 100) return { metric, direction: "high", title: ENDINGS[metric].high[0], reason: ENDINGS[metric].high[1] };
  }
  return null;
}

function applyChoice(side) {
  if (state.locked || state.ended || !state.currentCard) return;
  state.locked = true;
  clearPreview();

  const card = state.currentCard;
  const effect = side === "left" ? card.leftEffect : card.rightEffect;
  const nextStoryId = side === "left" ? card.nextCardLeft : card.nextCardRight;
  if (nextStoryId) state.priorityStoryQueue.push(nextStoryId);

  state.daysSurvived += 1;
  for (const metric of METRICS) {
    const delta = effect[metric] ?? 0;
    state.metrics[metric] += delta;
    showMetricPop(metric, delta);
    updateMetricDisplay(metric);
  }
  ui.day.textContent = String(state.daysSurvived);

  const ending = getEnding();
  if (ending) {
    state.ended = true;
    showEnding(ending);
    return;
  }

  ui.card.classList.add(side === "left" ? "is-exiting-left" : "is-exiting-right");
  window.setTimeout(() => {
    if (state.ended) return;
    state.locked = false;
    renderCard();
  }, 260);
}

function titleForDays(days) {
  if (days < 10) return "脆皮大学生";
  if (days <= 30) return "合格社畜";
  if (days <= 60) return "摸鱼大师";
  return "卷王之王";
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawSummaryCard(ending, days) {
  const canvas = ui.canvas;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#292d2f");
  gradient.addColorStop(.55, "#202426");
  gradient.addColorStop(1, "#303033");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(810, 80, 10, 810, 80, 460);
  glow.addColorStop(0, "rgba(167,225,188,.16)");
  glow.addColorStop(1, "rgba(167,225,188,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, 390);

  ctx.fillStyle = "#a7e1bc";
  ctx.fillRect(52, 47, 32, 4);
  ctx.font = "600 20px 'DM Sans', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#bbc1bb";
  ctx.fillText("WORKER SURVIVAL GUIDE", 52, 83);

  ctx.font = "800 54px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#f2efe7";
  ctx.fillText(titleForDays(days), 52, 169);

  ctx.font = "500 22px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#c6c9c2";
  ctx.fillText(`在职场撑过了 ${days} 天`, 52, 220);

  roundedRect(ctx, 52, 259, 650, 110, 15);
  ctx.fillStyle = "rgba(255,255,255,.055)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.09)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = "600 16px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#a7e1bc";
  ctx.fillText("你的结局", 76, 294);
  ctx.font = "700 26px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#f4f0e7";
  ctx.fillText(ending.title, 76, 334);
  ctx.font = "400 16px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#c4c6c0";
  ctx.fillText(ending.reason, 76, 354, 590);

  ctx.font = "600 14px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#8f9690";
  ctx.fillText("最后一天的状态", 52, 416);
  METRICS.forEach((metric, index) => {
    const x = 52 + index * 164;
    const value = Math.max(0, Math.min(100, state.metrics[metric]));
    ctx.font = "500 16px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#c7c9c3";
    ctx.fillText(METRIC_LABELS[metric], x, 451);
    ctx.font = "700 16px 'DM Sans', sans-serif";
    ctx.fillStyle = "#f1eee6";
    ctx.fillText(String(value), x + 110, 451);
    roundedRect(ctx, x, 466, 126, 7, 5);
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.fill();
    roundedRect(ctx, x, 466, Math.max(4, 126 * value / 100), 7, 5);
    ctx.fillStyle = ["#ff7866", "#f1bf70", "#9bc8ee", "#c5a2df"][index];
    ctx.fill();
  });

  if (gameQrImage.complete && gameQrImage.naturalWidth > 0) {
    ctx.drawImage(gameQrImage, 770, 409, 136, 136);
  }
  ctx.font = "500 13px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#929994";
  ctx.textAlign = "center";
  ctx.fillText("扫码进入游戏", 838, 565);
  ctx.textAlign = "left";

  ctx.strokeStyle = "rgba(255,255,255,.1)";
  ctx.beginPath();
  ctx.moveTo(52, 536);
  ctx.lineTo(716, 536);
  ctx.stroke();
  ctx.font = "500 16px 'Noto Sans SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "#bbc1bb";
  ctx.fillText("打工人生存指南 - 免费开源项目", 52, 575);
  ctx.font = "500 12px 'DM Sans', sans-serif";
  ctx.fillStyle = "#737a75";
  ctx.fillText("KEEP YOUR METRICS ALIVE", 52, 604);

  ui.download.href = canvas.toDataURL("image/png");
}

function showEnding(ending) {
  state.ending = ending;
  ui.endingTitle.textContent = ending.title;
  ui.endingCopy.textContent = ending.reason;
  drawSummaryCard(ending, state.daysSurvived);
  if (!ui.dialog.open) ui.dialog.showModal();
}

function setDonationHint(message) {
  ui.donationHint.textContent = message;
}

function updateDonationSelection() {
  for (const button of ui.methodButtons) {
    const selected = button.dataset.method === state.donationMethod;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }
  for (const button of ui.amountButtons) {
    const selected = button.dataset.amount === state.donationAmount;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.disabled = !state.donationMethod;
  }
}

function resetDonationSelection() {
  state.donationMethod = null;
  state.donationAmount = null;
  updateDonationSelection();
  setDonationHint("先选微信或支付宝，再选金额展示收款码。");
  if (ui.paymentDialog.open) ui.paymentDialog.close();
}

function showDonationQr() {
  if (!state.donationMethod || !state.donationAmount) return;
  const isCustom = state.donationAmount === "custom";
  const selectedAmount = isCustom ? null : Number(state.donationAmount);

  const [folder, filename] = DONATION_QR_PATHS[state.donationMethod][isCustom ? "custom" : state.donationAmount];
  const imageUrl = new URL(`./${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`, import.meta.url).href;
  const methodLabel = PAYMENT_LABELS[state.donationMethod];
  const amountLabel = isCustom ? "自由打赏" : `¥${selectedAmount.toFixed(2)}`;

  ui.paymentTitle.textContent = `${methodLabel}收款码`;
  ui.paymentDescription.textContent = isCustom
    ? `请用${methodLabel}扫一扫自由打赏码，在${methodLabel}中填写打赏金额。`
    : `请用${methodLabel}扫一扫，核对收款方和金额后完成付款。`;
  ui.paymentAmount.textContent = amountLabel;
  ui.paymentCodeImage.alt = `${methodLabel} ${amountLabel} 收款码`;
  ui.paymentCodeImage.src = imageUrl;
  ui.savePaymentCode.href = imageUrl;
  ui.savePaymentCode.download = `${methodLabel}-${isCustom ? "自由打赏" : selectedAmount.toFixed(2)}.jpg`;
  if (!ui.paymentDialog.open) ui.paymentDialog.showModal();
  setDonationHint(isCustom
    ? `已选${methodLabel}自由打赏，收款码已打开。`
    : `已选 ${amountLabel}，${methodLabel}收款码已打开。`);
}

function selectDonationMethod(method) {
  state.donationMethod = method;
  updateDonationSelection();
  if (state.donationAmount) {
    showDonationQr();
  } else {
    setDonationHint(`已选${PAYMENT_LABELS[method]}，再选一个打赏金额。`);
  }
}

function selectDonationAmount(amount) {
  if (!state.donationMethod) {
    setDonationHint("请先选择微信或支付宝，再选择打赏金额。");
    return;
  }

  state.donationAmount = amount;
  updateDonationSelection();
  if (amount === "custom") {
    showDonationQr();
    return;
  }

  if (state.donationMethod) {
    showDonationQr();
  } else {
    setDonationHint(`已选 ¥${Number(amount).toFixed(2)}，再选微信或支付宝。`);
  }
}

function resetGame() {
  state.metrics = Object.fromEntries(METRICS.map((metric) => [metric, STARTING_VALUE]));
  state.daysSurvived = 0;
  state.currentCard = null;
  state.priorityStoryQueue = [];
  state.unplayedPool = shuffledCardIds();
  state.locked = false;
  state.ended = false;
  state.ending = null;
  resetDonationSelection();
  updateMetricsDisplay();
  renderCard();
  if (ui.dialog.open) ui.dialog.close();
}

function dragStart(event) {
  if (state.locked || state.ended || event.target.closest("button")) return;
  state.drag = { pointerId: event.pointerId, startX: event.clientX, x: 0 };
  ui.card.classList.add("is-dragging");
  ui.card.setPointerCapture(event.pointerId);
}

function dragMove(event) {
  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  const x = Math.max(-180, Math.min(180, event.clientX - state.drag.startX));
  state.drag.x = x;
  const rotation = Math.max(-13, Math.min(13, x / 15));
  ui.card.style.transform = `translateX(${x}px) rotate(${rotation}deg)`;
  ui.card.style.opacity = String(1 - Math.max(0, Math.abs(x) - 90) / 550);
  ui.card.classList.toggle("dragging-left", x < -20);
  ui.card.classList.toggle("dragging-right", x > 20);
  if (Math.abs(x) >= 20) previewChoice(x < 0 ? "left" : "right");
  else clearPreview();
}

function dragEnd(event) {
  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  const { x } = state.drag;
  state.drag = null;
  ui.card.classList.remove("is-dragging");
  if (Math.abs(x) >= SWIPE_THRESHOLD) {
    applyChoice(x < 0 ? "left" : "right");
  } else {
    clearPreview();
  }
}

ui.leftButton.addEventListener("click", () => applyChoice("left"));
ui.rightButton.addEventListener("click", () => applyChoice("right"));
ui.leftButton.addEventListener("mouseenter", () => previewChoice("left"));
ui.rightButton.addEventListener("mouseenter", () => previewChoice("right"));
ui.leftButton.addEventListener("mouseleave", clearPreview);
ui.rightButton.addEventListener("mouseleave", clearPreview);

if ("PointerEvent" in window) {
  ui.card.addEventListener("pointerdown", dragStart);
  ui.card.addEventListener("pointermove", dragMove);
  ui.card.addEventListener("pointerup", dragEnd);
  ui.card.addEventListener("pointercancel", dragEnd);
} else {
  // Legacy fallback for browsers without Pointer Events; touch remains a first-class input.
  let legacyStartX = null;
  ui.card.addEventListener("touchstart", (event) => {
    if (event.target.closest("button") || state.locked || state.ended) return;
    legacyStartX = event.changedTouches[0].clientX;
    ui.card.classList.add("is-dragging");
  }, { passive: true });
  ui.card.addEventListener("touchmove", (event) => {
    if (legacyStartX === null) return;
    const x = Math.max(-180, Math.min(180, event.changedTouches[0].clientX - legacyStartX));
    ui.card.style.transform = `translateX(${x}px) rotate(${Math.max(-13, Math.min(13, x / 15))}deg)`;
    ui.card.classList.toggle("dragging-left", x < -20);
    ui.card.classList.toggle("dragging-right", x > 20);
    if (Math.abs(x) >= 20) previewChoice(x < 0 ? "left" : "right");
    else clearPreview();
  }, { passive: true });
  ui.card.addEventListener("touchend", (event) => {
    if (legacyStartX === null) return;
    const x = event.changedTouches[0].clientX - legacyStartX;
    legacyStartX = null;
    ui.card.classList.remove("is-dragging");
    if (Math.abs(x) >= SWIPE_THRESHOLD) applyChoice(x < 0 ? "left" : "right");
    else clearPreview();
  });
  ui.card.addEventListener("mousedown", (event) => {
    if (event.target.closest("button") || state.locked || state.ended) return;
    legacyStartX = event.clientX;
    ui.card.classList.add("is-dragging");
  });
  window.addEventListener("mousemove", (event) => {
    if (legacyStartX === null) return;
    const x = Math.max(-180, Math.min(180, event.clientX - legacyStartX));
    ui.card.style.transform = `translateX(${x}px) rotate(${Math.max(-13, Math.min(13, x / 15))}deg)`;
    if (Math.abs(x) >= 20) previewChoice(x < 0 ? "left" : "right");
    else clearPreview();
  });
  window.addEventListener("mouseup", (event) => {
    if (legacyStartX === null) return;
    const x = event.clientX - legacyStartX;
    legacyStartX = null;
    ui.card.classList.remove("is-dragging");
    if (Math.abs(x) >= SWIPE_THRESHOLD) applyChoice(x < 0 ? "left" : "right");
    else clearPreview();
  });
}

window.addEventListener("keydown", (event) => {
  if (ui.dialog.open || event.altKey || event.ctrlKey || event.metaKey || state.locked || state.ended) return;
  const key = event.key.toLowerCase();
  if (["arrowleft", "a"].includes(key)) {
    event.preventDefault();
    applyChoice("left");
  } else if (["arrowright", "d"].includes(key)) {
    event.preventDefault();
    applyChoice("right");
  }
});

ui.restart.addEventListener("click", resetGame);
ui.close.addEventListener("click", () => ui.dialog.close());
ui.dialog.addEventListener("click", (event) => {
  if (event.target === ui.dialog) ui.dialog.close();
});
ui.methodButtons.forEach((button) => {
  button.addEventListener("click", () => selectDonationMethod(button.dataset.method));
});
ui.amountButtons.forEach((button) => {
  button.addEventListener("click", () => selectDonationAmount(button.dataset.amount));
});
ui.closePaymentDialog.addEventListener("click", () => ui.paymentDialog.close());
ui.returnToEnding.addEventListener("click", () => ui.paymentDialog.close());
ui.paymentDialog.addEventListener("click", (event) => {
  if (event.target === ui.paymentDialog) ui.paymentDialog.close();
});

state.unplayedPool = shuffledCardIds();
updateDonationSelection();
updateMetricsDisplay();
renderCard();
