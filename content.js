(function () {
  window.APP_CONFIG = {
    title: "和你并肩的大合唱",
    subtitle: "把想对你说的话，藏进今晚的五个彩蛋里。",
    keyword: "五月之约",
    unlockCount: 5,
    bgmUrl: "",
    easterEggs: [
      {
        id: "egg-click",
        trigger: "click-heart",
        title: "心跳前奏",
        text: "第一眼见你，我就像站在开场前的舞台边，\n灯还没亮，心已经先大声合唱。",
        note: "你出现以后，连等待都变得浪漫。",
        effect: "burst"
      },
      {
        id: "egg-longpress",
        trigger: "longpress-stage",
        title: "长按回响",
        text: "如果青春是一场远行，\n我最想做的是和你坐在同一排，\n把每一首歌都唱成“我们”。",
        note: "想把你的名字，写进我所有重要时刻。",
        effect: "wave"
      },
      {
        id: "egg-keyword",
        trigger: "type-keyword",
        title: "暗号命中",
        text: "你是我生活里的那束追光，\n让我敢把平凡日子，过成热血现场。",
        note: "谢谢你让我一直相信，温柔也可以很坚定。",
        effect: "spark"
      },
      {
        id: "egg-corner",
        trigger: "tap-corner",
        title: "角落彩灯",
        text: "就算世界偶尔嘈杂，\n只要你在身边，\n我就听得见心里那句最清楚的“不要怕”。",
        note: "你是让我稳住节拍的人。",
        effect: "shine"
      },
      {
        id: "egg-swipe",
        trigger: "swipe-up",
        title: "Encore",
        text: "把今天当成我们的安可场，\n把明天当成下一次并肩挥手的约定。\n这一生的歌单，我都想和你一起听完。",
        note: "谢谢你来，终章也是新的开场。",
        effect: "ribbon"
      }
    ],
    finalMessage:
      "给最可爱的五月天女孩：\n\n我想认真地喜欢你很久很久，\n久到每一次演唱会的灯亮起时，\n我们都还能下意识牵住彼此的手。\n\n以后不管顺风还是逆风，\n都让我陪你一起唱下去。",
    finalSignature: "—— 一直站你旁边的人"
  };
})();
