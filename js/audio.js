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
    this._pianoTimer = null;
    this._pianoStep = 0;
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
      this.ctx.resume().catch(() => { });
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
  // Cozy Rain Ambience: Gentle Window Drizzle + "Tí Tách" Drops + Felt Piano
  // --------------------------------------------------------------------------
  _ensureRainBuffer(ctx) {
    if (this.rainBuffer) return this.rainBuffer;
    const sr = ctx.sampleRate;
    const len = sr * 5; // 5-second seamless velvety stereo drizzle loop
    const buf = ctx.createBuffer(2, len, sr);
    const fadeSamples = Math.floor(sr * 0.25);

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
        // Pure velvety pink noise — zero harsh white-noise hiss
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.068;
        b6 = white * 0.115926;
      }
      for (let i = 0; i < fadeSamples; i++) {
        const t = i / fadeSamples;
        out[len - fadeSamples + i] = out[len - fadeSamples + i] * (1 - t) + out[i] * t;
      }
    }
    this.rainBuffer = buf;
    return buf;
  }

  // Synthesize a warm, intimate felt-piano note routed through the stereo ambience bus
  _playFeltPianoNote(freq, velocity = 0.048, duration = 2.9, panVal = 0) {
    if (!this.ctx || !this._rainNodes || this.ctx.state !== "running") return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dest = this._rainNodes.pianoBus;

    const oscBody = ctx.createOscillator();
    const oscFund = ctx.createOscillator();
    const oscHarm = ctx.createOscillator();
    oscBody.type = "triangle";
    oscFund.type = "sine";
    oscHarm.type = "sine";
    oscBody.frequency.setValueAtTime(freq, now);
    oscFund.frequency.setValueAtTime(freq, now);
    oscHarm.frequency.setValueAtTime(freq * 2, now);

    const gBody = ctx.createGain();
    const gFund = ctx.createGain();
    const gHarm = ctx.createGain();
    gBody.gain.setValueAtTime(0.4, now);
    gFund.gain.setValueAtTime(0.7, now);
    gHarm.gain.setValueAtTime(0.15, now);
    gHarm.gain.exponentialRampToValueAtTime(0.001, now + Math.min(0.75, duration * 0.32));

    // Soft felt-hammer lowpass filter warming smoothly as the string decays
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(Math.min(1850, freq * 3.8), now);
    lp.frequency.exponentialRampToValueAtTime(Math.max(460, freq * 1.5), now + duration * 0.72);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(velocity, now + 0.022);
    env.gain.exponentialRampToValueAtTime(velocity * 0.44, now + 0.52);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscBody.connect(gBody);
    oscFund.connect(gFund);
    oscHarm.connect(gHarm);
    gBody.connect(lp);
    gFund.connect(lp);
    gHarm.connect(lp);
    lp.connect(env);

    if (typeof ctx.createStereoPanner === "function") {
      const pan = ctx.createStereoPanner();
      pan.pan.setValueAtTime(panVal, now);
      env.connect(pan);
      pan.connect(dest);
    } else {
      env.connect(dest);
    }

    oscBody.start(now);
    oscFund.start(now);
    oscHarm.start(now);
    const stopAt = now + duration + 0.06;
    oscBody.stop(stopAt);
    oscFund.stop(stopAt);
    oscHarm.stop(stopAt);
  }

  // Organic single raindrop "tí tách" (delicate filtered tap + soft water droplet)
  _playSoftRaindrop() {
    if (!this.ctx || !this._rainNodes || this.ctx.state !== "running") return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const dest = this._rainNodes.masterGain;
    const panVal = (Math.random() * 2 - 1) * 0.82;

    const connectOut = node => {
      if (typeof ctx.createStereoPanner === "function") {
        const pan = ctx.createStereoPanner();
        pan.pan.setValueAtTime(panVal, now);
        node.connect(pan);
        pan.connect(dest);
      } else {
        node.connect(dest);
      }
    };

    if (Math.random() < 0.64 && this.noiseBuffer) {
      // Tiny raindrop tap on a leaf / windowpane
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(1450 + Math.random() * 2300, now);
      bp.Q.setValueAtTime(5 + Math.random() * 4.5, now);
      const g = ctx.createGain();
      const vol = 0.036 + Math.random() * 0.044;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.02 + Math.random() * 0.018);
      n.connect(bp);
      bp.connect(g);
      connectOut(g);
      n.start(now, Math.random() * 0.25, 0.045);
    } else {
      // Soft water droplet "tách"
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const baseF = 640 + Math.random() * 820;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseF, now);
      osc.frequency.exponentialRampToValueAtTime(baseF * (1.35 + Math.random() * 0.22), now + 0.03);
      const vol = 0.012 + Math.random() * 0.015;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(g);
      connectOut(g);
      osc.start(now);
      osc.stop(now + 0.046);
    }
  }

  startRainAmbience() {
    this._rainPlaying = true;
    if (!this.soundEnabled || !this.rainAmbienceEnabled) return;
    const ctx = this._ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => { });
    }
    if (this._rainNodes) return;

    const now = ctx.currentTime;

    // Master ambience bus (smooth fade-in / fade-out)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(1.0, now + 0.75);
    masterGain.connect(ctx.destination);

    // Layer 1: Whisper-soft drizzle behind a window (gentle, never noisy)
    const src = ctx.createBufferSource();
    src.buffer = this._ensureRainBuffer(ctx);
    src.loop = true;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(380, now);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1450, now);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.11, now);
    lfoGain.gain.setValueAtTime(220, now);
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);

    const rainBedGain = ctx.createGain();
    rainBedGain.gain.setValueAtTime(0.075, now);

    src.connect(hp);
    hp.connect(lp);
    lp.connect(rainBedGain);
    rainBedGain.connect(masterGain);

    // Layer 3 Bus: Dreamy stereo echo/reverb for the felt piano
    const pianoBus = ctx.createGain();
    pianoBus.gain.setValueAtTime(1.0, now);
    pianoBus.connect(masterGain);

    const delayL = ctx.createDelay(1.0);
    const delayR = ctx.createDelay(1.0);
    delayL.delayTime.setValueAtTime(0.36, now);
    delayR.delayTime.setValueAtTime(0.52, now);

    const fbFilter = ctx.createBiquadFilter();
    fbFilter.type = "lowpass";
    fbFilter.frequency.setValueAtTime(1100, now);

    const fbGain = ctx.createGain();
    fbGain.gain.setValueAtTime(0.32, now);

    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(0.46, now);

    pianoBus.connect(delayL);
    delayL.connect(fbFilter);
    fbFilter.connect(delayR);
    delayR.connect(fbGain);
    fbGain.connect(delayL);
    delayL.connect(wetGain);
    delayR.connect(wetGain);
    wetGain.connect(masterGain);

    src.start(now);
    lfo.start(now);
    this._rainNodes = { src, lfo, masterGain, pianoBus, fbGain, wetGain };

    // Layer 2: Organic randomized "tí tách" raindrop loop
    clearTimeout(this._rainDropTimer);
    const scheduleDrop = () => {
      if (!this._rainPlaying || !this._rainNodes) return;
      if (this.soundEnabled && this.rainAmbienceEnabled) {
        this._playSoftRaindrop();
        if (Math.random() < 0.28) {
          setTimeout(() => {
            if (this._rainPlaying && this._rainNodes) this._playSoftRaindrop();
          }, 42 + Math.random() * 58);
        }
      }
      this._rainDropTimer = setTimeout(scheduleDrop, 90 + Math.random() * 200);
    };
    this._rainDropTimer = setTimeout(scheduleDrop, 100);

    // Layer 3: Gentle 8-bar rainy-evening felt piano melody (C major / A minor)
    const bars = [
      { bass: [174.61, 261.63], notes: [440.00, 392.00, 329.63, null] },   // Fmaj7: A4 G4 E4 -
      { bass: [164.81, 246.94], notes: [392.00, 329.63, 293.66, null] },   // Em7:   G4 E4 D4 -
      { bass: [110.00, 164.81, 246.94], notes: [523.25, 493.88, 392.00, 329.63] }, // Am9: C5 B4 G4 E4
      { bass: [146.83, 220.00], notes: [349.23, 329.63, 293.66, null] },   // Dm9:   F4 E4 D4 -
      { bass: [174.61, 261.63], notes: [659.25, 587.33, 523.25, 440.00] }, // Fmaj9: E5 D5 C5 A4
      { bass: [164.81, 196.00], notes: [392.00, 440.00, 493.88, null] },   // Cmaj7/E: G4 A4 B4 -
      { bass: [146.83, 220.00], notes: [523.25, 440.00, 392.00, 329.63] }, // Dm7:   C5 A4 G4 E4
      { bass: [130.81, 196.00, 293.66], notes: [329.63, 392.00, null, null] } // Cmaj9: E4 G4 - -
    ];

    clearTimeout(this._pianoTimer);
    const schedulePiano = () => {
      if (!this._rainPlaying || !this._rainNodes) return;
      if (this.soundEnabled && this.rainAmbienceEnabled && this.ctx && this.ctx.state === "running") {
        const barIdx = Math.floor(this._pianoStep / 4) % bars.length;
        const beat = this._pianoStep % 4;
        const bar = bars[barIdx];

        if (beat === 0) {
          // Soft rolled left-hand chord on bar start
          bar.bass.forEach((f, idx) => {
            setTimeout(() => {
              if (this._rainPlaying && this._rainNodes) {
                this._playFeltPianoNote(f, idx === 0 ? 0.048 : 0.032, 3.8, -0.24 + idx * 0.08);
              }
            }, idx * 75);
          });
        }

        const melFreq = bar.notes[beat];
        if (melFreq) {
          const vel = (beat === 0 ? 0.042 : 0.034) * (0.88 + Math.random() * 0.22);
          const delayMs = beat === 0 ? 190 : 0;
          setTimeout(() => {
            if (this._rainPlaying && this._rainNodes) {
              this._playFeltPianoNote(melFreq, vel, 2.7 + Math.random() * 0.8, 0.14 + (Math.random() - 0.5) * 0.25);
            }
          }, delayMs);
        }
        this._pianoStep++;
      }
      // Relaxed, unhurried rubato pacing (~0.92s - 1.12s per beat)
      this._pianoTimer = setTimeout(schedulePiano, 920 + Math.random() * 200);
    };
    this._pianoTimer = setTimeout(schedulePiano, 260);
  }

  stopRainAmbience(keepIntent = false) {
    if (!keepIntent) this._rainPlaying = false;
    clearTimeout(this._rainDropTimer);
    clearTimeout(this._pianoTimer);
    this._rainDropTimer = null;
    this._pianoTimer = null;
    if (!this._rainNodes) return;
    const nodes = this._rainNodes;
    this._rainNodes = null;
    try {
      if (this.ctx) {
        const now = this.ctx.currentTime;
        nodes.masterGain.gain.cancelScheduledValues(now);
        nodes.masterGain.gain.setValueAtTime(nodes.masterGain.gain.value, now);
        nodes.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.45);
        setTimeout(() => {
          try {
            nodes.src.stop();
            nodes.lfo.stop();
            nodes.fbGain.disconnect();
            nodes.wetGain.disconnect();
            nodes.masterGain.disconnect();
          } catch (_) { }
        }, 500);
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
