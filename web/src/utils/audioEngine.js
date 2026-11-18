// Web Audio API Engine for ZEEKS Studio Showcase
// Generates live synthesized audio tracks and performs real-time stereo FFT/RMS analysis

class StudioAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.splitter = null;
    this.analyserL = null;
    this.analyserR = null;
    this.dataArrayL = null;
    this.dataArrayR = null;
    this.isPlaying = false;
    this.currentTrack = 'synthwave'; // 'synthwave' | 'techno' | 'ambient' | 'sine1k' | 'custom'
    this.tempo = 122;
    this.timerId = null;
    this.currentStep = 0;
    this.customAudioBuffer = null;
    this.customSourceNode = null;
    this.onEndedCallback = null;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    // Stereo Analysers
    this.splitter = this.ctx.createChannelSplitter(2);
    this.analyserL = this.ctx.createAnalyser();
    this.analyserR = this.ctx.createAnalyser();

    this.analyserL.fftSize = 512;
    this.analyserR.fftSize = 512;
    this.analyserL.smoothingTimeConstant = 0.3;
    this.analyserR.smoothingTimeConstant = 0.3;

    // Connect Splitter -> Analysers
    this.masterGain.connect(this.splitter);
    this.splitter.connect(this.analyserL, 0);
    this.splitter.connect(this.analyserR, 1);

    // Connect Master to Speakers
    this.masterGain.connect(this.ctx.destination);

    this.dataArrayL = new Float32Array(this.analyserL.fftSize);
    this.dataArrayR = new Float32Array(this.analyserR.fftSize);
  }

  setGain(val) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1.5, val));
    this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
  }

  async resume() {
    this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  playTrack(trackName) {
    this.resume();
    this.stop();
    this.currentTrack = trackName;
    this.isPlaying = true;

    if (trackName === 'sine1k') {
      this.startSineTone(1000);
    } else if (trackName === 'custom' && this.customAudioBuffer) {
      this.playCustomBuffer();
    } else {
      this.startBeatLoop(trackName);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.sineOsc) {
      try { this.sineOsc.stop(); } catch (e) {}
      this.sineOsc = null;
    }
    if (this.customSourceNode) {
      try { this.customSourceNode.stop(); } catch (e) {}
      this.customSourceNode = null;
    }
    this.currentStep = 0;
  }

  startSineTone(freq = 1000) {
    if (!this.ctx) return;
    this.sineOsc = this.ctx.createOscillator();
    const sineGain = this.ctx.createGain();
    this.sineOsc.type = 'sine';
    this.sineOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Reference -10 dBFS
    sineGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.sineOsc.connect(sineGain);
    sineGain.connect(this.masterGain);
    this.sineOsc.start();
  }

  startBeatLoop(preset = 'synthwave') {
    const bpm = preset === 'techno' ? 128 : (preset === 'ambient' ? 95 : 122);
    const stepIntervalMs = (60 / bpm / 4) * 1000; // 16th note interval

    this.timerId = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.scheduleStep(this.currentStep, now, preset);
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepIntervalMs);
  }

  scheduleStep(step, time, preset) {
    // Kick drum: 4 on the floor (steps 0, 4, 8, 12)
    if (step % 4 === 0) {
      this.triggerKick(time, preset);
    }

    // Snare / Clap on steps 4, 12 (techno/synthwave)
    if (step === 4 || step === 12) {
      this.triggerSnare(time, preset);
    }

    // Hi-hats
    if (step % 2 === 0 || (preset === 'synthwave' && step % 4 === 2)) {
      this.triggerHat(time, step % 4 === 2);
    }

    // Bassline and Synths
    this.triggerBass(step, time, preset);
    this.triggerArp(step, time, preset);
  }

  triggerKick(time, preset) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = preset === 'techno' ? 160 : 130;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  triggerSnare(time, preset) {
    // Filtered noise buffer
    const bufferSize = this.ctx.sampleRate * 0.15;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.19);
  }

  triggerHat(time, open = false) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, time);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const dur = open ? 0.12 : 0.04;
    gain.gain.setValueAtTime(open ? 0.22 : 0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  triggerBass(step, time, preset) {
    const bassNotes = preset === 'techno' 
      ? [55, 55, 65, 55, 55, 73, 55, 49]
      : [65.4, 65.4, 77.8, 65.4, 87.3, 87.3, 77.8, 98.0]; // C2, Eb2, F2, G2

    const note = bassNotes[(step) % bassNotes.length];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(note, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(preset === 'ambient' ? 380 : 750, time);
    filter.Q.setValueAtTime(4, time);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.19);
  }

  triggerArp(step, time, preset) {
    if (preset === 'ambient' && step % 4 !== 0) return;

    // Harmonic scale (Minor pentatonic: C4, Eb4, F4, G4, Bb4, C5)
    const scale = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 622.25];
    const note = scale[(step * 3) % scale.length];

    const osc = this.ctx.createOscillator();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const gain = this.ctx.createGain();

    osc.type = preset === 'ambient' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(note, time);

    // Pan alternating left/right to excite stereo channels!
    if (panner) {
      const panVal = Math.sin(step * 0.8) * 0.7; // -0.7 to +0.7
      panner.pan.setValueAtTime(panVal, time);
    }

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    if (panner) {
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.23);
  }

  // Load custom audio file
  async loadCustomFile(file) {
    this.resume();
    const arrayBuffer = await file.arrayBuffer();
    this.customAudioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.playTrack('custom');
    return {
      duration: this.customAudioBuffer.duration,
      name: file.name,
      channels: this.customAudioBuffer.numberOfChannels
    };
  }

  playCustomBuffer() {
    if (!this.customAudioBuffer || !this.ctx) return;
    this.customSourceNode = this.ctx.createBufferSource();
    this.customSourceNode.buffer = this.customAudioBuffer;
    this.customSourceNode.loop = true;
    this.customSourceNode.connect(this.masterGain);
    this.customSourceNode.start(0);
  }

  // Real-time stereo meter telemetry
  getMeters() {
    if (!this.analyserL || !this.analyserR) {
      return { leftDb: -60, rightDb: -60, leftPeak: -60, rightPeak: -60, isPlaying: false };
    }

    this.analyserL.getFloatTimeDomainData(this.dataArrayL);
    this.analyserR.getFloatTimeDomainData(this.dataArrayR);

    // Calculate RMS and Peak for Left
    let sumSquaresL = 0;
    let peakL = 0;
    for (let i = 0; i < this.dataArrayL.length; i++) {
      const absVal = Math.abs(this.dataArrayL[i]);
      if (absVal > peakL) peakL = absVal;
      sumSquaresL += absVal * absVal;
    }
    const rmsL = Math.sqrt(sumSquaresL / this.dataArrayL.length);

    // Calculate RMS and Peak for Right
    let sumSquaresR = 0;
    let peakR = 0;
    for (let i = 0; i < this.dataArrayR.length; i++) {
      const absVal = Math.abs(this.dataArrayR[i]);
      if (absVal > peakR) peakR = absVal;
      sumSquaresR += absVal * absVal;
    }
    const rmsR = Math.sqrt(sumSquaresR / this.dataArrayR.length);

    // Convert RMS to VU dB scale (reference 0 VU = -14 dBFS standard pro audio)
    // -20 dB to +3 dB
    const rmsToVuDb = (rms) => {
      if (rms < 0.0001) return -40;
      const dbfs = 20 * Math.log10(rms);
      // Offset so that typical mastered/synth level sits comfortably around -3 to 0 VU
      return dbfs + 14;
    };

    const peakToDb = (peak) => {
      if (peak < 0.0001) return -50;
      return 20 * Math.log10(peak) + 14;
    };

    return {
      leftDb: rmsToVuDb(rmsL),
      rightDb: rmsToVuDb(rmsR),
      leftPeak: peakToDb(peakL),
      rightPeak: peakToDb(peakR),
      isPlaying: this.isPlaying,
    };
  }
}

export const studioAudio = new StudioAudioEngine();
