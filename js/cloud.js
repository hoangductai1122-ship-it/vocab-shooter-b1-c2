/* ==========================================================================
   Google Account Cloud Sync (Firebase Auth + Firestore)
   - Syncs learned words, SRS intervals, daily goal & streak across
     Laptop Chrome <-> Phone Chrome when signed into the same Google account.
   ========================================================================== */

(() => {
  "use strict";

  const LOCAL_CLOUD_SETTINGS_KEY = "vocab_ielts_cloud_settings_v1";
  const FIREBASE_CDN_BASE = "https://www.gstatic.com/firebasejs/10.14.1";

  function loadStoredOverrides() {
    try {
      const raw = localStorage.getItem(LOCAL_CLOUD_SETTINGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  class VocabCloudManager {
    constructor() {
      this.user = null;
      this.ready = false;
      this.auth = null;
      this.db = null;
      this._unsubUserDoc = null;
      this._saveTimer = null;
      this._suppressEchoUntil = 0;

      this.onAuthStateChangedCb = null;
      this.onCloudProgressCb = null;
    }

    getEffectiveConfig() {
      const base = window.VOCAB_CLOUD_CONFIG || {};
      const over = loadStoredOverrides();
      const fbBase = base.firebase || {};
      const fbOver = over.firebase || {};

      return {
        firebase: {
          apiKey: (fbOver.apiKey || fbBase.apiKey || "").trim(),
          authDomain: (fbOver.authDomain || fbBase.authDomain || "").trim(),
          projectId: (fbOver.projectId || fbBase.projectId || "").trim(),
          appId: (fbOver.appId || fbBase.appId || "").trim()
        }
      };
    }

    saveOverrides(overrides) {
      try {
        localStorage.setItem(LOCAL_CLOUD_SETTINGS_KEY, JSON.stringify(overrides || {}));
      } catch (_) {}
    }

    isFirebaseConfigured() {
      const fb = this.getEffectiveConfig().firebase;
      return Boolean(fb.apiKey && fb.projectId && (fb.authDomain || fb.projectId));
    }

    _emitAuth() {
      if (typeof this.onAuthStateChangedCb === "function") {
        this.onAuthStateChangedCb(this.user, this.isFirebaseConfigured());
      }
    }

    _loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Không thể tải thư viện Cloud: ${src}`));
        document.head.appendChild(s);
      });
    }

    async init() {
      if (!this.isFirebaseConfigured()) {
        this._emitAuth();
        return false;
      }

      try {
        if (!window.firebase) {
          await this._loadScript(`${FIREBASE_CDN_BASE}/firebase-app-compat.js`);
          await this._loadScript(`${FIREBASE_CDN_BASE}/firebase-auth-compat.js`);
          await this._loadScript(`${FIREBASE_CDN_BASE}/firebase-firestore-compat.js`);
        }

        const fbCfg = this.getEffectiveConfig().firebase;
        const fullCfg = {
          apiKey: fbCfg.apiKey,
          authDomain: fbCfg.authDomain || `${fbCfg.projectId}.firebaseapp.com`,
          projectId: fbCfg.projectId,
          appId: fbCfg.appId || undefined
        };

        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(fullCfg);
        }

        this.auth = window.firebase.auth();
        this.db = window.firebase.firestore();
        this.ready = true;

        this.auth.onAuthStateChanged(user => {
          this.user = user
            ? {
                uid: user.uid,
                displayName: user.displayName || user.email || "Người học",
                email: user.email || "",
                photoURL: user.photoURL || ""
              }
            : null;
          this._emitAuth();
          this._subscribeUserDoc();
        });

        return true;
      } catch (err) {
        console.warn("[VocabCloud] Init warning:", err);
        this._emitAuth();
        return false;
      }
    }

    async signInWithGoogle() {
      if (!this.isFirebaseConfigured()) {
        throw new Error("NOT_CONFIGURED");
      }
      if (!this.ready) {
        const ok = await this.init();
        if (!ok || !this.auth) throw new Error("INIT_FAILED");
      }
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        await this.auth.signInWithPopup(provider);
      } catch (err) {
        if (err && (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment")) {
          await this.auth.signInWithRedirect(provider);
          return;
        }
        throw err;
      }
    }

    async signOut() {
      if (this._unsubUserDoc) {
        this._unsubUserDoc();
        this._unsubUserDoc = null;
      }
      if (this.auth) {
        await this.auth.signOut();
      }
      this.user = null;
      this._emitAuth();
    }

    _subscribeUserDoc() {
      if (this._unsubUserDoc) {
        this._unsubUserDoc();
        this._unsubUserDoc = null;
      }
      if (!this.db || !this.user) return;

      const docRef = this.db.collection("user_progress").doc(this.user.uid);
      this._unsubUserDoc = docRef.onSnapshot(
        snap => {
          if (Date.now() < this._suppressEchoUntil) return;
          if (snap.exists) {
            const remoteData = snap.data() || {};
            if (typeof this.onCloudProgressCb === "function") {
              this.onCloudProgressCb(remoteData, false);
            }
          } else if (typeof this.onCloudProgressCb === "function") {
            this.onCloudProgressCb(null, true);
          }
        },
        err => {
          console.warn("[VocabCloud] User sync warning:", err.message);
        }
      );
    }

    schedulePushProgress(serializedProgress, customWords = []) {
      if (!this.db || !this.user) return;
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(async () => {
        if (!this.db || !this.user) return;
        try {
          this._suppressEchoUntil = Date.now() + 1400;
          const docRef = this.db.collection("user_progress").doc(this.user.uid);
          await docRef.set(
            {
              ...serializedProgress,
              customWords,
              email: this.user.email || "",
              displayName: this.user.displayName || "",
              updatedAtMs: Date.now()
            },
            { merge: true }
          );
        } catch (err) {
          console.warn("[VocabCloud] Push progress failed:", err.message);
        }
      }, 650);
    }

    // Union-merge local & cloud progress so switching between Laptop & Phone never loses a word
    static mergeProgressRecords(localPlain, remotePlain) {
      if (!remotePlain) return { merged: localPlain, changedLocal: false, changedRemote: true };

      const mergedLearned = { ...(remotePlain.learned || {}) };
      let changedLocal = false;
      let changedRemote = false;

      const localLearned = localPlain.learned || {};
      for (const word of Object.keys(localLearned)) {
        const loc = localLearned[word];
        const rem = mergedLearned[word];
        if (!rem) {
          mergedLearned[word] = loc.slice();
          changedRemote = true;
        } else {
          const tMin = Math.min(loc[0] || Infinity, rem[0] || Infinity);
          const revCnt = Math.max(loc[1] || 0, rem[1] || 0);
          const streak = Math.max(loc[2] || 0, rem[2] || 0);
          const nextDue = Math.max(loc[3] || 0, rem[3] || 0);
          const combined = [tMin === Infinity ? 0 : tMin, revCnt, streak, nextDue];

          mergedLearned[word] = combined;
          if (JSON.stringify(combined) !== JSON.stringify(loc)) changedLocal = true;
          if (JSON.stringify(combined) !== JSON.stringify(rem)) changedRemote = true;
        }
      }

      for (const word of Object.keys(remotePlain.learned || {})) {
        if (!localLearned[word]) changedLocal = true;
      }

      const missedSet = new Set([...(localPlain.missed || []), ...(remotePlain.missed || [])]);
      for (const w of Object.keys(mergedLearned)) {
        if ((mergedLearned[w][2] || 0) >= 1) missedSet.delete(w);
      }

      const milestonesSet = new Set([
        ...(localPlain.clearedMilestones || []),
        ...(remotePlain.clearedMilestones || [])
      ]);
      if (milestonesSet.size !== (localPlain.clearedMilestones || []).length) changedLocal = true;
      if (milestonesSet.size !== (remotePlain.clearedMilestones || []).length) changedRemote = true;

      const readArticlesSet = new Set([
        ...(localPlain.readArticles || []),
        ...(remotePlain.readArticles || [])
      ]);
      if (readArticlesSet.size !== (localPlain.readArticles || []).length) changedLocal = true;
      if (readArticlesSet.size !== (remotePlain.readArticles || []).length) changedRemote = true;

      const highScore = Math.max(Number(localPlain.highScore) || 0, Number(remotePlain.highScore) || 0);
      const streakDays = Math.max(Number(localPlain.streakDays) || 0, Number(remotePlain.streakDays) || 0);

      const today = localPlain.dailyDate || "";
      let dailyCount = Number(localPlain.dailyCount) || 0;
      if (remotePlain.dailyDate === today) {
        const maxDaily = Math.max(dailyCount, Number(remotePlain.dailyCount) || 0);
        if (maxDaily !== dailyCount) changedLocal = true;
        dailyCount = maxDaily;
      }

      const lastStreakDate =
        (localPlain.lastStreakDate || "") >= (remotePlain.lastStreakDate || "")
          ? (localPlain.lastStreakDate || "")
          : (remotePlain.lastStreakDate || "");

      return {
        merged: {
          learned: mergedLearned,
          missed: Array.from(missedSet),
          clearedMilestones: Array.from(milestonesSet),
          readArticles: Array.from(readArticlesSet),
          highScore,
          dailyDate: today,
          dailyCount,
          streakDays,
          lastStreakDate
        },
        changedLocal,
        changedRemote
      };
    }
  }

  window.VocabCloudManager = VocabCloudManager;
})();
