/**
 * Cozy Web Audio API synthesizer for sound effects.
 * Requires no external audio files, works 100% offline and reliably.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public sfxVolume: number = 0.8;
  public musicVolume: number = 0.5;
  private ambientTimer: number | null = null;
  public isMusicPlaying: boolean = false;

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
  }

  public toggleMusic(enable?: boolean) {
    const target = enable !== undefined ? enable : !this.isMusicPlaying;
    if (target) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  public startAmbientMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.initCtx();

    // Gentle cozy chord progression: Cmaj7 - Am7 - Dm7 - G7
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.enabled || !this.isMusicPlaying || this.musicVolume <= 0) return;
      this.initCtx();
      if (!this.ctx) return;

      const chord = chords[chordIdx % chords.length];
      chordIdx++;
      const now = this.ctx.currentTime;

      chord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);

        const vol = 0.035 * this.musicVolume;
        gain.gain.setValueAtTime(0.001, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(vol, now + i * 0.15 + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 3.8);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 4.0);
      });
    };

    playChord();
    this.ambientTimer = window.setInterval(playChord, 4200);
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.ambientTimer !== null) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  public playStep() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

    gain.gain.setValueAtTime(0.04 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playPlant() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0.1 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playWater() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + i * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500 + Math.random() * 200, startTime);
      osc.frequency.exponentialRampToValueAtTime(300, startTime + 0.08);

      gain.gain.setValueAtTime(0.06 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.08);
    }
  }

  public playHarvest() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.09 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  public playCoin() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
  }

  public playMeow() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.linearRampToValueAtTime(750, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.35);

    gain.gain.setValueAtTime(0.01 * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0.1 * this.sfxVolume, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playSleep() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [392.0, 329.63, 261.63]; // G4, E4, C4
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.18;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  public playHeart() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [587.33, 880.0];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  public playSnip() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);

    gain.gain.setValueAtTime(0.07 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playBubble() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playBuild() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playCheer() {
    if (!this.enabled || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + i * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.1 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }
}

export const soundManager = new SoundManager();
