/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private heartbeatTimer: number | null = null;

  constructor() {}

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.startAmbientHeartbeat();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private startAmbientHeartbeat() {
    if (!this.ctx || !this.masterGain) return;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    const beat = () => {
      if (!this.ctx || !this.ambientGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      this.playHeartbeatThud(now, 55, 0.18);
      this.playHeartbeatThud(now + 0.28, 48, 0.15);
    };

    this.heartbeatTimer = window.setInterval(beat, 1800);
  }

  private playHeartbeatThud(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.ambientGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(28, time + duration);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  public playSwimWhip() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playBoost() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);
    filter.Q.value = 3.0;

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playRivalHit() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Punchy cartoon impact thwack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playRivalSpinout() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Comical dizzy cartoon spinout whoop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(780, this.ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.38);
  }

  public playPenisLaunchBurst() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Supersonic ejaculatory launch explosion whoosh
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 1.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 1.2);
    osc2.stop(this.ctx.currentTime + 1.2);
  }

  public playAimSwoosh() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playMissBounce() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Comical rubbery cartoon bounce
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(380, this.ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  public playDirectHitSuccess() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Splashdown fanfare
    const notes = [659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const st = this.ctx.currentTime + idx * 0.06;
      gain.gain.setValueAtTime(0.25, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(st);
      osc.stop(st + 0.45);
    });
  }

  public playZoneTransition() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const st = this.ctx.currentTime + idx * 0.07;
      gain.gain.setValueAtTime(0.18, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(st);
      osc.stop(st + 0.38);
    });
  }

  public playCollectATP(combo = 0) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const baseFreq = notes[Math.min(combo, notes.length - 1)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  public playPowerUp() {
    this.playPowerUpCollect('ENERGY_SPHERE');
  }

  public playPowerUpCollect(type: 'ENERGY_SPHERE' | 'SHIELD_BUBBLE' | 'GUIDANCE_CRYSTAL') {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    if (type === 'SHIELD_BUBBLE') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } else if (type === 'ENERGY_SPHERE') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } else {
      const freqs = [880, 1174, 1396, 1760];
      freqs.forEach((f, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        const st = this.ctx.currentTime + idx * 0.05;
        gain.gain.setValueAtTime(0.18, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(st);
        osc.stop(st + 0.32);
      });
    }
  }

  public playShieldDeflect() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  public playSurgeWhoosh(isForward: boolean) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isForward ? 80 : 160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isForward ? 300 : 70, this.ctx.currentTime + 0.5);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.55);
  }

  public playHitObstacle() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playLevelClear() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = this.ctx.currentTime + idx * 0.1;
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  public playVictoryFanfare() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const victoryMelody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.5, d: 0.45 },
      { f: 880.0, d: 0.2 },
      { f: 1046.5, d: 0.6 },
    ];

    let t = this.ctx.currentTime + 0.05;
    victoryMelody.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = note.f;

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + note.d);

      t += note.d * 0.9;
    });
  }

  public dispose() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundManager = new SoundManager();
