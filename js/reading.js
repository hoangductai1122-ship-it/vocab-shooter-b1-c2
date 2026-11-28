/* ==========================================================================
   IELTS Reading Studio Engine
   - 20 A4-Length Science & Economics Breakthrough Passages
   - Instant Click-Any-Word Lookup (10,500 IELTS Library + Contextual Glossary)
   - 1-Click Save to Mưa Từ Vựng with Ebbinghaus SRS Memory Curve
   - Interactive IELTS Reading Comprehension Quiz + Evidence Paragraph Jump
   ========================================================================== */

(() => {
  "use strict";

  const READING_PREFS_KEY = "vocab_ielts_reading_prefs_v1";
  const READING_QUIZ_KEY = "vocab_ielts_reading_quiz_v1";

  const articles = window.READING_ARTICLES || [];
  const glossary = window.READING_GLOSSARY || {};
  const irregulars = window.READING_IRREGULAR_LEMMAS || {};

  function loadReadingPrefs() {
    try {
      const raw = localStorage.getItem(READING_PREFS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      theme: "sepia",
      fontSize: 17.5,
      showAcademic: true,
      showGist: false,
      showPanel: true,
      filter: "all"
    };
  }

  function loadQuizStore() {
    try {
      const raw = localStorage.getItem(READING_QUIZ_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {}; // articleId -> { answers: { q1: 0, ... }, checked: true/false }
  }

  const state = {
    ...loadReadingPrefs(),
    search: "",
    activeArticleId: null,
    sessionSavedWords: [], // [{ word, meaning, posShort, level }]
    quizStore: loadQuizStore(),
    activeLookup: null,
    activeWordSpan: null
  };

  function saveReadingPrefs() {
    try {
      localStorage.setItem(
        READING_PREFS_KEY,
        JSON.stringify({
          theme: state.theme,
          fontSize: state.fontSize,
          showAcademic: state.showAcademic,
          showGist: state.showGist,
          showPanel: state.showPanel,
          filter: state.filter
        })
      );
    } catch (_) {}
  }

  function saveQuizStore() {
    try {
      localStorage.setItem(READING_QUIZ_KEY, JSON.stringify(state.quizStore));
    } catch (_) {}
  }

  const dom = {
    stage: document.getElementById("reading-stage"),
    library: document.getElementById("reading-library"),
    libSummary: document.getElementById("rd-lib-summary"),
    libGotoRain: document.getElementById("rd-lib-goto-rain"),
    btnBackHub: document.getElementById("btn-reading-back-hub"),
    filterGroup: document.getElementById("rd-filter-group"),
    search: document.getElementById("rd-search"),
    articlesGrid: document.getElementById("rd-articles-grid"),

    workspace: document.getElementById("reading-workspace"),
    btnBackList: document.getElementById("btn-rd-back-list"),
    btnPrev: document.getElementById("btn-rd-prev"),
    btnNext: document.getElementById("btn-rd-next"),
    articlePos: document.getElementById("rd-article-pos"),
    themeGroup: document.getElementById("rd-theme-group"),
    btnFontDown: document.getElementById("btn-rd-font-down"),
    btnFontUp: document.getElementById("btn-rd-font-up"),
    btnToggleAcad: document.getElementById("btn-rd-toggle-acad"),
    btnToggleGist: document.getElementById("btn-rd-toggle-gist"),
    btnToggleAmbience: document.getElementById("btn-rd-toggle-ambience"),
    btnTogglePanel: document.getElementById("btn-rd-toggle-panel"),

    body: document.getElementById("rd-body"),
    paper: document.getElementById("rd-a4-paper"),
    paperMeta: document.getElementById("rd-paper-meta"),
    paperTitle: document.getElementById("rd-paper-title"),
    paperTitleVi: document.getElementById("rd-paper-title-vi"),
    paperContent: document.getElementById("rd-paper-content"),
    btnMarkDone: document.getElementById("btn-rd-mark-done"),
    btnPracticeRainBottom: document.getElementById("btn-rd-practice-rain-bottom"),
    btnNextBottom: document.getElementById("btn-rd-next-bottom"),

    sidePanel: document.getElementById("rd-side-panel"),
    savedCount: document.getElementById("rd-saved-count"),
    savedList: document.getElementById("rd-saved-list"),
    btnGotoRain: document.getElementById("btn-rd-goto-rain"),
    quizScore: document.getElementById("rd-quiz-score"),
    quizList: document.getElementById("rd-quiz-list"),
    btnCheckQuiz: document.getElementById("btn-rd-check-quiz"),
    btnResetQuiz: document.getElementById("btn-rd-reset-quiz"),

    popoverBackdrop: document.getElementById("word-popover-backdrop"),
    popover: document.getElementById("word-popover"),
    wpWord: document.getElementById("wp-word"),
    wpSurface: document.getElementById("wp-surface"),
    wpLevel: document.getElementById("wp-level"),
    wpAwl: document.getElementById("wp-awl"),
    wpClose: document.getElementById("wp-close"),
    wpPos: document.getElementById("wp-pos"),
    wpIpa: document.getElementById("wp-ipa"),
    wpSpeak: document.getElementById("wp-speak"),
    wpSpeakSlow: document.getElementById("wp-speak-slow"),
    wpMeaning: document.getElementById("wp-meaning"),
    wpNote: document.getElementById("wp-note"),
    wpContextWrap: document.getElementById("wp-context-wrap"),
    wpContext: document.getElementById("wp-context"),
    wpBtnSave: document.getElementById("wp-btn-save"),
    wpBtnRequeue: document.getElementById("wp-btn-requeue"),
    wpSavedRow: document.getElementById("wp-saved-row"),
    wpSrsHint: document.getElementById("wp-srs-hint"),
    wpBtnRemove: document.getElementById("wp-btn-remove")
  };

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bridge() {
    return window.VocabAppBridge || null;
  }

  // --------------------------------------------------------------------------
  // Smart Lemmatizer & Multi-Tier Contextual Dictionary Lookup
  // --------------------------------------------------------------------------
  function generateLemmaCandidates(rawWord) {
    const w = String(rawWord || "")
      .toLowerCase()
      .replace(/^'+|'+$/g, "")
      .replace(/'s$/, "");
    if (!w) return [];

    const out = [w];
    if (irregulars[w]) out.push(irregulars[w]);

    // UK <-> US spelling normalization
    if (w.includes("is")) {
      out.push(
        w
          .replace(/isation$/, "ization")
          .replace(/ising$/, "izing")
          .replace(/ised$/, "ized")
      );
    }
    if (w.includes("iz")) {
      out.push(
        w
          .replace(/ization$/, "isation")
          .replace(/izing$/, "ising")
          .replace(/ized$/, "ised")
      );
    }
    if (w.includes("our")) out.push(w.replace("our", "or"));

    const seeds = out.slice();
    for (const base of seeds) {
      if (base.endsWith("ies") && base.length > 4) out.push(base.slice(0, -3) + "y");
      if (base.endsWith("ied") && base.length > 4) out.push(base.slice(0, -3) + "y");
      if (base.endsWith("ves") && base.length > 4) {
        out.push(base.slice(0, -3) + "f", base.slice(0, -3) + "fe");
      }
      if (base.endsWith("es") && base.length > 3) {
        out.push(base.slice(0, -2), base.slice(0, -1));
      }
      if (base.endsWith("s") && !base.endsWith("ss") && base.length > 2) {
        out.push(base.slice(0, -1));
      }
      if (base.endsWith("ing") && base.length > 5) {
        const stem = base.slice(0, -3);
        out.push(stem, stem + "e");
        if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
          out.push(stem.slice(0, -1));
        }
      }
      if (base.endsWith("ed") && base.length > 4) {
        const stem = base.slice(0, -2);
        out.push(stem, base.slice(0, -1));
        if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
          out.push(stem.slice(0, -1));
        }
      }
      if (base.endsWith("ly") && base.length > 4) {
        out.push(base.slice(0, -2));
        if (base.endsWith("ily")) out.push(base.slice(0, -3) + "y");
        if (base.endsWith("ally")) out.push(base.slice(0, -4) + "al");
      }
      if (base.endsWith("er") && base.length > 4) {
        out.push(base.slice(0, -2), base.slice(0, -1));
        if (base.endsWith("ier")) out.push(base.slice(0, -3) + "y");
      }
      if (base.endsWith("est") && base.length > 5) {
        out.push(base.slice(0, -3), base.slice(0, -2));
        if (base.endsWith("iest")) out.push(base.slice(0, -4) + "y");
      }
      if (base.endsWith("tion") && base.length > 6) {
        out.push(base.slice(0, -3) + "e", base.slice(0, -4));
      }
      if (base.endsWith("ment") && base.length > 6) out.push(base.slice(0, -4));
      if (base.endsWith("ness") && base.length > 6) out.push(base.slice(0, -4));
      if (base.endsWith("ity") && base.length > 5) {
        out.push(base.slice(0, -3), base.slice(0, -3) + "e");
      }
    }

    return Array.from(new Set(out));
  }

  function makeConciseRainMeaning(fullMeaning) {
    const clean = String(fullMeaning || "").trim();
    if (clean.length <= 44) return clean;
    // Strip parenthetical clarification for compact falling raindrop display
    const noParen = clean.replace(/\s*\([^)]*\)/g, "").trim();
    if (noParen.length >= 4 && noParen.length <= 48) return noParen;
    const firstClause = noParen.split(";")[0].trim();
    return firstClause.length <= 52 ? firstClause : firstClause.slice(0, 49).trim() + "…";
  }

  function resolveWordEntry(surfaceWord, articleTopicId = 2) {
    const b = bridge();
    const candidates = generateLemmaCandidates(surfaceWord);
    const POS_EXTRA = {
      art: "art · Mạo từ",
      pron: "pron · Đại từ"
    };

    // Tier 1: Domain-specific Science & Economics Reading Glossary (exact contextual fit)
    for (const cand of candidates) {
      if (Object.prototype.hasOwnProperty.call(glossary, cand)) {
        const g = glossary[cand];
        const saveLemma = g[0] || "";
        const posAbbr = g[1] || "n";
        const level = g[2] || "B2";
        const ipa = g[3] || "";
        const meaning = g[4] || "";
        const note = g[5] || "";

        // Enrich IPA or AWL flag if main 10,000 library also has saveLemma
        const libMatch = saveLemma && b ? b.lookupVocab(saveLemma) : null;
        const posInfo = b ? b.getPosInfo(posAbbr) : { short: posAbbr };
        return {
          displayWord: saveLemma || cand,
          saveLemma: saveLemma && /^[a-z]+( [a-z]+)*$/.test(saveLemma) ? saveLemma : "",
          surfaceWord,
          pos: posAbbr,
          posShort: POS_EXTRA[posAbbr] || (posInfo ? posInfo.short : posAbbr),
          level,
          ipa: ipa || (libMatch ? libMatch.ipa : ""),
          meaning,
          shortMeaning: makeConciseRainMeaning(meaning),
          note: note || (libMatch ? `Chủ đề: ${libMatch.topicVi}` : ""),
          topicId: libMatch ? libMatch.topicId : articleTopicId,
          isAwl: Boolean(libMatch && libMatch.isAwl)
        };
      }
    }

    // Tier 2: Main 10,000 IELTS A1–C2 + AWL Vocabulary Library
    if (b) {
      for (const cand of candidates) {
        const v = b.lookupVocab(cand);
        if (v) {
          return {
            displayWord: v.word,
            saveLemma: v.word,
            surfaceWord,
            pos: v.pos,
            posShort: v.posShort,
            level: v.level,
            ipa: v.ipa || "",
            meaning: v.meaning,
            shortMeaning: makeConciseRainMeaning(v.meaning),
            note: `Chủ đề IELTS: ${v.topicVi || v.topicName}`,
            topicId: v.topicId || articleTopicId,
            isAwl: Boolean(v.isAwl)
          };
        }
      }
    }

    // Fallback for any rare number or proper token
    const cleanFallback = String(surfaceWord || "").toLowerCase().replace(/[^a-z]/g, "");
    return {
      displayWord: surfaceWord,
      saveLemma: cleanFallback.length >= 3 ? cleanFallback : "",
      surfaceWord,
      pos: "n",
      posShort: "n · Từ vựng",
      level: "B2",
      ipa: "",
      meaning: "Thuật ngữ tiếng Anh trong ngữ cảnh bài đọc",
      shortMeaning: "Thuật ngữ trong bài đọc",
      note: "Nhấn 🔊 để nghe phát âm chuẩn",
      topicId: articleTopicId,
      isAwl: false
    };
  }

  function countArticleWords(article) {
    const joined = article.paragraphs.map(p => p.text).join(" ");
    const matches = joined.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g);
    return matches ? matches.length : 460;
  }

  // --------------------------------------------------------------------------
  // 3A. Render Magazine Library of 20 Breakthrough Articles
  // --------------------------------------------------------------------------
  function renderLibrary() {
    const b = bridge();
    const q = state.search.trim().toLowerCase();
    let doneCount = 0;
    articles.forEach(a => {
      if (b && b.isArticleRead(a.id)) doneCount++;
    });

    const counts = b ? b.getLearningCounts() : { due: 0, totalLearned: 0 };
    if (dom.libSummary) {
      dom.libSummary.textContent = `Đã đọc ${doneCount}/${articles.length} bài · Phân bậc tự động bằng thuật toán đo từ vựng C1–C2, độ dài câu & Flesch-Kincaid (Passage 1 → Passage 3)`;
    }
    if (dom.libGotoRain) {
      dom.libGotoRain.textContent = counts.due > 0
        ? `🌧️ Mưa Từ Vựng (${counts.due} chờ ôn)`
        : `🌧️ Mưa Từ Vựng`;
    }

    dom.filterGroup.querySelectorAll(".chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.filter === state.filter);
    });

    const filtered = articles.filter(a => {
      const isDone = b ? b.isArticleRead(a.id) : false;
      if (state.filter === "p1" && a.passage !== 1) return false;
      if (state.filter === "p2" && a.passage !== 2) return false;
      if (state.filter === "p3" && a.passage !== 3) return false;
      if (state.filter === "science" && a.category !== "science") return false;
      if (state.filter === "economics" && a.category !== "economics") return false;
      if (state.filter === "unread" && isDone) return false;
      if (state.filter === "done" && !isDone) return false;
      if (q) {
        const hay = `${a.title} ${a.titleVi} ${a.tag} ${a.sourceNote} ${a.band}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (!filtered.length) {
      dom.articlesGrid.innerHTML = `<div class="rd-saved-empty" style="grid-column:1/-1;padding:28px;">Không tìm thấy bản tin phù hợp với bộ lọc hiện tại.</div>`;
      return;
    }

    dom.articlesGrid.innerHTML = filtered
      .map(a => {
        const isDone = b ? b.isArticleRead(a.id) : false;
        const wc = countArticleWords(a);
        const mins = Math.max(3, Math.round(wc / 125));
        const qState = state.quizStore[a.id];
        let quizText = "4 câu IELTS";
        if (qState && qState.checked) {
          let right = 0;
          a.questions.forEach(qItem => {
            if (qState.answers && qState.answers[qItem.id] === qItem.answer) right++;
          });
          quizText = `🎯 Đạt ${right}/${a.questions.length} câu`;
        }
        const catIcon = a.category === "science" ? "🔬" : "📈";
        const tier = a.passage || 2;
        const tierDot = tier === 1 ? "🟢" : tier === 2 ? "🔵" : "🟣";
        const m = a.metrics || { c1c2Pct: 12, b2PlusPct: 25, avgSent: 24, fkGrade: 15 };
        const metricTooltip = `Đo tự động: Từ B2+ ${m.b2PlusPct}% · Từ C1–C2 ${m.c1c2Pct}% · Độ dài câu TB ${m.avgSent} từ · Flesch-Kincaid Grade ${m.fkGrade}`;
        return `
          <button type="button" class="rd-article-card ${isDone ? "is-done" : ""}" data-article-id="${escapeHtml(a.id)}" title="${escapeHtml(metricTooltip)}">
            <div>
              <div class="rd-card-top">
                <span class="rd-cat-pill ${escapeHtml(a.category)}">${catIcon} #${String(a.num).padStart(2, "0")} · ${escapeHtml(a.tag)}</span>
                <span class="rd-card-band tier-${tier}">${tierDot} ${escapeHtml(a.band)}</span>
              </div>
              <h3 class="rd-card-title" style="margin-top:10px;">${escapeHtml(a.title)}</h3>
              <p class="rd-card-vi" style="margin-top:5px;">${escapeHtml(a.titleVi)}</p>
              <div class="rd-metrics-strip">
                <span class="rd-metric-chip">📊 C1–C2: ${m.c1c2Pct}%</span>
                <span class="rd-metric-chip">✍️ Câu TB: ${m.avgSent} từ</span>
                <span class="rd-metric-chip">FK: ${m.fkGrade}</span>
              </div>
            </div>
            <div class="rd-card-foot">
              <span>📄 ${wc} từ (~1 trang A4 · ${mins} phút) · ${quizText}</span>
              <span class="${isDone ? "rd-done-badge" : "rd-open-cta"}">${isDone ? "✅ Đã đọc" : "Đọc ngay →"}</span>
            </div>
          </button>`;
      })
      .join("");
  }

  // --------------------------------------------------------------------------
  // 3B. Render A4 Passage + Interactive Word Spans + IELTS Questions
  // --------------------------------------------------------------------------
  function getActiveArticle() {
    return articles.find(a => a.id === state.activeArticleId) || articles[0];
  }

  function applyReaderVisualPrefs() {
    if (!dom.stage || !dom.paper || !dom.body) return;
    dom.stage.setAttribute("data-theme", state.theme);
    dom.paper.style.setProperty("--rd-font-size", `${state.fontSize}px`);
    dom.paper.classList.toggle("show-academic", Boolean(state.showAcademic));
    dom.body.classList.toggle("panel-collapsed", !state.showPanel);

    dom.themeGroup.querySelectorAll(".rd-theme-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.theme === state.theme);
    });
    dom.btnToggleAcad.classList.toggle("active", Boolean(state.showAcademic));
    dom.btnToggleGist.classList.toggle("active", Boolean(state.showGist));
    dom.btnTogglePanel.classList.toggle("active", Boolean(state.showPanel));

    dom.paperContent.querySelectorAll(".a4-para-gist").forEach(gEl => {
      gEl.classList.toggle("hidden", !state.showGist);
    });
  }

  function tokenizeParagraphHtml(text, topicId) {
    const b = bridge();
    // Split preserving whitespace & punctuation while wrapping every English word token
    return text.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, match => {
      const info = resolveWordEntry(match, topicId);
      const saveKey = info.saveLemma;
      const isSaved = Boolean(saveKey && b && b.isWordLearned(saveKey));
      const isAcad = Boolean(saveKey && (info.level === "C1" || info.level === "C2" || info.isAwl));
      const cls = [
        "r-word",
        isSaved ? "is-saved" : "",
        isAcad ? "is-academic" : ""
      ]
        .filter(Boolean)
        .join(" ");
      return `<span class="${cls}" data-surface="${escapeHtml(match)}" data-lemma="${escapeHtml(saveKey)}">${escapeHtml(match)}</span>`;
    });
  }

  function refreshSavedHighlightsInPassage() {
    const b = bridge();
    if (!b || !dom.paperContent) return;
    dom.paperContent.querySelectorAll(".r-word").forEach(span => {
      const lemma = span.dataset.lemma;
      span.classList.toggle("is-saved", Boolean(lemma && b.isWordLearned(lemma)));
    });
  }

  function renderSavedWordsPanel() {
    const b = bridge();
    const counts = b ? b.getLearningCounts() : { due: 0, totalLearned: 0 };

    // Keep sessionSavedWords synced with actual learned state
    const validList = state.sessionSavedWords.filter(item => !b || b.isWordLearned(item.word));
    state.sessionSavedWords = validList;

    dom.savedCount.textContent = validList.length > 0
      ? `${validList.length} mới lưu · ${counts.due} chờ ôn`
      : `${counts.due} chờ ôn`;

    if (!validList.length) {
      dom.savedList.innerHTML = `
        <div class="rd-saved-empty">
          Chạm vào bất kỳ từ mới nào bên trang A4 rồi bấm <strong>Lưu vào Mưa Từ Vựng</strong> — từ sẽ hiện ngay tại đây!
        </div>`;
    } else {
      dom.savedList.innerHTML = validList
        .map(
          item => `
          <div class="rd-saved-item">
            <div class="rd-saved-left">
              <div class="rd-saved-word-row">
                <button type="button" class="speak-mini-btn" data-rd-speak="${escapeHtml(item.word)}" title="Nghe phát âm">🔊</button>
                <strong>${escapeHtml(item.word)}</strong>
                <span class="cefr-tag ${escapeHtml(item.level)}">${escapeHtml(item.level)}</span>
              </div>
              <span class="rd-saved-vi">${escapeHtml(item.meaning)}</span>
            </div>
            <button type="button" class="rd-saved-remove" data-rd-unsave="${escapeHtml(item.word)}" title="Bỏ lưu từ này">✕</button>
          </div>`
        )
        .join("");
    }

    const btnLabel = validList.length > 0
      ? `🌧️ Qua Mưa Từ Vựng ôn ngay (${validList.length} từ vừa lưu)`
      : counts.due > 0
        ? `🌧️ Qua Mưa Từ Vựng ôn (${counts.due} từ chờ ôn)`
        : `🌧️ Mở Mưa Từ Vựng`;
    dom.btnGotoRain.querySelector("span").textContent = btnLabel;
    dom.btnPracticeRainBottom.textContent = validList.length > 0
      ? `🌧️ Ôn ${validList.length} từ vừa lưu`
      : `🌧️ Sang Mưa Từ Vựng`;
  }

  function renderQuiz(article) {
    const qState = state.quizStore[article.id] || { answers: {}, checked: false };
    const checked = Boolean(qState.checked);
    let correctCount = 0;

    dom.quizList.innerHTML = article.questions
      .map((q, idx) => {
        const picked = qState.answers ? qState.answers[q.id] : undefined;
        if (checked && picked === q.answer) correctCount++;

        const optsHtml = q.options
          .map((optText, optIdx) => {
            let cls = "rd-opt-btn";
            if (picked === optIdx) cls += " selected";
            if (checked) {
              if (optIdx === q.answer) cls += " correct";
              else if (picked === optIdx && picked !== q.answer) cls += " wrong";
            }
            return `<button type="button" class="${cls}" data-qid="${escapeHtml(q.id)}" data-oidx="${optIdx}">${escapeHtml(optText)}</button>`;
          })
          .join("");

        const explainHtml = checked
          ? `<div class="rd-q-explain">
               <div><strong>Đáp án đúng: ${escapeHtml(q.options[q.answer])}</strong> — ${escapeHtml(q.explainVi)}</div>
               <button type="button" class="rd-evidence-btn" data-jump-para="${escapeHtml(q.para)}">📍 Xem dẫn chứng Đoạn ${escapeHtml(q.para)}</button>
             </div>`
          : "";

        return `
          <div class="rd-q-item">
            <div class="rd-q-prompt"><span class="rd-q-num">Câu ${idx + 1}.</span>${escapeHtml(q.prompt)}</div>
            <div class="rd-q-options ${q.type === "tfng" ? "tfng-row" : ""}">${optsHtml}</div>
            ${explainHtml}
          </div>`;
      })
      .join("");

    dom.quizScore.textContent = checked
      ? `🎯 Đúng ${correctCount}/${article.questions.length}`
      : `${article.questions.length} câu`;
  }

  function syncMarkDoneButton(article) {
    const b = bridge();
    const isDone = b ? b.isArticleRead(article.id) : false;
    dom.btnMarkDone.classList.toggle("done-active", isDone);
    dom.btnMarkDone.textContent = isDone ? "✅ Đã hoàn thành bài đọc" : "✓ Đánh dấu đã đọc xong";
  }

  function openArticle(articleId) {
    hidePopover();
    const idx = Math.max(0, articles.findIndex(a => a.id === articleId));
    const article = articles[idx];
    if (!article) return;

    state.activeArticleId = article.id;
    dom.library.classList.add("hidden");
    dom.workspace.classList.remove("hidden");

    dom.articlePos.textContent = `Bài ${String(idx + 1).padStart(2, "0")}/${articles.length}`;
    dom.btnPrev.disabled = idx <= 0;
    dom.btnNext.disabled = idx >= articles.length - 1;
    dom.btnNextBottom.textContent = idx >= articles.length - 1 ? "Về danh sách 20 bài →" : "Bài tiếp theo →";

    const wc = countArticleWords(article);
    const mins = Math.max(3, Math.round(wc / 125));
    const catIcon = article.category === "science" ? "🔬 Khoa học" : "📈 Kinh tế";
    const tier = article.passage || 2;
    const tierDot = tier === 1 ? "🟢" : tier === 2 ? "🔵" : "🟣";
    const m = article.metrics || { c1c2Pct: 12, b2PlusPct: 25, avgSent: 24, fkGrade: 15 };

    dom.paperMeta.innerHTML = `
      <span class="rd-cat-pill ${escapeHtml(article.category)}">${catIcon} · ${escapeHtml(article.tag)}</span>
      <span class="rd-card-band tier-${tier}" title="Phân tích tự động: Từ B2+ ${m.b2PlusPct}% · Flesch-Kincaid ${m.fkGrade}">${tierDot} ${escapeHtml(article.band)}</span>
      <span>· 📊 C1–C2: ${m.c1c2Pct}% · Câu TB: ${m.avgSent} từ</span>
      <span>· 📄 ${wc} từ (~${mins} phút)</span>
    `;
    dom.paperTitle.textContent = article.title;
    dom.paperTitleVi.textContent = article.titleVi;

    dom.paperContent.innerHTML = article.paragraphs
      .map(
        p => `
        <section class="a4-para-block" id="rd-para-${escapeHtml(p.id)}" data-para="${escapeHtml(p.id)}">
          <p class="a4-para-text"><span class="a4-para-label">${escapeHtml(p.id)}</span>${tokenizeParagraphHtml(p.text, article.topicId)}</p>
          <div class="a4-para-gist ${state.showGist ? "" : "hidden"}">💡 <strong>Ý chính đoạn ${escapeHtml(p.id)}:</strong> ${escapeHtml(p.gistVi)}</div>
        </section>`
      )
      .join("");

    applyReaderVisualPrefs();
    syncMarkDoneButton(article);
    renderSavedWordsPanel();
    renderQuiz(article);
    dom.body.scrollTop = 0;
  }

  function showLibrary() {
    hidePopover();
    state.activeArticleId = null;
    dom.workspace.classList.add("hidden");
    dom.library.classList.remove("hidden");
    renderLibrary();
  }

  // --------------------------------------------------------------------------
  // Word Lookup Popover & 1-Click Save to Mưa Từ Vựng (SRS)
  // --------------------------------------------------------------------------
  function extractContextSentence(paraText, surfaceWord) {
    const sentences = String(paraText || "").match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paraText];
    const targetLower = surfaceWord.toLowerCase();
    const found =
      sentences.find(s => s.toLowerCase().includes(targetLower)) || sentences[0] || "";
    const trimmed = found.trim();
    const esc = escapeHtml(trimmed);
    const safeWord = surfaceWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return esc.replace(new RegExp(`\\b(${safeWord})\\b`, "i"), "<mark>$1</mark>");
  }

  function updatePopoverSrsButtons() {
    const b = bridge();
    const info = state.activeLookup;
    if (!info || !b) return;

    const lemma = info.saveLemma;
    if (!lemma) {
      dom.wpBtnSave.classList.add("hidden");
      dom.wpBtnRequeue.classList.add("hidden");
      dom.wpSavedRow.classList.remove("hidden");
      dom.wpSrsHint.textContent = "ℹ️ Tên riêng / ký hiệu ngữ pháp (chỉ tra cứu)";
      dom.wpBtnRemove.classList.add("hidden");
      return;
    }

    dom.wpBtnRemove.classList.remove("hidden");
    const learned = b.isWordLearned(lemma);
    const mastered = b.isWordMastered(lemma);
    const due = b.isWordDue(lemma);

    if (!learned) {
      dom.wpBtnSave.classList.remove("hidden");
      dom.wpBtnRequeue.classList.add("hidden");
      dom.wpSavedRow.classList.add("hidden");
    } else {
      dom.wpBtnSave.classList.add("hidden");
      dom.wpSavedRow.classList.remove("hidden");
      if (mastered && !due) {
        dom.wpSrsHint.textContent = "✅ Đã thuộc trong Sổ từ";
        dom.wpBtnRequeue.classList.remove("hidden");
      } else {
        dom.wpSrsHint.textContent = "🌧️ Đã lưu vào hàng chờ Mưa Từ Vựng (SRS)";
        dom.wpBtnRequeue.classList.add("hidden");
      }
    }
  }

  function positionPopoverNearSpan(spanEl) {
    if (window.innerWidth <= 768) {
      dom.popoverBackdrop.classList.remove("hidden");
      dom.popover.style.left = "";
      dom.popover.style.top = "";
      return;
    }
    dom.popoverBackdrop.classList.add("hidden");
    const rect = spanEl.getBoundingClientRect();
    const popW = 348;
    const popH = dom.popover.offsetHeight || 250;
    const pad = 12;

    let left = rect.left + rect.width / 2 - popW / 2;
    left = Math.max(pad, Math.min(window.innerWidth - popW - pad, left));

    let top = rect.bottom + 10;
    if (top + popH > window.innerHeight - pad) {
      top = Math.max(pad, rect.top - popH - 10);
    }

    dom.popover.style.left = `${Math.round(left)}px`;
    dom.popover.style.top = `${Math.round(top)}px`;
  }

  function openWordPopover(spanEl) {
    const article = getActiveArticle();
    const surface = spanEl.dataset.surface || spanEl.textContent.trim();
    if (!surface) return;

    if (state.activeWordSpan) state.activeWordSpan.classList.remove("active-word");
    state.activeWordSpan = spanEl;
    spanEl.classList.add("active-word");

    const info = resolveWordEntry(surface, article ? article.topicId : 2);
    state.activeLookup = info;

    dom.wpWord.textContent = info.displayWord;
    const diffSurface = info.displayWord.toLowerCase() !== surface.toLowerCase();
    dom.wpSurface.textContent = `Từ trong bài: “${surface}”`;
    dom.wpSurface.classList.toggle("hidden", !diffSurface);

    dom.wpLevel.textContent = info.level;
    dom.wpLevel.className = `cefr-tag ${info.level}`;
    dom.wpAwl.classList.toggle("hidden", !info.isAwl);

    dom.wpPos.textContent = info.posShort;
    dom.wpPos.className = `pos-pill pos-${info.pos}`;
    dom.wpIpa.textContent = info.ipa || "";

    dom.wpMeaning.textContent = info.meaning;
    dom.wpNote.textContent = info.note || "";
    dom.wpNote.classList.toggle("hidden", !info.note);

    // Find paragraph text for context sentence
    const paraSec = spanEl.closest(".a4-para-block");
    const paraId = paraSec ? paraSec.dataset.para : null;
    const paraObj = article && paraId ? article.paragraphs.find(p => p.id === paraId) : null;
    if (paraObj) {
      dom.wpContextWrap.classList.remove("hidden");
      dom.wpContext.innerHTML = extractContextSentence(paraObj.text, surface);
    } else {
      dom.wpContextWrap.classList.add("hidden");
    }

    updatePopoverSrsButtons();
    dom.popover.classList.remove("hidden");
    positionPopoverNearSpan(spanEl);

    // Gentle auto-pronunciation when tapping an English word
    const b = bridge();
    if (b) b.speak(info.displayWord, 0.94);
  }

  function hidePopover() {
    if (state.activeWordSpan) {
      state.activeWordSpan.classList.remove("active-word");
      state.activeWordSpan = null;
    }
    state.activeLookup = null;
    if (dom.popover) dom.popover.classList.add("hidden");
    if (dom.popoverBackdrop) dom.popoverBackdrop.classList.add("hidden");
  }

  function handleSaveCurrentWord() {
    const b = bridge();
    const info = state.activeLookup;
    if (!b || !info || !info.saveLemma) return;

    const ok = b.saveWordToRainQueue({
      word: info.saveLemma,
      pos: info.pos,
      level: info.level,
      ipa: info.ipa,
      meaning: info.meaning,
      shortMeaning: info.shortMeaning,
      topicId: info.topicId,
      isAwl: info.isAwl
    });

    if (ok) {
      if (!state.sessionSavedWords.some(x => x.word === info.saveLemma)) {
        state.sessionSavedWords.unshift({
          word: info.saveLemma,
          meaning: info.shortMeaning || info.meaning,
          level: info.level
        });
      }
      refreshSavedHighlightsInPassage();
      renderSavedWordsPanel();
      updatePopoverSrsButtons();
    }
  }

  // --------------------------------------------------------------------------
  // Event Listeners
  // --------------------------------------------------------------------------
  function bindReadingEvents() {
    if (!dom.stage) return;

    dom.btnBackHub.addEventListener("click", () => {
      const b = bridge();
      if (b) b.openHub();
    });

    dom.libGotoRain.addEventListener("click", () => {
      const b = bridge();
      if (b) b.openRainFromReading(state.sessionSavedWords.length > 0);
    });

    dom.filterGroup.addEventListener("click", e => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.filter = chip.dataset.filter || "all";
      saveReadingPrefs();
      renderLibrary();
    });

    dom.search.addEventListener("input", () => {
      state.search = dom.search.value;
      renderLibrary();
    });

    dom.articlesGrid.addEventListener("click", e => {
      const card = e.target.closest(".rd-article-card");
      if (!card) return;
      openArticle(card.dataset.articleId);
    });

    dom.btnBackList.addEventListener("click", showLibrary);

    dom.btnPrev.addEventListener("click", () => {
      const idx = articles.findIndex(a => a.id === state.activeArticleId);
      if (idx > 0) openArticle(articles[idx - 1].id);
    });

    dom.btnNext.addEventListener("click", () => {
      const idx = articles.findIndex(a => a.id === state.activeArticleId);
      if (idx >= 0 && idx < articles.length - 1) openArticle(articles[idx + 1].id);
    });

    dom.btnNextBottom.addEventListener("click", () => {
      const idx = articles.findIndex(a => a.id === state.activeArticleId);
      if (idx >= 0 && idx < articles.length - 1) {
        openArticle(articles[idx + 1].id);
      } else {
        showLibrary();
      }
    });

    dom.themeGroup.addEventListener("click", e => {
      const btn = e.target.closest(".rd-theme-btn");
      if (!btn) return;
      state.theme = btn.dataset.theme || "sepia";
      saveReadingPrefs();
      applyReaderVisualPrefs();
    });

    dom.btnFontDown.addEventListener("click", () => {
      state.fontSize = Math.max(14.5, state.fontSize - 1);
      saveReadingPrefs();
      applyReaderVisualPrefs();
    });

    dom.btnFontUp.addEventListener("click", () => {
      state.fontSize = Math.min(22.5, state.fontSize + 1);
      saveReadingPrefs();
      applyReaderVisualPrefs();
    });

    dom.btnToggleAcad.addEventListener("click", () => {
      state.showAcademic = !state.showAcademic;
      saveReadingPrefs();
      applyReaderVisualPrefs();
    });

    dom.btnToggleGist.addEventListener("click", () => {
      state.showGist = !state.showGist;
      saveReadingPrefs();
      applyReaderVisualPrefs();
    });

    dom.btnToggleAmbience.addEventListener("click", () => {
      const b = bridge();
      if (b) {
        const active = b.toggleReadingAmbience();
        dom.btnToggleAmbience.classList.toggle("active", active);
      }
    });

    dom.btnTogglePanel.addEventListener("click", () => {
      if (window.innerWidth <= 1060) {
        dom.sidePanel.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      state.showPanel = !state.showPanel;
      saveReadingPrefs();
      applyReaderVisualPrefs();
    });

    // Click ANY word in the A4 passage -> Instant Lookup Popover
    dom.paperContent.addEventListener("click", e => {
      const wordSpan = e.target.closest(".r-word");
      if (!wordSpan) return;
      e.stopPropagation();
      openWordPopover(wordSpan);
    });

    dom.body.addEventListener("scroll", () => {
      if (window.innerWidth > 768 && !dom.popover.classList.contains("hidden")) {
        hidePopover();
      }
    });

    dom.btnMarkDone.addEventListener("click", () => {
      const article = getActiveArticle();
      const b = bridge();
      if (!article || !b) return;
      b.toggleArticleRead(article.id);
      syncMarkDoneButton(article);
    });

    [dom.btnGotoRain, dom.btnPracticeRainBottom].forEach(btn => {
      btn.addEventListener("click", () => {
        hidePopover();
        const b = bridge();
        if (b) b.openRainFromReading(state.sessionSavedWords.length > 0);
      });
    });

    // Saved words tray interactions
    dom.savedList.addEventListener("click", e => {
      const speakBtn = e.target.closest("[data-rd-speak]");
      if (speakBtn) {
        const b = bridge();
        if (b) b.speak(speakBtn.dataset.rdSpeak, 0.94);
        return;
      }
      const rmBtn = e.target.closest("[data-rd-unsave]");
      if (rmBtn) {
        const b = bridge();
        if (b) {
          b.removeSavedWord(rmBtn.dataset.rdUnsave);
          state.sessionSavedWords = state.sessionSavedWords.filter(x => x.word !== rmBtn.dataset.rdUnsave);
          refreshSavedHighlightsInPassage();
          renderSavedWordsPanel();
          updatePopoverSrsButtons();
        }
      }
    });

    // IELTS Reading Quiz interactions
    dom.quizList.addEventListener("click", e => {
      const jumpBtn = e.target.closest("[data-jump-para]");
      if (jumpBtn) {
        const paraEl = document.getElementById(`rd-para-${jumpBtn.dataset.jumpPara}`);
        if (paraEl) {
          paraEl.scrollIntoView({ behavior: "smooth", block: "center" });
          paraEl.classList.remove("evidence-flash");
          void paraEl.offsetWidth;
          paraEl.classList.add("evidence-flash");
          setTimeout(() => paraEl.classList.remove("evidence-flash"), 2100);
        }
        return;
      }

      const optBtn = e.target.closest(".rd-opt-btn");
      if (!optBtn) return;
      const article = getActiveArticle();
      if (!article) return;

      const cur = state.quizStore[article.id] || { answers: {}, checked: false };
      if (cur.checked) return; // Locked until reset
      cur.answers = cur.answers || {};
      cur.answers[optBtn.dataset.qid] = Number(optBtn.dataset.oidx);
      state.quizStore[article.id] = cur;
      saveQuizStore();
      renderQuiz(article);
    });

    dom.btnCheckQuiz.addEventListener("click", () => {
      const article = getActiveArticle();
      if (!article) return;
      const cur = state.quizStore[article.id] || { answers: {}, checked: false };
      cur.checked = true;
      state.quizStore[article.id] = cur;
      saveQuizStore();
      renderQuiz(article);

      // Automatically mark article read upon completing comprehension check!
      const b = bridge();
      if (b && !b.isArticleRead(article.id)) {
        b.toggleArticleRead(article.id, true);
        syncMarkDoneButton(article);
      }
    });

    dom.btnResetQuiz.addEventListener("click", () => {
      const article = getActiveArticle();
      if (!article) return;
      state.quizStore[article.id] = { answers: {}, checked: false };
      saveQuizStore();
      renderQuiz(article);
    });

    // Popover controls
    dom.wpClose.addEventListener("click", hidePopover);
    dom.popoverBackdrop.addEventListener("click", hidePopover);

    dom.wpSpeak.addEventListener("click", () => {
      const b = bridge();
      if (b && state.activeLookup) b.speak(state.activeLookup.displayWord, 0.94);
    });

    dom.wpSpeakSlow.addEventListener("click", () => {
      const b = bridge();
      if (b && state.activeLookup) b.speak(state.activeLookup.displayWord, 0.64);
    });

    dom.wpBtnSave.addEventListener("click", handleSaveCurrentWord);

    dom.wpBtnRequeue.addEventListener("click", () => {
      const b = bridge();
      const info = state.activeLookup;
      if (!b || !info || !info.saveLemma) return;
      if (b.requeueWordForImmediateReview(info.saveLemma)) {
        if (!state.sessionSavedWords.some(x => x.word === info.saveLemma)) {
          state.sessionSavedWords.unshift({
            word: info.saveLemma,
            meaning: info.shortMeaning || info.meaning,
            level: info.level
          });
        }
        renderSavedWordsPanel();
        updatePopoverSrsButtons();
      }
    });

    dom.wpBtnRemove.addEventListener("click", () => {
      const b = bridge();
      const info = state.activeLookup;
      if (!b || !info || !info.saveLemma) return;
      b.removeSavedWord(info.saveLemma);
      state.sessionSavedWords = state.sessionSavedWords.filter(x => x.word !== info.saveLemma);
      refreshSavedHighlightsInPassage();
      renderSavedWordsPanel();
      updatePopoverSrsButtons();
    });

    // Click outside popover closes it cleanly
    document.addEventListener("click", e => {
      if (dom.popover.classList.contains("hidden")) return;
      if (dom.popover.contains(e.target) || e.target.closest(".r-word")) return;
      hidePopover();
    });

    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && !dom.popover.classList.contains("hidden")) {
        hidePopover();
      }
    });
  }

  // Expose Studio API to Game Engine
  window.VocabReadingStudio = {
    open(articleId = null) {
      const b = bridge();
      if (b && dom.btnToggleAmbience) {
        dom.btnToggleAmbience.classList.toggle("active", b.isReadingAmbienceOn());
      }
      if (articleId) {
        openArticle(articleId);
      } else if (state.activeArticleId) {
        openArticle(state.activeArticleId);
      } else {
        showLibrary();
      }
    },
    hidePopover,
    syncAmbienceButton(active) {
      if (dom.btnToggleAmbience) dom.btnToggleAmbience.classList.toggle("active", Boolean(active));
    },
    onProgressSynced() {
      if (state.activeArticleId) {
        refreshSavedHighlightsInPassage();
        renderSavedWordsPanel();
        const art = getActiveArticle();
        if (art) syncMarkDoneButton(art);
      } else if (dom.stage && !dom.stage.classList.contains("hidden")) {
        renderLibrary();
      }
    }
  };

  bindReadingEvents();
})();
