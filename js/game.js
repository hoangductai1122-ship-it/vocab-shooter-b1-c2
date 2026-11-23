/* ==========================================================================
   Luyện Gõ · B1–C2 Space Typing Vocabulary Game Engine
   ========================================================================== */

(() => {
  "use strict";

  const STORAGE_PROGRESS_KEY = "vocab_shooter_progress_v1";
  const STORAGE_CUSTOM_KEY = "vocab_shooter_custom_words_v1";
  const STORAGE_PREFS_KEY = "vocab_shooter_prefs_v1";

  const LEVEL_COLORS = {
    B1: "#38bdf8",
    B2: "#a855f7",
    C1: "#ec4899",
    C2: "#ef4444"
  };

  const LEVEL_BONUS = {
    B1: 0,
    B2: 25,
    C1: 50,
    C2: 80
  };

  const SPEED_PRESETS = {
    chill:  { baseSpeed: 33, maxSpeed: 54, spawnInterval: 2.35, minSpawn: 1.55, maxActive: 4 },
    normal: { baseSpeed: 48, maxSpeed: 74, spawnInterval: 1.85, minSpawn: 1.15, maxActive: 5 },
    fast:   { baseSpeed: 68, maxSpeed: 102, spawnInterval: 1.45, minSpawn: 0.85, maxActive: 6 }
  };

  const CHEER_MESSAGES = [
    "Tuyệt vời!",
    "Chuẩn xác!",
    "Đỉnh quá!",
    "Nhanh như chớp!",
    "Bắn cực nét!",
    "Học siêu đỉnh!"
  ];

  // --------------------------------------------------------------------------
  // State & Data Initialization
  // --------------------------------------------------------------------------
  const audio = new window.GameAudio();
  const topics = window.VOCAB_TOPICS || [];
  const topicMap = new Map(topics.map(t => [t.id, t]));
  const posMap = window.POS_LABELS || {};

  let allVocab = [];
  let progress = loadProgress();
  let prefs = loadPrefs();

  const game = {
    status: "menu", // menu | playing | paused | result
    levelFilter: prefs.levelFilter || "ALL", // ALL | B1 | B2 | C1 | C2
    milestoneId: prefs.milestoneId || 1,     // 1..20
    speedKey: prefs.speedKey || "chill",     // chill | normal | fast
    endless: Boolean(prefs.endless),
    showLevelOnPill: prefs.showLevelOnPill !== false,
    virtualKeyboardOpen: false,

    score: 0,
    lives: 3,
    maxLives: 3,
    combo: 0,
    bestCombo: 0,
    correctChars: 0,
    wrongChars: 0,

    milestoneGoal: 15,
    wordsDestroyed: 0,
    wordQueue: [],
    activeWords: [],
    lockedWord: null,
    sessionLog: [], // [{ entry, status: 'hit' | 'missed' }]
    recentMeanings: [], // up to 3 most recent for bottom-right dock

    spawnTimer: 0.4,
    elapsed: 0,
    lastFrameTs: 0,
    wordUid: 0,
    rocketAngle: 0,
    lastDockWord: null
  };

  // Canvas visual effects state
  const fx = {
    width: 1000,
    height: 600,
    stars: [],
    lasers: [],
    particles: [],
    rings: []
  };

  // Notebook pagination state
  const notebookState = {
    page: 1,
    perPage: 45,
    filtered: []
  };

  // --------------------------------------------------------------------------
  // DOM References
  // --------------------------------------------------------------------------
  const el = {
    arena: document.getElementById("arena"),
    canvas: document.getElementById("fx-canvas"),
    wordsLayer: document.getElementById("words-layer"),
    popupsLayer: document.getElementById("popups-layer"),
    dangerLine: document.getElementById("danger-line"),
    rocketShip: document.getElementById("rocket-ship"),
    rocketAnchor: document.getElementById("rocket-anchor"),
    mascot: document.getElementById("mascot"),
    mascotBubble: document.getElementById("mascot-bubble"),

    // Header & HUD
    btnHome: document.getElementById("btn-home"),
    btnNotebook: document.getElementById("btn-notebook"),
    notebookCount: document.getElementById("notebook-count"),
    btnFullscreen: document.getElementById("btn-fullscreen"),
    quickLevelBar: document.getElementById("quick-level-bar"),

    scoreValue: document.getElementById("score-value"),
    comboBadge: document.getElementById("combo-badge"),
    btnMilestones: document.getElementById("btn-milestones"),
    milestoneLabel: document.getElementById("milestone-label"),
    milestoneTopic: document.getElementById("milestone-topic"),
    milestoneProgressText: document.getElementById("milestone-progress-text"),
    milestoneProgressFill: document.getElementById("milestone-progress-fill"),
    heartsContainer: document.getElementById("hearts-container"),
    deckPill: document.getElementById("deck-pill"),
    deckPillText: document.getElementById("deck-pill-text"),

    // Right controls
    btnExit: document.getElementById("btn-exit"),
    btnPause: document.getElementById("btn-pause"),
    iconPause: document.getElementById("icon-pause"),
    iconPlay: document.getElementById("icon-play"),
    btnKeyboard: document.getElementById("btn-keyboard"),
    btnSound: document.getElementById("btn-sound"),
    iconSoundOn: document.getElementById("icon-sound-on"),
    iconSoundOff: document.getElementById("icon-sound-off"),

    // Meaning dock & typing UI
    meaningHistory: document.getElementById("meaning-history"),
    meaningCurrent: document.getElementById("meaning-current"),
    mcStatus: document.getElementById("mc-status"),
    mcLevel: document.getElementById("mc-level"),
    mcSpeak: document.getElementById("mc-speak"),
    mcWord: document.getElementById("mc-word"),
    mcIpa: document.getElementById("mc-ipa"),
    mcPos: document.getElementById("mc-pos"),
    mcMeaning: document.getElementById("mc-meaning"),
    typingIndicator: document.getElementById("typing-indicator"),
    typingTyped: document.getElementById("typing-typed"),
    typingRemaining: document.getElementById("typing-remaining"),
    virtualKeyboard: document.getElementById("virtual-keyboard"),
    mobileInput: document.getElementById("mobile-input"),

    // Overlays
    startOverlay: document.getElementById("start-overlay"),
    startLevelGroup: document.getElementById("start-level-group"),
    poolCountHint: document.getElementById("pool-count-hint"),
    selectMilestone: document.getElementById("select-milestone"),
    speedGroup: document.getElementById("speed-group"),
    optSpeak: document.getElementById("opt-speak"),
    optShowLevel: document.getElementById("opt-show-level"),
    optEndless: document.getElementById("opt-endless"),
    btnStartGame: document.getElementById("btn-start-game"),
    btnOpenNotebookStart: document.getElementById("btn-open-notebook-start"),

    pauseOverlay: document.getElementById("pause-overlay"),
    pauseSubtitle: document.getElementById("pause-subtitle"),
    btnResume: document.getElementById("btn-resume"),
    btnRestartMilestone: document.getElementById("btn-restart-milestone"),
    btnPauseNotebook: document.getElementById("btn-pause-notebook"),
    btnPauseMenu: document.getElementById("btn-pause-menu"),

    resultOverlay: document.getElementById("result-overlay"),
    resultEmoji: document.getElementById("result-emoji"),
    resultTitle: document.getElementById("result-title"),
    resultSubtitle: document.getElementById("result-subtitle"),
    resScore: document.getElementById("res-score"),
    resWords: document.getElementById("res-words"),
    resAccuracy: document.getElementById("res-accuracy"),
    resCombo: document.getElementById("res-combo"),
    resultReviewList: document.getElementById("result-review-list"),
    btnNextMilestone: document.getElementById("btn-next-milestone"),
    btnReplayMilestone: document.getElementById("btn-replay-milestone"),
    btnResultMenu: document.getElementById("btn-result-menu"),

    // Modals
    milestonesModal: document.getElementById("milestones-modal"),
    milestonesGrid: document.getElementById("milestones-grid"),
    closeMilestones: document.getElementById("close-milestones"),

    notebookModal: document.getElementById("notebook-modal"),
    closeNotebook: document.getElementById("close-notebook"),
    nbSummaryText: document.getElementById("nb-summary-text"),
    nbSearch: document.getElementById("nb-search"),
    nbLevel: document.getElementById("nb-level"),
    nbTopic: document.getElementById("nb-topic"),
    nbStatus: document.getElementById("nb-status"),
    nbTbody: document.getElementById("nb-tbody"),
    nbPagination: document.getElementById("nb-pagination"),
    tabBrowse: document.getElementById("tab-browse"),
    tabImport: document.getElementById("tab-import"),
    importFile: document.getElementById("import-file"),
    importTextarea: document.getElementById("import-textarea"),
    importFeedback: document.getElementById("import-feedback"),
    btnDoImport: document.getElementById("btn-do-import"),
    btnExportJson: document.getElementById("btn-export-json"),
    btnResetProgress: document.getElementById("btn-reset-progress")
  };

  const ctx = el.canvas.getContext("2d");

  // --------------------------------------------------------------------------
  // Persistence Helpers
  // --------------------------------------------------------------------------
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          mastered: new Set(parsed.mastered || []),
          missed: new Set(parsed.missed || []),
          clearedMilestones: new Set(parsed.clearedMilestones || []),
          highScore: parsed.highScore || 0
        };
      }
    } catch (_) {}
    return { mastered: new Set(), missed: new Set(), clearedMilestones: new Set(), highScore: 0 };
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        STORAGE_PROGRESS_KEY,
        JSON.stringify({
          mastered: Array.from(progress.mastered),
          missed: Array.from(progress.missed),
          clearedMilestones: Array.from(progress.clearedMilestones),
          highScore: progress.highScore
        })
      );
    } catch (_) {}
    updateNotebookBadge();
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_PREFS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      levelFilter: "ALL",
      milestoneId: 1,
      speedKey: "chill",
      soundEnabled: true,
      autoSpeak: true,
      showLevelOnPill: true,
      endless: false
    };
  }

  function savePrefs() {
    try {
      localStorage.setItem(
        STORAGE_PREFS_KEY,
        JSON.stringify({
          levelFilter: game.levelFilter,
          milestoneId: game.milestoneId,
          speedKey: game.speedKey,
          soundEnabled: audio.soundEnabled,
          autoSpeak: audio.autoSpeak,
          showLevelOnPill: game.showLevelOnPill,
          endless: game.endless
        })
      );
    } catch (_) {}
  }

  function loadCustomWords() {
    try {
      const raw = localStorage.getItem(STORAGE_CUSTOM_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveCustomWords(list) {
    try {
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(list));
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // Vocabulary Normalization & Filtering
  // --------------------------------------------------------------------------
  function normalizeEntry(raw, isCustom = false) {
    const word = String(raw[0] || raw.word || "").trim().toLowerCase();
    const pos = String(raw[1] || raw.pos || "n").trim().toLowerCase();
    const level = String(raw[2] || raw.level || "B2").trim().toUpperCase();
    const ipa = String(raw[3] || raw.ipa || "").trim();
    const meaning = String(raw[4] || raw.meaning || "").trim();
    const topicId = Number(raw[5] || raw.topicId || 1);
    const topic = topicMap.get(topicId) || topics[0];
    const posInfo = posMap[pos] || { abbr: pos, vi: pos, short: pos };

    return {
      word,
      pos: posInfo.abbr,
      posVi: posInfo.vi,
      posShort: posInfo.short,
      level: ["B1", "B2", "C1", "C2"].includes(level) ? level : "B2",
      ipa,
      meaning,
      topicId: topic ? topic.id : 1,
      topicName: topic ? topic.name : "Technology",
      topicVi: topic ? topic.vi : "Công nghệ",
      isCustom
    };
  }

  function rebuildVocabulary() {
    const seen = new Set();
    const merged = [];

    for (const part of window.VOCAB_PARTS || []) {
      for (const row of part) {
        const entry = normalizeEntry(row, false);
        if (entry.word && !seen.has(entry.word)) {
          seen.add(entry.word);
          merged.push(entry);
        }
      }
    }

    for (const row of loadCustomWords()) {
      const entry = normalizeEntry(row, true);
      if (entry.word && /^[a-z]+$/.test(entry.word) && entry.meaning) {
        if (seen.has(entry.word)) {
          const idx = merged.findIndex(e => e.word === entry.word);
          if (idx >= 0) merged[idx] = entry;
        } else {
          seen.add(entry.word);
          merged.push(entry);
        }
      }
    }

    allVocab = merged;
    updatePoolHints();
    updateNotebookBadge();
  }

  function getFilteredPool(forMilestone = !game.endless) {
    return allVocab.filter(item => {
      const matchLvl = game.levelFilter === "ALL" || item.level === game.levelFilter;
      const matchTopic = !forMilestone || item.topicId === game.milestoneId;
      return matchLvl && matchTopic;
    });
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildQueueForRun() {
    const pool = getFilteredPool(!game.endless);
    const fallback = pool.length ? pool : allVocab;

    if (game.levelFilter === "ALL" && !game.endless) {
      // Gentle CEFR ramp inside a milestone: B1 -> B2 -> C1 -> C2 mix
      const byLvl = { B1: [], B2: [], C1: [], C2: [] };
      fallback.forEach(w => {
        if (byLvl[w.level]) byLvl[w.level].push(w);
      });
      const b1 = shuffle(byLvl.B1);
      const b2 = shuffle(byLvl.B2);
      const c1 = shuffle(byLvl.C1);
      const c2 = shuffle(byLvl.C2);
      // Interleave progressively so players experience all B1-C2 within the 15-word milestone
      const mixed = [];
      const maxLen = Math.max(b1.length, b2.length, c1.length, c2.length);
      for (let i = 0; i < maxLen; i++) {
        if (b1[i]) mixed.push(b1[i]);
        if (b2[i]) mixed.push(b2[i]);
        if (c1[i]) mixed.push(c1[i]);
        if (c2[i]) mixed.push(c2[i]);
      }
      return mixed;
    }

    return shuffle(fallback);
  }

  // --------------------------------------------------------------------------
  // Canvas FX (Starfield, Lasers, Explosions, Shockwaves)
  // --------------------------------------------------------------------------
  function resizeCanvas() {
    const rect = el.arena.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fx.width = rect.width;
    fx.height = rect.height;
    el.canvas.width = Math.round(rect.width * dpr);
    el.canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!fx.stars.length) {
      initStars();
    } else {
      fx.stars.forEach(s => {
        s.x = Math.random() * fx.width;
        s.y = Math.random() * fx.height;
      });
    }
  }

  function initStars() {
    fx.stars = [];
    const count = 115;
    for (let i = 0; i < count; i++) {
      fx.stars.push({
        x: Math.random() * fx.width,
        y: Math.random() * fx.height,
        r: Math.random() < 0.12 ? 1.8 + Math.random() * 1.1 : 0.6 + Math.random() * 1.1,
        sparkle: Math.random() < 0.08,
        alpha: 0.25 + Math.random() * 0.65,
        speed: 0.7 + Math.random() * 2.1,
        phase: Math.random() * Math.PI * 2,
        drift: 3 + Math.random() * 7,
        hue: Math.random() < 0.25 ? "#bfdbfe" : Math.random() < 0.15 ? "#e9d5ff" : "#ffffff"
      });
    }
  }

  function getRocketNozzlePoint() {
    const arenaRect = el.arena.getBoundingClientRect();
    const rocketRect = el.rocketAnchor.getBoundingClientRect();
    const cx = rocketRect.left - arenaRect.left + rocketRect.width / 2;
    const cy = rocketRect.top - arenaRect.top + rocketRect.height * 0.24;
    return { x: cx, y: cy };
  }

  function spawnLaser(tx, ty, color = "#38bdf8", thick = false) {
    const from = getRocketNozzlePoint();
    fx.lasers.push({
      x1: from.x,
      y1: from.y,
      x2: tx,
      y2: ty,
      color,
      thick,
      life: thick ? 0.24 : 0.15,
      maxLife: thick ? 0.24 : 0.15
    });

    // Small muzzle sparks
    for (let i = 0; i < (thick ? 10 : 5); i++) {
      const ang = Math.atan2(ty - from.y, tx - from.x) + (Math.random() - 0.5) * 0.8;
      const spd = 80 + Math.random() * 160;
      fx.particles.push({
        x: tx,
        y: ty,
        vx: Math.cos(ang) * spd * -0.4 + (Math.random() - 0.5) * 90,
        vy: Math.sin(ang) * spd * -0.4 + (Math.random() - 0.5) * 90,
        r: 1.8 + Math.random() * 2,
        color: "#fde047",
        life: 0.25 + Math.random() * 0.18,
        maxLife: 0.43
      });
    }
  }

  function spawnExplosion(x, y, color) {
    fx.rings.push({
      x,
      y,
      r: 12,
      maxR: 68,
      color,
      life: 0.36,
      maxLife: 0.36
    });

    for (let i = 0; i < 24; i++) {
      const ang = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.35;
      const spd = 70 + Math.random() * 210;
      fx.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 2 + Math.random() * 3.2,
        color: i % 3 === 0 ? "#fde047" : i % 4 === 0 ? "#ffffff" : color,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8
      });
    }
  }

  function renderCanvas(dt, nowSec) {
    ctx.clearRect(0, 0, fx.width, fx.height);

    // 1. Stars
    for (const s of fx.stars) {
      if (game.status === "playing") {
        s.y += s.drift * dt;
        if (s.y > fx.height) {
          s.y = -2;
          s.x = Math.random() * fx.width;
        }
      }
      const tw = 0.55 + 0.45 * Math.sin(nowSec * s.speed + s.phase);
      const a = s.alpha * tw;
      ctx.globalAlpha = a;
      ctx.fillStyle = s.hue;

      if (s.sparkle) {
        // 4-point cross star like screenshot
        const len = s.r * 3.2;
        ctx.beginPath();
        ctx.moveTo(s.x - len, s.y);
        ctx.lineTo(s.x + len, s.y);
        ctx.moveTo(s.x, s.y - len);
        ctx.lineTo(s.x, s.y + len);
        ctx.strokeStyle = s.hue;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 2. Shockwave rings
    for (let i = fx.rings.length - 1; i >= 0; i--) {
      const ring = fx.rings[i];
      ring.life -= dt;
      if (ring.life <= 0) {
        fx.rings.splice(i, 1);
        continue;
      }
      const p = 1 - ring.life / ring.maxLife;
      const curR = ring.r + (ring.maxR - ring.r) * (1 - Math.pow(1 - p, 3));
      ctx.save();
      ctx.globalAlpha = (1 - p) * 0.75;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 3 * (1 - p) + 0.8;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Laser beams
    for (let i = fx.lasers.length - 1; i >= 0; i--) {
      const l = fx.lasers[i];
      l.life -= dt;
      if (l.life <= 0) {
        fx.lasers.splice(i, 1);
        continue;
      }
      const alpha = l.life / l.maxLife;
      ctx.save();
      ctx.lineCap = "round";

      // Outer glow beam
      ctx.globalAlpha = alpha * 0.55;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.thick ? 11 : 6;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();

      // Inner bright core
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#fef9c3";
      ctx.lineWidth = l.thick ? 3.5 : 2;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Particles
    for (let i = fx.particles.length - 1; i >= 0; i--) {
      const p = fx.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        fx.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.4 + 0.6 * (p.life / p.maxLife)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --------------------------------------------------------------------------
  // UI & HUD Rendering Helpers
  // --------------------------------------------------------------------------
  function renderHearts() {
    let html = "";
    for (let i = 0; i < game.maxLives; i++) {
      const filled = i < game.lives;
      html += `
        <svg class="heart-svg ${filled ? "filled" : "empty"}" viewBox="0 0 24 24"
          fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>`;
    }
    el.heartsContainer.innerHTML = html;
  }

  function updateHUD() {
    el.scoreValue.textContent = game.score.toLocaleString("en-US");
    if (game.combo >= 2) {
      el.comboBadge.textContent = `x${game.combo}`;
      el.comboBadge.classList.remove("hidden");
    } else {
      el.comboBadge.classList.add("hidden");
    }

    const topic = topicMap.get(game.milestoneId) || topics[0];
    if (game.endless) {
      el.milestoneLabel.textContent = "Vô tận";
      el.milestoneTopic.textContent = "Mọi chủ đề";
      el.milestoneProgressText.textContent = `${game.wordsDestroyed} từ`;
      el.milestoneProgressFill.style.width = `${Math.min(100, (game.wordsDestroyed % 20) * 5)}%`;
    } else {
      el.milestoneLabel.textContent = `Mốc ${topic.id}/20`;
      el.milestoneTopic.textContent = topic.name;
      el.milestoneProgressText.textContent = `${game.wordsDestroyed}/${game.milestoneGoal}`;
      const pct = game.milestoneGoal > 0 ? Math.min(100, (game.wordsDestroyed / game.milestoneGoal) * 100) : 0;
      el.milestoneProgressFill.style.width = `${pct}%`;
    }

    const lvlLabel = game.levelFilter === "ALL" ? "B1–C2" : `Level ${game.levelFilter}`;
    const totalMatch = getFilteredPool(false).length;
    el.deckPillText.textContent = `${totalMatch.toLocaleString("en-US")} từ vựng tiếng Anh · ${lvlLabel}`;

    renderHearts();
    el.arena.classList.toggle("hide-pill-levels", !game.showLevelOnPill);
  }

  function updateNotebookBadge() {
    el.notebookCount.textContent = `${progress.mastered.size}/${allVocab.length}`;
  }

  function updatePoolHints() {
    const countAll = getFilteredPool(false).length;
    const countTopic = getFilteredPool(true).length;
    el.poolCountHint.textContent = game.endless
      ? `(${countAll.toLocaleString("en-US")} từ sẵn sàng)`
      : `(${countTopic} từ trong mốc này · ${countAll.toLocaleString("en-US")} tổng)`;
  }

  function updateTypingIndicator() {
    if (!game.lockedWord) {
      el.typingIndicator.classList.add("hidden");
      highlightVirtualKey(null);
      return;
    }
    const w = game.lockedWord;
    el.typingTyped.textContent = w.entry.word.slice(0, w.typedCount);
    el.typingRemaining.textContent = w.entry.word.slice(w.typedCount);
    el.typingIndicator.classList.remove("hidden");
    highlightVirtualKey(w.entry.word[w.typedCount] || null);
  }

  function aimRocketAt(tx, ty) {
    const origin = getRocketNozzlePoint();
    const dx = tx - origin.x;
    const dy = ty - origin.y;
    const angleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    game.rocketAngle = Math.max(-52, Math.min(52, angleDeg));
    el.rocketShip.style.transform = `rotate(${game.rocketAngle.toFixed(1)}deg)`;
  }

  function triggerRocketRecoil() {
    el.rocketShip.classList.add("recoil");
    el.rocketShip.style.transform = `rotate(${game.rocketAngle.toFixed(1)}deg) translateY(5px) scale(0.96)`;
    clearTimeout(triggerRocketRecoil._t);
    triggerRocketRecoil._t = setTimeout(() => {
      el.rocketShip.classList.remove("recoil");
      el.rocketShip.style.transform = `rotate(${game.rocketAngle.toFixed(1)}deg)`;
    }, 90);
  }

  function triggerMascot(mode, text) {
    el.mascot.classList.remove("cheer", "shock");
    void el.mascot.offsetWidth;
    el.mascot.classList.add(mode);

    if (text) {
      el.mascotBubble.textContent = text;
      el.mascotBubble.classList.remove("hidden");
      clearTimeout(triggerMascot._bt);
      triggerMascot._bt = setTimeout(() => {
        el.mascotBubble.classList.add("hidden");
      }, 1500);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // --------------------------------------------------------------------------
  // HERO FEATURE: Vietnamese Meaning + Part of Speech Reveal!
  // --------------------------------------------------------------------------
  function showMeaningPopup(entry, x, y, missed = false) {
    const popup = document.createElement("div");
    popup.className = `meaning-popup${missed ? " missed" : ""}`;

    // Clamp position safely inside arena so popup never gets clipped
    const clampedX = Math.max(155, Math.min(fx.width - 175, x));
    const clampedY = Math.max(92, Math.min(fx.height - 135, y));
    popup.style.left = `${clampedX}px`;
    popup.style.top = `${clampedY}px`;

    popup.innerHTML = `
      <div class="mp-top">
        <span class="mp-word">${missed ? "✕ " : "✓ "}${escapeHtml(entry.word)}</span>
        <span class="mp-ipa">${escapeHtml(entry.ipa)}</span>
      </div>
      <div class="mp-body">
        <span class="pos-pill pos-${escapeHtml(entry.pos)}">${escapeHtml(entry.posShort)}</span>
        <span class="cefr-tag ${escapeHtml(entry.level)}">${escapeHtml(entry.level)}</span>
        <span class="mp-vi">${escapeHtml(entry.meaning)}</span>
      </div>
    `;

    el.popupsLayer.appendChild(popup);
    setTimeout(() => popup.remove(), 3350);
  }

  function updateMeaningDock(entry, missed = false) {
    // Push previous active word into mini history stack (keep last 2)
    if (game.lastDockWord) {
      game.recentMeanings.unshift(game.lastDockWord);
      if (game.recentMeanings.length > 2) game.recentMeanings.pop();
    }
    game.lastDockWord = { entry, missed };

    // Render history stack
    el.meaningHistory.innerHTML = game.recentMeanings
      .slice()
      .reverse()
      .map(
        item => `
        <div class="mh-item">
          <div class="mh-left">
            <span class="mh-word">${escapeHtml(item.entry.word)}</span>
            <span class="mh-pos">(${escapeHtml(item.entry.pos)})</span>
          </div>
          <span class="mh-vi">${escapeHtml(item.entry.meaning)}</span>
        </div>`
      )
      .join("");

    // Render current highlighted card
    el.meaningCurrent.classList.remove("hidden", "missed-card");
    if (missed) el.meaningCurrent.classList.add("missed-card");
    // Re-trigger entry animation cleanly
    el.meaningCurrent.style.animation = "none";
    void el.meaningCurrent.offsetWidth;
    el.meaningCurrent.style.animation = "";

    el.mcStatus.textContent = missed ? "✕ BỎ LỠ · GHI NHỚ TỪ NÀY" : "✓ VỪA BẮN HẠ";
    el.mcLevel.textContent = entry.level;
    el.mcLevel.className = `cefr-tag ${entry.level}`;
    el.mcWord.textContent = entry.word;
    el.mcIpa.textContent = entry.ipa;
    el.mcPos.textContent = entry.posShort;
    el.mcPos.className = `pos-pill pos-${entry.pos}`;
    el.mcMeaning.textContent = entry.meaning;
  }

  // --------------------------------------------------------------------------
  // Word Spawning & DOM Pill Management
  // --------------------------------------------------------------------------
  function pickNextWordEntry() {
    const activeSet = new Set(game.activeWords.map(w => w.entry.word));
    const activeFirstLetters = new Set(game.activeWords.map(w => w.entry.word[0]));

    if (game.wordQueue.length === 0) {
      game.wordQueue = buildQueueForRun();
    }

    // Try finding a word not on screen AND with a fresh starting letter for crisp lock-on
    let idx = game.wordQueue.findIndex(
      e => !activeSet.has(e.word) && !activeFirstLetters.has(e.word[0])
    );
    if (idx === -1) {
      idx = game.wordQueue.findIndex(e => !activeSet.has(e.word));
    }
    if (idx === -1) return null;

    const [entry] = game.wordQueue.splice(idx, 1);
    return entry;
  }

  function spawnWord() {
    const preset = SPEED_PRESETS[game.speedKey] || SPEED_PRESETS.chill;
    if (game.activeWords.length >= preset.maxActive) return;

    // Stop spawning new words once enough words are already spawned/destroyed for milestone
    if (!game.endless && game.wordsDestroyed + game.activeWords.length >= game.milestoneGoal) {
      return;
    }

    const entry = pickNextWordEntry();
    if (!entry) return;

    const node = document.createElement("div");
    node.className = `word-pill lvl-${entry.level}`;
    node.innerHTML = `
      <span class="word-chars"><span class="typed"></span><span class="untyped">${entry.word}</span></span>
      <span class="pill-cefr">${entry.level}</span>
    `;
    node.style.visibility = "hidden";
    el.wordsLayer.appendChild(node);

    const pillW = node.offsetWidth || 160;
    const pillH = node.offsetHeight || 44;

    // Safe horizontal bounds (avoid right floating controls)
    const minX = 24;
    const maxX = Math.max(minX + 40, fx.width - pillW - 76);

    // Choose non-overlapping X among candidate lanes
    let chosenX = minX + Math.random() * (maxX - minX);
    let bestClearance = -1;
    for (let attempt = 0; attempt < 12; attempt++) {
      const candX = minX + Math.random() * (maxX - minX);
      let minDist = Infinity;
      for (const other of game.activeWords) {
        if (other.y < 140) {
          const dist = Math.abs(candX + pillW / 2 - (other.x + other.w / 2)) - (pillW + other.w) / 2;
          if (dist < minDist) minDist = dist;
        }
      }
      if (minDist > 26) {
        chosenX = candX;
        break;
      }
      if (minDist > bestClearance) {
        bestClearance = minDist;
        chosenX = candX;
      }
    }

    // Gentle speed scaling by progress & word length fairness
    const progressFactor = Math.min(1, game.wordsDestroyed / 35);
    const rawSpeed = preset.baseSpeed + (preset.maxSpeed - preset.baseSpeed) * progressFactor;
    const lengthRelief = entry.word.length > 9 ? 0.84 : entry.word.length > 7 ? 0.92 : 1.0;
    const speed = rawSpeed * lengthRelief * (0.92 + Math.random() * 0.16);

    const wordObj = {
      id: ++game.wordUid,
      entry,
      el: node,
      typedEl: node.querySelector(".typed"),
      untypedEl: node.querySelector(".untyped"),
      x: chosenX,
      y: -pillH - 4,
      w: pillW,
      h: pillH,
      speed,
      typedCount: 0
    };

    node.style.transform = `translate3d(${wordObj.x}px, ${wordObj.y}px, 0)`;
    node.style.visibility = "visible";
    game.activeWords.push(wordObj);
  }

  function removeWordObj(wordObj) {
    const idx = game.activeWords.indexOf(wordObj);
    if (idx >= 0) game.activeWords.splice(idx, 1);
    if (wordObj.el && wordObj.el.parentNode) {
      wordObj.el.remove();
    }
    if (game.lockedWord === wordObj) {
      game.lockedWord = null;
      updateTypingIndicator();
    }
  }

  function clearArenaWords() {
    for (const w of game.activeWords) {
      if (w.el && w.el.parentNode) w.el.remove();
    }
    game.activeWords = [];
    game.lockedWord = null;
    el.popupsLayer.innerHTML = "";
    updateTypingIndicator();
  }

  // --------------------------------------------------------------------------
  // Typing Mechanics & Scoring
  // --------------------------------------------------------------------------
  function handleCharInput(char) {
    if (game.status !== "playing") return;
    const ch = char.toLowerCase();
    if (!/^[a-z]$/.test(ch)) return;

    flashVirtualKey(ch);

    // 1. If no target locked, lock onto lowest word starting with `ch`
    if (!game.lockedWord) {
      const candidates = game.activeWords
        .filter(w => w.entry.word[0] === ch && w.y > -w.h * 0.7)
        .sort((a, b) => b.y - a.y);

      if (!candidates.length) {
        game.wrongChars++;
        game.combo = 0;
        audio.playError();
        updateHUD();
        return;
      }

      game.lockedWord = candidates[0];
      game.lockedWord.el.classList.add("locked");
    }

    // 2. Match next character of locked word
    const target = game.lockedWord;
    const expected = target.entry.word[target.typedCount];

    if (ch === expected) {
      game.correctChars++;
      target.typedCount++;
      target.typedEl.textContent = target.entry.word.slice(0, target.typedCount);
      target.untypedEl.textContent = target.entry.word.slice(target.typedCount);

      // Gentle knockback & aim rocket
      target.y = Math.max(8, target.y - 5);
      const cx = target.x + target.w / 2;
      const cy = target.y + target.h / 2;
      aimRocketAt(cx, cy);
      triggerRocketRecoil();

      const color = LEVEL_COLORS[target.entry.level] || "#38bdf8";
      const isFinal = target.typedCount >= target.entry.word.length;
      spawnLaser(cx, cy, color, isFinal);

      if (isFinal) {
        destroyWord(target, cx, cy, color);
      } else {
        audio.playLaser(target.typedCount);
        updateTypingIndicator();
      }
    } else {
      game.wrongChars++;
      game.combo = 0;
      audio.playError();
      target.el.classList.remove("wrong-hit");
      void target.el.offsetWidth;
      target.el.classList.add("wrong-hit");
      updateHUD();
    }
  }

  function handleBackspace() {
    if (game.status !== "playing" || !game.lockedWord) return;
    const target = game.lockedWord;
    if (target.typedCount > 0) {
      target.typedCount--;
      target.typedEl.textContent = target.entry.word.slice(0, target.typedCount);
      target.untypedEl.textContent = target.entry.word.slice(target.typedCount);
    }
    if (target.typedCount === 0) {
      target.el.classList.remove("locked");
      game.lockedWord = null;
    }
    updateTypingIndicator();
  }

  function unlockTarget() {
    if (!game.lockedWord) return;
    const t = game.lockedWord;
    t.typedCount = 0;
    t.typedEl.textContent = "";
    t.untypedEl.textContent = t.entry.word;
    t.el.classList.remove("locked");
    game.lockedWord = null;
    updateTypingIndicator();
  }

  function destroyWord(target, cx, cy, color) {
    const entry = target.entry;
    removeWordObj(target);

    game.wordsDestroyed++;
    game.combo++;
    if (game.combo > game.bestCombo) game.bestCombo = game.combo;

    const base = 100 + entry.word.length * 10 + (LEVEL_BONUS[entry.level] || 0);
    const mult = 1 + Math.min(game.combo - 1, 10) * 0.12;
    game.score += Math.round(base * mult);
    if (game.score > progress.highScore) progress.highScore = game.score;

    // Progress persistence
    progress.mastered.add(entry.word);
    progress.missed.delete(entry.word);
    saveProgress();

    game.sessionLog.unshift({ entry, status: "hit" });

    // Visual & Audio FX
    spawnExplosion(cx, cy, color);
    audio.playExplosion(game.combo);
    audio.speakWord(entry.word);

    // REVEAL VIETNAMESE MEANING + PART OF SPEECH!
    showMeaningPopup(entry, cx, cy, false);
    updateMeaningDock(entry, false);

    // Mascot celebration on combos or C2 hits
    if (game.combo > 0 && game.combo % 4 === 0) {
      triggerMascot("cheer", `Combo x${game.combo}! 🔥`);
    } else if (entry.level === "C2") {
      triggerMascot("cheer", "Hạ gục từ C2! ⚡");
    } else if (game.combo === 1) {
      const msg = CHEER_MESSAGES[game.wordsDestroyed % CHEER_MESSAGES.length];
      if (game.wordsDestroyed % 5 === 0) triggerMascot("cheer", msg);
    }

    updateHUD();

    // Check Milestone Victory
    if (!game.endless && game.wordsDestroyed >= game.milestoneGoal) {
      progress.clearedMilestones.add(game.milestoneId);
      saveProgress();
      setTimeout(() => {
        if (game.status === "playing") {
          finishRun(true);
        }
      }, 650);
    } else if (game.activeWords.length === 0) {
      // Spawn next word quickly so action feels responsive
      game.spawnTimer = Math.min(game.spawnTimer, 0.35);
    }
  }

  function handleWordMissed(wordObj) {
    // Ignore trailing misses during milestone-victory celebration delay
    if (!game.endless && game.wordsDestroyed >= game.milestoneGoal) {
      removeWordObj(wordObj);
      return;
    }

    const entry = wordObj.entry;
    const cx = wordObj.x + wordObj.w / 2;
    const cy = Math.max(120, fx.height - 95);

    removeWordObj(wordObj);

    game.lives = Math.max(0, game.lives - 1);
    game.combo = 0;

    if (!progress.mastered.has(entry.word)) {
      progress.missed.add(entry.word);
      saveProgress();
    }
    game.sessionLog.unshift({ entry, status: "missed" });

    // Show missed word's meaning so learner still sees it
    showMeaningPopup(entry, cx, cy, true);
    updateMeaningDock(entry, true);

    // Damage feedback
    audio.playDamage();
    el.dangerLine.classList.add("hit");
    el.arena.classList.remove("shake");
    void el.arena.offsetWidth;
    el.arena.classList.add("shake");
    triggerMascot("shock", "Ôi! Trượt mất rồi!");
    setTimeout(() => el.dangerLine.classList.remove("hit"), 260);

    updateHUD();

    if (game.lives <= 0) {
      setTimeout(() => {
        if (game.status === "playing") {
          finishRun(false);
        }
      }, 380);
    }
  }

  // --------------------------------------------------------------------------
  // Game Lifecycle (Start, Pause, Resume, Result, Loop)
  // --------------------------------------------------------------------------
  function startRun() {
    clearArenaWords();
    closeAllModals();

    game.status = "playing";
    game.score = 0;
    game.lives = game.maxLives;
    game.combo = 0;
    game.bestCombo = 0;
    game.correctChars = 0;
    game.wrongChars = 0;
    game.wordsDestroyed = 0;
    game.sessionLog = [];
    game.recentMeanings = [];
    game.lastDockWord = null;
    game.spawnTimer = 0.25;
    game.elapsed = 0;
    game.rocketAngle = 0;
    el.rocketShip.style.transform = "rotate(0deg)";

    el.meaningHistory.innerHTML = "";
    el.meaningCurrent.classList.add("hidden");

    game.wordQueue = buildQueueForRun();
    const poolSize = getFilteredPool(true).length;
    game.milestoneGoal = game.endless ? 9999 : Math.min(15, Math.max(8, poolSize));

    el.startOverlay.classList.add("hidden");
    el.pauseOverlay.classList.add("hidden");
    el.resultOverlay.classList.add("hidden");
    syncPauseIcon();
    updateHUD();

    // Immediately drop 2 words cleanly spaced for instant engagement
    spawnWord();
    setTimeout(() => {
      if (game.status === "playing" && game.activeWords.length < 2) {
        spawnWord();
      }
    }, 650);
  }

  function pauseGame() {
    if (game.status !== "playing") return;
    game.status = "paused";
    const topic = topicMap.get(game.milestoneId) || topics[0];
    el.pauseSubtitle.textContent = game.endless
      ? `Chế độ Vô tận · Đã bắn hạ ${game.wordsDestroyed} từ`
      : `Mốc ${topic.id}/20 · ${topic.name} (${game.wordsDestroyed}/${game.milestoneGoal} từ)`;
    el.pauseOverlay.classList.remove("hidden");
    syncPauseIcon();
  }

  function resumeGame() {
    if (game.status !== "paused") return;
    game.status = "playing";
    game.lastFrameTs = performance.now();
    el.pauseOverlay.classList.add("hidden");
    syncPauseIcon();
  }

  function returnToMenu() {
    game.status = "menu";
    clearArenaWords();
    el.pauseOverlay.classList.add("hidden");
    el.resultOverlay.classList.add("hidden");
    el.startOverlay.classList.remove("hidden");
    syncStartOverlayControls();
    syncPauseIcon();
    updateHUD();
  }

  function finishRun(victory) {
    game.status = "result";
    clearArenaWords();
    syncPauseIcon();

    const topic = topicMap.get(game.milestoneId) || topics[0];
    const totalTyped = game.correctChars + game.wrongChars;
    const accuracy = totalTyped > 0 ? Math.round((game.correctChars / totalTyped) * 100) : 100;

    if (victory) {
      audio.playMilestoneWin();
      el.resultEmoji.textContent = "🏆";
      el.resultTitle.textContent = `Hoàn thành Mốc ${topic.id}/20!`;
      el.resultSubtitle.textContent = `Chủ đề: ${topic.name} (${topic.vi}) · Bạn đã chinh phục ${game.wordsDestroyed} từ vựng`;
      el.btnNextMilestone.classList.toggle("hidden", game.milestoneId >= topics.length);
    } else {
      audio.playGameOver();
      el.resultEmoji.textContent = "💫";
      el.resultTitle.textContent = game.endless ? "Kết thúc lượt chơi Vô tận!" : "Hết năng lượng lá chắn!";
      el.resultSubtitle.textContent = `Bạn đã bắn hạ ${game.wordsDestroyed} từ · Hãy ôn lại nghĩa các từ bên dưới nhé`;
      el.btnNextMilestone.classList.add("hidden");
    }

    el.resScore.textContent = game.score.toLocaleString("en-US");
    el.resWords.textContent = String(game.wordsDestroyed);
    el.resAccuracy.textContent = `${accuracy}%`;
    el.resCombo.textContent = `x${game.bestCombo}`;

    // Build scrollable vocabulary review list
    if (!game.sessionLog.length) {
      el.resultReviewList.innerHTML = `<p class="muted-text" style="padding:12px;text-align:center;">Chưa có từ nào trong ván này.</p>`;
    } else {
      el.resultReviewList.innerHTML = game.sessionLog
        .map(
          item => `
          <div class="review-item ${item.status === "missed" ? "is-missed" : ""}">
            <div class="review-left">
              <button class="speak-mini-btn" data-speak="${escapeHtml(item.entry.word)}" title="Nghe phát âm">🔊</button>
              <span class="review-word">${escapeHtml(item.entry.word)}</span>
              <span class="review-ipa">${escapeHtml(item.entry.ipa)}</span>
              <span class="cefr-tag ${escapeHtml(item.entry.level)}">${escapeHtml(item.entry.level)}</span>
              <span class="pos-pill pos-${escapeHtml(item.entry.pos)}">${escapeHtml(item.entry.posShort)}</span>
            </div>
            <div class="review-right">
              <span class="review-meaning">${escapeHtml(item.entry.meaning)}</span>
            </div>
          </div>`
        )
        .join("");
    }

    el.resultOverlay.classList.remove("hidden");
  }

  function syncPauseIcon() {
    const paused = game.status === "paused";
    el.iconPause.classList.toggle("hidden", paused);
    el.iconPlay.classList.toggle("hidden", !paused);
  }

  function syncSoundIcon() {
    el.iconSoundOn.classList.toggle("hidden", !audio.soundEnabled);
    el.iconSoundOff.classList.toggle("hidden", audio.soundEnabled);
    el.btnSound.classList.toggle("active", audio.soundEnabled);
  }

  // Main Animation Loop
  function gameLoop(ts) {
    if (!game.lastFrameTs) game.lastFrameTs = ts;
    const dt = Math.min(0.05, (ts - game.lastFrameTs) / 1000);
    game.lastFrameTs = ts;
    const nowSec = ts / 1000;

    if (game.status === "playing") {
      game.elapsed += dt;
      const preset = SPEED_PRESETS[game.speedKey] || SPEED_PRESETS.chill;
      const dynInterval = Math.max(
        preset.minSpawn,
        preset.spawnInterval - Math.min(0.65, game.wordsDestroyed * 0.018)
      );

      game.spawnTimer -= dt;
      if (game.spawnTimer <= 0) {
        spawnWord();
        game.spawnTimer = dynInterval;
      }

      const dangerY = fx.height - 32;
      for (let i = game.activeWords.length - 1; i >= 0; i--) {
        const w = game.activeWords[i];
        w.y += w.speed * dt;
        w.el.style.transform = `translate3d(${w.x}px, ${w.y}px, 0)`;

        if (w.y + w.h >= dangerY) {
          handleWordMissed(w);
        }
      }

      // Smoothly track locked word with rocket turret
      if (game.lockedWord) {
        aimRocketAt(
          game.lockedWord.x + game.lockedWord.w / 2,
          game.lockedWord.y + game.lockedWord.h / 2
        );
      }
    }

    renderCanvas(dt, nowSec);
    requestAnimationFrame(gameLoop);
  }

  // --------------------------------------------------------------------------
  // Virtual Keyboard
  // --------------------------------------------------------------------------
  function buildVirtualKeyboard() {
    const rows = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m", "⌫"]
    ];
    el.virtualKeyboard.innerHTML = rows
      .map(
        row =>
          `<div class="vk-row">${row
            .map(
              k =>
                `<button class="vk-key" data-key="${k}" type="button">${k}</button>`
            )
            .join("")}</div>`
      )
      .join("");

    el.virtualKeyboard.addEventListener("click", e => {
      const btn = e.target.closest(".vk-key");
      if (!btn) return;
      const key = btn.dataset.key;
      if (key === "⌫") handleBackspace();
      else handleCharInput(key);
    });
  }

  function flashVirtualKey(ch) {
    if (!game.virtualKeyboardOpen) return;
    const btn = el.virtualKeyboard.querySelector(`.vk-key[data-key="${ch}"]`);
    if (!btn) return;
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 110);
  }

  function highlightVirtualKey(ch) {
    el.virtualKeyboard.querySelectorAll(".vk-key.next-hint").forEach(k => k.classList.remove("next-hint"));
    if (!ch || !game.virtualKeyboardOpen) return;
    const btn = el.virtualKeyboard.querySelector(`.vk-key[data-key="${ch}"]`);
    if (btn) btn.classList.add("next-hint");
  }

  // --------------------------------------------------------------------------
  // Modals: Milestones Picker & Vocabulary Notebook + Importer
  // --------------------------------------------------------------------------
  function populateTopicSelects() {
    const optsHtml = topics
      .map(t => `<option value="${t.id}">Mốc ${t.id}/20 · ${t.icon} ${t.name} (${t.vi})</option>`)
      .join("");
    el.selectMilestone.innerHTML = optsHtml;
    el.selectMilestone.value = String(game.milestoneId);

    el.nbTopic.innerHTML = `<option value="ALL">Mọi chủ đề (20 mốc)</option>${optsHtml}`;
  }

  function openMilestonesModal() {
    if (game.status === "playing") pauseGame();
    renderMilestonesGrid();
    el.milestonesModal.classList.remove("hidden");
  }

  function renderMilestonesGrid() {
    el.milestonesGrid.innerHTML = topics
      .map(t => {
        const wordsInTopic = allVocab.filter(
          w => w.topicId === t.id && (game.levelFilter === "ALL" || w.level === game.levelFilter)
        );
        const masteredInTopic = wordsInTopic.filter(w => progress.mastered.has(w.word)).length;
        const cleared = progress.clearedMilestones.has(t.id);
        const current = !game.endless && game.milestoneId === t.id;

        return `
          <button class="ms-card ${current ? "current" : ""} ${cleared ? "cleared" : ""}" data-milestone="${t.id}">
            <div class="ms-card-top">
              <span>${t.icon} Mốc ${t.id}/20</span>
              ${cleared ? `<span class="ms-cleared-badge">✓ Hoàn thành</span>` : `<span>${masteredInTopic}/${wordsInTopic.length}</span>`}
            </div>
            <div class="ms-card-title">${t.name}</div>
            <div class="ms-card-sub">${t.vi} · ${wordsInTopic.length} từ</div>
          </button>`;
      })
      .join("");
  }

  function openNotebookModal() {
    if (game.status === "playing") pauseGame();
    notebookState.page = 1;
    renderNotebook();
    el.notebookModal.classList.remove("hidden");
  }

  function closeAllModals() {
    el.milestonesModal.classList.add("hidden");
    el.notebookModal.classList.add("hidden");
  }

  function renderNotebook() {
    const q = el.nbSearch.value.trim().toLowerCase();
    const lvl = el.nbLevel.value;
    const topicVal = el.nbTopic.value;
    const statusVal = el.nbStatus.value;

    el.nbSummaryText.textContent = `${allVocab.length.toLocaleString("en-US")} từ vựng B1–C2 · ${progress.mastered.size} đã bắn hạ · ${progress.missed.size} cần ôn lại`;

    notebookState.filtered = allVocab.filter(item => {
      if (lvl !== "ALL" && item.level !== lvl) return false;
      if (topicVal !== "ALL" && item.topicId !== Number(topicVal)) return false;
      if (statusVal === "MASTERED" && !progress.mastered.has(item.word)) return false;
      if (statusVal === "MISSED" && !progress.missed.has(item.word)) return false;
      if (statusVal === "UNSEEN" && (progress.mastered.has(item.word) || progress.missed.has(item.word))) return false;
      if (q && !item.word.includes(q) && !item.meaning.toLowerCase().includes(q)) return false;
      return true;
    });

    const total = notebookState.filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / notebookState.perPage));
    if (notebookState.page > totalPages) notebookState.page = totalPages;

    const start = (notebookState.page - 1) * notebookState.perPage;
    const slice = notebookState.filtered.slice(start, start + notebookState.perPage);

    if (!slice.length) {
      el.nbTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8;">Không tìm thấy từ vựng phù hợp.</td></tr>`;
    } else {
      el.nbTbody.innerHTML = slice
        .map(item => {
          const isMastered = progress.mastered.has(item.word);
          const isMissed = progress.missed.has(item.word);
          const stClass = isMastered ? "mastered" : isMissed ? "missed" : "unseen";
          const stText = isMastered ? "✓ Đã bắn hạ" : isMissed ? "✕ Cần ôn lại" : "Chưa gặp";

          return `
            <tr>
              <td>
                <div class="nb-word-cell">
                  <button class="speak-mini-btn" data-speak="${escapeHtml(item.word)}" title="Nghe phát âm">🔊</button>
                  <div>
                    <div class="nb-word-main">${escapeHtml(item.word)}</div>
                    <div class="nb-word-ipa">${escapeHtml(item.ipa)}</div>
                  </div>
                </div>
              </td>
              <td><span class="cefr-tag ${escapeHtml(item.level)}">${escapeHtml(item.level)}</span></td>
              <td><span class="pos-pill pos-${escapeHtml(item.pos)}">${escapeHtml(item.posShort)}</span></td>
              <td style="color:#fde68a;font-weight:600;">${escapeHtml(item.meaning)}</td>
              <td style="color:#94a3b8;font-size:12px;">${escapeHtml(item.topicName)}</td>
              <td><span class="nb-status-pill ${stClass}">${stText}</span></td>
            </tr>`;
        })
        .join("");
    }

    el.nbPagination.innerHTML = `
      <span>Hiển thị ${total ? start + 1 : 0}–${Math.min(start + notebookState.perPage, total)} / ${total.toLocaleString("en-US")} từ</span>
      <div class="page-btns">
        <button class="btn-ghost" id="nb-prev" ${notebookState.page <= 1 ? "disabled" : ""} style="padding:5px 12px;font-size:12px;">← Trước</button>
        <span style="align-self:center;padding:0 6px;">Trang ${notebookState.page}/${totalPages}</span>
        <button class="btn-ghost" id="nb-next" ${notebookState.page >= totalPages ? "disabled" : ""} style="padding:5px 12px;font-size:12px;">Sau →</button>
      </div>
    `;
  }

  function importCustomVocabulary(rawText) {
    const text = rawText.trim();
    if (!text) {
      el.importFeedback.textContent = "⚠️ Vui lòng dán dữ liệu CSV hoặc JSON trước khi nhập.";
      return;
    }

    let parsedRows = [];
    try {
      if (text.startsWith("[")) {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          parsedRows = json;
        }
      } else {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (/^word\s*,/i.test(line)) continue; // skip header
          const parts = line.split(",");
          if (parts.length >= 2) {
            const word = parts[0].trim().toLowerCase();
            if (parts.length === 2) {
              parsedRows.push([word, "n", "B2", "", parts[1].trim(), game.milestoneId]);
            } else if (parts.length === 3) {
              parsedRows.push([word, parts[1].trim(), "B2", "", parts[2].trim(), game.milestoneId]);
            } else if (parts.length === 4) {
              parsedRows.push([word, parts[1].trim(), parts[2].trim(), "", parts[3].trim(), game.milestoneId]);
            } else {
              parsedRows.push([
                word,
                parts[1].trim(),
                parts[2].trim(),
                parts[3].trim(),
                parts.slice(4).join(",").trim(),
                game.milestoneId
              ]);
            }
          }
        }
      }
    } catch (err) {
      el.importFeedback.textContent = `❌ Lỗi định dạng dữ liệu: ${err.message}`;
      return;
    }

    const valid = [];
    for (const row of parsedRows) {
      const n = normalizeEntry(row, true);
      if (/^[a-z]+$/.test(n.word) && n.meaning) {
        valid.push([n.word, n.pos, n.level, n.ipa, n.meaning, n.topicId]);
      }
    }

    if (!valid.length) {
      el.importFeedback.textContent = "⚠️ Không tìm thấy từ hợp lệ (từ tiếng Anh chỉ gồm chữ cái a–z và có nghĩa tiếng Việt).";
      return;
    }

    const existing = loadCustomWords();
    const map = new Map(existing.map(r => [r[0], r]));
    valid.forEach(r => map.set(r[0], r));
    saveCustomWords(Array.from(map.values()));
    rebuildVocabulary();
    renderNotebook();
    updateHUD();

    el.importTextarea.value = "";
    el.importFeedback.textContent = `✅ Đã nhập thành công ${valid.length} từ mới! Tổng kho hiện có ${allVocab.length.toLocaleString("en-US")} từ.`;
  }

  // --------------------------------------------------------------------------
  // Sync Controls & Event Listeners
  // --------------------------------------------------------------------------
  function setLevelFilter(level) {
    game.levelFilter = level;
    savePrefs();

    el.quickLevelBar.querySelectorAll(".lvl-pill").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.level === level);
    });
    el.startLevelGroup.querySelectorAll(".chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.level === level);
    });

    updatePoolHints();
    updateHUD();

    // If changing filter mid-game, refresh upcoming word queue seamlessly
    if (game.status === "playing") {
      game.wordQueue = buildQueueForRun();
    }
  }

  function syncStartOverlayControls() {
    el.startLevelGroup.querySelectorAll(".chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.level === game.levelFilter);
    });
    el.quickLevelBar.querySelectorAll(".lvl-pill").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.level === game.levelFilter);
    });
    el.speedGroup.querySelectorAll(".chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.speed === game.speedKey);
    });
    el.selectMilestone.value = String(game.milestoneId);
    el.selectMilestone.disabled = game.endless;
    el.optSpeak.checked = audio.autoSpeak;
    el.optShowLevel.checked = game.showLevelOnPill;
    el.optEndless.checked = game.endless;
    updatePoolHints();
  }

  function bindEvents() {
    window.addEventListener("resize", resizeCanvas);

    // Global Typing Input
    window.addEventListener("keydown", e => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        if (document.activeElement !== el.mobileInput) return;
      }
      if (!el.milestonesModal.classList.contains("hidden") || !el.notebookModal.classList.contains("hidden")) {
        if (e.key === "Escape") closeAllModals();
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Escape") {
        e.preventDefault();
        if (game.status === "paused") resumeGame();
        else if (game.status === "playing") {
          if (game.lockedWord) unlockTarget();
          else pauseGame();
        }
        return;
      }

      if (game.status !== "playing") {
        if (e.key === "Enter" && game.status === "menu") {
          startRun();
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        unlockTarget();
        return;
      }

      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleCharInput(e.key);
      }
    });

    // Mobile input fallback
    el.mobileInput.addEventListener("input", () => {
      const val = el.mobileInput.value;
      el.mobileInput.value = "";
      for (const ch of val) {
        if (/^[a-zA-Z]$/.test(ch)) handleCharInput(ch);
      }
    });

    // Top bar & HUD actions
    el.btnHome.addEventListener("click", returnToMenu);
    el.btnExit.addEventListener("click", returnToMenu);
    el.deckPill.addEventListener("click", openMilestonesModal);
    el.btnMilestones.addEventListener("click", openMilestonesModal);
    el.btnNotebook.addEventListener("click", openNotebookModal);
    el.btnOpenNotebookStart.addEventListener("click", openNotebookModal);
    el.btnPauseNotebook.addEventListener("click", openNotebookModal);

    el.btnFullscreen.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });

    el.btnPause.addEventListener("click", () => {
      if (game.status === "playing") pauseGame();
      else if (game.status === "paused") resumeGame();
    });

    el.btnKeyboard.addEventListener("click", () => {
      el.btnKeyboard.blur();
      game.virtualKeyboardOpen = !game.virtualKeyboardOpen;
      el.virtualKeyboard.classList.toggle("hidden", !game.virtualKeyboardOpen);
      el.btnKeyboard.classList.toggle("active", game.virtualKeyboardOpen);
      updateTypingIndicator();
    });

    el.btnSound.addEventListener("click", () => {
      el.btnSound.blur();
      audio.soundEnabled = !audio.soundEnabled;
      syncSoundIcon();
      savePrefs();
    });

    el.mcSpeak.addEventListener("click", () => {
      el.mcSpeak.blur();
      if (game.lastDockWord) {
        audio.speakWord(game.lastDockWord.entry.word, true);
      }
    });

    // Quick CEFR filter bar
    el.quickLevelBar.addEventListener("click", e => {
      const btn = e.target.closest(".lvl-pill");
      if (!btn) return;
      btn.blur();
      setLevelFilter(btn.dataset.level);
    });

    // Start overlay setup controls
    el.startLevelGroup.addEventListener("click", e => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      setLevelFilter(btn.dataset.level);
    });

    el.speedGroup.addEventListener("click", e => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      game.speedKey = btn.dataset.speed;
      el.speedGroup.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === btn));
      savePrefs();
    });

    el.selectMilestone.addEventListener("change", () => {
      game.milestoneId = Number(el.selectMilestone.value);
      savePrefs();
      updatePoolHints();
      updateHUD();
    });

    el.optSpeak.addEventListener("change", () => {
      audio.autoSpeak = el.optSpeak.checked;
      savePrefs();
    });

    el.optShowLevel.addEventListener("change", () => {
      game.showLevelOnPill = el.optShowLevel.checked;
      savePrefs();
      updateHUD();
    });

    el.optEndless.addEventListener("change", () => {
      game.endless = el.optEndless.checked;
      el.selectMilestone.disabled = game.endless;
      savePrefs();
      updatePoolHints();
      updateHUD();
    });

    el.btnStartGame.addEventListener("click", startRun);

    // Pause overlay actions
    el.btnResume.addEventListener("click", resumeGame);
    el.btnRestartMilestone.addEventListener("click", startRun);
    el.btnPauseMenu.addEventListener("click", returnToMenu);

    // Result overlay actions
    el.btnNextMilestone.addEventListener("click", () => {
      if (game.milestoneId < topics.length) {
        game.milestoneId++;
        savePrefs();
      }
      startRun();
    });
    el.btnReplayMilestone.addEventListener("click", startRun);
    el.btnResultMenu.addEventListener("click", returnToMenu);

    // Delegate pronunciation click in review list & notebook
    document.addEventListener("click", e => {
      const speakBtn = e.target.closest("[data-speak]");
      if (speakBtn) {
        audio.speakWord(speakBtn.dataset.speak, true);
      }
    });

    // Milestones modal
    el.closeMilestones.addEventListener("click", () => el.milestonesModal.classList.add("hidden"));
    el.milestonesModal.addEventListener("click", e => {
      if (e.target === el.milestonesModal) el.milestonesModal.classList.add("hidden");
    });
    el.milestonesGrid.addEventListener("click", e => {
      const card = e.target.closest(".ms-card");
      if (!card) return;
      game.milestoneId = Number(card.dataset.milestone);
      game.endless = false;
      savePrefs();
      syncStartOverlayControls();
      el.milestonesModal.classList.add("hidden");
      startRun();
    });

    // Notebook modal
    el.closeNotebook.addEventListener("click", () => el.notebookModal.classList.add("hidden"));
    el.notebookModal.addEventListener("click", e => {
      if (e.target === el.notebookModal) el.notebookModal.classList.add("hidden");
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
        el.tabBrowse.classList.toggle("hidden", btn.dataset.tab !== "browse");
        el.tabImport.classList.toggle("hidden", btn.dataset.tab !== "import");
      });
    });

    [el.nbSearch, el.nbLevel, el.nbTopic, el.nbStatus].forEach(ctrl => {
      ctrl.addEventListener("input", () => {
        notebookState.page = 1;
        renderNotebook();
      });
      ctrl.addEventListener("change", () => {
        notebookState.page = 1;
        renderNotebook();
      });
    });

    el.nbPagination.addEventListener("click", e => {
      if (e.target.id === "nb-prev" && notebookState.page > 1) {
        notebookState.page--;
        renderNotebook();
      } else if (e.target.id === "nb-next") {
        notebookState.page++;
        renderNotebook();
      }
    });

    el.btnDoImport.addEventListener("click", () => importCustomVocabulary(el.importTextarea.value));
    el.importFile.addEventListener("change", e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        el.importTextarea.value = String(reader.result || "");
        importCustomVocabulary(el.importTextarea.value);
      };
      reader.readAsText(file, "utf-8");
      el.importFile.value = "";
    });

    el.btnExportJson.addEventListener("click", () => {
      const payload = allVocab.map(v => ({
        word: v.word,
        pos: v.pos,
        posVi: v.posVi,
        level: v.level,
        ipa: v.ipa,
        meaning: v.meaning,
        topicId: v.topicId,
        topic: v.topicName
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vocab-b1-c2-vietnamese.json";
      a.click();
      URL.revokeObjectURL(url);
    });

    el.btnResetProgress.addEventListener("click", () => {
      if (!confirm("Bạn có chắc muốn đặt lại toàn bộ tiến độ bắn hạ & mốc đã hoàn thành?")) return;
      progress = { mastered: new Set(), missed: new Set(), clearedMilestones: new Set(), highScore: 0 };
      saveProgress();
      renderNotebook();
      updateHUD();
    });
  }

  // --------------------------------------------------------------------------
  // Bootstrap
  // --------------------------------------------------------------------------
  function init() {
    audio.soundEnabled = prefs.soundEnabled !== false;
    audio.autoSpeak = prefs.autoSpeak !== false;

    rebuildVocabulary();
    populateTopicSelects();
    buildVirtualKeyboard();
    resizeCanvas();
    syncSoundIcon();
    syncStartOverlayControls();
    updateHUD();
    bindEvents();

    requestAnimationFrame(gameLoop);
  }

  init();
})();
