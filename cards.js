export const cardsData = [
  // --- 基础日常卡牌 ---
  {
    id: "card_1",
    text: "老板突然问你：‘今晚有个紧急需求，能加个班吗？’",
    leftText: "果断拒绝，准时下班",
    leftEffect: { health: +5, money: -5, social: +5, hair: +2 },
    rightText: "含泪答应，愿为公司奉献",
    rightEffect: { health: -15, money: +15, social: -10, hair: -10 }
  },
  {
    id: "card_2",
    text: "外卖小哥送来了一份热气腾腾的炸鸡汉堡。",
    leftText: "吃！人生苦短，及时行乐",
    leftEffect: { health: -10, money: -5, social: +5, hair: 0 },
    rightText: "忍痛倒掉，吃水煮菜沙拉",
    rightEffect: { health: +10, money: -10, social: -5, hair: +2 }
  },
  {
    id: "card_3",
    text: "同事偷偷告诉你，HR 正在暗中调查平时谁摸鱼最严重。",
    leftText: "瑟瑟发抖，开始疯狂敲键盘假装很忙",
    leftEffect: { health: -5, money: 0, social: -5, hair: -5 },
    rightText: "不慌，反正我也准备跑路了",
    rightEffect: { health: +5, money: 0, social: +10, hair: +5 }
  },
  {
    id: "card_4",
    text: "公司组织年度体检，你看着长长的体检项目名单陷入沉思。",
    leftText: "直接放弃体检，省得吓自己",
    leftEffect: { health: -10, money: +5, social: 0, hair: 0 },
    rightText: "老老实实去排队，直面惨淡的人生",
    rightEffect: { health: +10, money: -15, social: 0, hair: -5 }
  },
  {
    id: "card_5",
    text: "深夜 2 点，你在床上刷短视频刷到停不下来。",
    leftText: "放下手机，强迫自己闭眼睡觉",
    leftEffect: { health: +15, money: 0, social: 0, hair: +5 },
    rightText: "再刷 10 个视频就睡（第100遍）",
    rightEffect: { health: -15, money: 0, social: -5, hair: -10 }
  },
  {
    id: "card_6",
    text: "朋友邀请你周末去密室逃脱，但你只想在家里躺平。",
    leftText: "拒绝社交，享受孤独的周末",
    leftEffect: { health: +5, money: +5, social: -15, hair: +2 },
    rightText: "硬着头皮去社交，假装合群",
    rightEffect: { health: -10, money: -15, social: +15, hair: -5 }
  },
  {
    id: "card_7",
    text: "隔壁工位的同事在打响膈，声音震天响，严重影响你写代码。",
    leftText: "戴上降噪耳机，默默忍受",
    leftEffect: { health: -5, money: 0, social: +5, hair: -2 },
    rightText: "递过去一瓶水并善意提醒",
    rightEffect: { health: +5, money: -5, social: -5, hair: 0 }
  },
  {
    id: "card_8",
    text: "你在电梯里偶遇大老板，电梯里只有你们两个人，气氛凝固了。",
    leftText: "尴尬地盯着地板，假装没看见",
    leftEffect: { health: 0, money: 0, social: -10, hair: -2 },
    rightText: "主动尬聊，夸赞老板今天的发型好看",
    rightEffect: { health: -5, money: +10, social: +10, hair: -5 }
  },
  {
    id: "card_9",
    text: "房东突然发消息通知你：下个月房租要涨 20%。",
    leftText: "忍气吞声续租，懒得搬家",
    leftEffect: { health: -5, money: -20, social: 0, hair: -5 },
    rightText: "怒而搬家，找更便宜的破地下室",
    rightEffect: { health: -15, money: +10, social: -5, hair: 0 }
  },

  // --- 剧情链 A：加密货币梭哈局 ---
  {
    id: "crypto_start",
    text: "群里有人说买某种新出的‘狗狗币’能暴富，要冲吗？",
    leftText: "理智拒绝，远离高风险",
    leftEffect: { health: +5, money: 0, social: 0, hair: +2 },
    rightText: "梭哈！把这个月的工资全压上",
    rightEffect: { health: -10, money: -20, social: +5, hair: -10 },
    nextCardRight: "crypto_result"
  },
  {
    id: "crypto_result",
    text: "你买的币暴雷了！庄家连夜跑路，你的账户缩水 99%...",
    leftText: "心态崩了，坐在天台怀疑人生",
    leftEffect: { health: -20, money: -30, social: -10, hair: -15 },
    rightText: "当做交学费，继续默默搬砖",
    rightEffect: { health: -5, money: -10, social: 0, hair: -5 }
  },

  // --- 剧情链 B：办公室恋爱局 ---
  {
    id: "love_start",
    text: "隔壁部门的漂亮小姐姐/小哥哥主动加你微信，问你周末有没有空。",
    leftText: "婉拒，单身狗一个人打游戏不香吗",
    leftEffect: { health: +5, money: +5, social: -10, hair: +2 },
    rightText: "欣然答应，精心挑选约会战袍",
    rightEffect: { health: +10, money: -20, social: +20, hair: -5 },
    nextCardRight: "love_second"
  },
  {
    id: "love_second",
    text: "恋爱第三个月，对方暗示你该准备见家长或者谈婚论嫁了...",
    leftText: "太快了！选择冷处理并逃避",
    leftEffect: { health: -10, money: 0, social: -20, hair: -10 },
    rightText: "买钻戒求婚，准备步入婚姻殿堂",
    rightEffect: { health: -15, money: -40, social: +30, hair: -20 }
  },

  // --- 剧情链 C：副业创业局 ---
  {
    id: "side_start",
    text: "你打算晚上下班后做自媒体自媒体搞副业，需要买几千块的拍摄设备。",
    leftText: "算了，下班已经够累了，躺平保命",
    leftEffect: { health: +10, money: 0, social: 0, hair: +5 },
    rightText: "咬牙掏钱买设备，开干！",
    rightEffect: { health: -15, money: -25, social: -5, hair: -10 },
    nextCardRight: "side_result"
  },
  {
    id: "side_result",
    text: "你的副业视频突然爆火，有广告商找上门投广告！",
    leftText: "顺势辞职，全职做自媒体博主",
    leftEffect: { health: +20, money: +40, social: +10, hair: +10 },
    rightText: "接广告赚外快，同时继续苟在公司",
    rightEffect: { health: -20, money: +30, social: -10, hair: -15 }
  },

  // --- 更多日常进阶卡牌 ---
  {
    id: "card_10",
    text: "公司推出健身卡打折活动，年卡只需要 1000 块。",
    leftText: "办卡！这次一定坚持去",
    leftEffect: { health: +10, money: -15, social: +5, hair: +5 },
    rightText: "不办，洗澡卡而已，别想骗我钱",
    rightEffect: { health: -5, money: +10, social: 0, hair: 0 }
  },
  {
    id: "card_11",
    text: "领导让你在全公司大例会上做季度总结 PPT 汇报。",
    leftText: "精心准备 PPT，展现专业素养",
    leftEffect: { health: -10, money: +10, social: +15, hair: -10 },
    rightText: "套用网络模板，随便敷衍过去",
    rightEffect: { health: +5, money: 0, social: -10, hair: +5 }
  },
  {
    id: "card_12",
    text: "双十一购物节到了，零点购物车打折促销大爆发。",
    leftText: "清空购物车，疯狂消费解压",
    leftEffect: { health: -5, money: -30, social: +5, hair: 0 },
    rightText: "理性消费，一分钱都不花",
    rightEffect: { health: 0, money: +20, social: -5, hair: +2 }
  },
  {
    id: "card_13",
    text: "你在洗头时发现下水道口被一大团头发堵住了...",
    leftText: "购买昂贵的防脱发洗发水和生发液",
    leftEffect: { health: +5, money: -20, social: 0, hair: +15 },
    rightText: "戴上帽子，假装什么都没发生",
    rightEffect: { health: -5, money: 0, social: -5, hair: -15 }
  },
  {
    id: "card_14",
    text: "公司空降了一个完全不懂业务的咸鱼主管，天天胡乱派活。",
    leftText: "忍辱负重，替主管收拾烂摊子",
    leftEffect: { health: -15, money: +10, social: +5, hair: -10 },
    rightText: "硬刚回击，直接在群里发邮件吐槽",
    rightEffect: { health: +10, money: -10, social: -20, hair: +5 }
  },
  {
    id: "card_15",
    text: "周末高中同学聚会，大家都在比谁混得好、买了几套房。",
    leftText: "租豪车去参加，绝不能输了面子",
    leftEffect: { health: -10, money: -25, social: +20, hair: -5 },
    rightText: "找借口不去，在家打单机游戏",
    rightEffect: { health: +10, money: +5, social: -15, hair: +5 }
  }
];
