/* ==========================================================================
   Luyện Gõ · B1–C2 Vocabulary + 500 Boss Collocations Game Engine
   Features: Tank/Gun/Cannon Turrets, 4 Selectable Ammo Types, Boss Phase
   ========================================================================== */

(() => {
  "use strict";

  const STORAGE_PROGRESS_KEY = "vocab_shooter_progress_v1";
  const STORAGE_CUSTOM_KEY = "vocab_shooter_custom_words_v1";
  const STORAGE_PREFS_KEY = "vocab_shooter_prefs_v2";

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
    chill:  { baseSpeed: 33, maxSpeed: 54, bossSpeed: 28, spawnInterval: 2.35, minSpawn: 1.55, maxActive: 4 },
    normal: { baseSpeed: 48, maxSpeed: 74, bossSpeed: 38, spawnInterval: 1.85, minSpawn: 1.15, maxActive: 5 },
    fast:   { baseSpeed: 68, maxSpeed: 102, bossSpeed: 50, spawnInterval: 1.45, minSpawn: 0.85, maxActive: 6 }
  };

  const BOSS_PHASES_PER_MILESTONE = 3;
  const BOSS_ONLY_GOAL = 5;

  const CHEER_MESSAGES = [
    "Tuyệt vời!",
    "Chuẩn xác!",
    "Đỉnh quá!",
    "Hỏa lực cực mạnh!",
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

  let singleVocab = [];
  let collocVocab = [];
  let allLibrary = [];
  let progress = loadProgress();
  let prefs = loadPrefs();

  const game = {
    status: "menu", // menu | playing | paused | result
    levelFilter: prefs.levelFilter || "ALL",
    milestoneId: prefs.milestoneId || 1,
    speedKey: prefs.speedKey || "chill",
    weaponType: prefs.weaponType || "tank",   // tank | gun | cannon
    ammoType: prefs.ammoType || "bullet",     // bullet | laser | missile | plasma
    endless: Boolean(prefs.endless),
    bossOnly: Boolean(prefs.bossOnly),
    showLevelOnPill: prefs.showLevelOnPill !== false,
    virtualKeyboardOpen: false,

    score: 0,
    lives: 3,
    maxLives: 3,
    combo: 0,
    bestCombo: 0,
    correctChars: 0,
    wrongChars: 0,

    milestoneGoal: 12,
    wordsDestroyed: 0,
    regularDestroyed: 0,

    // Boss Collocation Phase state
    inBossPhase: false,
    bossTotalWaves: BOSS_PHASES_PER_MILESTONE,
    bossWavesDefeated: 0,
    bossQueue: [],
    nextEndlessBossAt: 10,

    wordQueue: [],
    activeWords: [],
    lockedWord: null,
    sessionLog: [],
    recentMeanings: [],

    spawnTimer: 0.4,
    elapsed: 0,
    lastFrameTs: 0,
    wordUid: 0,
    turretAngle: 0,
    lastDockWord: null
  };

  // Canvas visual effects state (lively deep space + weapons)
  const fx = {
    width: 1000,
    height: 600,
    stars: [],
    nebulae: [],
    meteors: [],
    asteroids: [],
    meteorTimer: 1.4,
    lasers: [],
    projectiles: [], // bullets, homing missiles, plasma orbs
    casings: [],     // ejected brass casings
    particles: [],
    rings: [],
    muzzleFlashes: []
  };

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
    turretAnchor: document.getElementById("turret-anchor"),
    weaponTank: document.getElementById("weapon-tank"),
    weaponGun: document.getElementById("weapon-gun"),
    weaponCannon: document.getElementById("weapon-cannon"),
    rotatorTank: document.getElementById("rotator-tank"),
    rotatorGun: document.getElementById("rotator-gun"),
    rotatorCannon: document.getElementById("rotator-cannon"),
    mascot: document.getElementById("mascot"),
    mascotBubble: document.getElementById("mascot-bubble"),

    // Boss HUD
    bossHud: document.getElementById("boss-hud"),
    bossHudTitle: document.getElementById("boss-hud-title"),
    bossHudPhase: document.getElementById("boss-hud-phase"),
    bossHpSegments: document.getElementById("boss-hp-segments"),

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
    startWeaponGroup: document.getElementById("start-weapon-group"),
    startAmmoGroup: document.getElementById("start-ammo-group"),
    poolCountHint: document.getElementById("pool-count-hint"),
    selectMilestone: document.getElementById("select-milestone"),
    speedGroup: document.getElementById("speed-group"),
    optSpeak: document.getElementById("opt-speak"),
    optShowLevel: document.getElementById("opt-show-level"),
    optBossOnly: document.getElementById("opt-boss-only"),
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
    nbKind: document.getElementById("nb-kind"),
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
  // Helpers & Persistence
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

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
      weaponType: "tank",
      ammoType: "bullet",
      soundEnabled: true,
      autoSpeak: true,
      showLevelOnPill: true,
      endless: false,
      bossOnly: false
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
          weaponType: game.weaponType,
          ammoType: game.ammoType,
          soundEnabled: audio.soundEnabled,
          autoSpeak: audio.autoSpeak,
          showLevelOnPill: game.showLevelOnPill,
          endless: game.endless,
          bossOnly: game.bossOnly
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
  // Vocabulary & Collocation Normalization
  // --------------------------------------------------------------------------
  function normalizeWordEntry(raw, isCustom = false) {
    const word = String(raw[0] || raw.word || raw.phrase || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    const isColloc = word.includes(" ");
    const rawPos = String(raw[1] || raw.pos || raw.pattern || (isColloc ? "colloc" : "n")).trim().toLowerCase();
    const level = String(raw[2] || raw.level || "B2").trim().toUpperCase();
    const ipa = String(raw[3] || raw.ipa || "").trim();
    const meaning = String(raw[4] || raw.meaning || "").trim();
    const topicId = Number(raw[5] || raw.topicId || 1);
    const topic = topicMap.get(topicId) || topics[0];

    const posInfo = posMap[rawPos];
    const pos = isColloc ? "colloc" : (posInfo ? posInfo.abbr : "n");
    const posVi = isColloc ? `Cụm từ (${rawPos})` : (posInfo ? posInfo.vi : rawPos);
    const posShort = isColloc ? `colloc · ${rawPos}` : (posInfo ? posInfo.short : rawPos);

    return {
      word,
      pos,
      pattern: isColloc ? rawPos : "",
      posVi,
      posShort,
      level: ["B1", "B2", "C1", "C2"].includes(level) ? level : "B2",
      ipa,
      meaning,
      topicId: topic ? topic.id : 1,
      topicName: topic ? topic.name : "Technology",
      topicVi: topic ? topic.vi : "Công nghệ",
      isColloc,
      isCustom
    };
  }

  function normalizeCollocEntry(raw) {
    // [phrase, pattern, level, vietnamese_meaning, topicId]
    const phrase = String(raw[0] || "").trim().toLowerCase().replace(/\s+/g, " ");
    const pattern = String(raw[1] || "colloc").trim();
    const level = String(raw[2] || "B2").trim().toUpperCase();
    const meaning = String(raw[3] || "").trim();
    const topicId = Number(raw[4] || 1);
    const topic = topicMap.get(topicId) || topics[0];

    return {
      word: phrase,
      pos: "colloc",
      pattern,
      posVi: `Collocation (${pattern})`,
      posShort: `colloc · ${pattern}`,
      level: ["B1", "B2", "C1", "C2"].includes(level) ? level : "B2",
      ipa: "",
      meaning,
      topicId: topic ? topic.id : 1,
      topicName: topic ? topic.name : "Technology",
      topicVi: topic ? topic.vi : "Công nghệ",
      isColloc: true,
      isCustom: false
    };
  }

  function rebuildVocabulary() {
    const seenWords = new Set();
    const seenCollocs = new Set();
    const words = [];
    const collocs = [];

    for (const part of window.VOCAB_PARTS || []) {
      for (const row of part) {
        const entry = normalizeWordEntry(row, false);
        if (entry.word && !seenWords.has(entry.word)) {
          seenWords.add(entry.word);
          words.push(entry);
        }
      }
    }

    for (const part of window.COLLOCATION_PARTS || []) {
      for (const row of part) {
        const entry = normalizeCollocEntry(row);
        if (entry.word && !seenCollocs.has(entry.word)) {
          seenCollocs.add(entry.word);
          collocs.push(entry);
        }
      }
    }

    for (const row of loadCustomWords()) {
      const entry = normalizeWordEntry(row, true);
      if (entry.word && /^[a-z]+( [a-z]+)*$/.test(entry.word) && entry.meaning) {
        if (entry.isColloc) {
          if (seenCollocs.has(entry.word)) {
            const idx = collocs.findIndex(e => e.word === entry.word);
            if (idx >= 0) collocs[idx] = entry;
          } else {
            seenCollocs.add(entry.word);
            collocs.push(entry);
          }
        } else {
          if (seenWords.has(entry.word)) {
            const idx = words.findIndex(e => e.word === entry.word);
            if (idx >= 0) words[idx] = entry;
          } else {
            seenWords.add(entry.word);
            words.push(entry);
          }
        }
      }
    }

    singleVocab = words;
    collocVocab = collocs;
    allLibrary = [...singleVocab, ...collocVocab];

    updatePoolHints();
    updateNotebookBadge();
  }

  function getFilteredPool(sourceList, forMilestone = !game.endless) {
    return sourceList.filter(item => {
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
    const pool = getFilteredPool(singleVocab, !game.endless);
    const fallback = pool.length ? pool : singleVocab;

    if (game.levelFilter === "ALL" && !game.endless) {
      const byLvl = { B1: [], B2: [], C1: [], C2: [] };
      fallback.forEach(w => { if (byLvl[w.level]) byLvl[w.level].push(w); });
      const b1 = shuffle(byLvl.B1);
      const b2 = shuffle(byLvl.B2);
      const c1 = shuffle(byLvl.C1);
      const c2 = shuffle(byLvl.C2);
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

  function buildBossQueue(forMilestone = !game.endless) {
    const pool = getFilteredPool(collocVocab, forMilestone);
    const fallback = pool.length ? pool : collocVocab;

    if (game.levelFilter === "ALL") {
      // Escalate Boss Collocations: Wave 1 (B1/B2) -> Wave 2 (B2/C1) -> Wave 3 (C1/C2)
      const tier1 = shuffle(fallback.filter(c => c.level === "B1" || c.level === "B2"));
      const tier2 = shuffle(fallback.filter(c => c.level === "B2" || c.level === "C1"));
      const tier3 = shuffle(fallback.filter(c => c.level === "C1" || c.level === "C2"));

      const used = new Set();
      const ordered = [];
      const pushUnique = list => {
        for (const item of list) {
          if (!used.has(item.word)) {
            used.add(item.word);
            ordered.push(item);
            return true;
          }
        }
        return false;
      };

      // Build clean escalating sequence of 3+ waves
      pushUnique(tier1);
      pushUnique(tier2);
      pushUnique(tier3);
      for (const item of shuffle(fallback)) {
        if (!used.has(item.word)) {
          used.add(item.word);
          ordered.push(item);
        }
      }
      return ordered;
    }

    return shuffle(fallback);
  }

  // --------------------------------------------------------------------------
  // Weapon & Ammo Management
  // --------------------------------------------------------------------------
  function getActiveRotator() {
    if (game.weaponType === "gun") return el.rotatorGun;
    if (game.weaponType === "cannon") return el.rotatorCannon;
    return el.rotatorTank;
  }

  function setWeaponType(type) {
    if (!["tank", "gun", "cannon"].includes(type)) return;
    game.weaponType = type;
    savePrefs();

    el.weaponTank.classList.toggle("hidden", type !== "tank");
    el.weaponGun.classList.toggle("hidden", type !== "gun");
    el.weaponCannon.classList.toggle("hidden", type !== "cannon");

    el.startWeaponGroup.querySelectorAll(".chip").forEach(b => b.classList.toggle("active", b.dataset.weapon === type));

    getActiveRotator().style.transform = `rotate(${game.turretAngle.toFixed(1)}deg)`;
  }

  function setAmmoType(type) {
    if (!["bullet", "laser", "missile", "plasma"].includes(type)) return;
    game.ammoType = type;
    savePrefs();

    el.startAmmoGroup.querySelectorAll(".chip").forEach(b => b.classList.toggle("active", b.dataset.ammo === type));
  }

  function getTurretMuzzlePoint() {
    const arenaRect = el.arena.getBoundingClientRect();
    const anchorRect = el.turretAnchor.getBoundingClientRect();
    const pivotX = anchorRect.left - arenaRect.left + anchorRect.width * 0.5;
    const pivotY = anchorRect.top - arenaRect.top + anchorRect.height * 0.6;
    const barrelLen = 46;
    const rad = (game.turretAngle * Math.PI) / 180;
    return {
      x: pivotX + Math.sin(rad) * barrelLen,
      y: pivotY - Math.cos(rad) * barrelLen,
      pivotX,
      pivotY
    };
  }

  function aimTurretAt(tx, ty) {
    const arenaRect = el.arena.getBoundingClientRect();
    const anchorRect = el.turretAnchor.getBoundingClientRect();
    const pivotX = anchorRect.left - arenaRect.left + anchorRect.width * 0.5;
    const pivotY = anchorRect.top - arenaRect.top + anchorRect.height * 0.6;
    const dx = tx - pivotX;
    const dy = ty - pivotY;
    const angleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    game.turretAngle = Math.max(-58, Math.min(58, angleDeg));
    getActiveRotator().style.transform = `rotate(${game.turretAngle.toFixed(1)}deg)`;
  }

  function triggerTurretRecoil() {
    const rot = getActiveRotator();
    rot.classList.add("recoil");
    rot.style.transform = `rotate(${game.turretAngle.toFixed(1)}deg) translateY(5px) scale(0.97)`;
    clearTimeout(triggerTurretRecoil._t);
    triggerTurretRecoil._t = setTimeout(() => {
      rot.classList.remove("recoil");
      rot.style.transform = `rotate(${game.turretAngle.toFixed(1)}deg)`;
    }, 85);
  }

  // --------------------------------------------------------------------------
  // Canvas FX (Starfield, 4 Ammo Projectiles, Shell Casings, Explosions)
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
      initSpaceBackdrop();
    } else {
      fx.stars.forEach(s => {
        s.x = Math.random() * fx.width;
        s.y = Math.random() * fx.height;
      });
      fx.nebulae.forEach(n => {
        n.x = Math.random() * fx.width;
        n.y = Math.random() * fx.height;
      });
      fx.asteroids.forEach(a => {
        a.x = Math.random() * fx.width;
        a.y = Math.random() * fx.height;
      });
    }
  }

  function initSpaceBackdrop() {
    // 1. 3-Layer Parallax Starfield (175 stars)
    fx.stars = [];
    const palette = ["#ffffff", "#ffffff", "#bfdbfe", "#e9d5ff", "#fde68a", "#a5f3fc"];
    for (let i = 0; i < 175; i++) {
      const layer = i < 95 ? 0 : i < 148 ? 1 : 2;
      fx.stars.push({
        x: Math.random() * fx.width,
        y: Math.random() * fx.height,
        r: layer === 0 ? 0.55 + Math.random() * 0.7 : layer === 1 ? 1.0 + Math.random() * 0.9 : 1.7 + Math.random() * 1.1,
        sparkle: layer === 2 && Math.random() < 0.45,
        alpha: layer === 0 ? 0.25 + Math.random() * 0.4 : 0.45 + Math.random() * 0.5,
        speed: 0.9 + Math.random() * 2.6,
        phase: Math.random() * Math.PI * 2,
        drift: layer === 0 ? 4 : layer === 1 ? 10 : 19,
        hue: palette[Math.floor(Math.random() * palette.length)]
      });
    }

    // 2. Drifting Luminous Nebula Clouds
    fx.nebulae = [
      { x: fx.width * 0.2, y: fx.height * 0.35, r: 290, vx: 6, vy: 3, color: "124, 58, 237", baseA: 0.14, phase: 0 },
      { x: fx.width * 0.78, y: fx.height * 0.48, r: 260, vx: -5, vy: 4, color: "14, 165, 233", baseA: 0.13, phase: 1.7 },
      { x: fx.width * 0.52, y: fx.height * 0.22, r: 240, vx: 4, vy: -3, color: "236, 72, 153", baseA: 0.10, phase: 3.1 },
      { x: fx.width * 0.36, y: fx.height * 0.78, r: 270, vx: -4, vy: -2, color: "99, 102, 241", baseA: 0.13, phase: 4.5 },
      { x: fx.width * 0.85, y: fx.height * 0.76, r: 210, vx: -6, vy: 2, color: "45, 212, 191", baseA: 0.09, phase: 2.3 }
    ];

    // 3. Subtle Deep-Space Drifting Asteroids
    fx.asteroids = [];
    for (let i = 0; i < 6; i++) {
      const sides = 6 + Math.floor(Math.random() * 3);
      const pts = [];
      for (let k = 0; k < sides; k++) {
        const ang = (Math.PI * 2 * k) / sides;
        const rad = 0.72 + Math.random() * 0.32;
        pts.push({ ang, rad });
      }
      fx.asteroids.push({
        x: Math.random() * fx.width,
        y: Math.random() * fx.height,
        size: 7 + Math.random() * 11,
        vx: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 8),
        vy: 5 + Math.random() * 9,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.65,
        pts,
        alpha: 0.11 + Math.random() * 0.09
      });
    }
  }

  function spawnMeteor() {
    const startX = fx.width * (0.15 + Math.random() * 0.85);
    const startY = -10 + Math.random() * (fx.height * 0.35);
    const angle = (128 + Math.random() * 28) * (Math.PI / 180); // diagonal down-left
    const speed = 520 + Math.random() * 360;
    const colors = ["#7dd3fc", "#fde68a", "#e9d5ff", "#ffffff"];
    fx.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 75 + Math.random() * 75,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0.55 + Math.random() * 0.45,
      maxLife: 1.0
    });
  }

  function fireAmmoAt(tx, ty, accentColor, isFinishingShot = false) {
    const muzzle = getTurretMuzzlePoint();
    const ammo = game.ammoType;

    // Muzzle flash burst at barrel tip
    fx.muzzleFlashes.push({
      x: muzzle.x,
      y: muzzle.y,
      angle: (game.turretAngle * Math.PI) / 180,
      color: ammo === "plasma" ? "#e879f9" : ammo === "laser" ? accentColor : "#fde047",
      size: isFinishingShot ? 22 : 14,
      life: 0.09,
      maxLife: 0.09
    });

    if (ammo === "laser") {
      fx.lasers.push({
        x1: muzzle.x,
        y1: muzzle.y,
        x2: tx,
        y2: ty,
        color: accentColor,
        thick: isFinishingShot,
        life: isFinishingShot ? 0.24 : 0.15,
        maxLife: isFinishingShot ? 0.24 : 0.15
      });
      spawnImpactSparks(tx, ty, accentColor, isFinishingShot ? 10 : 5);
      return;
    }

    if (ammo === "bullet") {
      // Eject spinning brass shell casing from weapon breech
      const ejectDir = Math.random() < 0.5 ? 1 : -1;
      fx.casings.push({
        x: muzzle.pivotX + ejectDir * 14,
        y: muzzle.pivotY - 4,
        vx: ejectDir * (70 + Math.random() * 65),
        vy: -(85 + Math.random() * 65),
        rot: Math.random() * Math.PI,
        vrot: ejectDir * (10 + Math.random() * 8),
        life: 0.65
      });

      // High-velocity golden tracer bullet(s) — twin burst for gun!
      const shots = game.weaponType === "gun" ? [-6, 6] : [0];
      shots.forEach(off => {
        const rad = (game.turretAngle * Math.PI) / 180;
        const sx = muzzle.x + Math.cos(rad) * off;
        const sy = muzzle.y + Math.sin(rad) * off;
        fx.projectiles.push({
          type: "bullet",
          x: sx,
          y: sy,
          sx,
          sy,
          tx: tx + (Math.random() - 0.5) * 12,
          ty: ty + (Math.random() - 0.5) * 8,
          t: 0,
          duration: 0.12,
          color: "#fde047",
          isFinal: isFinishingShot
        });
      });
      return;
    }

    if (ammo === "missile") {
      // Curved homing micro-missile with smoke trail!
      const curveSide = (Math.random() < 0.5 ? -1 : 1) * (55 + Math.random() * 65);
      const midX = (muzzle.x + tx) / 2 + curveSide;
      const midY = (muzzle.y + ty) / 2 + 25;
      fx.projectiles.push({
        type: "missile",
        x: muzzle.x,
        y: muzzle.y,
        sx: muzzle.x,
        sy: muzzle.y,
        cx: midX,
        cy: midY,
        tx,
        ty,
        t: 0,
        duration: 0.28,
        angle: (game.turretAngle * Math.PI) / 180,
        color: "#fb923c",
        isFinal: isFinishingShot
      });
      return;
    }

    if (ammo === "plasma") {
      fx.projectiles.push({
        type: "plasma",
        x: muzzle.x,
        y: muzzle.y,
        sx: muzzle.x,
        sy: muzzle.y,
        tx,
        ty,
        t: 0,
        duration: 0.19,
        color: "#c084fc",
        isFinal: isFinishingShot
      });
    }
  }

  function spawnImpactSparks(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 150;
      fx.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 1.6 + Math.random() * 2.2,
        color: i % 2 === 0 ? "#fde047" : color,
        life: 0.22 + Math.random() * 0.18,
        maxLife: 0.4
      });
    }
  }

  function spawnExplosion(x, y, color, isBoss = false) {
    fx.rings.push({
      x,
      y,
      r: 14,
      maxR: isBoss ? 125 : 68,
      color: isBoss ? "#fbbf24" : color,
      life: isBoss ? 0.52 : 0.36,
      maxLife: isBoss ? 0.52 : 0.36
    });
    if (isBoss) {
      fx.rings.push({
        x,
        y,
        r: 6,
        maxR: 92,
        color: "#f43f5e",
        life: 0.44,
        maxLife: 0.44
      });
    }

    const count = isBoss ? 44 : 24;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const spd = (isBoss ? 105 : 70) + Math.random() * (isBoss ? 280 : 210);
      fx.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: (isBoss ? 2.8 : 2) + Math.random() * 3.4,
        color: i % 3 === 0 ? "#fde047" : i % 4 === 0 ? "#ffffff" : isBoss ? "#f43f5e" : color,
        life: 0.48 + Math.random() * (isBoss ? 0.55 : 0.35),
        maxLife: isBoss ? 1.03 : 0.83
      });
    }
  }

  function renderCanvas(dt, nowSec) {
    ctx.clearRect(0, 0, fx.width, fx.height);

    // 0. Drifting Breathing Nebula Clouds
    for (const n of fx.nebulae) {
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      if (n.x < -n.r) n.x = fx.width + n.r;
      if (n.x > fx.width + n.r) n.x = -n.r;
      if (n.y < -n.r) n.y = fx.height + n.r;
      if (n.y > fx.height + n.r) n.y = -n.r;

      const a = n.baseA * (0.72 + 0.28 * Math.sin(nowSec * 0.65 + n.phase));
      const grad = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
      grad.addColorStop(0, `rgba(${n.color}, ${a.toFixed(3)})`);
      grad.addColorStop(0.55, `rgba(${n.color}, ${(a * 0.35).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${n.color}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 0b. Subtle Perspective Sci-Fi Defense Grid above bottom horizon
    const horizonTop = fx.height - 110;
    const horizonBot = fx.height - 24;
    ctx.save();
    ctx.strokeStyle = game.inBossPhase ? "rgba(244, 63, 94, 0.13)" : "rgba(56, 189, 248, 0.10)";
    ctx.lineWidth = 1;
    const gridScroll = (nowSec * 18) % 22;
    for (let row = 0; row < 5; row++) {
      const t = (row * 22 + gridScroll) / 110;
      const y = horizonTop + Math.pow(t, 1.55) * (horizonBot - horizonTop);
      ctx.globalAlpha = t * 0.7;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(fx.width, y);
      ctx.stroke();
    }
    const cxGrid = fx.width / 2;
    ctx.globalAlpha = 0.45;
    for (let col = -7; col <= 7; col++) {
      ctx.beginPath();
      ctx.moveTo(cxGrid + col * 56, horizonTop);
      ctx.lineTo(cxGrid + col * 145, horizonBot);
      ctx.stroke();
    }
    ctx.restore();

    // 0c. Distant Drifting Space Asteroids
    for (const ast of fx.asteroids) {
      ast.x += ast.vx * dt;
      ast.y += ast.vy * dt;
      ast.rot += ast.vrot * dt;
      if (ast.y > fx.height + 30) { ast.y = -30; ast.x = Math.random() * fx.width; }
      if (ast.x < -30) ast.x = fx.width + 30;
      if (ast.x > fx.width + 30) ast.x = -30;

      ctx.save();
      ctx.translate(ast.x, ast.y);
      ctx.rotate(ast.rot);
      ctx.globalAlpha = ast.alpha;
      ctx.fillStyle = "#94a3b8";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ast.pts.forEach((pt, idx) => {
        const px = Math.cos(pt.ang) * ast.size * pt.rad;
        const py = Math.sin(pt.ang) * ast.size * pt.rad;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 1. 3-Layer Parallax Stars
    for (const s of fx.stars) {
      const speedMult = game.status === "playing" ? (game.inBossPhase ? 1.8 : 1.0) : 0.45;
      s.y += s.drift * speedMult * dt;
      if (s.y > fx.height) {
        s.y = -2;
        s.x = Math.random() * fx.width;
      }
      const tw = 0.52 + 0.48 * Math.sin(nowSec * s.speed + s.phase);
      ctx.globalAlpha = s.alpha * tw;
      ctx.fillStyle = s.hue;

      if (s.sparkle) {
        const len = s.r * 3.1;
        ctx.beginPath();
        ctx.moveTo(s.x - len, s.y);
        ctx.lineTo(s.x + len, s.y);
        ctx.moveTo(s.x, s.y - len);
        ctx.lineTo(s.x, s.y + len);
        ctx.strokeStyle = s.hue;
        ctx.lineWidth = 1.05;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 1b. Shooting Stars / Meteors
    fx.meteorTimer -= dt;
    if (fx.meteorTimer <= 0) {
      spawnMeteor();
      fx.meteorTimer = 2.0 + Math.random() * 2.8;
    }
    for (let i = fx.meteors.length - 1; i >= 0; i--) {
      const m = fx.meteors[i];
      m.life -= dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.life <= 0 || m.x < -120 || m.y > fx.height + 120) {
        fx.meteors.splice(i, 1);
        continue;
      }
      const mag = Math.hypot(m.vx, m.vy) || 1;
      const tailX = m.x - (m.vx / mag) * m.len;
      const tailY = m.y - (m.vy / mag) * m.len;
      const a = Math.min(1, m.life * 2.2);

      ctx.save();
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, m.color);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = a * 0.85;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Shockwave rings
    for (let i = fx.rings.length - 1; i >= 0; i--) {
      const ring = fx.rings[i];
      ring.life -= dt;
      if (ring.life <= 0) { fx.rings.splice(i, 1); continue; }
      const p = 1 - ring.life / ring.maxLife;
      const curR = ring.r + (ring.maxR - ring.r) * (1 - Math.pow(1 - p, 3));
      ctx.save();
      ctx.globalAlpha = (1 - p) * 0.78;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 3.2 * (1 - p) + 0.8;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Laser beams
    for (let i = fx.lasers.length - 1; i >= 0; i--) {
      const l = fx.lasers[i];
      l.life -= dt;
      if (l.life <= 0) { fx.lasers.splice(i, 1); continue; }
      const alpha = l.life / l.maxLife;
      ctx.save();
      ctx.lineCap = "round";
      ctx.globalAlpha = alpha * 0.58;
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.thick ? 12 : 6.5;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#fef9c3";
      ctx.lineWidth = l.thick ? 3.8 : 2.2;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Active Projectiles (Bullets, Homing Missiles, Plasma Orbs)
    for (let i = fx.projectiles.length - 1; i >= 0; i--) {
      const pr = fx.projectiles[i];
      const prevX = pr.x;
      const prevY = pr.y;
      pr.t += dt / pr.duration;

      if (pr.t >= 1) {
        if (pr.type === "missile") {
          fx.rings.push({ x: pr.tx, y: pr.ty, r: 4, maxR: 34, color: "#fb923c", life: 0.22, maxLife: 0.22 });
          spawnImpactSparks(pr.tx, pr.ty, "#fb923c", 9);
        } else if (pr.type === "plasma") {
          fx.rings.push({ x: pr.tx, y: pr.ty, r: 5, maxR: 38, color: "#e879f9", life: 0.24, maxLife: 0.24 });
          spawnImpactSparks(pr.tx, pr.ty, "#38bdf8", 8);
        } else {
          spawnImpactSparks(pr.tx, pr.ty, "#fde047", 5);
        }
        fx.projectiles.splice(i, 1);
        continue;
      }

      const u = pr.t;
      if (pr.type === "missile") {
        // Quadratic Bezier homing arc
        const inv = 1 - u;
        pr.x = inv * inv * pr.sx + 2 * inv * u * pr.cx + u * u * pr.tx;
        pr.y = inv * inv * pr.sy + 2 * inv * u * pr.cy + u * u * pr.ty;
        const ang = Math.atan2(pr.y - prevY, pr.x - prevX);

        // Smoke & fire exhaust trail
        fx.particles.push({
          x: pr.x - Math.cos(ang) * 8,
          y: pr.y - Math.sin(ang) * 8,
          vx: (Math.random() - 0.5) * 26,
          vy: (Math.random() - 0.5) * 26,
          r: 2.5 + Math.random() * 2.4,
          color: Math.random() < 0.45 ? "#fb923c" : "rgba(226, 232, 240, 0.75)",
          life: 0.24,
          maxLife: 0.24
        });

        ctx.save();
        ctx.translate(pr.x, pr.y);
        ctx.rotate(ang);
        // Missile body
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.lineTo(-6, -4);
        ctx.lineTo(-9, 0);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        ctx.fill();
        // Red nose tip
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.lineTo(4, -2.8);
        ctx.lineTo(4, 2.8);
        ctx.closePath();
        ctx.fill();
        // Tail flame
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(-9, 0, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (pr.type === "bullet") {
        pr.x = pr.sx + (pr.tx - pr.sx) * u;
        pr.y = pr.sy + (pr.ty - pr.sy) * u;
        const tailU = Math.max(0, u - 0.28);
        const tailX = pr.sx + (pr.tx - pr.sx) * tailU;
        const tailY = pr.sy + (pr.ty - pr.sy) * tailU;

        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(251, 146, 60, 0.72)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(pr.x, pr.y);
        ctx.stroke();

        ctx.strokeStyle = "#fef9c3";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(pr.x, pr.y);
        ctx.stroke();
        ctx.restore();
      } else if (pr.type === "plasma") {
        pr.x = pr.sx + (pr.tx - pr.sx) * u;
        pr.y = pr.sy + (pr.ty - pr.sy) * u;
        const pulse = 8 + Math.sin(nowSec * 36) * 2.2;

        ctx.save();
        const grad = ctx.createRadialGradient(pr.x, pr.y, 1, pr.x, pr.y, pulse * 1.9);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.35, "#e879f9");
        grad.addColorStop(0.7, "rgba(56, 189, 248, 0.55)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pulse * 1.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 5. Ejected Brass Shell Casings
    for (let i = fx.casings.length - 1; i >= 0; i--) {
      const c = fx.casings[i];
      c.life -= dt;
      if (c.life <= 0) { fx.casings.splice(i, 1); continue; }
      c.vy += 420 * dt; // gravity
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.rot += c.vrot * dt;

      ctx.save();
      ctx.globalAlpha = Math.min(1, c.life * 2.5);
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(-3.5, -1.6, 7, 3.2);
      ctx.restore();
    }

    // 6. Muzzle Flashes
    for (let i = fx.muzzleFlashes.length - 1; i >= 0; i--) {
      const mf = fx.muzzleFlashes[i];
      mf.life -= dt;
      if (mf.life <= 0) { fx.muzzleFlashes.splice(i, 1); continue; }
      const a = mf.life / mf.maxLife;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(mf.x, mf.y);
      ctx.rotate(mf.angle);
      const grad = ctx.createRadialGradient(0, 0, 1, 0, -4, mf.size);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.45, mf.color);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, -4, mf.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Particles
    for (let i = fx.particles.length - 1; i >= 0; i--) {
      const p = fx.particles[i];
      p.life -= dt;
      if (p.life <= 0) { fx.particles.splice(i, 1); continue; }
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

  function renderBossHud() {
    if (!game.inBossPhase) {
      el.bossHud.classList.add("hidden");
      el.arena.classList.remove("boss-mode");
      return;
    }

    el.bossHud.classList.remove("hidden");
    el.arena.classList.add("boss-mode");

    const topic = topicMap.get(game.milestoneId) || topics[0];
    el.bossHudTitle.textContent = game.endless
      ? "👑 MINI-BOSS COLLOCATION"
      : `👑 BOSS · ${topic.name}`;

    const curWave = Math.min(game.bossTotalWaves, game.bossWavesDefeated + 1);
    el.bossHudPhase.textContent = game.endless && game.bossOnly
      ? `Đã hạ ${game.bossWavesDefeated}`
      : `Đợt ${curWave}/${game.bossTotalWaves}`;

    const activeBoss = game.activeWords.find(w => w.isBoss);
    const curFillPct = activeBoss
      ? Math.max(0, ((activeBoss.entry.word.length - activeBoss.typedCount) / activeBoss.entry.word.length) * 100)
      : 100;

    const segCount = Math.min(5, game.bossTotalWaves);
    let segHtml = "";
    for (let i = 0; i < segCount; i++) {
      const depleted = i < game.bossWavesDefeated;
      const isCurrent = i === game.bossWavesDefeated;
      const wPct = depleted ? 0 : isCurrent ? curFillPct : 100;
      segHtml += `
        <div class="boss-hp-seg ${depleted ? "depleted" : ""}">
          <div class="boss-hp-seg-fill" style="width:${wPct.toFixed(1)}%"></div>
        </div>`;
    }
    el.bossHpSegments.innerHTML = segHtml;
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
      el.milestoneLabel.textContent = game.bossOnly ? "Săn Boss Vô tận" : "Vô tận";
      el.milestoneTopic.textContent = "Mọi chủ đề";
      el.milestoneProgressText.textContent = `${game.wordsDestroyed} hạ gục`;
      el.milestoneProgressFill.style.width = `${Math.min(100, (game.wordsDestroyed % 20) * 5)}%`;
    } else if (game.bossOnly) {
      el.milestoneLabel.textContent = `Boss Mốc ${topic.id}/20`;
      el.milestoneTopic.textContent = topic.name;
      el.milestoneProgressText.textContent = `${game.bossWavesDefeated}/${game.bossTotalWaves} Boss`;
      const pct = (game.bossWavesDefeated / Math.max(1, game.bossTotalWaves)) * 100;
      el.milestoneProgressFill.style.width = `${Math.min(100, pct)}%`;
    } else {
      el.milestoneLabel.textContent = `Mốc ${topic.id}/20`;
      el.milestoneTopic.textContent = topic.name;
      if (game.inBossPhase) {
        el.milestoneProgressText.textContent = `👑 BOSS ${game.bossWavesDefeated}/${game.bossTotalWaves}`;
        el.milestoneProgressFill.style.width = "100%";
      } else {
        el.milestoneProgressText.textContent = `${game.regularDestroyed}/${game.milestoneGoal} + Boss`;
        const pct = game.milestoneGoal > 0 ? Math.min(100, (game.regularDestroyed / game.milestoneGoal) * 100) : 0;
        el.milestoneProgressFill.style.width = `${pct}%`;
      }
    }

    const lvlLabel = game.levelFilter === "ALL" ? "B1–C2" : `Level ${game.levelFilter}`;
    const wordCnt = getFilteredPool(singleVocab, false).length;
    const colCnt = getFilteredPool(collocVocab, false).length;
    el.deckPillText.textContent = `${wordCnt.toLocaleString("en-US")} từ + ${colCnt} Boss Collocations · ${lvlLabel}`;

    renderHearts();
    renderBossHud();
    el.arena.classList.toggle("hide-pill-levels", !game.showLevelOnPill);
  }

  function updateNotebookBadge() {
    el.notebookCount.textContent = `${progress.mastered.size}/${allLibrary.length}`;
  }

  function updatePoolHints() {
    const wAll = getFilteredPool(singleVocab, false).length;
    const cAll = getFilteredPool(collocVocab, false).length;
    const wTopic = getFilteredPool(singleVocab, true).length;
    const cTopic = getFilteredPool(collocVocab, true).length;
    el.poolCountHint.textContent = game.endless
      ? `(${wAll.toLocaleString("en-US")} từ + ${cAll} Boss Collocations)`
      : `(${wTopic} từ + ${cTopic} Boss Collocations trong mốc này)`;
  }

  function formatPhraseCharsHtml(text, typedCount) {
    const typed = text.slice(0, typedCount);
    const rest = text.slice(typedCount);

    const typedHtml = escapeHtml(typed);
    let restHtml = "";
    for (let i = 0; i < rest.length; i++) {
      const ch = rest[i];
      if (ch === " ") {
        const isNext = i === 0 && typedCount > 0;
        restHtml += `<span class="space-char${isNext ? " next-space" : ""}">␣</span>`;
      } else {
        restHtml += escapeHtml(ch);
      }
    }
    return `<span class="typed">${typedHtml}</span><span class="untyped">${restHtml}</span>`;
  }

  function updateTypingIndicator() {
    if (!game.lockedWord) {
      el.typingIndicator.classList.add("hidden");
      highlightVirtualKey(null);
      return;
    }
    const w = game.lockedWord;
    const text = w.entry.word;
    const nextCh = text[w.typedCount] || null;
    el.typingTyped.textContent = text.slice(0, w.typedCount);
    el.typingRemaining.textContent = text.slice(w.typedCount).replace(/ /g, "␣");
    el.typingIndicator.classList.remove("hidden");
    highlightVirtualKey(nextCh);
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
      }, 1700);
    }
  }

  // --------------------------------------------------------------------------
  // Compact Vietnamese Meaning + Part of Speech Reveal (won't cover falling words)
  // --------------------------------------------------------------------------
  function showMeaningPopup(entry, x, y, missed = false) {
    const popup = document.createElement("div");
    popup.className = `meaning-popup${missed ? " missed" : ""}`;

    const clampedX = Math.max(125, Math.min(fx.width - 140, x));
    const clampedY = Math.max(88, Math.min(fx.height - 115, y));
    popup.style.left = `${clampedX}px`;
    popup.style.top = `${clampedY}px`;

    const prefix = missed ? "✕ " : entry.isColloc ? "👑 " : "✓ ";
    const posCompact = entry.isColloc ? entry.pattern : entry.pos;
    popup.innerHTML = `
      <div class="mp-top">
        <span class="mp-word">${prefix}${escapeHtml(entry.word)}</span>
        <span class="pos-pill pos-${escapeHtml(entry.pos)}">${escapeHtml(posCompact)}</span>
      </div>
      <div class="mp-body">
        <span class="mp-vi">${escapeHtml(entry.meaning)}</span>
      </div>
    `;

    el.popupsLayer.appendChild(popup);
    setTimeout(() => popup.remove(), entry.isColloc ? 2600 : 2200);
  }

  function updateMeaningDock(entry, missed = false) {
    if (game.lastDockWord) {
      game.recentMeanings = [game.lastDockWord]; // keep only 1 ultra-compact previous item
    }
    game.lastDockWord = { entry, missed };

    el.meaningHistory.innerHTML = game.recentMeanings
      .slice()
      .reverse()
      .map(
        item => `
        <div class="mh-item">
          <div class="mh-left">
            <span class="mh-word">${item.entry.isColloc ? "👑 " : ""}${escapeHtml(item.entry.word)}</span>
            <span class="mh-pos">(${escapeHtml(item.entry.isColloc ? item.entry.pattern : item.entry.pos)})</span>
          </div>
          <span class="mh-vi">${escapeHtml(item.entry.meaning)}</span>
        </div>`
      )
      .join("");

    el.meaningCurrent.classList.remove("hidden", "missed-card");
    if (missed) el.meaningCurrent.classList.add("missed-card");
    el.meaningCurrent.style.animation = "none";
    void el.meaningCurrent.offsetWidth;
    el.meaningCurrent.style.animation = "";

    el.mcStatus.textContent = missed
      ? "✕ BỎ LỠ · GHI NHỚ"
      : entry.isColloc
        ? "👑 BOSS COLLOCATION ĐÃ HẠ"
        : "✓ VỪA BẮN HẠ";
    el.mcLevel.textContent = entry.level;
    el.mcLevel.className = `cefr-tag ${entry.level}`;
    el.mcWord.textContent = entry.word;
    el.mcIpa.textContent = entry.ipa || (entry.isColloc ? "Collocation" : "");
    el.mcPos.textContent = entry.posShort;
    el.mcPos.className = `pos-pill pos-${entry.pos}`;
    el.mcMeaning.textContent = entry.meaning;
  }

  // --------------------------------------------------------------------------
  // Word Spawning & Boss Collocation Encounter System
  // --------------------------------------------------------------------------
  function pickNextWordEntry() {
    const activeSet = new Set(game.activeWords.map(w => w.entry.word));
    const activeFirstLetters = new Set(game.activeWords.map(w => w.entry.word[0]));

    if (game.wordQueue.length === 0) {
      game.wordQueue = buildQueueForRun();
    }

    let idx = game.wordQueue.findIndex(
      e => !activeSet.has(e.word) && !activeFirstLetters.has(e.word[0])
    );
    if (idx === -1) idx = game.wordQueue.findIndex(e => !activeSet.has(e.word));
    if (idx === -1) return null;

    const [entry] = game.wordQueue.splice(idx, 1);
    return entry;
  }

  function spawnWord() {
    if (game.inBossPhase) return;

    const preset = SPEED_PRESETS[game.speedKey] || SPEED_PRESETS.chill;
    if (game.activeWords.length >= preset.maxActive) return;

    if (!game.endless && game.regularDestroyed + game.activeWords.length >= game.milestoneGoal) {
      return;
    }

    const entry = pickNextWordEntry();
    if (!entry) return;

    const node = document.createElement("div");
    node.className = `word-pill lvl-${entry.level}`;
    node.innerHTML = `
      <span class="word-chars">${formatPhraseCharsHtml(entry.word, 0)}</span>
      <span class="pill-cefr">${entry.level}</span>
    `;
    node.style.visibility = "hidden";
    el.wordsLayer.appendChild(node);

    const pillW = node.offsetWidth || 160;
    const pillH = node.offsetHeight || 44;

    const minX = 24;
    const maxX = Math.max(minX + 40, fx.width - pillW - 76);

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
      if (minDist > 26) { chosenX = candX; break; }
      if (minDist > bestClearance) { bestClearance = minDist; chosenX = candX; }
    }

    const progressFactor = Math.min(1, game.wordsDestroyed / 35);
    const rawSpeed = preset.baseSpeed + (preset.maxSpeed - preset.baseSpeed) * progressFactor;
    const lengthRelief = entry.word.length > 9 ? 0.84 : entry.word.length > 7 ? 0.92 : 1.0;
    const speed = rawSpeed * lengthRelief * (0.92 + Math.random() * 0.16);

    const wordObj = {
      id: ++game.wordUid,
      entry,
      isBoss: false,
      el: node,
      charsEl: node.querySelector(".word-chars"),
      hpFillEl: null,
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

  function triggerBossPhase(wavesCount) {
    // Seamless natural Boss transition — no warning banner or pause!
    game.inBossPhase = true;
    game.bossTotalWaves = wavesCount;
    game.bossWavesDefeated = 0;

    if (!game.bossQueue.length) {
      game.bossQueue = buildBossQueue(!game.endless);
    }

    updateHUD();

    setTimeout(() => {
      if (game.status === "playing" && game.inBossPhase && !game.activeWords.some(w => w.isBoss)) {
        spawnNextBossWave();
      }
    }, 520);
  }

  function spawnNextBossWave() {
    if (!game.inBossPhase || game.status !== "playing") return;

    if (!game.bossQueue.length) {
      game.bossQueue = buildBossQueue(!game.endless);
    }
    const entry = game.bossQueue.shift();
    if (!entry) return;

    const waveNum = game.bossWavesDefeated + 1;
    const waveBadge = game.endless && game.bossOnly
      ? `BOSS #${waveNum}`
      : `BOSS · ĐỢT ${waveNum}/${game.bossTotalWaves}`;

    const node = document.createElement("div");
    node.className = `word-pill is-boss lvl-${entry.level}`;
    node.innerHTML = `
      <div class="boss-pill-head">
        <span>👑 ${waveBadge}</span>
        <span>·</span>
        <span>${escapeHtml(entry.pattern)}</span>
        <span class="pill-cefr">${entry.level}</span>
      </div>
      <span class="word-chars">${formatPhraseCharsHtml(entry.word, 0)}</span>
      <div class="boss-pill-hp"><div class="boss-pill-hp-fill"></div></div>
    `;
    node.style.visibility = "hidden";
    el.wordsLayer.appendChild(node);

    const pillW = node.offsetWidth || 320;
    const pillH = node.offsetHeight || 78;

    const minX = 32;
    const maxX = Math.max(minX + 20, fx.width - pillW - 78);
    const centerX = Math.max(minX, Math.min(maxX, (fx.width - pillW) / 2 + (Math.random() - 0.5) * 140));

    const preset = SPEED_PRESETS[game.speedKey] || SPEED_PRESETS.chill;
    const waveEscalation = 1 + Math.min(game.bossWavesDefeated, 4) * 0.1;
    const lengthScale = Math.max(0.62, Math.min(1.05, 19 / Math.max(12, entry.word.length)));
    const speed = preset.bossSpeed * waveEscalation * lengthScale;

    const bossObj = {
      id: ++game.wordUid,
      entry,
      isBoss: true,
      el: node,
      charsEl: node.querySelector(".word-chars"),
      hpFillEl: node.querySelector(".boss-pill-hp-fill"),
      x: centerX,
      y: -pillH - 4, // glides in naturally from top like regular words
      w: pillW,
      h: pillH,
      speed,
      typedCount: 0
    };

    node.style.transform = `translate3d(${bossObj.x}px, ${bossObj.y}px, 0)`;
    node.style.visibility = "visible";
    game.activeWords.push(bossObj);
    updateHUD();
  }

  function removeWordObj(wordObj) {
    const idx = game.activeWords.indexOf(wordObj);
    if (idx >= 0) game.activeWords.splice(idx, 1);
    if (wordObj.el && wordObj.el.parentNode) wordObj.el.remove();
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
  // Typing Mechanics, Weapon Firing & Scoring
  // --------------------------------------------------------------------------
  function handleCharInput(char) {
    if (game.status !== "playing") return;
    const ch = char.toLowerCase();
    if (!/^[a-z ]$/.test(ch)) return;

    flashVirtualKey(ch);

    // 1. Lock onto lowest matching word if unlocked
    if (!game.lockedWord) {
      if (ch === " ") return; // never start lock-on with space
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

    // 2. Match next expected char (including space for Boss Collocations!)
    const target = game.lockedWord;
    const expected = target.entry.word[target.typedCount];

    if (ch === expected) {
      game.correctChars++;
      target.typedCount++;
      target.charsEl.innerHTML = formatPhraseCharsHtml(target.entry.word, target.typedCount);

      if (target.isBoss && target.hpFillEl) {
        const remPct = ((target.entry.word.length - target.typedCount) / target.entry.word.length) * 100;
        target.hpFillEl.style.width = `${Math.max(0, remPct).toFixed(1)}%`;
        renderBossHud();
      }

      // Gentle knockback & aim turret
      target.y = Math.max(target.isBoss ? 78 : 8, target.y - (target.isBoss ? 3.5 : 5));
      const cx = target.x + target.w / 2;
      const cy = target.y + target.h / 2;
      aimTurretAt(cx, cy);
      triggerTurretRecoil();

      const color = target.isBoss ? "#fbbf24" : (LEVEL_COLORS[target.entry.level] || "#38bdf8");
      const isFinal = target.typedCount >= target.entry.word.length;
      fireAmmoAt(cx, cy, color, isFinal);

      if (isFinal) {
        destroyWord(target, cx, cy, color);
      } else {
        audio.playShot(game.ammoType, target.typedCount);
        updateTypingIndicator();
      }
    } else {
      game.wrongChars++;
      game.combo = 0;
      audio.playError();
      target.el.classList.remove("wrong-hit");
      void target.el.offsetWidth;
      target.el.classList.add("wrong-hit");

      // Extra Boss Challenge: typos push the Boss closer!
      if (target.isBoss) {
        target.y += 10;
      }
      updateHUD();
    }
  }

  function handleBackspace() {
    if (game.status !== "playing" || !game.lockedWord) return;
    const target = game.lockedWord;
    if (target.typedCount > 0) {
      target.typedCount--;
      target.charsEl.innerHTML = formatPhraseCharsHtml(target.entry.word, target.typedCount);
      if (target.isBoss && target.hpFillEl) {
        const remPct = ((target.entry.word.length - target.typedCount) / target.entry.word.length) * 100;
        target.hpFillEl.style.width = `${Math.max(0, remPct).toFixed(1)}%`;
        renderBossHud();
      }
    }
    if (target.typedCount === 0 && !target.isBoss) {
      target.el.classList.remove("locked");
      game.lockedWord = null;
    }
    updateTypingIndicator();
  }

  function unlockTarget() {
    if (!game.lockedWord) return;
    const t = game.lockedWord;
    t.typedCount = 0;
    t.charsEl.innerHTML = formatPhraseCharsHtml(t.entry.word, 0);
    if (!t.isBoss) {
      t.el.classList.remove("locked");
      game.lockedWord = null;
    } else if (t.hpFillEl) {
      t.hpFillEl.style.width = "100%";
      renderBossHud();
    }
    updateTypingIndicator();
  }

  function destroyWord(target, cx, cy, color) {
    const entry = target.entry;
    const wasBoss = target.isBoss;
    removeWordObj(target);

    game.wordsDestroyed++;
    if (!wasBoss) game.regularDestroyed++;

    game.combo++;
    if (game.combo > game.bestCombo) game.bestCombo = game.combo;

    const base = (wasBoss ? 320 : 100) + entry.word.length * 10 + (LEVEL_BONUS[entry.level] || 0);
    const mult = 1 + Math.min(game.combo - 1, 10) * 0.12;
    game.score += Math.round(base * mult);
    if (game.score > progress.highScore) progress.highScore = game.score;

    progress.mastered.add(entry.word);
    progress.missed.delete(entry.word);
    saveProgress();

    game.sessionLog.unshift({ entry, status: "hit" });

    // Visual & Audio FX
    spawnExplosion(cx, cy, color, wasBoss);
    audio.playExplosion(game.combo, wasBoss);
    audio.speakWord(entry.word);

    // Reveal Vietnamese Meaning + Part of Speech / Collocation Pattern
    showMeaningPopup(entry, cx, cy, false);
    updateMeaningDock(entry, false);

    if (wasBoss) {
      game.bossWavesDefeated++;
      triggerMascot("cheer", `Hạ Boss ${game.bossWavesDefeated}/${game.bossTotalWaves}! 👑`);
      updateHUD();

      // Check Endless Boss-Only vs Milestone Boss Completion
      if (game.endless && game.bossOnly) {
        setTimeout(() => {
          if (game.status === "playing") spawnNextBossWave();
        }, 700);
        return;
      }

      if (game.bossWavesDefeated >= game.bossTotalWaves) {
        // BOSS COMPLETELY DEFEATED!
        game.score += 500;
        if (game.score > progress.highScore) progress.highScore = game.score;

        // Extra celebratory fireworks
        spawnExplosion(fx.width * 0.35, fx.height * 0.38, "#fbbf24", true);
        spawnExplosion(fx.width * 0.65, fx.height * 0.35, "#38bdf8", true);
        audio.playBossDefeat();

        if (game.endless) {
          // Endless Mini-Boss cleared -> resume regular waves
          game.inBossPhase = false;
          game.nextEndlessBossAt = game.regularDestroyed + 10;
          triggerMascot("cheer", "+500 ĐIỂM HẠ BOSS! 🔥");
          updateHUD();
          game.spawnTimer = 1.1;
        } else {
          // Milestone Victory!
          progress.clearedMilestones.add(game.milestoneId);
          saveProgress();
          updateHUD();
          setTimeout(() => {
            if (game.status === "playing") finishRun(true);
          }, 950);
        }
      } else {
        // Next Boss wave!
        setTimeout(() => {
          if (game.status === "playing" && game.inBossPhase) {
            spawnNextBossWave();
          }
        }, 780);
      }
      return;
    }

    // Regular word celebrations
    if (game.combo > 0 && game.combo % 4 === 0) {
      triggerMascot("cheer", `Combo x${game.combo}! 🔥`);
    } else if (entry.level === "C2") {
      triggerMascot("cheer", "Hạ gục từ C2! ⚡");
    } else if (game.wordsDestroyed % 5 === 0) {
      triggerMascot("cheer", CHEER_MESSAGES[game.wordsDestroyed % CHEER_MESSAGES.length]);
    }

    updateHUD();

    // Check if ready to summon End-of-Milestone BOSS naturally
    if (!game.endless && game.regularDestroyed >= game.milestoneGoal) {
      triggerBossPhase(BOSS_PHASES_PER_MILESTONE);
      return;
    }

    // Endless Mode Mini-Boss every 10 regular words
    if (game.endless && !game.bossOnly && game.regularDestroyed >= game.nextEndlessBossAt) {
      triggerBossPhase(1);
      return;
    }

    if (game.activeWords.length === 0) {
      game.spawnTimer = Math.min(game.spawnTimer, 0.35);
    }
  }

  function handleWordMissed(wordObj) {
    if (!game.endless && game.inBossPhase && game.bossWavesDefeated >= game.bossTotalWaves) {
      removeWordObj(wordObj);
      return;
    }

    const entry = wordObj.entry;
    const wasBoss = wordObj.isBoss;
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

    showMeaningPopup(entry, cx, cy, true);
    updateMeaningDock(entry, true);

    audio.playDamage();
    el.dangerLine.classList.add("hit");
    el.arena.classList.remove("shake");
    void el.arena.offsetWidth;
    el.arena.classList.add("shake");
    triggerMascot("shock", wasBoss ? "Boss phá lá chắn rồi!" : "Ôi! Trượt mất rồi!");
    setTimeout(() => el.dangerLine.classList.remove("hit"), 260);

    updateHUD();

    if (game.lives <= 0) {
      setTimeout(() => {
        if (game.status === "playing") finishRun(false);
      }, 420);
      return;
    }

    // If a Boss Collocation slipped through but player still has lives, summon next Boss wave to retry!
    if (wasBoss && game.inBossPhase) {
      setTimeout(() => {
        if (game.status === "playing" && game.inBossPhase && game.activeWords.length === 0) {
          spawnNextBossWave();
        }
      }, 850);
    }
  }

  // --------------------------------------------------------------------------
  // Game Lifecycle
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
    game.regularDestroyed = 0;

    game.inBossPhase = false;
    game.bossWavesDefeated = 0;
    game.bossTotalWaves = game.bossOnly ? BOSS_ONLY_GOAL : BOSS_PHASES_PER_MILESTONE;
    game.nextEndlessBossAt = 10;

    game.sessionLog = [];
    game.recentMeanings = [];
    game.lastDockWord = null;
    game.spawnTimer = 0.25;
    game.elapsed = 0;
    game.turretAngle = 0;
    getActiveRotator().style.transform = "rotate(0deg)";

    el.meaningHistory.innerHTML = "";
    el.meaningCurrent.classList.add("hidden");
    el.arena.classList.remove("boss-mode");
    el.bossHud.classList.add("hidden");

    game.wordQueue = buildQueueForRun();
    game.bossQueue = buildBossQueue(!game.endless);

    const poolSize = getFilteredPool(singleVocab, true).length;
    game.milestoneGoal = game.endless ? 9999 : Math.min(12, Math.max(8, poolSize));

    el.startOverlay.classList.add("hidden");
    el.pauseOverlay.classList.add("hidden");
    el.resultOverlay.classList.add("hidden");
    syncPauseIcon();
    updateHUD();

    if (game.bossOnly) {
      triggerBossPhase(game.endless ? 999 : BOSS_ONLY_GOAL);
    } else {
      spawnWord();
      setTimeout(() => {
        if (game.status === "playing" && !game.inBossPhase && game.activeWords.length < 2) {
          spawnWord();
        }
      }, 650);
    }
  }

  function pauseGame() {
    if (game.status !== "playing") return;
    game.status = "paused";
    const topic = topicMap.get(game.milestoneId) || topics[0];
    el.pauseSubtitle.textContent = game.inBossPhase
      ? `👑 Đang đấu Boss Collocation · ${topic.name}`
      : game.endless
        ? `Chế độ Vô tận · Đã bắn hạ ${game.wordsDestroyed} mục tiêu`
        : `Mốc ${topic.id}/20 · ${topic.name} (${game.regularDestroyed}/${game.milestoneGoal} từ + Boss)`;
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
    game.inBossPhase = false;
    clearArenaWords();
    el.arena.classList.remove("boss-mode");
    el.bossHud.classList.add("hidden");
    el.pauseOverlay.classList.add("hidden");
    el.resultOverlay.classList.add("hidden");
    el.startOverlay.classList.remove("hidden");
    syncStartOverlayControls();
    syncPauseIcon();
    updateHUD();
  }

  function finishRun(victory) {
    game.status = "result";
    game.inBossPhase = false;
    clearArenaWords();
    el.arena.classList.remove("boss-mode");
    el.bossHud.classList.add("hidden");
    syncPauseIcon();

    const topic = topicMap.get(game.milestoneId) || topics[0];
    const totalTyped = game.correctChars + game.wrongChars;
    const accuracy = totalTyped > 0 ? Math.round((game.correctChars / totalTyped) * 100) : 100;

    if (victory) {
      el.resultEmoji.textContent = "👑";
      el.resultTitle.textContent = `Tiêu diệt Boss · Vượt Mốc ${topic.id}/20!`;
      el.resultSubtitle.textContent = `Chủ đề: ${topic.name} (${topic.vi}) · Hạ gục ${game.wordsDestroyed} từ & Collocations (+500 thưởng Boss)`;
      el.btnNextMilestone.classList.toggle("hidden", game.milestoneId >= topics.length);
    } else {
      audio.playGameOver();
      el.resultEmoji.textContent = "💥";
      el.resultTitle.textContent = game.endless ? "Kết thúc lượt chiến đấu!" : "Lá chắn phòng thủ đã vỡ!";
      el.resultSubtitle.textContent = `Bạn đã bắn hạ ${game.wordsDestroyed} mục tiêu · Ôn lại nghĩa từ & Collocations bên dưới nhé`;
      el.btnNextMilestone.classList.add("hidden");
    }

    el.resScore.textContent = game.score.toLocaleString("en-US");
    el.resWords.textContent = String(game.wordsDestroyed);
    el.resAccuracy.textContent = `${accuracy}%`;
    el.resCombo.textContent = `x${game.bestCombo}`;

    if (!game.sessionLog.length) {
      el.resultReviewList.innerHTML = `<p class="muted-text" style="padding:12px;text-align:center;">Chưa có mục tiêu nào trong ván này.</p>`;
    } else {
      el.resultReviewList.innerHTML = game.sessionLog
        .map(
          item => `
          <div class="review-item ${item.status === "missed" ? "is-missed" : ""}">
            <div class="review-left">
              <button class="speak-mini-btn" data-speak="${escapeHtml(item.entry.word)}" title="Nghe phát âm">🔊</button>
              ${item.entry.isColloc ? `<span class="boss-tag-badge">👑 BOSS</span>` : ""}
              <span class="review-word">${escapeHtml(item.entry.word)}</span>
              ${item.entry.ipa ? `<span class="review-ipa">${escapeHtml(item.entry.ipa)}</span>` : ""}
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
      if (!game.inBossPhase) {
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

      if (game.lockedWord) {
        aimTurretAt(
          game.lockedWord.x + game.lockedWord.w / 2,
          game.lockedWord.y + game.lockedWord.h / 2
        );
      }
    }

    renderCanvas(dt, nowSec);
    requestAnimationFrame(gameLoop);
  }

  // --------------------------------------------------------------------------
  // Virtual Keyboard (with SPACE bar for Boss Collocations!)
  // --------------------------------------------------------------------------
  function buildVirtualKeyboard() {
    const rows = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m", "⌫"],
      ["SPACE"]
    ];
    el.virtualKeyboard.innerHTML = rows
      .map(
        row =>
          `<div class="vk-row">${row
            .map(k =>
              k === "SPACE"
                ? `<button class="vk-key vk-space" data-key=" " type="button">SPACE (CÁCH)</button>`
                : `<button class="vk-key" data-key="${k}" type="button">${k}</button>`
            )
            .join("")}</div>`
      )
      .join("");

    el.virtualKeyboard.addEventListener("click", e => {
      const btn = e.target.closest(".vk-key");
      if (!btn) return;
      btn.blur();
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
  // Modals: Milestones Picker & Vocabulary/Collocations Notebook
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
        const wInTopic = singleVocab.filter(w => w.topicId === t.id && (game.levelFilter === "ALL" || w.level === game.levelFilter));
        const cInTopic = collocVocab.filter(c => c.topicId === t.id && (game.levelFilter === "ALL" || c.level === game.levelFilter));
        const totalInTopic = wInTopic.length + cInTopic.length;
        const masteredInTopic = [...wInTopic, ...cInTopic].filter(w => progress.mastered.has(w.word)).length;
        const cleared = progress.clearedMilestones.has(t.id);
        const current = !game.endless && game.milestoneId === t.id;

        return `
          <button class="ms-card ${current ? "current" : ""} ${cleared ? "cleared" : ""}" data-milestone="${t.id}">
            <div class="ms-card-top">
              <span>${t.icon} Mốc ${t.id}/20</span>
              ${cleared ? `<span class="ms-cleared-badge">👑 Đã diệt Boss</span>` : `<span>${masteredInTopic}/${totalInTopic}</span>`}
            </div>
            <div class="ms-card-title">${t.name}</div>
            <div class="ms-card-sub">${wInTopic.length} từ + ${cInTopic.length} Boss Collocations</div>
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
    const kind = el.nbKind.value;
    const lvl = el.nbLevel.value;
    const topicVal = el.nbTopic.value;
    const statusVal = el.nbStatus.value;

    el.nbSummaryText.textContent = `${singleVocab.length.toLocaleString("en-US")} từ đơn + ${collocVocab.length} Boss Collocations · ${progress.mastered.size} đã bắn hạ · ${progress.missed.size} cần ôn lại`;

    notebookState.filtered = allLibrary.filter(item => {
      if (kind === "WORD" && item.isColloc) return false;
      if (kind === "COLLOC" && !item.isColloc) return false;
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
                    <div class="nb-word-main">
                      ${item.isColloc ? `<span class="boss-tag-badge" style="margin-right:6px;">👑 BOSS</span>` : ""}
                      ${escapeHtml(item.word)}
                    </div>
                    ${item.ipa ? `<div class="nb-word-ipa">${escapeHtml(item.ipa)}</div>` : ""}
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
      <span>Hiển thị ${total ? start + 1 : 0}–${Math.min(start + notebookState.perPage, total)} / ${total.toLocaleString("en-US")} mục</span>
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
        if (Array.isArray(json)) parsedRows = json;
      } else {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          if (/^(word|phrase)\s*,/i.test(line)) continue;
          const parts = line.split(",");
          if (parts.length >= 2) {
            const word = parts[0].trim().toLowerCase().replace(/\s+/g, " ");
            if (parts.length === 2) {
              parsedRows.push([word, word.includes(" ") ? "colloc" : "n", "B2", "", parts[1].trim(), game.milestoneId]);
            } else if (parts.length === 3) {
              parsedRows.push([word, parts[1].trim(), "B2", "", parts[2].trim(), game.milestoneId]);
            } else if (parts.length === 4) {
              parsedRows.push([word, parts[1].trim(), parts[2].trim(), "", parts[3].trim(), game.milestoneId]);
            } else {
              parsedRows.push([word, parts[1].trim(), parts[2].trim(), parts[3].trim(), parts.slice(4).join(",").trim(), game.milestoneId]);
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
      const n = normalizeWordEntry(row, true);
      if (/^[a-z]+( [a-z]+)*$/.test(n.word) && n.meaning) {
        valid.push([n.word, n.isColloc ? (n.pattern || "colloc") : n.pos, n.level, n.ipa, n.meaning, n.topicId]);
      }
    }

    if (!valid.length) {
      el.importFeedback.textContent = "⚠️ Không tìm thấy mục hợp lệ (từ/collocation chỉ gồm chữ cái a–z và dấu cách, kèm nghĩa tiếng Việt).";
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
    el.importFeedback.textContent = `✅ Đã nhập ${valid.length} mục mới! Tổng kho hiện có ${allLibrary.length.toLocaleString("en-US")} từ & Boss Collocations.`;
  }

  // --------------------------------------------------------------------------
  // Sync Controls & Events
  // --------------------------------------------------------------------------
  function setLevelFilter(level) {
    game.levelFilter = level;
    savePrefs();

    el.quickLevelBar.querySelectorAll(".lvl-pill").forEach(btn => btn.classList.toggle("active", btn.dataset.level === level));
    el.startLevelGroup.querySelectorAll(".chip").forEach(btn => btn.classList.toggle("active", btn.dataset.level === level));

    updatePoolHints();
    updateHUD();

    if (game.status === "playing") {
      game.wordQueue = buildQueueForRun();
      game.bossQueue = buildBossQueue(!game.endless);
    }
  }

  function syncStartOverlayControls() {
    el.startLevelGroup.querySelectorAll(".chip").forEach(btn => btn.classList.toggle("active", btn.dataset.level === game.levelFilter));
    el.quickLevelBar.querySelectorAll(".lvl-pill").forEach(btn => btn.classList.toggle("active", btn.dataset.level === game.levelFilter));
    el.speedGroup.querySelectorAll(".chip").forEach(btn => btn.classList.toggle("active", btn.dataset.speed === game.speedKey));
    el.selectMilestone.value = String(game.milestoneId);
    el.selectMilestone.disabled = game.endless;
    el.optSpeak.checked = audio.autoSpeak;
    el.optShowLevel.checked = game.showLevelOnPill;
    el.optEndless.checked = game.endless;
    el.optBossOnly.checked = game.bossOnly;
    setWeaponType(game.weaponType);
    setAmmoType(game.ammoType);
    updatePoolHints();
  }

  function bindEvents() {
    window.addEventListener("resize", resizeCanvas);

    // Global Typing + Quick Ammo Hotkeys (1-4)
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
          if (game.lockedWord && !game.lockedWord.isBoss) unlockTarget();
          else pauseGame();
        }
        return;
      }

      if (game.status !== "playing") {
        if (e.key === "Enter" && game.status === "menu") startRun();
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

      if (e.key === " ") {
        e.preventDefault();
        handleCharInput(" ");
        return;
      }

      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleCharInput(e.key);
      }
    });

    el.mobileInput.addEventListener("input", () => {
      const val = el.mobileInput.value;
      el.mobileInput.value = "";
      for (const ch of val) {
        if (/^[a-zA-Z ]$/.test(ch)) handleCharInput(ch);
      }
    });

    // Top bar & HUD
    el.btnHome.addEventListener("click", returnToMenu);
    el.btnExit.addEventListener("click", returnToMenu);
    el.deckPill.addEventListener("click", openMilestonesModal);
    el.btnMilestones.addEventListener("click", openMilestonesModal);
    el.btnNotebook.addEventListener("click", openNotebookModal);
    el.btnOpenNotebookStart.addEventListener("click", openNotebookModal);
    el.btnPauseNotebook.addEventListener("click", openNotebookModal);

    el.btnFullscreen.addEventListener("click", () => {
      el.btnFullscreen.blur();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    });

    el.btnPause.addEventListener("click", () => {
      el.btnPause.blur();
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
      if (game.lastDockWord) audio.speakWord(game.lastDockWord.entry.word, true);
    });

    // Weapon & Ammo switchers (Start menu only — hidden during battle)
    el.startWeaponGroup.addEventListener("click", e => {
      const btn = e.target.closest(".chip");
      if (btn) setWeaponType(btn.dataset.weapon);
    });
    el.startAmmoGroup.addEventListener("click", e => {
      const btn = e.target.closest(".chip");
      if (btn) setAmmoType(btn.dataset.ammo);
    });

    // Level & Speed setup
    el.quickLevelBar.addEventListener("click", e => {
      const btn = e.target.closest(".lvl-pill");
      if (!btn) return;
      btn.blur();
      setLevelFilter(btn.dataset.level);
    });

    el.startLevelGroup.addEventListener("click", e => {
      const btn = e.target.closest(".chip");
      if (btn) setLevelFilter(btn.dataset.level);
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

    el.optBossOnly.addEventListener("change", () => {
      game.bossOnly = el.optBossOnly.checked;
      savePrefs();
      updatePoolHints();
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

    // Pause & Result overlay buttons
    el.btnResume.addEventListener("click", resumeGame);
    el.btnRestartMilestone.addEventListener("click", startRun);
    el.btnPauseMenu.addEventListener("click", returnToMenu);

    el.btnNextMilestone.addEventListener("click", () => {
      if (game.milestoneId < topics.length) {
        game.milestoneId++;
        savePrefs();
      }
      startRun();
    });
    el.btnReplayMilestone.addEventListener("click", startRun);
    el.btnResultMenu.addEventListener("click", returnToMenu);

    document.addEventListener("click", e => {
      const speakBtn = e.target.closest("[data-speak]");
      if (speakBtn) {
        speakBtn.blur();
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

    [el.nbSearch, el.nbKind, el.nbLevel, el.nbTopic, el.nbStatus].forEach(ctrl => {
      ctrl.addEventListener("input", () => { notebookState.page = 1; renderNotebook(); });
      ctrl.addEventListener("change", () => { notebookState.page = 1; renderNotebook(); });
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
      const payload = allLibrary.map(v => ({
        word: v.word,
        kind: v.isColloc ? "collocation" : "word",
        pos: v.isColloc ? v.pattern : v.pos,
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
      a.download = "vocab-and-collocations-b1-c2.json";
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
