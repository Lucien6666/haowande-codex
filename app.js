(function () {
  "use strict";

  var config = window.APP_CONFIG || {};
  var state = {
    unlocked: new Set(),
    shownQueueIndex: 0,
    currentEgg: null,
    favorites: new Set(),
    longPressTimer: null,
    inputBuffer: "",
    touchStartY: null,
    audioPrimed: false,
    audioEnabled: false,
    audioLoadState: "idle",
    keywordModalOpen: false,
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
    keywordOpenBtn: document.getElementById("keyword-open-btn"),
    audioToggle: document.getElementById("audio-toggle"),
    progressBar: document.getElementById("progress-bar"),
    modal: document.getElementById("egg-modal"),
    triggerTag: document.getElementById("egg-trigger-tag"),
    eggTitle: document.getElementById("egg-title"),
    eggSong: document.getElementById("egg-song"),
    eggText: document.getElementById("egg-text"),
    eggNote: document.getElementById("egg-note"),
    nextEggBtn: document.getElementById("next-egg-btn"),
    favEggBtn: document.getElementById("fav-egg-btn"),
    closeModalBtn: document.getElementById("close-modal-btn"),
    keywordModal: document.getElementById("keyword-modal"),
    keywordModalTitle: document.getElementById("keyword-modal-title"),
    keywordInput: document.getElementById("keyword-input"),
    keywordError: document.getElementById("keyword-error"),
    keywordSubmitBtn: document.getElementById("keyword-submit-btn"),
    keywordCancelBtn: document.getElementById("keyword-cancel-btn"),
    finale: document.getElementById("finale"),
    finalMessage: document.getElementById("final-message"),
    finalSignature: document.getElementById("final-signature"),
    finalDate: document.getElementById("final-date"),
    pageTitle: document.getElementById("page-title"),
    pageSubtitle: document.getElementById("page-subtitle"),
    canvas: document.getElementById("particle-canvas")
  };

  var audio = null;
  var ctx = null;
  var particles = [];

  function safeText(val, fallback) {
    return typeof val === "string" && val.trim() ? val : fallback;
  }

  function normalizeKeywordText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function isEditableTarget(target) {
    if (!target) {
      return false;
    }
    var tag = (target.tagName || "").toUpperCase();
    return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function initContent() {
    document.title = safeText(config.title, "给你的一场霓虹演唱会");
    if (els.pageTitle) {
      els.pageTitle.textContent = safeText(config.title, "给你的一场霓虹演唱会");
    }
    if (els.pageSubtitle) {
      els.pageSubtitle.textContent = safeText(config.subtitle, "每个彩蛋，都是一句想悄悄唱给你的话。");
    }
    if (els.finalMessage) {
      els.finalMessage.textContent = safeText(config.finalMessage, "愿你永远做自己喜欢的自己。\n\n这页写给你。");
    }
    if (els.finalSignature) {
      els.finalSignature.textContent = safeText(config.finalSignature, "—— 某个很喜欢你的人");
    }

    if (els.keywordOpenBtn) {
      els.keywordOpenBtn.textContent = safeText(config.keywordButtonText, "输入暗号");
    }
    if (els.keywordModalTitle) {
      els.keywordModalTitle.textContent = safeText(config.keywordPromptTitle, "输入暗号");
    }
    if (els.keywordInput) {
      els.keywordInput.placeholder = safeText(config.keywordPromptPlaceholder, "输入暗号");
    }

    var now = new Date();
    if (els.finalDate) {
      els.finalDate.textContent = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
    }
  }

  function syncAudioButton() {
    if (!els.audioToggle) {
      return;
    }

    if (!audio) {
      els.audioToggle.disabled = true;
      els.audioToggle.setAttribute("aria-pressed", "false");
      els.audioToggle.textContent = "音乐：未配置";
      return;
    }

    if (state.audioLoadState === "failed") {
      els.audioToggle.disabled = false;
      els.audioToggle.setAttribute("aria-pressed", "false");
      els.audioToggle.textContent = "音乐：加载失败";
      return;
    }

    if (state.audioLoadState === "loading" && !state.audioEnabled) {
      els.audioToggle.disabled = false;
      els.audioToggle.setAttribute("aria-pressed", "false");
      els.audioToggle.textContent = "音乐：加载中";
      return;
    }

    els.audioToggle.disabled = false;
    els.audioToggle.setAttribute("aria-pressed", String(state.audioEnabled));
    els.audioToggle.textContent = state.audioEnabled ? "音乐：开" : "音乐：点我播放";
  }

  function initAudio() {
    var bgmUrl = safeText(config.bgmUrl, "");
    if (!bgmUrl) {
      syncAudioButton();
      return;
    }

    audio = new Audio(bgmUrl);
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = "auto";
    state.audioLoadState = "loading";

    audio.addEventListener("canplay", function () {
      if (state.audioLoadState !== "failed") {
        state.audioLoadState = "ready";
      }
      syncAudioButton();
    });

    audio.addEventListener("error", function () {
      state.audioLoadState = "failed";
      state.audioEnabled = false;
      syncAudioButton();
    });

    audio.addEventListener("pause", function () {
      if (state.audioEnabled) {
        state.audioEnabled = false;
        syncAudioButton();
      }
    });

    syncAudioButton();
  }

  function tryPlayAudio() {
    if (!audio) {
      return Promise.resolve(false);
    }

    return audio
      .play()
      .then(function () {
        state.audioEnabled = true;
        if (state.audioLoadState !== "failed") {
          state.audioLoadState = "ready";
        }
        syncAudioButton();
        return true;
      })
      .catch(function () {
        state.audioEnabled = false;
        syncAudioButton();
        return false;
      });
  }

  function primeAudio() {
    if (!audio || state.audioPrimed) {
      return;
    }
    state.audioPrimed = true;
    tryPlayAudio();
  }

  function toggleAudio() {
    if (!audio) {
      return;
    }

    if (state.audioEnabled) {
      audio.pause();
      state.audioEnabled = false;
      syncAudioButton();
      return;
    }

    if (state.audioLoadState === "failed") {
      state.audioLoadState = "loading";
      syncAudioButton();
      audio.load();
    }

    tryPlayAudio();
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

  function getEggLyric(egg) {
    var lyric = safeText(egg.lyric, "");
    if (lyric) {
      return lyric;
    }
    return safeText(egg.text, "[在 content.js 填写歌词文案]");
  }

  function showEgg(egg) {
    if (!egg) {
      return;
    }

    state.currentEgg = egg;
    if (els.triggerTag) {
      els.triggerTag.textContent = triggerLabel[egg.trigger] || "彩蛋";
    }
    if (els.eggTitle) {
      els.eggTitle.textContent = safeText(egg.title, "彩蛋");
    }

    if (els.eggSong) {
      var song = safeText(egg.song, "");
      if (song) {
        els.eggSong.textContent = "♪ " + song;
        els.eggSong.style.display = "block";
      } else {
        els.eggSong.textContent = "";
        els.eggSong.style.display = "none";
      }
    }

    if (els.eggText) {
      els.eggText.textContent = getEggLyric(egg);
    }
    if (els.eggNote) {
      els.eggNote.textContent = safeText(egg.note, "");
    }
    if (els.favEggBtn) {
      els.favEggBtn.textContent = state.favorites.has(egg.id) ? "已收藏" : "收藏这句";
    }
    if (els.modal) {
      els.modal.classList.add("show");
      els.modal.setAttribute("aria-hidden", "false");
    }
  }

  function closeModal() {
    if (!els.modal) {
      return;
    }
    els.modal.classList.remove("show");
    els.modal.setAttribute("aria-hidden", "true");
  }

  function setKeywordError(text) {
    if (!els.keywordError) {
      return;
    }
    els.keywordError.textContent = text || "";
  }

  function openKeywordModal() {
    if (!els.keywordModal) {
      return;
    }
    state.keywordModalOpen = true;
    els.keywordModal.classList.add("show");
    els.keywordModal.setAttribute("aria-hidden", "false");
    setKeywordError("");
    if (els.keywordInput) {
      els.keywordInput.value = "";
      setTimeout(function () {
        els.keywordInput.focus();
      }, 30);
    }
  }

  function closeKeywordModal() {
    if (!els.keywordModal) {
      return;
    }
    state.keywordModalOpen = false;
    els.keywordModal.classList.remove("show");
    els.keywordModal.setAttribute("aria-hidden", "true");
    setKeywordError("");
  }

  function submitKeyword() {
    var expected = normalizeKeywordText(safeText(config.keyword, "倔强"));
    var typed = normalizeKeywordText(els.keywordInput ? els.keywordInput.value : "");

    if (!typed) {
      setKeywordError("请先输入暗号。");
      return;
    }

    if (typed !== expected) {
      setKeywordError(safeText(config.keywordErrorText, "暗号还不对，再试一次。"));
      return;
    }

    closeKeywordModal();
    burstAt(window.innerWidth * 0.5, window.innerHeight * 0.5, 44);
    triggerByType("type-keyword");
    state.inputBuffer = "";
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
    if (!els.progressBar) {
      return;
    }
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
      closeKeywordModal();
      if (els.finale) {
        els.finale.classList.add("show");
        els.finale.setAttribute("aria-hidden", "false");
      }
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
    if (els.startScreen) {
      els.startScreen.classList.remove("visible");
    }
    if (els.mainStage) {
      els.mainStage.classList.add("active");
    }
  }

  function shouldIgnoreStageGesture(target) {
    if (!target || typeof target.closest !== "function") {
      return false;
    }
    return Boolean(
      target.closest(".btn") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest(".keyword-input")
    );
  }

  function onHeartClick(evt) {
    createRipple(evt.clientX, evt.clientY);
    burstAt(evt.clientX, evt.clientY, 26);
    triggerByType("click-heart");
  }

  function onLongPressStart(evt) {
    if (shouldIgnoreStageGesture(evt.target)) {
      return;
    }

    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
    }

    var point = getPoint(evt);
    state.longPressTimer = setTimeout(function () {
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
    var point = getPoint(evt);
    createRipple(point.x, point.y);
    burstAt(point.x, point.y, 18);
    triggerByType("tap-corner");
  }

  function onKeyInput(evt) {
    if (isEditableTarget(evt.target)) {
      return;
    }

    var key = evt.key;
    if (!key || key.length !== 1) {
      return;
    }

    state.inputBuffer += key.toLowerCase();
    if (state.inputBuffer.length > 24) {
      state.inputBuffer = state.inputBuffer.slice(-24);
    }

    var keyword = normalizeKeywordText(safeText(config.keyword, "倔强"));
    if (keyword && normalizeKeywordText(state.inputBuffer).indexOf(keyword) !== -1) {
      burstAt(window.innerWidth * 0.5, window.innerHeight * 0.5, 40);
      triggerByType("type-keyword");
      state.inputBuffer = "";
    }
  }

  function onTouchStart(evt) {
    if (shouldIgnoreStageGesture(evt.target)) {
      state.touchStartY = null;
      return;
    }

    if (!evt.touches || !evt.touches[0]) {
      return;
    }
    state.touchStartY = evt.touches[0].clientY;
  }

  function onTouchEnd(evt) {
    if (shouldIgnoreStageGesture(evt.target)) {
      state.touchStartY = null;
      return;
    }

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

    if (els.favEggBtn) {
      els.favEggBtn.textContent = state.favorites.has(state.currentEgg.id) ? "已收藏" : "收藏这句";
    }
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

  function setupCanvas() {
    if (!els.canvas) {
      return;
    }

    ctx = els.canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    requestAnimationFrame(tickParticles);
  }

  function handleKeywordOpen(evt) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    openKeywordModal();
  }

  function resizeCanvas() {
    if (!els.canvas) {
      return;
    }
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
    if (ctx && els.canvas) {
      ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
      for (var i = particles.length - 1; i >= 0; i -= 1) {
        var particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.01;
        particle.life -= 1;
        var alpha = Math.max(0, particle.life / 60);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + particle.color + "," + alpha + ")";
        ctx.fill();
        if (particle.life <= 0) {
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
    if (els.startBtn) {
      els.startBtn.addEventListener("click", onStart);
    }
    if (els.audioToggle) {
      els.audioToggle.addEventListener("click", toggleAudio);
    }
    if (els.keywordOpenBtn) {
      els.keywordOpenBtn.addEventListener("click", handleKeywordOpen);
      els.keywordOpenBtn.addEventListener("touchend", handleKeywordOpen, { passive: false });
    }

    document.addEventListener(
      "pointerdown",
      function () {
        primeAudio();
      },
      { once: true }
    );

    if (els.heart) {
      els.heart.addEventListener("click", onHeartClick);
    }

    if (els.stage) {
      els.stage.addEventListener("mousedown", onLongPressStart);
      els.stage.addEventListener("touchstart", onLongPressStart, { passive: true });
      els.stage.addEventListener("mouseup", onLongPressEnd);
      els.stage.addEventListener("mouseleave", onLongPressEnd);
      els.stage.addEventListener("touchend", onLongPressEnd);

      els.stage.addEventListener("touchstart", onTouchStart, { passive: true });
      els.stage.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    for (var i = 0; i < els.corners.length; i += 1) {
      els.corners[i].addEventListener("click", onCornerTap);
      els.corners[i].addEventListener("touchstart", onCornerTap, { passive: true });
    }

    window.addEventListener("keydown", onKeyInput);

    if (els.nextEggBtn) {
      els.nextEggBtn.addEventListener("click", onNextEgg);
    }
    if (els.favEggBtn) {
      els.favEggBtn.addEventListener("click", onFavorite);
    }
    if (els.closeModalBtn) {
      els.closeModalBtn.addEventListener("click", closeModal);
    }

    if (els.modal) {
      els.modal.addEventListener("click", function (evt) {
        if (evt.target === els.modal) {
          closeModal();
        }
      });
    }

    if (els.keywordSubmitBtn) {
      els.keywordSubmitBtn.addEventListener("click", submitKeyword);
    }
    if (els.keywordCancelBtn) {
      els.keywordCancelBtn.addEventListener("click", closeKeywordModal);
    }
    if (els.keywordInput) {
      els.keywordInput.addEventListener("keydown", function (evt) {
        if (evt.key === "Enter") {
          evt.preventDefault();
          submitKeyword();
        }
      });
    }
    if (els.keywordModal) {
      els.keywordModal.addEventListener("click", function (evt) {
        if (evt.target === els.keywordModal) {
          closeKeywordModal();
        }
      });
    }

    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape") {
        if (state.keywordModalOpen) {
          closeKeywordModal();
          return;
        }
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
          song: "歌名占位",
          lyric: "请在 content.js 中配置该彩蛋歌词",
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
