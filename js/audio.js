/* ==========================================================================
   Procedural Web Audio SFX + Web Speech API English Pronunciation
   ========================================================================== */

class GameAudio {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.autoSpeak = true;
    this.preferredVoice = null;
    this._initVoices();
  }

  _initVoices() {
    if (!("speechSynthesis" in window)) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      if (!voices.length) return;
      // Prefer crisp natural English voices
      this.preferredVoice =
        voices.find(v => /en[-_]US/i.test(v.lang) && /Google|Natural|Aria|Jenny|Zira|Samantha/i.test(v.name)) ||
        voices.find(v => /en[-_]US/i.test(v.lang)) ||
        voices.find(v => /^en/i.test(v.lang)) ||
        null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  _ensureCtx() {
    if (!this.soundEnabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playLaser(step = 0) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startFreq = 620 + Math.min(step, 12) * 35;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.42, now + 0.075);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
  }

  playExplosion(combo = 1) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Soft pop burst
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.16);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);

    // 2. Pleasant reward chime scaling gently with combo
    const basePitch = 523.25 * Math.pow(1.045, Math.min(combo, 10)); // C5 upward
    [basePitch, basePitch * 1.25].forEach((freq, idx) => {
      const ch = ctx.createOscillator();
      const chGain = ctx.createGain();
      ch.type = "sine";
      const t0 = now + idx * 0.045;
      ch.frequency.setValueAtTime(freq, t0);
      chGain.gain.setValueAtTime(0.085, t0);
      chGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
      ch.connect(chGain);
      chGain.connect(ctx.destination);
      ch.start(t0);
      ch.stop(t0 + 0.24);
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
    osc.frequency.linearRampToValueAtTime(115, now + 0.09);
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
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.32);
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
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
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

  speakWord(word, force = false) {
    if (!("speechSynthesis" in window)) return;
    if (!force && (!this.soundEnabled || !this.autoSpeak)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = "en-US";
      utter.rate = 0.96;
      utter.pitch = 1.0;
      utter.volume = 0.92;
      if (this.preferredVoice) {
        utter.voice = this.preferredVoice;
      }
      window.speechSynthesis.speak(utter);
    } catch (_) {
      // Ignore speech synthesis failures gracefully
    }
  }
}

window.GameAudio = GameAudio;
