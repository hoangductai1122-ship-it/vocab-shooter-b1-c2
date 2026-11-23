/* ==========================================================================
   Procedural Web Audio SFX (Space Weapons + Rain Mode)
   + Reliable English Pronunciation (Web Speech API + Audio Fallback)
   ========================================================================== */

class GameAudio {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
    this.rainBuffer = null;
    this.soundEnabled = true;
    this.autoSpeak = true;
    this.rainAmbienceEnabled = true;
    this._rainPlaying = false;
    this._rainNodes = null;
    this._rainDropTimer = null;
    this.preferredVoice = null;
    this._activeUtter = null;
    this._speakTimer = null;
    this._fallbackTimer = null;
    this._audioEl = null;
    this._unlocked = false;
    this._initVoices();
  }

  _initVoices() {
    if (!("speechSynthesis" in window)) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      if (!voices.length) return;
      // Strongly prefer local OS English voices (Microsoft Zira/David/Aria/Samantha)
      // because remote Google voices on Chrome/Windows often hang silently after cancel().
      this.preferredVoice =
        voices.find(v => v.localService && /en[-_]US/i.test(v.lang) && /Aria|Jenny|Zira|David|Mark|Samantha/i.test(v.name)) ||
        voices.find(v => v.localService && /en[-_]US/i.test(v.lang)) ||
        voices.find(v => v.localService && /^en/i.test(v.lang)) ||
        voices.find(v => /en[-_]US/i.test(v.lang)) ||
        voices.find(v => /^en/i.test(v.lang)) ||
        null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  // Call on direct user click/keydown so browsers always unlock & resume audio
  unlock() {
    this._ensureCtx();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    if (!this._unlocked) {
      this._unlocked = true;
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.resume();
          this._initVoices();
        } catch (_) { }
      }
    }
  }

  _ensureCtx() {
    if (!this.soundEnabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => { });
    }
    if (!this.noiseBuffer) {
      const sr = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, sr * 0.4, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }
    return this.ctx;
  }

  playShot(ammoType = "bullet", step = 0) {
    if (ammoType === "water") return this.playWaterBolt(step);
    if (ammoType === "laser") return this.playLaser(step);
    if (ammoType === "missile") return this.playMissileLaunch(step);
    if (ammoType === "plasma") return this.playPlasma(step);
    return this.playBullet(step);
  }

  playWaterBolt(step = 0) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const base = 460 + Math.min(step, 12) * 38;
    osc.type = "sine";
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.45, now + 0.065);
    gain.gain.setValueAtTime(0.085, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playWaterSplash() {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(260, now + 0.24);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.26);
  }

  // --------------------------------------------------------------------------
  // Cozy Procedural Rain Ambience (Stereo Rain Wash + Crisp Droplet Patters)
  // --------------------------------------------------------------------------
  _ensureRainBuffer(ctx) {
    if (this.rainBuffer) return this.rainBuffer;
    const sr = ctx.sampleRate;
    const len = sr * 4; // 4-second seamless stereo rain loop
    const buf = ctx.createBuffer(2, len, sr);
    const fadeSamples = Math.floor(sr * 0.18);

    for (let ch = 0; ch < 2; ch++) {
      const out = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
        // Blend warm pink body + light crisp white rainfall texture
        out[i] = Math.max(-0.95, Math.min(0.95, pink * 0.72 + white * 0.24));
      }
      // Crossfade loop seam so there is zero click
      for (let i = 0; i < fadeSamples; i++) {
        const t = i / fadeSamples;
        out[len - fadeSamples + i] = out[len - fadeSamples + i] * (1 - t) + out[i] * t;
      }
    }
    this.rainBuffer = buf;
    return buf;
  }

  startRainAmbience() {
    this._rainPlaying = true;
    if (!this.soundEnabled || !this.rainAmbienceEnabled) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    if (this._rainNodes) return;

    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this._ensureRainBuffer(ctx);
    src.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(320, now);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(3200, now);

    // Gentle LFO breathing on the rain shimmer
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.15, now);
    lfoGain.gain.setValueAtTime(520, now);
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.34, now + 0.45);

    src.connect(hp);
    hp.connect(lp);
    lp.connect(masterGain);
    masterGain.connect(ctx.destination);

    src.start(now);
    lfo.start(now);
    this._rainNodes = { src, lfo, masterGain };

    // Crisp, gentle raindrop patters on leaves & water
    clearInterval(this._rainDropTimer);
    this._rainDropTimer = setInterval(() => {
      if (!this._rainPlaying || !this.soundEnabled || !this.rainAmbienceEnabled || !this.ctx || this.ctx.state !== "running") return;
      if (Math.random() > 0.72) return;
      const t = this.ctx.currentTime;

      // Soft droplet plink
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const freq = 750 + Math.random() * 1400;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.48, t + 0.036);
      const vol = 0.022 + Math.random() * 0.032;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.048);

      if (typeof this.ctx.createStereoPanner === "function") {
        const pan = this.ctx.createStereoPanner();
        pan.pan.setValueAtTime((Math.random() * 2 - 1) * 0.75, t);
        osc.connect(g);
        g.connect(pan);
        pan.connect(this.ctx.destination);
      } else {
        osc.connect(g);
        g.connect(this.ctx.destination);
      }
      osc.start(t);
      osc.stop(t + 0.052);
    }, 150);
  }

  stopRainAmbience(keepIntent = false) {
    if (!keepIntent) this._rainPlaying = false;
    clearInterval(this._rainDropTimer);
    this._rainDropTimer = null;
    if (!this._rainNodes) return;
    const nodes = this._rainNodes;
    this._rainNodes = null;
    try {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        nodes.masterGain.gain.cancelScheduledValues(now);
        nodes.masterGain.gain.setValueAtTime(nodes.masterGain.gain.value, now);
        nodes.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.28);
        setTimeout(() => {
          try { nodes.src.stop(); nodes.lfo.stop(); nodes.masterGain.disconnect(); } catch (_) { }
        }, 320);
      } else {
        nodes.src.stop();
        nodes.lfo.stop();
      }
    } catch (_) { }
  }

  syncRainAmbience(shouldPlay) {
    this._rainPlaying = Boolean(shouldPlay);
    if (this._rainPlaying && this.soundEnabled && this.rainAmbienceEnabled) {
      this.startRainAmbience();
    } else {
      this.stopRainAmbience(true);
    }
  }

  playPowerUp(type = "freeze") {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = type === "heal"
      ? [523.25, 659.25, 783.99, 1046.5]
      : type === "gem"
        ? [659.25, 880, 1174.66, 1567.98]
        : [783.99, 1046.5, 1318.5, 1760]; // freeze crystalline chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === "heal" ? "triangle" : "sine";
      const t = now + idx * 0.055;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.085, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playBullet(step = 0) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400 + Math.min(step, 10) * 60, now);
    filter.Q.setValueAtTime(1.2, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.14, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.075);

    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.065);
    oGain.gain.setValueAtTime(0.12, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(oGain);
    oGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  playLaser(step = 0) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startFreq = 680 + Math.min(step, 14) * 32;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.36, now + 0.08);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playMissileLaunch(step = 0) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.14);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.1, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.16);

    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160 + Math.min(step, 8) * 10, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.11);
    oGain.gain.setValueAtTime(0.12, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(oGain);
    oGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.125);
  }

  playPlasma(step = 0) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    const f = 320 + Math.min(step, 12) * 20;
    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(f, now);
    osc1.frequency.exponentialRampToValueAtTime(f * 1.9, now + 0.05);
    osc1.frequency.exponentialRampToValueAtTime(f * 0.6, now + 0.12);

    osc2.frequency.setValueAtTime(f * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(f * 0.75, now + 0.12);

    gain.gain.setValueAtTime(0.085, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.135);
    osc2.stop(now + 0.135);
  }

  playExplosion(combo = 1, isBoss = false) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(isBoss ? 190 : 210, now);
    osc.frequency.exponentialRampToValueAtTime(isBoss ? 34 : 52, now + (isBoss ? 0.3 : 0.14));
    gain.gain.setValueAtTime(isBoss ? 0.2 : 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isBoss ? 0.32 : 0.16));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (isBoss ? 0.34 : 0.17));

    const basePitch = (isBoss ? 587.33 : 523.25) * Math.pow(1.04, Math.min(combo, 10));
    const intervals = isBoss ? [1, 1.25, 1.5] : [1, 1.25];
    intervals.forEach((mul, idx) => {
      const ch = ctx.createOscillator();
      const chGain = ctx.createGain();
      ch.type = "sine";
      const t0 = now + idx * 0.045;
      ch.frequency.setValueAtTime(basePitch * mul, t0);
      chGain.gain.setValueAtTime(0.075, t0);
      chGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
      ch.connect(chGain);
      chGain.connect(ctx.destination);
      ch.start(t0);
      ch.stop(t0 + 0.24);
    });
  }

  playBossDefeat() {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    this.playExplosion(6, true);
    const now = ctx.currentTime + 0.12;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const t = now + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  playError() {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.09);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playDamage() {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(64, now + 0.32);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playMilestoneWin() {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const t = now + i * 0.09;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  playGameOver() {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const t = now + i * 0.11;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.34);
    });
  }

  // Fallback natural US English TTS audio stream when Web Speech API is silent/unavailable
  _playAudioFallback(text) {
    try {
      if (this._audioEl) {
        this._audioEl.pause();
        this._audioEl.currentTime = 0;
      }
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
      const el = new Audio(url);
      el.referrerPolicy = "no-referrer";
      el.volume = 0.95;
      this._audioEl = el;
      el.play().catch(() => { });
    } catch (_) { }
  }

  speakWord(text, force = false, delayMs = 0) {
    if (!text) return;
    if (!force && (!this.soundEnabled || !this.autoSpeak)) return;

    clearTimeout(this._speakTimer);
    clearTimeout(this._fallbackTimer);

    const runSpeak = () => {
      const hasSpeech = "speechSynthesis" in window;
      if (!hasSpeech) {
        this._playAudioFallback(text);
        return;
      }

      try {
        // Refresh voice list in case voices finished loading asynchronously
        if (!this.preferredVoice) this._initVoices();

        const synth = window.speechSynthesis;
        const wasBusy = synth.speaking || synth.pending;
        if (wasBusy) {
          synth.cancel();
        }
        if (synth.paused) {
          synth.resume();
        }

        const fireUtterance = () => {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = "en-US";
          utter.rate = text.includes(" ") ? 0.92 : 0.94;
          utter.pitch = 1.0;
          utter.volume = 1.0;
          if (this.preferredVoice) {
            utter.voice = this.preferredVoice;
          }

          let started = false;
          utter.onstart = () => {
            started = true;
            clearTimeout(this._fallbackTimer);
          };
          utter.onerror = () => {
            if (!started) {
              clearTimeout(this._fallbackTimer);
              this._playAudioFallback(text);
            }
          };

          // Pin reference on instance so Chrome GC doesn't kill utterance mid-speech
          this._activeUtter = utter;
          synth.speak(utter);

          // Watchdog: if Chrome/Windows SpeechSynthesis silently drops the utterance,
          // automatically play natural US English audio stream instead!
          this._fallbackTimer = setTimeout(() => {
            if (!started && !synth.speaking) {
              this._playAudioFallback(text);
            }
          }, 420);
        };

        // Chrome bug workaround: wait ~45ms after cancel() before calling speak()
        if (wasBusy) {
          this._speakTimer = setTimeout(fireUtterance, 45);
        } else {
          fireUtterance();
        }
      } catch (_) {
        this._playAudioFallback(text);
      }
    };

    if (delayMs > 0) {
      this._speakTimer = setTimeout(runSpeak, delayMs);
    } else {
      runSpeak();
    }
  }
}

window.GameAudio = GameAudio;
