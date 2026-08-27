window.Business48Data = Object.freeze({
  schemaVersion: 1,
  steps: [
    { id: 1, short: "兴趣", title: "写一张真正属于你的兴趣清单", kicker: "先别急着赚钱" },
    { id: 2, short: "问题", title: "从兴趣里找到值得解决的问题", kicker: "把模糊变具体" },
    { id: 3, short: "模式", title: "让解决方案遇见商业模式", kicker: "27 种可能性" },
    { id: 4, short: "验证", title: "用 8 个问题检查这个想法", kicker: "不打分，只找证据" },
    { id: 5, short: "计划", title: "把未来 48 小时排成两天", kicker: "先做最小可见版本" },
    { id: 6, short: "品牌", title: "说清品牌、4P 和网站主张", kicker: "只突出一个卖点" },
    { id: 7, short: "客户", title: "决定怎样找到第一位客户", kicker: "写下第一个真实动作" }
  ],
  businessModels: [
    { id: "ads", name: "广告", prompt: "能否持续吸引一个明确细分人群？", group: "内容" },
    { id: "saas", name: "软件即服务", prompt: "这个问题是否会反复发生，值得按月付费？", group: "数字" },
    { id: "subscription", name: "订阅", prompt: "能否持续提供有价值的产品或内容？", group: "持续收入" },
    { id: "self-publishing", name: "自助出版", prompt: "知识或创意能否成为书、音乐或播客？", group: "内容" },
    { id: "presale", name: "预售", prompt: "能否先得到承诺或订单，再投入生产？", group: "验证" },
    { id: "on-demand", name: "按需生产", prompt: "能否有人下单后再生产，减少库存风险？", group: "产品" },
    { id: "matchmaker", name: "撮合服务", prompt: "能否把正在寻找彼此的两类人连接起来？", group: "平台" },
    { id: "mobile-app", name: "移动应用", prompt: "这个问题是否适合在手机上高频解决？", group: "数字" },
    { id: "freemium", name: "免费增值", prompt: "哪个基础价值免费，哪个进阶价值值得付费？", group: "持续收入" },
    { id: "download", name: "数字下载", prompt: "能否做成课程、模板、字体或软件？", group: "数字" },
    { id: "agency", name: "代理", prompt: "能否组织一批可信专家供客户预约？", group: "服务" },
    { id: "affiliate", name: "联属网络营销", prompt: "能否推荐真正相关的产品并获得佣金？", group: "内容" },
    { id: "concierge", name: "礼宾服务", prompt: "哪件复杂麻烦的事值得客户付钱交给你？", group: "服务" },
    { id: "daily-deal", name: "每日优惠", prompt: "是否有明确人群和足够稳定的订阅者？", group: "平台" },
    { id: "door-to-door", name: "挨家挨户", prompt: "能否直接接触目标客户并快速得到反馈？", group: "验证" },
    { id: "dropshipping", name: "代发货", prompt: "能否由制造商发货，你负责选品和销售？", group: "产品" },
    { id: "ecommerce", name: "电子商务", prompt: "能否自己采购或制作产品并在线销售？", group: "产品" },
    { id: "live-events", name: "现场活动", prompt: "能否把技能做成课程、聚会或线下体验？", group: "服务" },
    { id: "manufacturing", name: "制造", prompt: "能否先手工做出小批产品，再逐步扩大？", group: "产品" },
    { id: "marketplace", name: "市场平台", prompt: "能否同时吸引足够的买方和卖方？", group: "平台" },
    { id: "party-plan", name: "派对策划", prompt: "产品是否适合在熟人聚会中展示和销售？", group: "服务" },
    { id: "pay-what-you-want", name: "自主定价", prompt: "数字产品能否让用户自行决定支付金额？", group: "数字" },
    { id: "peer-to-peer", name: "点对点", prompt: "用户是否愿意直接彼此分享资源或服务？", group: "平台" },
    { id: "popup", name: "快闪店", prompt: "能否用短期线下空间测试零售需求？", group: "验证" },
    { id: "razor-blades", name: "剃须刀与刀片", prompt: "是否有低门槛设备和持续消耗品的组合？", group: "持续收入" },
    { id: "retail", name: "零售产品", prompt: "能否通过第三方制造，再由实体零售商销售？", group: "产品" },
    { id: "social-network", name: "社交网络", prompt: "是否存在足够具体、尚未被满足的共同兴趣？", group: "平台" }
  ],
  ideaChecks: [
    "你对这个产品真的感兴趣吗？",
    "说实话，你自己会购买它吗？",
    "你对此类业务了解得足够多吗？",
    "是否有足够多的人和你一样感兴趣？",
    "你为什么要做它，是否有一个可信的故事？",
    "你能否在 48 小时内把一个版本放到真实世界？",
    "现有竞争是否留下了你能做得更好的空间？",
    "它能否通过奶奶测试——用普通人听得懂的话讲清楚？"
  ],
  day1Tasks: [
    "写下兴趣与原因",
    "找出具体问题",
    "列出可能的解决方案",
    "匹配商业模式",
    "选出最可行的一个想法",
    "完成 8 题检查和奶奶测试",
    "与至少一位潜在客户交谈",
    "查看竞争者的价格与做法",
    "决定初步价格并估算能否覆盖成本",
    "找一位有经验的人做感觉检查",
    "写出名称、标语、唯一卖点和目标客户"
  ],
  day2Tasks: [
    "做出能展示的最小原型或样品",
    "完成最小品牌物料",
    "建立网站或公开说明页",
    "准备最终产品图片或演示素材",
    "选择第一种获客方式",
    "发出第一条邀请、报价或预售信息",
    "尝试得到第一位客户或第一份真实反馈"
  ],
  customerChannels: [
    "工艺品市场", "Facebook", "Google", "重新定位", "团购网站",
    "LinkedIn", "预售", "众筹", "新闻稿", "博主", "免费样品",
    "平面广告", "把促销转化为销售", "购买数据", "测试促销活动",
    "电子邮件销售", "电话销售", "贸易展览会", "派对策划",
    "客户推荐计划", "联盟计划", "折扣码", "家庭电视", "品牌合作", "聚会"
  ],
  mentorQuestions: [
    "你试过哪些没用的方法？为什么没用？",
    "产品后来做过哪些改变？",
    "如果从第一天重来，你会怎么做？",
    "哪种营销最有效？获得一个客户花了多少？",
    "客户最常抱怨什么？毛利率大致如何？",
    "行业主要趋势是什么？你从哪里获得行业信息？",
    "哪些公司做得好，哪些公司做得不好？"
  ],
  variants: {
    a: {
      name: "两天开启个人事业",
      eyebrow: "",
      heroTitle: "两天\n开启个人事业",
      heroBody: "48 小时不需要做完一家公司。你只需要把一个想法送到真实世界，得到第一份反馈。",
      image: "assets/a-orbit-launch.png",
      imageAlt: "两位职场人物在紫色太空场景中向彼此伸手",
      storageKey: "chen-hongye:business-48h:v1:a"
    },
    b: {
      name: "个人事业编辑部",
      eyebrow: "ISSUE 01 · YOUR BUSINESS",
      heroTitle: "把你的想法，编辑成一页能行动的计划。",
      heroBody: "从兴趣、问题和商业模式开始，一页一页删掉模糊，留下接下来真正要做的事。",
      image: "assets/b-editorial-founder.jpg",
      imageAlt: "戴黑色宽檐帽与墨镜的粉黑时尚插画人物",
      storageKey: "chen-hongye:business-48h:v1:b"
    },
    c: {
      name: "行动工作台",
      eyebrow: "48H ACTION DESK",
      heroTitle: "别再等准备好，先完成第一轮。",
      heroBody: "走完 7 步，把兴趣、问题、计划和第一位客户装进一张 48 小时行动卡。",
      image: "assets/c-action-leap.png",
      resultImage: "assets/c-workbench-result.png",
      imageAlt: "一位拿着本子、举笔向前跃起的插画人物",
      storageKey: "chen-hongye:business-48h:v1:c"
    }
  }
});
