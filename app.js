(function () {
  "use strict";

  var config = window.APP_CONFIG || {};
  var state = {
    unlocked: new Set(),
    shownQueueIndex: 0,
    currentEgg: null,
    favorites: new Set(),
    longPressTimer: null,
    longPressDone: false,
    inputBuffer: "",
    touchStartY: null,
    audioReady: false,
    audioEnabled: false,
    finished: false
  };

  var triggersOrder = ["click-heart", "longpress-stage", "type-keyword", "tap-corner", "swipe-up"];
  var triggerLabel = {
    "click-heart": "点击心跳",
    "longpress-stage": "长按舞台",
    "type-keyword": "键盘暗号",
    "tap-corner": "角落触发",
    "swipe-up": "上滑解锁"
  };

  var els = {
    startScreen: document.getElementById("start-screen"),
    mainStage: document.getElementById("main-stage"),
    startBtn: document.getElementById("start-btn"),
    stage: document.getElementById("stage"),
    heart: document.getElementById("heart-trigger"),
    corners: Array.prototype.slice.call(document.querySelectorAll(".corner-trigger")),
    audioToggle: document.getElementById("audio-toggle"),
    progressBar: document.getElementById("progress-bar"),
    modal: document.getElementById("egg-modal"),
    triggerTag: document.getElementById("egg-trigger-tag"),
    eggTitle: document.getElementById("egg-title"),
    eggText: document.getElementById("egg-text"),
    eggNote: document.getElementById("egg-note"),
    nextEggBtn: document.getElementById("next-egg-btn"),
    favEggBtn: document.getElementById("fav-egg-btn"),
    closeModalBtn: document.getElementById("close-modal-btn"),
    finale: document.getElementById("finale"),
    finalMessage: document.getElementById("final-message"),
    finalSignature: document.getElementById("final-signature"),
    finalDate: document.getElementById("final-date"),
    pageTitle: document.getElementById("page-title"),
    pageSubtitle: document.getElementById("page-subtitle"),
    canvas: document.getElementById("particle-canvas")
  };

  var audio = null;

  function safeText(val, fallback) {
    return typeof val === "string" && val.trim() ? val : fallback;
  }

  function initContent() {
    document.title = safeText(config.title, "给你的一场霓虹演唱会");
    els.pageTitle.textContent = safeText(config.title, "给你的一场霓虹演唱会");
    els.pageSubtitle.textContent = safeText(config.subtitle, "每个彩蛋，都是一句想悄悄唱给你的话。");
    els.finalMessage.textContent = safeText(config.finalMessage, "愿你永远做自己喜欢的自己。\n\n这页写给你。");
    els.finalSignature.textContent = safeText(config.finalSignature, "—— 某个很喜欢你的人");

    var now = new Date();
    els.finalDate.textContent =
      now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function initAudio() {
    if (!safeText(config.bgmUrl, "")) {
      els.audioToggle.disabled = true;
      els.audioToggle.textContent = "音乐：未配置";
      return;
    }

    audio = new Audio(config.bgmUrl);
    audio.loop = true;
    audio.volume = 0.5;

    els.audioToggle.disabled = false;
  }

  function primeAudio() {
    if (!audio || state.audioReady) {
      return;
    }

    state.audioReady = true;
    audio
      .play()
      .then(function () {
        state.audioEnabled = true;
        syncAudioButton();
      })
      .catch(function () {
        state.audioEnabled = false;
        syncAudioButton();
      });
  }

  function syncAudioButton() {
    if (!audio) {
      return;
    }
    els.audioToggle.setAttribute("aria-pressed", String(state.audioEnabled));
    els.audioToggle.textContent = state.audioEnabled ? "音乐：开" : "音乐：关";
  }

  function toggleAudio() {
    if (!audio) {
      return;
    }

    if (!state.audioEnabled) {
      audio
        .play()
        .then(function () {
          state.audioEnabled = true;
          syncAudioButton();
        })
        .catch(function () {});
    } else {
      audio.pause();
      state.audioEnabled = false;
      syncAudioButton();
    }
  }

  function getEggByTrigger(trigger) {
    var eggs = Array.isArray(config.easterEggs) ? config.easterEggs : [];
    for (var i = 0; i < eggs.length; i += 1) {
      if (eggs[i].trigger === trigger) {
        return eggs[i];
      }
    }
    return null;
  }

  function getQueueEgg() {
    var eggs = Array.isArray(config.easterEggs) ? config.easterEggs : [];
    if (!eggs.length) {
      return null;
    }
    var egg = eggs[state.shownQueueIndex % eggs.length];
    state.shownQueueIndex += 1;
    return egg;
  }

  function showEgg(egg) {
    if (!egg) {
      return;
    }

    state.currentEgg = egg;
    els.triggerTag.textContent = triggerLabel[egg.trigger] || "彩蛋";
    els.eggTitle.textContent = safeText(egg.title, "彩蛋");
    els.eggText.textContent = safeText(egg.text, "[在 content.js 填写彩蛋文案]");
    els.eggNote.textContent = safeText(egg.note, "");
    els.favEggBtn.textContent = state.favorites.has(egg.id) ? "已收藏" : "收藏这句";
    els.modal.classList.add("show");
    els.modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    els.modal.classList.remove("show");
    els.modal.setAttribute("aria-hidden", "true");
  }

  function markUnlocked(trigger) {
    if (state.finished) {
      return;
    }

    state.unlocked.add(trigger);
    updateProgress();

    if (state.unlocked.size >= (Number(config.unlockCount) || 5)) {
      showFinale();
    }
  }

  function updateProgress() {
    var total = Number(config.unlockCount) || 5;
    var pct = Math.min(100, Math.round((state.unlocked.size / total) * 100));
    els.progressBar.style.width = pct + "%";
  }

  function showFinale() {
    if (state.finished) {
      return;
    }

    state.finished = true;
    setTimeout(function () {
      closeModal();
      els.finale.classList.add("show");
      els.finale.setAttribute("aria-hidden", "false");
      burstAt(window.innerWidth * 0.5, window.innerHeight * 0.35, 80);
    }, 320);
  }

  function triggerByType(trigger) {
    var egg = getEggByTrigger(trigger);
    if (egg) {
      showEgg(egg);
    }
    markUnlocked(trigger);
  }

  function onStart() {
    primeAudio();
    els.startScreen.classList.remove("visible");
    els.mainStage.classList.add("active");
  }

  function onHeartClick(evt) {
    createRipple(evt.clientX, evt.clientY);
    burstAt(evt.clientX, evt.clientY, 26);
    triggerByType("click-heart");
  }

  function onLongPressStart(evt) {
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
    }
    state.longPressDone = false;
    var point = getPoint(evt);
    state.longPressTimer = setTimeout(function () {
      state.longPressDone = true;
      burstAt(point.x, point.y, 45);
      triggerByType("longpress-stage");
    }, 700);
  }

  function onLongPressEnd() {
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
  }

  function onCornerTap(evt) {
    var p = getPoint(evt);
    createRipple(p.x, p.y);
    burstAt(p.x, p.y, 18);
    triggerByType("tap-corner");
  }

  function onKeyInput(evt) {
    var key = evt.key;
    if (!key || key.length !== 1) {
      return;
    }

    state.inputBuffer += key.toLowerCase();
    if (state.inputBuffer.length > 24) {
      state.inputBuffer = state.inputBuffer.slice(-24);
    }

    var keyword = safeText(config.keyword, "倔强").toLowerCase();
    if (keyword && state.inputBuffer.indexOf(keyword) !== -1) {
      burstAt(window.innerWidth * 0.5, window.innerHeight * 0.5, 40);
      triggerByType("type-keyword");
      state.inputBuffer = "";
    }
  }

  function onTouchStart(evt) {
    if (!evt.touches || !evt.touches[0]) {
      return;
    }
    state.touchStartY = evt.touches[0].clientY;
  }

  function onTouchEnd(evt) {
    if (state.touchStartY == null || !evt.changedTouches || !evt.changedTouches[0]) {
      return;
    }
    var endY = evt.changedTouches[0].clientY;
    var diff = state.touchStartY - endY;
    state.touchStartY = null;
    if (diff > 90) {
      burstAt(window.innerWidth * 0.5, window.innerHeight * 0.35, 36);
      triggerByType("swipe-up");
    }
  }

  function onNextEgg() {
    var egg = getQueueEgg();
    showEgg(egg);
  }

  function onFavorite() {
    if (!state.currentEgg || !state.currentEgg.id) {
      return;
    }

    if (state.favorites.has(state.currentEgg.id)) {
      state.favorites.delete(state.currentEgg.id);
    } else {
      state.favorites.add(state.currentEgg.id);
    }

    els.favEggBtn.textContent = state.favorites.has(state.currentEgg.id) ? "已收藏" : "收藏这句";
  }

  function createRipple(x, y) {
    var ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    document.body.appendChild(ripple);
    setTimeout(function () {
      ripple.remove();
    }, 680);
  }

  var ctx = null;
  var particles = [];

  function setupCanvas() {
    if (!els.canvas) {
      return;
    }

    ctx = els.canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    requestAnimationFrame(tickParticles);
  }

  function resizeCanvas() {
    els.canvas.width = window.innerWidth;
    els.canvas.height = window.innerHeight;
  }

  function burstAt(x, y, count) {
    if (!ctx) {
      return;
    }
    for (var i = 0; i < count; i += 1) {
      var angle = (Math.PI * 2 * i) / count;
      var speed = 0.7 + Math.random() * 2.6;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40 + Math.random() * 24,
        color: Math.random() > 0.5 ? "121,244,255" : "255,92,199"
      });
    }
  }

  function tickParticles() {
    if (ctx) {
      ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
      for (var i = particles.length - 1; i >= 0; i -= 1) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        p.life -= 1;
        var alpha = Math.max(0, p.life / 60);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.color + "," + alpha + ")";
        ctx.fill();
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    }
    requestAnimationFrame(tickParticles);
  }

  function getPoint(evt) {
    if (evt.touches && evt.touches[0]) {
      return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    }
    return { x: evt.clientX || window.innerWidth / 2, y: evt.clientY || window.innerHeight / 2 };
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", onStart);
    els.audioToggle.addEventListener("click", toggleAudio);

    document.addEventListener(
      "click",
      function () {
        primeAudio();
      },
      { once: true }
    );

    els.heart.addEventListener("click", onHeartClick);

    els.stage.addEventListener("mousedown", onLongPressStart);
    els.stage.addEventListener("touchstart", onLongPressStart, { passive: true });
    els.stage.addEventListener("mouseup", onLongPressEnd);
    els.stage.addEventListener("mouseleave", onLongPressEnd);
    els.stage.addEventListener("touchend", onLongPressEnd);

    for (var i = 0; i < els.corners.length; i += 1) {
      els.corners[i].addEventListener("click", onCornerTap);
      els.corners[i].addEventListener("touchstart", onCornerTap, { passive: true });
    }

    window.addEventListener("keydown", onKeyInput);
    els.stage.addEventListener("touchstart", onTouchStart, { passive: true });
    els.stage.addEventListener("touchend", onTouchEnd, { passive: true });

    els.nextEggBtn.addEventListener("click", onNextEgg);
    els.favEggBtn.addEventListener("click", onFavorite);
    els.closeModalBtn.addEventListener("click", closeModal);
    els.modal.addEventListener("click", function (evt) {
      if (evt.target === els.modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape") {
        closeModal();
      }
    });
  }

  function validateConfig() {
    if (!Array.isArray(config.easterEggs) || !config.easterEggs.length) {
      config.easterEggs = triggersOrder.map(function (trigger, idx) {
        return {
          id: "fallback-" + idx,
          trigger: trigger,
          title: "彩蛋 " + (idx + 1),
          text: "请在 content.js 中配置该彩蛋文本",
          note: "",
          effect: ""
        };
      });
    }
  }

  function init() {
    validateConfig();
    initContent();
    initAudio();
    setupCanvas();
    bindEvents();
    updateProgress();
  }

  init();
})();
