(function () {
  window.APP_CONFIG = {
    title: "和你并肩的大合唱",
    subtitle: "把想对你说的话，藏进今晚的五个彩蛋里。",
    keyword: "五月之约",
    keywordButtonText: "输入暗号",
    keywordPromptTitle: "请输入你们的暗号",
    keywordPromptPlaceholder: "例如：五月之约",
    keywordErrorText: "暗号还不对，再试一次。",
    unlockCount: 5,
    bgmUrl: "./assets/bgm.mp3",
    easterEggs: [
      {
        id: "egg-click",
        trigger: "click-heart",
        title: "心跳前奏",
        song: "突然好想你 / 如果我们不曾相遇",
        lyric: "第一眼见你，我像站在开场前的舞台边，\n灯还没亮，心已经先把“突然好想你”唱了一遍。",
        note: "你出现以后，连等待都变得浪漫——\n好像在回答那句“如果我们不曾相遇”。",
        effect: "burst"
      },
      {
        id: "egg-longpress",
        trigger: "longpress-stage",
        title: "长按回响",
        song: "恋爱ING / 知足",
        lyric:
          "如果青春是一场远行，\n我最想做的是和你坐在同一排，\n把每一首歌都唱成“我们”，让心一直“恋爱ING”。",
        note: "后来我才懂，最奢侈的不是轰轰烈烈，\n而是和你一起“知足”。",
        effect: "wave"
      },
      {
        id: "egg-keyword",
        trigger: "type-keyword",
        title: "暗号命中",
        song: "倔强 / 温柔",
        lyric: "你是我生活里的那束追光，\n让我敢把平凡日子，过成热血现场——\n像“倔强”那样，不退、不散场。",
        note: "谢谢你让我一直相信：\n温柔不是软弱，是“温柔”里那种坚定。",
        effect: "spark"
      },
      {
        id: "egg-corner",
        trigger: "tap-corner",
        title: "角落彩灯",
        song: "我不愿让你一个人 / 拥抱",
        lyric: "就算世界偶尔嘈杂，\n只要你在身边，\n我就不会慌——因为我知道“我不愿让你一个人”。",
        note: "你是让我稳住节拍的人，\n也是我在人群里，最想“拥抱”的答案。",
        effect: "shine"
      },
      {
        id: "egg-swipe",
        trigger: "swipe-up",
        title: "Encore",
        song: "干杯 / 第二人生",
        lyric:
          "把今天当成我们的安可场，\n把明天当成下一次并肩挥手的约定。\n这一生的歌单，我都想和你一起听完，举杯说声“干杯”。",
        note: "谢谢你来——\n终章不是结束，是我们的“第二人生”开场。",
        effect: "ribbon"
      }
    ],
    finalMessage:
      "给最可爱的五月天女孩：\n\n如果青春会老去，我想把每一年的合唱都留给你。\n愿我们在每一次前奏响起时，都还能并肩举起手。\n\n谢谢你来到我的歌单里，\n也谢谢你愿意和我走向同一个安可。",
    finalSignature: "—— 一直站你旁边的人"
  };
})();
