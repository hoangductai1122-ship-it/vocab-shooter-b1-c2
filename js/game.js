/* ==========================================================================
   IELTS Vocabulary Suite (10,000 A1–C2 + AWL + 500 Boss Collocations)
   Tightly Linked 2-Stage Learning Loop:
     1. Luyện Gõ (Learn NEW words -> saved to Review Queue)
     2. Mưa Từ Vựng (SRS Spelling Review strictly from learned words -> Mastered)
   ========================================================================== */

(() => {
  "use strict";

  // v2 storage schema cleanly resets legacy v1 data as requested & stores compact SRS entries:
  // learned[word] = [learnedAtMin, reviewCount, streak, nextDueMin]
  const LEGACY_PROGRESS_KEY = "vocab_shooter_progress_v1";
  const STORAGE_PROGRESS_KEY = "vocab_ielts_progress_v2";
  const STORAGE_CUSTOM_KEY = "vocab_shooter_custom_words_v1";
  const STORAGE_PREFS_KEY = "vocab_ielts_prefs_v3";

  const LEVEL_COLORS = {
    A1: "#10b981",
    A2: "#14b8a6",
    B1: "#38bdf8",
    B2: "#a855f7",
    C1: "#ec4899",
    C2: "#ef4444"
  };

  const LEVEL_BONUS = {
    A1: 0,
    A2: 10,
    B1: 20,
    B2: 35,
    C1: 55,
    C2: 80
  };

  const SPEED_PRESETS = {
    slow:   { baseSpeed: 19, maxSpeed: 30, bossSpeed: 16, rainSpeed: 16, spawnInterval: 3.15, minSpawn: 2.2, maxActive: 3 },
    chill:  { baseSpeed: 33, maxSpeed: 54, bossSpeed: 28, rainSpeed: 25, spawnInterval: 2.35, minSpawn: 1.55, maxActive: 4 },
    normal: { baseSpeed: 48, maxSpeed: 74, bossSpeed: 38, rainSpeed: 36, spawnInterval: 1.85, minSpawn: 1.15, maxActive: 5 },
    fast:   { baseSpeed: 68, maxSpeed: 102, bossSpeed: 50, rainSpeed: 48, spawnInterval: 1.45, minSpawn: 0.85, maxActive: 6 }
  };

  // Spaced repetition intervals in minutes after successful spelling recall in Mưa Từ Vựng
  const SRS_INTERVALS_MIN = [1440, 4320, 10080, 30240]; // 1d, 3d, 7d, 21d

  const BOSS_PHASES_PER_MILESTONE = 3;
  const BOSS_ONLY_GOAL = 5;

  const CHEER_MESSAGES = [
    "Tuyệt vời!",
    "Chuẩn xác!",
    "Đỉnh quá!",
    "Hỏa lực cực mạnh!",
    "Bắn cực nét!",
    "Nhớ siêu đỉnh!"
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
  let vocabByWord = new Map();
  let progress = loadProgress();
  let prefs = loadPrefs();
  const sessionLearned = new Set(); // Exact words learned in Luyện Gõ during this session

  const game = {
    mode: "shooter",   // "shooter" (1. Học từ mới) | "rain" (2. Ôn từ đã học)
    status: "hub",     // hub | menu | playing | paused | result
    levelFilter: prefs.levelFilter || "ALL", // ALL | A1..C2 | AWL
    milestoneId: prefs.milestoneId || 1,
    speedKey: prefs.speedKey || "chill",
    weaponType: prefs.weaponType || "tank",
    ammoType: prefs.ammoType || "bullet",
    endless: Boolean(prefs.endless),
    bossOnly: Boolean(prefs.bossOnly),
    showLevelOnPill: prefs.showLevelOnPill !== false,
    virtualKeyboardOpen: false,

    // Rain Mode review preferences (strictly from learned words)
    rainSource: prefs.rainSource || "due",       // due | session | recent20 | all
    rainKind: prefs.rainKind || "WORDS_ONLY",    // WORDS_ONLY | ALL | COLLOCS_ONLY
    rainShowPos: prefs.rainShowPos !== false,

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
    rainMasteredThisRun: 0,

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

  const fx = {
    width: 1000,
    height: 600,
    stars: [],
    nebulae: [],
    meteors: [],
    asteroids: [],
    raindrops: [],
    ripples: [],
    meteorTimer: 1.4,
    lasers: [],
    projectiles: [],
    casings: [],
    particles: [],
    rings: [],
    muzzleFlashes: []
  };

  const notebookState = {
    page: 1,
    perPage: 50,
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
    oceanSurface: document.getElementById("ocean-surface"),
    turretAnchor: document.getElementById("turret-anchor"),
    boatAnchor: document.getElementById("boat-anchor"),
    paperBoat: document.getElementById("paper-boat"),
    weaponTank: document.getElementById("weapon-tank"),
    weaponGun: document.getElementById("weapon-gun"),
    weaponCannon: document.getElementById("weapon-cannon"),
    rotatorTank: document.getElementById("rotator-tank"),
    rotatorGun: document.getElementById("rotator-gun"),
    rotatorCannon: document.getElementById("rotator-cannon"),
    mascot: document.getElementById("mascot"),
    mascotBubble: document.getElementById("mascot-bubble"),

    brandIconShooter: document.getElementById("brand-icon-shooter"),
    brandIconRain: document.getElementById("brand-icon-rain"),
    brandTitle: document.getElementById("brand-title"),
    brandSubtitle: document.getElementById("brand-subtitle"),

    bossHud: document.getElementById("boss-hud"),
    bossHudTitle: document.getElementById("boss-hud-title"),
    bossHudPhase: document.getElementById("boss-hud-phase"),
    bossHpSegments: document.getElementById("boss-hp-segments"),

    btnHome: document.getElementById("btn-home"),
    btnQuickRain: document.getElementById("btn-quick-rain"),
    reviewQueueCount: document.getElementById("review-queue-count"),
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

    btnExit: document.getElementById("btn-exit"),
    btnPause: document.getElementById("btn-pause"),
    iconPause: document.getElementById("icon-pause"),
    iconPlay: document.getElementById("icon-play"),
    btnKeyboard: document.getElementById("btn-keyboard"),
    btnSound: document.getElementById("btn-sound"),
    iconSoundOn: document.getElementById("icon-sound-on"),
    iconSoundOff: document.getElementById("icon-sound-off"),

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
    typingHint: document.getElementById("typing-hint"),
    virtualKeyboard: document.getElementById("virtual-keyboard"),
    mobileInput: document.getElementById("mobile-input"),

    // Hub
    hubOverlay: document.getElementById("hub-overlay"),
    chooseGameShooter: document.getElementById("choose-game-shooter"),
    chooseGameRain: document.getElementById("choose-game-rain"),
    hubShooterCount: document.getElementById("hub-shooter-count"),
    hubRainCount: document.getElementById("hub-rain-count"),

    // Game 1 Start
    startOverlay: document.getElementById("start-overlay"),
    btnBackHub1: document.getElementById("btn-back-hub-1"),
    startLevelGroup: document.getElementById("start-level-group"),
    startWeaponGroup: document.getElementById("start-weapon-group"),
    startAmmoGroup: document.getElementById("start-ammo-group"),
    poolCountHint: document.getElementById("pool-count-hint"),
    selectMilestone: document.getElementById("select-milestone"),
    speedGroup: document.getElementById("speed-group"),
    optSpeak: document.getElementById("opt-speak"),
    btnTestVoice1: document.getElementById("btn-test-voice-1"),
    optShowLevel: document.getElementById("opt-show-level"),
    optBossOnly: document.getElementById("opt-boss-only"),
    optEndless: document.getElementById("opt-endless"),
    btnStartGame: document.getElementById("btn-start-game"),
    btnOpenNotebookStart: document.getElementById("btn-open-notebook-start"),

    // Game 2 Rain Start
    rainStartOverlay: document.getElementById("rain-start-overlay"),
    btnBackHub2: document.getElementById("btn-back-hub-2"),
    rainEmptyAlert: document.getElementById("rain-empty-alert"),
    btnGotoShooterEmpty: document.getElementById("btn-goto-shooter-empty"),
    rainSetupBody: document.getElementById("rain-setup-body"),
    rainPoolHint: document.getElementById("rain-pool-hint"),
    rainSourceGroup: document.getElementById("rain-source-group"),
    rainKindSelect: document.getElementById("rain-kind-select"),
    rainSpeedGroup: document.getElementById("rain-speed-group"),
    rainOptSpeak: document.getElementById("rain-opt-speak"),
    btnTestVoice2: document.getElementById("btn-test-voice-2"),
    rainOptPos: document.getElementById("rain-opt-pos"),
    btnStartRain: document.getElementById("btn-start-rain"),
    btnOpenNotebookRain: document.getElementById("btn-open-notebook-rain"),

    // Pause & Result
    pauseOverlay: document.getElementById("pause-overlay"),
    pauseSubtitle: document.getElementById("pause-subtitle"),
    btnResume: document.getElementById("btn-resume"),
    btnRestartMilestone: document.getElementById("btn-restart-milestone"),
    btnPauseNotebook: document.getElementById("btn-pause-notebook"),
    btnPauseMenu: document.getElementById("btn-pause-menu"),
    btnPauseHub: document.getElementById("btn-pause-hub"),

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
    btnPracticeRainNow: document.getElementById("btn-practice-rain-now"),
    btnBackLearnMore: document.getElementById("btn-back-learn-more"),
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
    btnExportProgress: document.getElementById("btn-export-progress"),
    importProgressFile: document.getElementById("import-progress-file"),
    btnResetProgress: document.getElementById("btn-reset-progress")
  };

  const ctx = el.canvas.getContext("2d");

  // --------------------------------------------------------------------------
  // Optimized SRS Learning Storage (Game 1 -> Review Queue -> Game 2 Mastered)
  // --------------------------------------------------------------------------
  function nowMin() {
    return Math.floor(Date.now() / 60000);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createEmptyProgress() {
    return {
      learned: {}, // word -> [learnedAtMin, reviewCount, streak, nextDueMin]
      missed: new Set(),
      clearedMilestones: new Set(),
      highScore: 0
    };
  }

  function loadProgress() {
    // Cleanly remove old legacy v1 test progress so user starts fresh from 0!
    try {
      localStorage.removeItem(LEGACY_PROGRESS_KEY);
    } catch (_) {}

    try {
      const raw = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          learned: parsed.learned && typeof parsed.learned === "object" ? parsed.learned : {},
          missed: new Set(parsed.missed || []),
          clearedMilestones: new Set(parsed.clearedMilestones || []),
          highScore: Number(parsed.highScore) || 0
        };
      }
    } catch (_) {}
    return createEmptyProgress();
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        STORAGE_PROGRESS_KEY,
        JSON.stringify({
          learned: progress.learned,
          missed: Array.from(progress.missed),
          clearedMilestones: Array.from(progress.clearedMilestones),
          highScore: progress.highScore
        })
      );
    } catch (_) {}
    updateProgressBadges();
  }

  function isWordLearned(word) {
    return Object.prototype.hasOwnProperty.call(progress.learned, word);
  }

  function isWordDueForReview(word) {
    const rec = progress.learned[word];
    if (!rec) return false;
    return rec[2] === 0 || nowMin() >= rec[3];
  }

  function isWordMasteredSpelling(word) {
    const rec = progress.learned[word];
    return Boolean(rec && rec[2] >= 1);
  }

  function getLearningCounts() {
    const keys = Object.keys(progress.learned);
    const cur = nowMin();
    let due = 0;
    let mastered = 0;
    for (let i = 0; i < keys.length; i++) {
      const rec = progress.learned[keys[i]];
      if (rec[2] >= 1) mastered++;
      if (rec[2] === 0 || cur >= rec[3]) due++;
    }
    return { totalLearned: keys.length, due, mastered };
  }

  // Called when user shoots down a word in Game 1 (Luyện Gõ): adds to Mưa Từ Vựng review queue!
  function recordLearnedFromShooter(word) {
    const t = nowMin();
    const existing = progress.learned[word];
    if (existing) {
      // Refresh learned timestamp & mark due if not yet mastered
      progress.learned[word] = [t, existing[1], existing[2], existing[2] === 0 ? 0 : existing[3]];
    } else {
      progress.learned[word] = [t, 0, 0, 0]; // immediately due for Mưa Từ Vựng spelling review!
    }
    progress.missed.delete(word);
    sessionLearned.add(word);
    saveProgress();
  }

  // Called when user recalls & spells a word in Game 2 (Mưa Từ Vựng)!
  function recordRainReviewSuccess(word, usedHint) {
    const t = nowMin();
    const existing = progress.learned[word] || [t, 0, 0, 0];
    const newCount = existing[1] + 1;
    if (usedHint) {
      // Needed hint -> keep in due queue to reinforce spelling again
      progress.learned[word] = [existing[0], newCount, 0, 0];
    } else {
      const newStreak = existing[2] + 1;
      const interval = SRS_INTERVALS_MIN[Math.min(newStreak - 1, SRS_INTERVALS_MIN.length - 1)];
      progress.learned[word] = [existing[0], newCount, newStreak, t + interval];
      game.rainMasteredThisRun++;
    }
    progress.missed.delete(word);
    saveProgress();
  }

  // Called when user misses a word in Game 2 (Mưa Từ Vựng): demotes streak back to 0 (due immediately)
  function recordRainReviewMiss(word) {
    const existing = progress.learned[word];
    if (existing) {
      progress.learned[word] = [existing[0], existing[1], 0, 0];
    }
    progress.missed.add(word);
    saveProgress();
  }

  function updateProgressBadges() {
    const c = getLearningCounts();
    el.notebookCount.textContent = `${c.totalLearned}/${allLibrary.length}`;
    el.reviewQueueCount.textContent = String(c.due);
    el.btnQuickRain.classList.toggle("has-due", c.due > 0);
    el.hubShooterCount.textContent = `${c.totalLearned.toLocaleString("en-US")} / ${allLibrary.length.toLocaleString("en-US")} đã học`;
    el.hubRainCount.textContent = c.due > 0
      ? `${c.due} từ chờ ôn · ${c.mastered} đã thuộc`
      : c.totalLearned > 0
        ? `Đã thuộc hết ${c.mastered} từ · Ôn lại`
        : "0 từ chờ ôn · Học ở Luyện Gõ trước";
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
      bossOnly: false,
      rainSource: "due",
      rainKind: "WORDS_ONLY",
      rainShowPos: true
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
          bossOnly: game.bossOnly,
          rainSource: game.rainSource,
          rainKind: game.rainKind,
          rainShowPos: game.rainShowPos
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
  // Vocabulary & Collocation Normalization (10,000 A1-C2/AWL + 500 Boss)
  // --------------------------------------------------------------------------
  const VALID_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

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
    const isAwl = Boolean(raw[6] || raw.isAwl);
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
      level: VALID_LEVELS.has(level) ? level : "B2",
      ipa,
      meaning,
      topicId: topic ? topic.id : 1,
      topicName: topic ? topic.name : "Technology",
      topicVi: topic ? topic.vi : "Công nghệ",
      isAwl,
      isColloc,
      isCustom
    };
  }

  function normalizeCollocEntry(raw) {
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
      level: VALID_LEVELS.has(level) ? level : "B2",
      ipa: "",
      meaning,
      topicId: topic ? topic.id : 1,
      topicName: topic ? topic.name : "Technology",
      topicVi: topic ? topic.vi : "Công nghệ",
      isAwl: false,
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
    vocabByWord = new Map(allLibrary.map(e => [e.word, e]));

    updatePoolHints();
    updateProgressBadges();
  }

  function matchesLevelFilter(item) {
    if (game.levelFilter === "ALL") return true;
    if (game.levelFilter === "AWL") return item.isAwl;
    return item.level === game.levelFilter;
  }

  function getFilteredPool(sourceList, forMilestone = !game.endless) {
    return sourceList.filter(item => {
      const matchLvl = matchesLevelFilter(item);
      const matchTopic = !forMilestone || item.topicId === game.milestoneId;
      return matchLvl && matchTopic;
    });
  }

  // STRICTLY returns ONLY words the player has ALREADY learned in Game 1 (Luyện Gõ)!
  // Sorted with SRS priority (newly learned / due first!)
  function getRainPool() {
    const learnedKeys = Object.keys(progress.learned);
    if (learnedKeys.length === 0) return [];

    // Sort all learned words newest-first so freshly learned words appear first
    const sortedKeys = learnedKeys.slice().sort((a, b) => (progress.learned[b][0] || 0) - (progress.learned[a][0] || 0));

    let chosenKeys = sortedKeys;
    if (game.rainSource === "due") {
      chosenKeys = sortedKeys.filter(w => isWordDueForReview(w));
    } else if (game.rainSource === "session") {
      chosenKeys = sortedKeys.filter(w => sessionLearned.has(w));
    } else if (game.rainSource === "recent20") {
      chosenKeys = sortedKeys.slice(0, 20);
    }

    let entries = chosenKeys.map(w => vocabByWord.get(w)).filter(Boolean);

    if (game.rainKind === "WORDS_ONLY") {
      const onlyWords = entries.filter(e => !e.isColloc);
      if (onlyWords.length) entries = onlyWords;
    } else if (game.rainKind === "COLLOCS_ONLY") {
      entries = entries.filter(e => e.isColloc);
    }

    if (game.levelFilter !== "ALL") {
      const lvlMatched = entries.filter(matchesLevelFilter);
      if (lvlMatched.length) entries = lvlMatched;
    }

    return entries;
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
    if (game.mode === "rain") {
      // Keep SRS due order with gentle shuffling within same priority bucket
      const pool = getRainPool();
      const dueNow = shuffle(pool.filter(e => isWordDueForReview(e.word)));
      const others = shuffle(pool.filter(e => !isWordDueForReview(e.word)));
      return [...dueNow, ...others];
    }

    // Game 1 (Luyện Gõ): ALWAYS prioritize UNSEEN (chưa học) words first!
    const pool = getFilteredPool(singleVocab, !game.endless);
    const fallback = pool.length ? pool : singleVocab;
    const unseen = fallback.filter(e => !isWordLearned(e.word));
    const already = fallback.filter(e => isWordLearned(e.word));

    const orderGroup = list => {
      if (game.levelFilter === "ALL" && !game.endless) {
        const tiers = ["A1", "A2", "B1", "B2", "C1", "C2"];
        const buckets = tiers.map(lv => shuffle(list.filter(w => w.level === lv)));
        const mixed = [];
        const maxLen = Math.max(0, ...buckets.map(b => b.length));
        for (let i = 0; i < maxLen; i++) {
          for (const b of buckets) {
            if (b[i]) mixed.push(b[i]);
          }
        }
        return mixed;
      }
      return shuffle(list);
    };

    return [...orderGroup(unseen), ...orderGroup(already)];
  }

  function buildBossQueue(forMilestone = !game.endless) {
    const pool = getFilteredPool(collocVocab, forMilestone);
    const fallback = pool.length ? pool : collocVocab;
    const unseen = fallback.filter(c => !isWordLearned(c.word));
    const source = unseen.length >= 3 ? unseen : fallback;

    if (game.levelFilter === "ALL" || game.levelFilter === "AWL") {
      const tier1 = shuffle(source.filter(c => c.level === "B1" || c.level === "B2"));
      const tier2 = shuffle(source.filter(c => c.level === "B2" || c.level === "C1"));
      const tier3 = shuffle(source.filter(c => c.level === "C1" || c.level === "C2"));

      const used = new Set();
      const ordered = [];
      const pushUnique = list => {
        for (const item of list) {
          if (!used.has(item.word)) { used.add(item.word); ordered.push(item); return; }
        }
      };
      pushUnique(tier1);
      pushUnique(tier2);
      pushUnique(tier3);
      for (const item of shuffle(source)) {
        if (!used.has(item.word)) { used.add(item.word); ordered.push(item); }
      }
      return ordered;
    }

    return shuffle(source);
  }

  // --------------------------------------------------------------------------
  // Mode Switching (Hub <-> Space Shooter <-> Rain Spelling Review)
  // --------------------------------------------------------------------------
  function applyModeTheme() {
    const isRain = game.mode === "rain";
    el.arena.classList.toggle("rain-mode", isRain);
    el.brandIconShooter.classList.toggle("hidden", isRain);
    el.brandIconRain.classList.toggle("hidden", !isRain);

    if (isRain) {
      el.brandTitle.textContent = "Mưa Từ Vựng · Ôn Chính Tả";
      el.brandSubtitle.textContent = "Ôn lại các từ bạn đã học từ Luyện Gõ — gõ đúng chính tả để đánh dấu Đã thuộc";
    } else {
      el.brandTitle.textContent = "Luyện Gõ · Học Từ Mới IELTS";
      el.brandSubtitle.textContent = "10.000 từ Oxford / Cambridge / AWL (A1–C2) — bắn hạ để học nghĩa & đưa vào hàng chờ ôn";
    }
  }

  function openHub() {
    game.status = "hub";
    game.inBossPhase = false;
    clearArenaWords();
    closeAllModals();
    el.arena.classList.remove("boss-mode");
    el.bossHud.classList.add("hidden");
    el.startOverlay.classList.add("hidden");
    el.rainStartOverlay.classList.add("hidden");
    el.pauseOverlay.classList.add("hidden");
    el.resultOverlay.classList.add("hidden");
    el.hubOverlay.classList.remove("hidden");
    updateProgressBadges();
    syncPauseIcon();
    updateHUD();
  }

  function openGameSetup(mode) {
    game.mode = mode;
    game.status = "menu";
    game.inBossPhase = false;
    clearArenaWords();
    closeAllModals();
    applyModeTheme();

    el.arena.classList.remove("boss-mode");
    el.bossHud.classList.add("hidden");
    el.hubOverlay.classList.add("hidden");
    el.pauseOverlay.classList.add("hidden");
    el.resultOverlay.classList.add("hidden");

    if (mode === "rain") {
      el.startOverlay.classList.add("hidden");
      el.rainStartOverlay.classList.remove("hidden");
      syncRainSetupControls();
    } else {
      el.rainStartOverlay.classList.add("hidden");
      el.startOverlay.classList.remove("hidden");
      syncStartOverlayControls();
    }
    syncPauseIcon();
    updateHUD();
  }

  function syncRainSetupControls() {
    const counts = getLearningCounts();
    const hasAny = counts.totalLearned > 0;

    el.rainEmptyAlert.classList.toggle("hidden", hasAny);
    el.rainSetupBody.classList.toggle("hidden", !hasAny);

    const dueBtn = el.rainSourceGroup.querySelector('[data-source="due"]');
    const sessionBtn = el.rainSourceGroup.querySelector('[data-source="session"]');
    const allBtn = el.rainSourceGroup.querySelector('[data-source="all"]');

    if (dueBtn) {
      dueBtn.textContent = `⏳ Cần ôn ngay (${counts.due})`;
      dueBtn.disabled = counts.due === 0;
    }
    if (sessionBtn) {
      sessionBtn.textContent = `Vừa học phiên này (${sessionLearned.size})`;
      sessionBtn.disabled = sessionLearned.size === 0;
    }
    if (allBtn) {
      allBtn.textContent = `Tất cả đã học (${counts.totalLearned})`;
    }

    // Smart auto-fallback if selected bucket is currently empty
    if (game.rainSource === "due" && counts.due === 0 && hasAny) game.rainSource = "all";
    if (game.rainSource === "session" && sessionLearned.size === 0 && hasAny) {
      game.rainSource = counts.due > 0 ? "due" : "all";
    }

    el.rainSourceGroup.querySelectorAll(".chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.source === game.rainSource);
    });
    el.rainSpeedGroup.querySelectorAll(".chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.speed === game.speedKey);
    });
    el.rainKindSelect.value = game.rainKind;
    el.rainOptSpeak.checked = audio.autoSpeak;
    el.rainOptPos.checked = game.rainShowPos;

    const pool = getRainPool();
    el.rainPoolHint.textContent = `(${pool.length} từ sẵn sàng ôn · ${counts.mastered} đã thuộc)`;
    el.btnStartRain.disabled = pool.length === 0;
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

  function getShooterOriginPoint() {
    const arenaRect = el.arena.getBoundingClientRect();
    if (game.mode === "rain") {
      const boatRect = el.boatAnchor.getBoundingClientRect();
      const cx = boatRect.left - arenaRect.left + boatRect.width * 0.5;
      const cy = boatRect.top - arenaRect.top + 12;
      return { x: cx, y: cy, pivotX: cx, pivotY: cy + 28 };
    }
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
    if (game.mode === "rain") return;
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

  function triggerShooterRecoil() {
    if (game.mode === "rain") {
      el.paperBoat.classList.add("recoil");
      clearTimeout(triggerShooterRecoil._rt);
      triggerShooterRecoil._rt = setTimeout(() => el.paperBoat.classList.remove("recoil"), 110);
      return;
    }
    const rot = getActiveRotator();
    rot.classList.add("recoil");
    rot.style.transform = `rotate(${game.turretAngle.toFixed(1)}deg) translateY(5px) scale(0.97)`;
    clearTimeout(triggerShooterRecoil._t);
    triggerShooterRecoil._t = setTimeout(() => {
      rot.classList.remove("recoil");
      rot.style.transform = `rotate(${game.turretAngle.toFixed(1)}deg)`;
    }, 85);
  }

  // --------------------------------------------------------------------------
  // Canvas FX (Space Mode + Rain Mode + Weapons)
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
      initBackdrops();
    } else {
      fx.stars.forEach(s => { s.x = Math.random() * fx.width; s.y = Math.random() * fx.height; });
      fx.nebulae.forEach(n => { n.x = Math.random() * fx.width; n.y = Math.random() * fx.height; });
      fx.asteroids.forEach(a => { a.x = Math.random() * fx.width; a.y = Math.random() * fx.height; });
      fx.raindrops.forEach(r => { r.x = Math.random() * fx.width; r.y = Math.random() * fx.height; });
    }
  }

  function initBackdrops() {
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

    fx.nebulae = [
      { x: fx.width * 0.2, y: fx.height * 0.35, r: 290, vx: 6, vy: 3, color: "124, 58, 237", baseA: 0.14, phase: 0 },
      { x: fx.width * 0.78, y: fx.height * 0.48, r: 260, vx: -5, vy: 4, color: "14, 165, 233", baseA: 0.13, phase: 1.7 },
      { x: fx.width * 0.52, y: fx.height * 0.22, r: 240, vx: 4, vy: -3, color: "236, 72, 153", baseA: 0.10, phase: 3.1 },
      { x: fx.width * 0.36, y: fx.height * 0.78, r: 270, vx: -4, vy: -2, color: "99, 102, 241", baseA: 0.13, phase: 4.5 },
      { x: fx.width * 0.85, y: fx.height * 0.76, r: 210, vx: -6, vy: 2, color: "45, 212, 191", baseA: 0.09, phase: 2.3 }
    ];

    fx.asteroids = [];
    for (let i = 0; i < 6; i++) {
      const sides = 6 + Math.floor(Math.random() * 3);
      const pts = [];
      for (let k = 0; k < sides; k++) {
        pts.push({ ang: (Math.PI * 2 * k) / sides, rad: 0.72 + Math.random() * 0.32 });
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

    fx.raindrops = [];
    for (let i = 0; i < 85; i++) {
      fx.raindrops.push({
        x: Math.random() * fx.width,
        y: Math.random() * fx.height,
        len: 10 + Math.random() * 16,
        vy: 260 + Math.random() * 240,
        alpha: 0.12 + Math.random() * 0.25
      });
    }
  }

  function spawnMeteor() {
    const startX = fx.width * (0.15 + Math.random() * 0.85);
    const startY = -10 + Math.random() * (fx.height * 0.35);
    const angle = (128 + Math.random() * 28) * (Math.PI / 180);
    const speed = 520 + Math.random() * 360;
    const colors = ["#7dd3fc", "#fde68a", "#e9d5ff", "#ffffff"];
    fx.meteors.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 75 + Math.random() * 75,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0.55 + Math.random() * 0.45
    });
  }

  function fireAmmoAt(tx, ty, accentColor, isFinishingShot = false) {
    const muzzle = getShooterOriginPoint();

    if (game.mode === "rain") {
      fx.lasers.push({
        x1: muzzle.x, y1: muzzle.y, x2: tx, y2: ty,
        color: isFinishingShot ? "#fde047" : "#38bdf8",
        thick: isFinishingShot,
        life: isFinishingShot ? 0.22 : 0.14,
        maxLife: isFinishingShot ? 0.22 : 0.14
      });
      spawnImpactSparks(tx, ty, "#7dd3fc", isFinishingShot ? 10 : 5);
      return;
    }

    const ammo = game.ammoType;
    fx.muzzleFlashes.push({
      x: muzzle.x, y: muzzle.y,
      angle: (game.turretAngle * Math.PI) / 180,
      color: ammo === "plasma" ? "#e879f9" : ammo === "laser" ? accentColor : "#fde047",
      size: isFinishingShot ? 22 : 14,
      life: 0.09, maxLife: 0.09
    });

    if (ammo === "laser") {
      fx.lasers.push({
        x1: muzzle.x, y1: muzzle.y, x2: tx, y2: ty,
        color: accentColor, thick: isFinishingShot,
        life: isFinishingShot ? 0.24 : 0.15, maxLife: isFinishingShot ? 0.24 : 0.15
      });
      spawnImpactSparks(tx, ty, accentColor, isFinishingShot ? 10 : 5);
      return;
    }

    if (ammo === "bullet") {
      const ejectDir = Math.random() < 0.5 ? 1 : -1;
      fx.casings.push({
        x: muzzle.pivotX + ejectDir * 14, y: muzzle.pivotY - 4,
        vx: ejectDir * (70 + Math.random() * 65), vy: -(85 + Math.random() * 65),
        rot: Math.random() * Math.PI, vrot: ejectDir * (10 + Math.random() * 8), life: 0.65
      });

      const shots = game.weaponType === "gun" ? [-6, 6] : [0];
      shots.forEach(off => {
        const rad = (game.turretAngle * Math.PI) / 180;
        const sx = muzzle.x + Math.cos(rad) * off;
        const sy = muzzle.y + Math.sin(rad) * off;
        fx.projectiles.push({
          type: "bullet", x: sx, y: sy, sx, sy,
          tx: tx + (Math.random() - 0.5) * 12, ty: ty + (Math.random() - 0.5) * 8,
          t: 0, duration: 0.12, color: "#fde047", isFinal: isFinishingShot
        });
      });
      return;
    }

    if (ammo === "missile") {
      const curveSide = (Math.random() < 0.5 ? -1 : 1) * (55 + Math.random() * 65);
      fx.projectiles.push({
        type: "missile", x: muzzle.x, y: muzzle.y, sx: muzzle.x, sy: muzzle.y,
        cx: (muzzle.x + tx) / 2 + curveSide, cy: (muzzle.y + ty) / 2 + 25,
        tx, ty, t: 0, duration: 0.28, color: "#fb923c", isFinal: isFinishingShot
      });
      return;
    }

    if (ammo === "plasma") {
      fx.projectiles.push({
        type: "plasma", x: muzzle.x, y: muzzle.y, sx: muzzle.x, sy: muzzle.y,
        tx, ty, t: 0, duration: 0.19, color: "#c084fc", isFinal: isFinishingShot
      });
    }
  }

  function spawnImpactSparks(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 150;
      fx.particles.push({
        x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        r: 1.6 + Math.random() * 2.2,
        color: i % 2 === 0 ? "#fde047" : color,
        life: 0.22 + Math.random() * 0.18, maxLife: 0.4
      });
    }
  }

  function spawnExplosion(x, y, color, isBoss = false) {
    fx.rings.push({
      x, y, r: 14, maxR: isBoss ? 125 : 68,
      color: isBoss ? "#fbbf24" : color,
      life: isBoss ? 0.52 : 0.36, maxLife: isBoss ? 0.52 : 0.36
    });
    if (isBoss) {
      fx.rings.push({ x, y, r: 6, maxR: 92, color: "#f43f5e", life: 0.44, maxLife: 0.44 });
    }
    const count = isBoss ? 44 : 24;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const spd = (isBoss ? 105 : 70) + Math.random() * (isBoss ? 280 : 210);
      fx.particles.push({
        x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        r: (isBoss ? 2.8 : 2) + Math.random() * 3.4,
        color: i % 3 === 0 ? "#fde047" : i % 4 === 0 ? "#ffffff" : isBoss ? "#f43f5e" : color,
        life: 0.48 + Math.random() * (isBoss ? 0.55 : 0.35),
        maxLife: isBoss ? 1.03 : 0.83
      });
    }
  }

  function renderRainBackdrop(dt, nowSec) {
    ctx.save();
    ctx.lineCap = "round";
    for (const r of fx.raindrops) {
      r.y += r.vy * dt;
      if (r.y > fx.height - 34) {
        if (Math.random() < 0.25 && fx.ripples.length < 18) {
          fx.ripples.push({ x: r.x, y: fx.height - 32, r: 2, maxR: 16 + Math.random() * 14, life: 0.45, maxLife: 0.45 });
        }
        r.y = -r.len - Math.random() * 40;
        r.x = Math.random() * fx.width;
      }
      ctx.globalAlpha = r.alpha;
      ctx.strokeStyle = "#93c5fd";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x, r.y + r.len);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(125, 211, 252, 0.38)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const baseY = fx.height - 34;
    for (let x = 0; x <= fx.width; x += 24) {
      const wy = baseY + Math.sin(x * 0.018 + nowSec * 2.2) * 2.4;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();

    for (let i = fx.ripples.length - 1; i >= 0; i--) {
      const rp = fx.ripples[i];
      rp.life -= dt;
      if (rp.life <= 0) { fx.ripples.splice(i, 1); continue; }
      const p = 1 - rp.life / rp.maxLife;
      const rx = rp.r + (rp.maxR - rp.r) * p;
      ctx.globalAlpha = (1 - p) * 0.45;
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(rp.x, rp.y, rx, rx * 0.26, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderSpaceBackdrop(dt, nowSec) {
    for (const n of fx.nebulae) {
      n.x += n.vx * dt; n.y += n.vy * dt;
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
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(fx.width, y); ctx.stroke();
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

    for (const ast of fx.asteroids) {
      ast.x += ast.vx * dt; ast.y += ast.vy * dt; ast.rot += ast.vrot * dt;
      if (ast.y > fx.height + 30) { ast.y = -30; ast.x = Math.random() * fx.width; }
      if (ast.x < -30) ast.x = fx.width + 30;
      if (ast.x > fx.width + 30) ast.x = -30;
      ctx.save();
      ctx.translate(ast.x, ast.y); ctx.rotate(ast.rot);
      ctx.globalAlpha = ast.alpha; ctx.fillStyle = "#94a3b8"; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
      ctx.beginPath();
      ast.pts.forEach((pt, idx) => {
        const px = Math.cos(pt.ang) * ast.size * pt.rad;
        const py = Math.sin(pt.ang) * ast.size * pt.rad;
        if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }

    for (const s of fx.stars) {
      const speedMult = game.status === "playing" ? (game.inBossPhase ? 1.8 : 1.0) : 0.45;
      s.y += s.drift * speedMult * dt;
      if (s.y > fx.height) { s.y = -2; s.x = Math.random() * fx.width; }
      const tw = 0.52 + 0.48 * Math.sin(nowSec * s.speed + s.phase);
      ctx.globalAlpha = s.alpha * tw; ctx.fillStyle = s.hue;
      if (s.sparkle) {
        const len = s.r * 3.1;
        ctx.beginPath();
        ctx.moveTo(s.x - len, s.y); ctx.lineTo(s.x + len, s.y);
        ctx.moveTo(s.x, s.y - len); ctx.lineTo(s.x, s.y + len);
        ctx.strokeStyle = s.hue; ctx.lineWidth = 1.05; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    fx.meteorTimer -= dt;
    if (fx.meteorTimer <= 0) {
      spawnMeteor();
      fx.meteorTimer = 2.0 + Math.random() * 2.8;
    }
    for (let i = fx.meteors.length - 1; i >= 0; i--) {
      const m = fx.meteors[i];
      m.life -= dt; m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.life <= 0 || m.x < -120 || m.y > fx.height + 120) { fx.meteors.splice(i, 1); continue; }
      const mag = Math.hypot(m.vx, m.vy) || 1;
      const tailX = m.x - (m.vx / mag) * m.len;
      const tailY = m.y - (m.vy / mag) * m.len;
      ctx.save();
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, m.color); grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = Math.min(1, m.life * 2.2) * 0.85;
      ctx.strokeStyle = grad; ctx.lineWidth = 2.1; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tailX, tailY); ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function renderCanvas(dt, nowSec) {
    ctx.clearRect(0, 0, fx.width, fx.height);
    if (game.mode === "rain") renderRainBackdrop(dt, nowSec);
    else renderSpaceBackdrop(dt, nowSec);

    for (let i = fx.rings.length - 1; i >= 0; i--) {
      const ring = fx.rings[i];
      ring.life -= dt;
      if (ring.life <= 0) { fx.rings.splice(i, 1); continue; }
      const p = 1 - ring.life / ring.maxLife;
      const curR = ring.r + (ring.maxR - ring.r) * (1 - Math.pow(1 - p, 3));
      ctx.save();
      ctx.globalAlpha = (1 - p) * 0.78; ctx.strokeStyle = ring.color; ctx.lineWidth = 3.2 * (1 - p) + 0.8;
      ctx.beginPath(); ctx.arc(ring.x, ring.y, curR, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }

    for (let i = fx.lasers.length - 1; i >= 0; i--) {
      const l = fx.lasers[i];
      l.life -= dt;
      if (l.life <= 0) { fx.lasers.splice(i, 1); continue; }
      const alpha = l.life / l.maxLife;
      ctx.save(); ctx.lineCap = "round";
      ctx.globalAlpha = alpha * 0.58; ctx.strokeStyle = l.color; ctx.lineWidth = l.thick ? 11 : 6;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
      ctx.globalAlpha = alpha; ctx.strokeStyle = "#fef9c3"; ctx.lineWidth = l.thick ? 3.5 : 2;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
      ctx.restore();
    }

    for (let i = fx.projectiles.length - 1; i >= 0; i--) {
      const pr = fx.projectiles[i];
      const prevX = pr.x, prevY = pr.y;
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
        const inv = 1 - u;
        pr.x = inv * inv * pr.sx + 2 * inv * u * pr.cx + u * u * pr.tx;
        pr.y = inv * inv * pr.sy + 2 * inv * u * pr.cy + u * u * pr.ty;
        const ang = Math.atan2(pr.y - prevY, pr.x - prevX);
        fx.particles.push({
          x: pr.x - Math.cos(ang) * 8, y: pr.y - Math.sin(ang) * 8,
          vx: (Math.random() - 0.5) * 26, vy: (Math.random() - 0.5) * 26,
          r: 2.5 + Math.random() * 2.4,
          color: Math.random() < 0.45 ? "#fb923c" : "rgba(226, 232, 240, 0.75)",
          life: 0.24, maxLife: 0.24
        });
        ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(ang);
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-6, -4); ctx.lineTo(-9, 0); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(4, -2.8); ctx.lineTo(4, 2.8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(-9, 0, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (pr.type === "bullet") {
        pr.x = pr.sx + (pr.tx - pr.sx) * u; pr.y = pr.sy + (pr.ty - pr.sy) * u;
        const tailU = Math.max(0, u - 0.28);
        const tailX = pr.sx + (pr.tx - pr.sx) * tailU, tailY = pr.sy + (pr.ty - pr.sy) * tailU;
        ctx.save(); ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(251, 146, 60, 0.72)"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(pr.x, pr.y); ctx.stroke();
        ctx.strokeStyle = "#fef9c3"; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(pr.x, pr.y); ctx.stroke();
        ctx.restore();
      } else if (pr.type === "plasma") {
        pr.x = pr.sx + (pr.tx - pr.sx) * u; pr.y = pr.sy + (pr.ty - pr.sy) * u;
        const pulse = 8 + Math.sin(nowSec * 36) * 2.2;
        ctx.save();
        const grad = ctx.createRadialGradient(pr.x, pr.y, 1, pr.x, pr.y, pulse * 1.9);
        grad.addColorStop(0, "#ffffff"); grad.addColorStop(0.35, "#e879f9");
        grad.addColorStop(0.7, "rgba(56, 189, 248, 0.55)"); grad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(pr.x, pr.y, pulse * 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    for (let i = fx.casings.length - 1; i >= 0; i--) {
      const c = fx.casings[i];
      c.life -= dt;
      if (c.life <= 0) { fx.casings.splice(i, 1); continue; }
      c.vy += 420 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vrot * dt;
      ctx.save(); ctx.globalAlpha = Math.min(1, c.life * 2.5);
      ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.fillStyle = "#f59e0b";
      ctx.fillRect(-3.5, -1.6, 7, 3.2); ctx.restore();
    }

    for (let i = fx.muzzleFlashes.length - 1; i >= 0; i--) {
      const mf = fx.muzzleFlashes[i];
      mf.life -= dt;
      if (mf.life <= 0) { fx.muzzleFlashes.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = mf.life / mf.maxLife;
      ctx.translate(mf.x, mf.y); ctx.rotate(mf.angle);
      const grad = ctx.createRadialGradient(0, 0, 1, 0, -4, mf.size);
      grad.addColorStop(0, "#ffffff"); grad.addColorStop(0.45, mf.color); grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, -4, mf.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    for (let i = fx.particles.length - 1; i >= 0; i--) {
      const p = fx.particles[i];
      p.life -= dt;
      if (p.life <= 0) { fx.particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.4 + 0.6 * (p.life / p.maxLife)), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --------------------------------------------------------------------------
  // UI & HUD Rendering
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
    if (game.mode === "rain" || !game.inBossPhase) {
      el.bossHud.classList.add("hidden");
      el.arena.classList.remove("boss-mode");
      return;
    }

    el.bossHud.classList.remove("hidden");
    el.arena.classList.add("boss-mode");

    const curWave = Math.min(game.bossTotalWaves, game.bossWavesDefeated + 1);
    el.bossHudPhase.textContent = game.endless && game.bossOnly
      ? `👑 #${game.bossWavesDefeated + 1}`
      : `👑 ${curWave}/${game.bossTotalWaves}`;

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
      segHtml += `<div class="boss-hp-seg ${depleted ? "depleted" : ""}"><div class="boss-hp-seg-fill" style="width:${wPct.toFixed(1)}%"></div></div>`;
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

    const counts = getLearningCounts();

    if (game.mode === "rain") {
      const srcName = game.rainSource === "due"
        ? "Cần ôn ngay"
        : game.rainSource === "session"
          ? "Phiên vừa học"
          : game.rainSource === "recent20"
            ? "20 từ gần nhất"
            : "Tất cả đã học";
      el.milestoneLabel.textContent = "Mưa Chính Tả";
      el.milestoneTopic.textContent = srcName;
      el.milestoneProgressText.textContent = `${game.wordsDestroyed}/${game.milestoneGoal}`;
      el.milestoneProgressFill.style.width = `${Math.min(100, (game.wordsDestroyed / Math.max(1, game.milestoneGoal)) * 100)}%`;
      el.deckPillText.textContent = `Kho đã học: ${counts.totalLearned} từ · Đã thuộc: ${counts.mastered}`;
    } else {
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
        el.milestoneProgressFill.style.width = `${Math.min(100, (game.bossWavesDefeated / Math.max(1, game.bossTotalWaves)) * 100)}%`;
      } else {
        el.milestoneLabel.textContent = `Mốc ${topic.id}/20`;
        el.milestoneTopic.textContent = topic.name;
        if (game.inBossPhase) {
          el.milestoneProgressText.textContent = `👑 BOSS ${game.bossWavesDefeated}/${game.bossTotalWaves}`;
          el.milestoneProgressFill.style.width = "100%";
        } else {
          el.milestoneProgressText.textContent = `${game.regularDestroyed}/${game.milestoneGoal} + Boss`;
          el.milestoneProgressFill.style.width = `${Math.min(100, (game.regularDestroyed / Math.max(1, game.milestoneGoal)) * 100)}%`;
        }
      }

      const lvlLabel = game.levelFilter === "ALL" ? "A1–C2" : game.levelFilter === "AWL" ? "🎓 AWL IELTS" : `Level ${game.levelFilter}`;
      const wordCnt = getFilteredPool(singleVocab, false).length;
      el.deckPillText.textContent = `${wordCnt.toLocaleString("en-US")} từ IELTS · ${lvlLabel}`;
    }

    renderHearts();
    renderBossHud();
    el.arena.classList.toggle("hide-pill-levels", !game.showLevelOnPill);
  }

  function updatePoolHints() {
    const wAll = getFilteredPool(singleVocab, false).length;
    const wTopic = getFilteredPool(singleVocab, true).length;
    const cTopic = getFilteredPool(collocVocab, true).length;
    el.poolCountHint.textContent = game.endless
      ? `(${wAll.toLocaleString("en-US")} từ IELTS sẵn sàng)`
      : `(${wTopic} từ + ${cTopic} Boss trong mốc này · ${wAll.toLocaleString("en-US")} tổng)`;
  }

  function formatPhraseCharsHtml(text, typedCount) {
    const typed = text.slice(0, typedCount);
    const rest = text.slice(typedCount);
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
    return `<span class="typed">${escapeHtml(typed)}</span><span class="untyped">${restHtml}</span>`;
  }

  function formatRainMaskHtml(word, typedCount, revealedExtra = 0) {
    let html = "";
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (ch === " ") {
        const isNextSpace = i === typedCount;
        html += `<span class="rm-space${isNextSpace ? " next-space" : ""}">${isNextSpace ? "␣" : ""}</span>`;
        continue;
      }
      const isWordStart = i === 0 || word[i - 1] === " ";
      if (i < typedCount) {
        html += `<span class="rm-slot typed">${escapeHtml(ch)}</span>`;
      } else if (isWordStart || i < typedCount + revealedExtra) {
        html += `<span class="rm-slot hint">${escapeHtml(ch)}</span>`;
      } else {
        const isNext = i === typedCount && typedCount > 0;
        html += `<span class="rm-slot blank${isNext ? " next-blank" : ""}">_</span>`;
      }
    }
    return html;
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
    if (game.mode === "rain") {
      el.typingTyped.textContent = text.slice(0, w.typedCount);
      el.typingRemaining.textContent = text.slice(w.typedCount).replace(/[a-z]/g, "_").replace(/ /g, " ");
      el.typingHint.textContent = "Bấm ? mở gợi ý · ESC đổi từ";
    } else {
      el.typingTyped.textContent = text.slice(0, w.typedCount);
      el.typingRemaining.textContent = text.slice(w.typedCount).replace(/ /g, "␣");
      el.typingHint.textContent = "ESC đổi mục tiêu";
    }
    el.typingIndicator.classList.remove("hidden");
    highlightVirtualKey(game.mode === "rain" ? null : nextCh);
  }

  function triggerMascot(mode, text) {
    el.mascot.classList.remove("cheer", "shock");
    void el.mascot.offsetWidth;
    el.mascot.classList.add(mode);
    if (text) {
      el.mascotBubble.textContent = text;
      el.mascotBubble.classList.remove("hidden");
      clearTimeout(triggerMascot._bt);
      triggerMascot._bt = setTimeout(() => el.mascotBubble.classList.add("hidden"), 1600);
    }
  }

  // --------------------------------------------------------------------------
  // Compact Meaning Popup & Dock
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
    if (game.lastDockWord) game.recentMeanings = [game.lastDockWord];
    game.lastDockWord = { entry, missed };

    el.meaningHistory.innerHTML = game.recentMeanings
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
      ? (game.mode === "rain" ? "✕ ĐÁP ÁN · CẦN ÔN LẠI" : "✕ BỎ LỠ · GHI NHỚ")
      : game.mode === "rain"
        ? "✅ ĐÃ THUỘC CHÍNH TẢ"
        : entry.isColloc
          ? "👑 ĐÃ LƯU SANG MƯA TỪ VỰNG"
          : "✓ ĐÃ HỌC · THÊM VÀO CHỜ ÔN";
    el.mcLevel.textContent = entry.level;
    el.mcLevel.className = `cefr-tag ${entry.level}`;
    el.mcWord.textContent = entry.word;
    el.mcIpa.textContent = entry.ipa || (entry.isColloc ? "Collocation" : "");
    el.mcPos.textContent = entry.posShort;
    el.mcPos.className = `pos-pill pos-${entry.pos}`;
    el.mcMeaning.textContent = entry.meaning;
  }

  // --------------------------------------------------------------------------
  // Spawning: Space Words, Boss Collocations, & Rain Cards
  // --------------------------------------------------------------------------
  function pickNextWordEntry() {
    const activeSet = new Set(game.activeWords.map(w => w.entry.word));
    const activeFirstLetters = new Set(game.activeWords.map(w => w.entry.word[0]));

    if (game.wordQueue.length === 0) {
      game.wordQueue = buildQueueForRun();
    }

    let idx = game.wordQueue.findIndex(e => !activeSet.has(e.word) && !activeFirstLetters.has(e.word[0]));
    if (idx === -1) idx = game.wordQueue.findIndex(e => !activeSet.has(e.word));
    if (idx === -1) return null;

    const [entry] = game.wordQueue.splice(idx, 1);
    return entry;
  }

  function pickNonOverlappingX(pillW) {
    const minX = 24;
    const maxX = Math.max(minX + 40, fx.width - pillW - 76);
    let chosenX = minX + Math.random() * (maxX - minX);
    let bestClearance = -1;
    for (let attempt = 0; attempt < 12; attempt++) {
      const candX = minX + Math.random() * (maxX - minX);
      let minDist = Infinity;
      for (const other of game.activeWords) {
        if (other.y < 165) {
          const dist = Math.abs(candX + pillW / 2 - (other.x + other.w / 2)) - (pillW + other.w) / 2;
          if (dist < minDist) minDist = dist;
        }
      }
      if (minDist > 26) return candX;
      if (minDist > bestClearance) { bestClearance = minDist; chosenX = candX; }
    }
    return chosenX;
  }

  function spawnWord() {
    if (game.inBossPhase) return;
    const preset = SPEED_PRESETS[game.speedKey] || SPEED_PRESETS.chill;
    const maxCap = game.mode === "rain" ? Math.min(3, preset.maxActive) : preset.maxActive;
    if (game.activeWords.length >= maxCap) return;

    if (game.mode === "rain") {
      if (game.wordsDestroyed + game.activeWords.length >= game.milestoneGoal) return;
    } else if (!game.endless && game.regularDestroyed + game.activeWords.length >= game.milestoneGoal) {
      return;
    }

    const entry = pickNextWordEntry();
    if (!entry) return;

    const node = document.createElement("div");
    let charsEl;

    if (game.mode === "rain") {
      node.className = "word-pill rain-card";
      const posBadge = game.rainShowPos
        ? `<span class="rain-pos-mini">${escapeHtml(entry.isColloc ? entry.pattern : entry.pos)}</span>`
        : "";
      node.innerHTML = `
        <div class="rain-meaning-row">
          <span>${escapeHtml(entry.meaning)}</span>
          ${posBadge}
        </div>
        <div class="rain-mask">${formatRainMaskHtml(entry.word, 0, 0)}</div>
      `;
      charsEl = node.querySelector(".rain-mask");
    } else {
      node.className = `word-pill lvl-${entry.level}`;
      node.innerHTML = `
        <span class="word-chars">${formatPhraseCharsHtml(entry.word, 0)}</span>
        <span class="pill-cefr">${entry.level}</span>
      `;
      charsEl = node.querySelector(".word-chars");
    }

    node.style.visibility = "hidden";
    el.wordsLayer.appendChild(node);

    const pillW = node.offsetWidth || 160;
    const pillH = node.offsetHeight || 54;
    const chosenX = pickNonOverlappingX(pillW);

    let speed;
    if (game.mode === "rain") {
      const lengthRelief = Math.max(0.68, Math.min(1.0, 9 / Math.max(6, entry.word.length)));
      speed = preset.rainSpeed * lengthRelief * (0.94 + Math.random() * 0.12);
    } else {
      const progressFactor = Math.min(1, game.wordsDestroyed / 35);
      const rawSpeed = preset.baseSpeed + (preset.maxSpeed - preset.baseSpeed) * progressFactor;
      const lengthRelief = entry.word.length > 9 ? 0.84 : entry.word.length > 7 ? 0.92 : 1.0;
      speed = rawSpeed * lengthRelief * (0.92 + Math.random() * 0.16);
    }

    const wordObj = {
      id: ++game.wordUid,
      entry,
      isBoss: false,
      el: node,
      charsEl,
      hpFillEl: null,
      x: chosenX,
      y: -pillH - 4,
      w: pillW,
      h: pillH,
      speed,
      typedCount: 0,
      hintExtra: 0,
      usedHint: false
    };

    node.style.transform = `translate3d(${wordObj.x}px, ${wordObj.y}px, 0)`;
    node.style.visibility = "visible";
    game.activeWords.push(wordObj);
  }

  function triggerBossPhase(wavesCount) {
    game.inBossPhase = true;
    game.bossTotalWaves = wavesCount;
    game.bossWavesDefeated = 0;
    if (!game.bossQueue.length) game.bossQueue = buildBossQueue(!game.endless);
    updateHUD();
    setTimeout(() => {
      if (game.status === "playing" && game.inBossPhase && !game.activeWords.some(w => w.isBoss)) {
        spawnNextBossWave();
      }
    }, 520);
  }

  function spawnNextBossWave() {
    if (!game.inBossPhase || game.status !== "playing") return;
    if (!game.bossQueue.length) game.bossQueue = buildBossQueue(!game.endless);
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
      y: -pillH - 4,
      w: pillW,
      h: pillH,
      speed,
      typedCount: 0,
      hintExtra: 0,
      usedHint: false
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
  // Typing Mechanics, Hint & Scoring
  // --------------------------------------------------------------------------
  function renderTargetDisplay(target) {
    if (game.mode === "rain") {
      target.charsEl.innerHTML = formatRainMaskHtml(target.entry.word, target.typedCount, target.hintExtra);
    } else {
      target.charsEl.innerHTML = formatPhraseCharsHtml(target.entry.word, target.typedCount);
    }
  }

  function revealRainHint() {
    if (game.mode !== "rain" || game.status !== "playing") return;
    const target = game.lockedWord || game.activeWords.slice().sort((a, b) => b.y - a.y)[0];
    if (!target) return;
    if (!game.lockedWord) {
      game.lockedWord = target;
      target.el.classList.add("locked");
    }
    target.usedHint = true;
    target.hintExtra = Math.min(target.entry.word.length - target.typedCount, target.hintExtra + 1);
    game.combo = 0;
    renderTargetDisplay(target);
    updateTypingIndicator();
    updateHUD();
  }

  function handleCharInput(char) {
    if (game.status !== "playing") return;
    const ch = char.toLowerCase();
    if (!/^[a-z ]$/.test(ch)) return;

    audio.unlock();
    flashVirtualKey(ch);

    if (!game.lockedWord) {
      if (ch === " ") return;
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

    const target = game.lockedWord;
    const expected = target.entry.word[target.typedCount];

    if (ch === expected) {
      game.correctChars++;
      target.typedCount++;
      if (target.hintExtra > 0) target.hintExtra--;
      renderTargetDisplay(target);

      if (target.isBoss && target.hpFillEl) {
        const remPct = ((target.entry.word.length - target.typedCount) / target.entry.word.length) * 100;
        target.hpFillEl.style.width = `${Math.max(0, remPct).toFixed(1)}%`;
        renderBossHud();
      }

      target.y = Math.max(target.isBoss ? 56 : 8, target.y - (target.isBoss ? 3.5 : 5));
      const cx = target.x + target.w / 2;
      const cy = target.y + target.h / 2;
      aimTurretAt(cx, cy);
      triggerShooterRecoil();

      const color = game.mode === "rain"
        ? "#38bdf8"
        : target.isBoss ? "#fbbf24" : (LEVEL_COLORS[target.entry.level] || "#38bdf8");
      const isFinal = target.typedCount >= target.entry.word.length;
      fireAmmoAt(cx, cy, color, isFinal);

      if (isFinal) {
        destroyWord(target, cx, cy, color);
      } else {
        audio.playShot(game.mode === "rain" ? "water" : game.ammoType, target.typedCount);
        updateTypingIndicator();
      }
    } else {
      game.wrongChars++;
      game.combo = 0;
      audio.playError();
      target.el.classList.remove("wrong-hit");
      void target.el.offsetWidth;
      target.el.classList.add("wrong-hit");
      if (target.isBoss) target.y += 10;
      updateHUD();
    }
  }

  function handleBackspace() {
    if (game.status !== "playing" || !game.lockedWord) return;
    const target = game.lockedWord;
    if (target.typedCount > 0) {
      target.typedCount--;
      renderTargetDisplay(target);
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
    renderTargetDisplay(t);
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
    const usedHint = Boolean(target.usedHint);
    removeWordObj(target);

    game.wordsDestroyed++;
    if (!wasBoss) game.regularDestroyed++;

    game.combo++;
    if (game.combo > game.bestCombo) game.bestCombo = game.combo;

    const base = (wasBoss ? 320 : game.mode === "rain" ? 150 : 100) + entry.word.length * 10 + (LEVEL_BONUS[entry.level] || 0);
    const mult = 1 + Math.min(game.combo - 1, 10) * 0.12;
    game.score += Math.round(base * mult);
    if (game.score > progress.highScore) progress.highScore = game.score;

    if (game.mode === "rain") {
      recordRainReviewSuccess(entry.word, usedHint);
    } else {
      recordLearnedFromShooter(entry.word);
    }

    game.sessionLog.unshift({ entry, status: "hit" });

    spawnExplosion(cx, cy, color, wasBoss);
    audio.playExplosion(game.combo, wasBoss);
    audio.speakWord(entry.word, false, 120);

    showMeaningPopup(entry, cx, cy, false);
    updateMeaningDock(entry, false);

    if (game.mode === "rain") {
      if (game.combo > 0 && game.combo % 3 === 0) {
        triggerMascot("cheer", `Nhớ chuẩn x${game.combo}! ⛵`);
      }
      updateHUD();
      if (game.wordsDestroyed >= game.milestoneGoal) {
        audio.playMilestoneWin();
        setTimeout(() => { if (game.status === "playing") finishRun(true); }, 700);
      } else if (game.activeWords.length === 0) {
        game.spawnTimer = Math.min(game.spawnTimer, 0.35);
      }
      return;
    }

    if (wasBoss) {
      game.bossWavesDefeated++;
      triggerMascot("cheer", `Hạ Boss ${game.bossWavesDefeated}/${game.bossTotalWaves}! 👑`);
      updateHUD();

      if (game.endless && game.bossOnly) {
        setTimeout(() => { if (game.status === "playing") spawnNextBossWave(); }, 700);
        return;
      }

      if (game.bossWavesDefeated >= game.bossTotalWaves) {
        game.score += 500;
        if (game.score > progress.highScore) progress.highScore = game.score;
        spawnExplosion(fx.width * 0.35, fx.height * 0.38, "#fbbf24", true);
        spawnExplosion(fx.width * 0.65, fx.height * 0.35, "#38bdf8", true);
        audio.playBossDefeat();

        if (game.endless) {
          game.inBossPhase = false;
          game.nextEndlessBossAt = game.regularDestroyed + 10;
          triggerMascot("cheer", "+500 ĐIỂM HẠ BOSS! 🔥");
          updateHUD();
          game.spawnTimer = 1.1;
        } else {
          progress.clearedMilestones.add(game.milestoneId);
          saveProgress();
          updateHUD();
          setTimeout(() => { if (game.status === "playing") finishRun(true); }, 950);
        }
      } else {
        setTimeout(() => { if (game.status === "playing" && game.inBossPhase) spawnNextBossWave(); }, 780);
      }
      return;
    }

    if (game.combo > 0 && game.combo % 4 === 0) {
      triggerMascot("cheer", `Combo x${game.combo}! 🔥`);
    } else if (entry.level === "C2") {
      triggerMascot("cheer", "Hạ gục từ C2! ⚡");
    } else if (game.wordsDestroyed % 5 === 0) {
      triggerMascot("cheer", CHEER_MESSAGES[game.wordsDestroyed % CHEER_MESSAGES.length]);
    }

    updateHUD();

    if (!game.endless && game.regularDestroyed >= game.milestoneGoal) {
      triggerBossPhase(BOSS_PHASES_PER_MILESTONE);
      return;
    }
    if (game.endless && !game.bossOnly && game.regularDestroyed >= game.nextEndlessBossAt) {
      triggerBossPhase(1);
      return;
    }
    if (game.activeWords.length === 0) {
      game.spawnTimer = Math.min(game.spawnTimer, 0.35);
    }
  }

  function handleWordMissed(wordObj) {
    if (game.mode === "shooter" && !game.endless && game.inBossPhase && game.bossWavesDefeated >= game.bossTotalWaves) {
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

    if (game.mode === "rain") {
      recordRainReviewMiss(entry.word);
    } else if (!isWordLearned(entry.word)) {
      progress.missed.add(entry.word);
      saveProgress();
    }
    game.sessionLog.unshift({ entry, status: "missed" });

    showMeaningPopup(entry, cx, cy, true);
    updateMeaningDock(entry, true);

    if (game.mode === "rain") {
      audio.playWaterSplash();
      audio.speakWord(entry.word, false, 180);
      fx.ripples.push({ x: cx, y: fx.height - 32, r: 6, maxR: 48, life: 0.6, maxLife: 0.6 });
      el.oceanSurface.classList.add("hit");
      setTimeout(() => el.oceanSurface.classList.remove("hit"), 260);
    } else {
      audio.playDamage();
      el.dangerLine.classList.add("hit");
      setTimeout(() => el.dangerLine.classList.remove("hit"), 260);
    }

    el.arena.classList.remove("shake");
    void el.arena.offsetWidth;
    el.arena.classList.add("shake");
    triggerMascot("shock", game.mode === "rain" ? `Đáp án: ${entry.word}` : wasBoss ? "Boss phá lá chắn rồi!" : "Ôi! Trượt mất rồi!");

    updateHUD();

    if (game.lives <= 0) {
      setTimeout(() => { if (game.status === "playing") finishRun(false); }, 450);
      return;
    }

    if (game.mode === "rain" && game.wordsDestroyed + game.activeWords.length < game.milestoneGoal) {
      game.wordQueue.push(entry);
    }
    if (wasBoss && game.inBossPhase) {
      setTimeout(() => { if (game.status === "playing" && game.inBossPhase && game.activeWords.length === 0) spawnNextBossWave(); }, 850);
    }
  }

  // --------------------------------------------------------------------------
  // Game Lifecycle
  // --------------------------------------------------------------------------
  function startRun() {
    audio.unlock();
    clearArenaWords();
    closeAllModals();
    applyModeTheme();

    if (game.mode === "rain") {
      const rainPool = getRainPool();
      if (!rainPool.length) {
        openGameSetup("rain");
        return;
      }
      game.maxLives = 4;
      game.milestoneGoal = Math.min(20, rainPool.length);
    } else {
      game.maxLives = 3;
      const poolSize = getFilteredPool(singleVocab, true).length;
      game.milestoneGoal = game.endless ? 9999 : Math.min(12, Math.max(8, poolSize));
    }

    game.status = "playing";
    game.score = 0;
    game.lives = game.maxLives;
    game.combo = 0;
    game.bestCombo = 0;
    game.correctChars = 0;
    game.wrongChars = 0;
    game.wordsDestroyed = 0;
    game.regularDestroyed = 0;
    game.rainMasteredThisRun = 0;

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
    game.bossQueue = game.mode === "shooter" ? buildBossQueue(!game.endless) : [];

    el.hubOverlay.classList.add("hidden");
    el.startOverlay.classList.add("hidden");
    el.rainStartOverlay.classList.add("hidden");
    el.pauseOverlay.classList.add("hidden");
    el.resultOverlay.classList.add("hidden");
    syncPauseIcon();
    updateHUD();

    if (game.mode === "shooter" && game.bossOnly) {
      triggerBossPhase(game.endless ? 999 : BOSS_ONLY_GOAL);
    } else {
      spawnWord();
      setTimeout(() => {
        if (game.status === "playing" && !game.inBossPhase && game.activeWords.length < 2) {
          spawnWord();
        }
      }, game.mode === "rain" ? 1100 : 650);
    }
  }

  function pauseGame() {
    if (game.status !== "playing") return;
    game.status = "paused";
    if (game.mode === "rain") {
      el.pauseSubtitle.textContent = `Mưa Từ Vựng · Đã nhớ ${game.wordsDestroyed}/${game.milestoneGoal} từ`;
    } else {
      const topic = topicMap.get(game.milestoneId) || topics[0];
      el.pauseSubtitle.textContent = game.inBossPhase
        ? `👑 Đang đấu Boss Collocation · ${topic.name}`
        : game.endless
          ? `Chế độ Vô tận · Đã học ${game.wordsDestroyed} từ`
          : `Mốc ${topic.id}/20 · ${topic.name} (${game.regularDestroyed}/${game.milestoneGoal} từ + Boss)`;
    }
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

  function finishRun(victory) {
    game.status = "result";
    game.inBossPhase = false;
    clearArenaWords();
    el.arena.classList.remove("boss-mode");
    el.bossHud.classList.add("hidden");
    syncPauseIcon();

    const totalTyped = game.correctChars + game.wrongChars;
    const accuracy = totalTyped > 0 ? Math.round((game.correctChars / totalTyped) * 100) : 100;
    const counts = getLearningCounts();

    if (game.mode === "rain") {
      el.btnNextMilestone.classList.add("hidden");
      el.btnPracticeRainNow.classList.add("hidden");
      el.btnBackLearnMore.classList.remove("hidden");
      if (victory) {
        el.resultEmoji.textContent = "⛵";
        el.resultTitle.textContent = `Hoàn thành ôn chính tả · Đã thuộc +${game.rainMasteredThisRun} từ!`;
        el.resultSubtitle.textContent = `Còn ${counts.due} từ chờ ôn · Tổng đã thuộc: ${counts.mastered}/${counts.totalLearned} từ`;
      } else {
        audio.playGameOver();
        el.resultEmoji.textContent = "🌧️";
        el.resultTitle.textContent = "Kết thúc lượt ôn tập!";
        el.resultSubtitle.textContent = `Đã thuộc thêm ${game.rainMasteredThisRun} từ · Các từ quên sẽ được giữ lại để ôn tiếp`;
      }
    } else {
      const topic = topicMap.get(game.milestoneId) || topics[0];
      el.btnBackLearnMore.classList.add("hidden");
      el.btnPracticeRainNow.classList.toggle("hidden", counts.totalLearned === 0);
      el.btnPracticeRainNow.textContent = counts.due > 0
        ? `🌧️ Ôn chính tả ngay (${counts.due} từ chờ ôn)`
        : `🌧️ Ôn chính tả (${counts.totalLearned} từ đã học)`;

      if (victory) {
        el.resultEmoji.textContent = "👑";
        el.resultTitle.textContent = `Tiêu diệt Boss · Vượt Mốc ${topic.id}/20!`;
        el.resultSubtitle.textContent = `${game.wordsDestroyed} từ mới đã lưu vào hàng chờ ôn Mưa Từ Vựng (+500 điểm Boss)`;
        el.btnNextMilestone.classList.toggle("hidden", game.milestoneId >= topics.length);
      } else {
        audio.playGameOver();
        el.resultEmoji.textContent = "💥";
        el.resultTitle.textContent = game.endless ? "Kết thúc lượt học!" : "Lá chắn phòng thủ đã vỡ!";
        el.resultSubtitle.textContent = `Bạn đã học được ${game.wordsDestroyed} từ mới — chuyển qua Mưa Từ Vựng để ôn lại ngay nhé!`;
        el.btnNextMilestone.classList.add("hidden");
      }
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
              ${item.entry.isAwl ? `<span class="awl-tag">AWL</span>` : ""}
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

  function gameLoop(ts) {
    if (!game.lastFrameTs) game.lastFrameTs = ts;
    const dt = Math.min(0.05, (ts - game.lastFrameTs) / 1000);
    game.lastFrameTs = ts;
    const nowSec = ts / 1000;

    if (game.status === "playing") {
      game.elapsed += dt;
      if (!game.inBossPhase) {
        const preset = SPEED_PRESETS[game.speedKey] || SPEED_PRESETS.chill;
        const rainPad = game.mode === "rain" ? 0.65 : 0;
        const dynInterval = Math.max(
          preset.minSpawn + rainPad,
          preset.spawnInterval + rainPad - Math.min(0.55, game.wordsDestroyed * 0.015)
        );
        game.spawnTimer -= dt;
        if (game.spawnTimer <= 0) {
          spawnWord();
          game.spawnTimer = dynInterval;
        }
      }

      const dangerY = fx.height - 34;
      for (let i = game.activeWords.length - 1; i >= 0; i--) {
        const w = game.activeWords[i];
        w.y += w.speed * dt;
        w.el.style.transform = `translate3d(${w.x}px, ${w.y}px, 0)`;
        if (w.y + w.h >= dangerY) handleWordMissed(w);
      }

      if (game.lockedWord && game.mode === "shooter") {
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
  // Virtual Keyboard
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
  // Modals: Milestones & Vocabulary Notebook + Progress Backup
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
    if (game.mode === "rain") {
      openNotebookModal("LEARNED");
      return;
    }
    if (game.status === "playing") pauseGame();
    renderMilestonesGrid();
    el.milestonesModal.classList.remove("hidden");
  }

  function renderMilestonesGrid() {
    el.milestonesGrid.innerHTML = topics
      .map(t => {
        const wInTopic = singleVocab.filter(w => w.topicId === t.id && matchesLevelFilter(w));
        const cInTopic = collocVocab.filter(c => c.topicId === t.id && matchesLevelFilter(c));
        const learnedInTopic = [...wInTopic, ...cInTopic].filter(w => isWordLearned(w.word)).length;
        const cleared = progress.clearedMilestones.has(t.id);
        const current = !game.endless && game.milestoneId === t.id;

        return `
          <button class="ms-card ${current ? "current" : ""} ${cleared ? "cleared" : ""}" data-milestone="${t.id}">
            <div class="ms-card-top">
              <span>${t.icon} Mốc ${t.id}/20</span>
              ${cleared ? `<span class="ms-cleared-badge">👑 Đã diệt Boss</span>` : `<span>${learnedInTopic}/${wInTopic.length + cInTopic.length}</span>`}
            </div>
            <div class="ms-card-title">${t.name}</div>
            <div class="ms-card-sub">${wInTopic.length} từ IELTS + ${cInTopic.length} Boss</div>
          </button>`;
      })
      .join("");
  }

  function openNotebookModal(presetStatus = null) {
    if (game.status === "playing") pauseGame();
    if (presetStatus) el.nbStatus.value = presetStatus;
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
    const counts = getLearningCounts();

    el.nbSummaryText.textContent = `${singleVocab.length.toLocaleString("en-US")} từ IELTS (A1–C2) + ${collocVocab.length} Boss · ${counts.due} chờ ôn · ${counts.mastered} đã thuộc`;

    notebookState.filtered = allLibrary.filter(item => {
      if (kind === "WORD" && item.isColloc) return false;
      if (kind === "AWL" && !item.isAwl) return false;
      if (kind === "COLLOC" && !item.isColloc) return false;
      if (lvl !== "ALL" && item.level !== lvl) return false;
      if (topicVal !== "ALL" && item.topicId !== Number(topicVal)) return false;

      if (statusVal === "DUE" && !isWordDueForReview(item.word)) return false;
      if (statusVal === "MASTERED" && !isWordMasteredSpelling(item.word)) return false;
      if (statusVal === "LEARNED" && !isWordLearned(item.word)) return false;
      if (statusVal === "MISSED" && !progress.missed.has(item.word)) return false;
      if (statusVal === "UNSEEN" && (isWordLearned(item.word) || progress.missed.has(item.word))) return false;

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
          const mastered = isWordMasteredSpelling(item.word);
          const due = isWordDueForReview(item.word);
          const missed = progress.missed.has(item.word);
          let stClass = "unseen", stText = "Chưa học";
          if (mastered && !due) { stClass = "mastered"; stText = "✅ Đã thuộc"; }
          else if (due) { stClass = "due"; stText = "⏳ Chờ ôn"; }
          else if (missed) { stClass = "missed"; stText = "✕ Cần ôn lại"; }

          return `
            <tr>
              <td>
                <div class="nb-word-cell">
                  <button class="speak-mini-btn" data-speak="${escapeHtml(item.word)}" title="Nghe phát âm">🔊</button>
                  <div>
                    <div class="nb-word-main">
                      ${item.isColloc ? `<span class="boss-tag-badge" style="margin-right:5px;">👑 BOSS</span>` : ""}
                      ${escapeHtml(item.word)}
                      ${item.isAwl ? `<span class="awl-tag">AWL</span>` : ""}
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
            if (parts.length === 2) parsedRows.push([word, word.includes(" ") ? "colloc" : "n", "B2", "", parts[1].trim(), game.milestoneId]);
            else if (parts.length === 3) parsedRows.push([word, parts[1].trim(), "B2", "", parts[2].trim(), game.milestoneId]);
            else if (parts.length === 4) parsedRows.push([word, parts[1].trim(), parts[2].trim(), "", parts[3].trim(), game.milestoneId]);
            else parsedRows.push([word, parts[1].trim(), parts[2].trim(), parts[3].trim(), parts.slice(4).join(",").trim(), game.milestoneId]);
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
        valid.push([n.word, n.isColloc ? (n.pattern || "colloc") : n.pos, n.level, n.ipa, n.meaning, n.topicId, 0]);
      }
    }

    if (!valid.length) {
      el.importFeedback.textContent = "⚠️ Không tìm thấy mục hợp lệ.";
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
    el.importFeedback.textContent = `✅ Đã nhập ${valid.length} mục mới! Tổng kho hiện có ${allLibrary.length.toLocaleString("en-US")} mục.`;
  }

  // --------------------------------------------------------------------------
  // Sync Controls & Event Listeners
  // --------------------------------------------------------------------------
  function setLevelFilter(level) {
    game.levelFilter = level;
    savePrefs();

    el.quickLevelBar.querySelectorAll(".lvl-pill").forEach(btn => btn.classList.toggle("active", btn.dataset.level === level));
    el.startLevelGroup.querySelectorAll(".chip").forEach(btn => btn.classList.toggle("active", btn.dataset.level === level));

    updatePoolHints();
    if (game.mode === "rain" && game.status === "menu") syncRainSetupControls();
    updateHUD();

    if (game.status === "playing") {
      game.wordQueue = buildQueueForRun();
      if (game.mode === "shooter") game.bossQueue = buildBossQueue(!game.endless);
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
    window.addEventListener("pointerdown", () => audio.unlock(), { once: true });

    window.addEventListener("keydown", e => {
      audio.unlock();
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

      if (e.key === "Backspace") { e.preventDefault(); handleBackspace(); return; }
      if (e.key === "Tab") { e.preventDefault(); unlockTarget(); return; }
      if (game.mode === "rain" && (e.key === "?" || e.key === "/")) { e.preventDefault(); revealRainHint(); return; }
      if (e.key === " ") { e.preventDefault(); handleCharInput(" "); return; }
      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); handleCharInput(e.key); }
    });

    el.mobileInput.addEventListener("input", () => {
      const val = el.mobileInput.value;
      el.mobileInput.value = "";
      for (const ch of val) {
        if (/^[a-zA-Z ]$/.test(ch)) handleCharInput(ch);
      }
    });

    // Hub & Quick 2-Game Link Bridge
    el.chooseGameShooter.addEventListener("click", () => { audio.unlock(); openGameSetup("shooter"); });
    el.chooseGameRain.addEventListener("click", () => { audio.unlock(); openGameSetup("rain"); });
    el.btnBackHub1.addEventListener("click", openHub);
    el.btnBackHub2.addEventListener("click", openHub);
    el.btnPauseHub.addEventListener("click", openHub);
    el.btnHome.addEventListener("click", openHub);
    el.btnGotoShooterEmpty.addEventListener("click", () => openGameSetup("shooter"));

    // Top bar quick jump to Mưa Từ Vựng review queue!
    el.btnQuickRain.addEventListener("click", () => {
      el.btnQuickRain.blur();
      audio.unlock();
      const c = getLearningCounts();
      game.rainSource = c.due > 0 ? "due" : "all";
      savePrefs();
      openGameSetup("rain");
    });

    [el.btnTestVoice1, el.btnTestVoice2].forEach(btn => {
      btn.addEventListener("click", () => {
        btn.blur();
        audio.unlock();
        audio.speakWord("pronunciation", true, 0);
      });
    });

    el.btnExit.addEventListener("click", () => openGameSetup(game.mode));
    el.deckPill.addEventListener("click", openMilestonesModal);
    el.btnMilestones.addEventListener("click", openMilestonesModal);
    el.btnNotebook.addEventListener("click", () => openNotebookModal());
    el.btnOpenNotebookStart.addEventListener("click", () => openNotebookModal());
    el.btnOpenNotebookRain.addEventListener("click", () => openNotebookModal("LEARNED"));
    el.btnPauseNotebook.addEventListener("click", () => openNotebookModal());

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
      audio.unlock();
      if (game.lastDockWord) audio.speakWord(game.lastDockWord.entry.word, true, 0);
    });

    el.startWeaponGroup.addEventListener("click", e => { const btn = e.target.closest(".chip"); if (btn) setWeaponType(btn.dataset.weapon); });
    el.startAmmoGroup.addEventListener("click", e => { const btn = e.target.closest(".chip"); if (btn) setAmmoType(btn.dataset.ammo); });
    el.quickLevelBar.addEventListener("click", e => { const btn = e.target.closest(".lvl-pill"); if (!btn) return; btn.blur(); setLevelFilter(btn.dataset.level); });
    el.startLevelGroup.addEventListener("click", e => { const btn = e.target.closest(".chip"); if (btn) setLevelFilter(btn.dataset.level); });
    el.speedGroup.addEventListener("click", e => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      game.speedKey = btn.dataset.speed;
      el.speedGroup.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === btn));
      savePrefs();
    });

    el.selectMilestone.addEventListener("change", () => { game.milestoneId = Number(el.selectMilestone.value); savePrefs(); updatePoolHints(); updateHUD(); });
    el.optSpeak.addEventListener("change", () => { audio.autoSpeak = el.optSpeak.checked; el.rainOptSpeak.checked = audio.autoSpeak; savePrefs(); });
    el.optShowLevel.addEventListener("change", () => { game.showLevelOnPill = el.optShowLevel.checked; savePrefs(); updateHUD(); });
    el.optBossOnly.addEventListener("change", () => { game.bossOnly = el.optBossOnly.checked; savePrefs(); updatePoolHints(); updateHUD(); });
    el.optEndless.addEventListener("change", () => { game.endless = el.optEndless.checked; el.selectMilestone.disabled = game.endless; savePrefs(); updatePoolHints(); updateHUD(); });
    el.btnStartGame.addEventListener("click", () => { game.mode = "shooter"; startRun(); });

    el.rainSourceGroup.addEventListener("click", e => {
      const btn = e.target.closest(".chip");
      if (!btn || btn.disabled) return;
      game.rainSource = btn.dataset.source;
      savePrefs();
      syncRainSetupControls();
    });
    el.rainKindSelect.addEventListener("change", () => { game.rainKind = el.rainKindSelect.value; savePrefs(); syncRainSetupControls(); });
    el.rainSpeedGroup.addEventListener("click", e => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      game.speedKey = btn.dataset.speed;
      el.rainSpeedGroup.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === btn));
      savePrefs();
    });
    el.rainOptSpeak.addEventListener("change", () => { audio.autoSpeak = el.rainOptSpeak.checked; el.optSpeak.checked = audio.autoSpeak; savePrefs(); });
    el.rainOptPos.addEventListener("change", () => { game.rainShowPos = el.rainOptPos.checked; savePrefs(); });
    el.btnStartRain.addEventListener("click", () => { game.mode = "rain"; startRun(); });

    el.btnResume.addEventListener("click", resumeGame);
    el.btnRestartMilestone.addEventListener("click", startRun);
    el.btnPauseMenu.addEventListener("click", () => openGameSetup(game.mode));
    el.btnNextMilestone.addEventListener("click", () => { if (game.milestoneId < topics.length) { game.milestoneId++; savePrefs(); } startRun(); });
    el.btnPracticeRainNow.addEventListener("click", () => {
      const c = getLearningCounts();
      game.rainSource = c.due > 0 ? "due" : sessionLearned.size > 0 ? "session" : "all";
      savePrefs();
      openGameSetup("rain");
    });
    el.btnBackLearnMore.addEventListener("click", () => openGameSetup("shooter"));
    el.btnReplayMilestone.addEventListener("click", startRun);
    el.btnResultMenu.addEventListener("click", () => openGameSetup(game.mode));

    document.addEventListener("click", e => {
      const speakBtn = e.target.closest("[data-speak]");
      if (speakBtn) { speakBtn.blur(); audio.unlock(); audio.speakWord(speakBtn.dataset.speak, true, 0); }
    });

    el.closeMilestones.addEventListener("click", () => el.milestonesModal.classList.add("hidden"));
    el.milestonesModal.addEventListener("click", e => { if (e.target === el.milestonesModal) el.milestonesModal.classList.add("hidden"); });
    el.milestonesGrid.addEventListener("click", e => {
      const card = e.target.closest(".ms-card");
      if (!card) return;
      game.mode = "shooter";
      game.milestoneId = Number(card.dataset.milestone);
      game.endless = false;
      savePrefs();
      syncStartOverlayControls();
      el.milestonesModal.classList.add("hidden");
      startRun();
    });

    el.closeNotebook.addEventListener("click", () => el.notebookModal.classList.add("hidden"));
    el.notebookModal.addEventListener("click", e => { if (e.target === el.notebookModal) el.notebookModal.classList.add("hidden"); });

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
      if (e.target.id === "nb-prev" && notebookState.page > 1) { notebookState.page--; renderNotebook(); }
      else if (e.target.id === "nb-next") { notebookState.page++; renderNotebook(); }
    });

    el.btnDoImport.addEventListener("click", () => importCustomVocabulary(el.importTextarea.value));
    el.importFile.addEventListener("change", e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { el.importTextarea.value = String(reader.result || ""); importCustomVocabulary(el.importTextarea.value); };
      reader.readAsText(file, "utf-8");
      el.importFile.value = "";
    });

    el.btnExportJson.addEventListener("click", () => {
      const payload = allLibrary.map(v => ({
        word: v.word, kind: v.isColloc ? "collocation" : "word",
        pos: v.isColloc ? v.pattern : v.pos, posVi: v.posVi, level: v.level,
        isAwl: v.isAwl, ipa: v.ipa, meaning: v.meaning, topicId: v.topicId, topic: v.topicName
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "ielts-vocab-a1-c2-10500.json"; a.click();
      URL.revokeObjectURL(url);
    });

    // Export / Import Learning Progress Backup!
    el.btnExportProgress.addEventListener("click", () => {
      const backup = {
        version: 2,
        exportedAt: new Date().toISOString(),
        learned: progress.learned,
        missed: Array.from(progress.missed),
        clearedMilestones: Array.from(progress.clearedMilestones),
        highScore: progress.highScore
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "ielts-progress-backup.json"; a.click();
      URL.revokeObjectURL(url);
      el.importFeedback.textContent = "✅ Đã tải file sao lưu tiến độ học!";
    });

    el.importProgressFile.addEventListener("change", e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result || "{}"));
          if (data && typeof data.learned === "object") {
            progress = {
              learned: data.learned,
              missed: new Set(data.missed || []),
              clearedMilestones: new Set(data.clearedMilestones || []),
              highScore: Number(data.highScore) || 0
            };
            saveProgress();
            renderNotebook();
            if (game.mode === "rain") syncRainSetupControls();
            updateHUD();
            el.importFeedback.textContent = `✅ Đã khôi phục tiến độ (${Object.keys(progress.learned).length} từ đã học)!`;
          } else {
            el.importFeedback.textContent = "❌ File sao lưu tiến độ không hợp lệ.";
          }
        } catch (err) {
          el.importFeedback.textContent = `❌ Lỗi đọc file tiến độ: ${err.message}`;
        }
      };
      reader.readAsText(file, "utf-8");
      el.importProgressFile.value = "";
    });

    el.btnResetProgress.addEventListener("click", () => {
      if (!confirm("Xóa sạch toàn bộ dữ liệu từ đã học & quay về từ đầu (0 từ)?")) return;
      progress = createEmptyProgress();
      sessionLearned.clear();
      saveProgress();
      renderNotebook();
      if (game.mode === "rain") syncRainSetupControls();
      updateHUD();
    });
  }

  function init() {
    audio.soundEnabled = prefs.soundEnabled !== false;
    audio.autoSpeak = prefs.autoSpeak !== false;

    rebuildVocabulary();
    populateTopicSelects();
    buildVirtualKeyboard();
    resizeCanvas();
    syncSoundIcon();
    syncStartOverlayControls();
    applyModeTheme();
    updateHUD();
    bindEvents();

    openHub();
    requestAnimationFrame(gameLoop);
  }

  init();
})();
