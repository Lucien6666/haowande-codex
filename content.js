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
        song: "歌名占位：倔强",
        lyric: "歌词占位：在这里填《倔强》的句子",
        note: "注释占位：写下你们和这句歌词的回忆。",
        effect: "burst"
      },
      {
        id: "egg-longpress",
        trigger: "longpress-stage",
        title: "长按回响",
        song: "歌名占位：温柔",
        lyric: "歌词占位：在这里填《温柔》的句子",
        note: "注释占位：写下你最想告诉她的一句话。",
        effect: "wave"
      },
      {
        id: "egg-keyword",
        trigger: "type-keyword",
        title: "暗号命中",
        song: "歌名占位：突然好想你",
        lyric: "歌词占位：在这里填《突然好想你》的句子",
        note: "注释占位：写下你们的专属暗号故事。",
        effect: "spark"
      },
      {
        id: "egg-corner",
        trigger: "tap-corner",
        title: "角落彩灯",
        song: "歌名占位：知足",
        lyric: "歌词占位：在这里填《知足》的句子",
        note: "注释占位：写下她让你觉得幸福的细节。",
        effect: "shine"
      },
      {
        id: "egg-swipe",
        trigger: "swipe-up",
        title: "Encore",
        song: "歌名占位：后来的我们",
        lyric: "歌词占位：在这里填《后来的我们》的句子",
        note: "注释占位：把你想一起实现的未来写在这里。",
        effect: "ribbon"
      }
    ],
    finalMessage:
      "给最可爱的五月天女孩：\n\n我想认真地喜欢你很久很久，\n久到每一次演唱会的灯亮起时，\n我们都还能下意识牵住彼此的手。\n\n以后不管顺风还是逆风，\n都让我陪你一起唱下去。",
    finalSignature: "—— 一直站你旁边的人"
  };
})();
