// Web Audio API sound & music synthesizer - zero external files, instantaneous playback
let audioCtx = null;
let bgmGainNode = null;
let bgmInterval = null;
let isBgmPlaying = false;
let masterGainNode = null;
let sfxVolume = 0.7;
let musicVolume = 0.5;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      masterGainNode.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Master volume control
export function setMasterVolume(volume) {
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
}

// SFX volume control
export function setSfxVolume(volume) {
  sfxVolume = Math.max(0, Math.min(1, volume));
}

// Music volume control
export function setMusicVolume(volume) {
  musicVolume = Math.max(0, Math.min(1, volume));
  if (bgmGainNode && audioCtx) {
    bgmGainNode.gain.setValueAtTime(musicVolume * 0.04, audioCtx.currentTime);
  }
}

// Procedural soothing background music engine
export function startBgm(enabled = true) {
  if (!enabled || isBgmPlaying) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.setValueAtTime(musicVolume * 0.04, ctx.currentTime);
    bgmGainNode.connect(masterGainNode);

    // Warm chord progression (Cmaj7 -> Am7 -> Fmaj7 -> Gsus4)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C, E, G, B
      [220.00, 261.63, 329.63, 392.00], // A, C, E, G
      [174.61, 220.00, 261.63, 329.63], // F, A, C, E
      [196.00, 261.63, 293.66, 392.00]  // G, C, D, G
    ];

    let chordIdx = 0;
    let stepIdx = 0;

    const playArpStep = () => {
      if (!isBgmPlaying || !audioCtx) return;
      const now = ctx.currentTime;
      const chord = chords[chordIdx];
      const freq = chord[stepIdx % chord.length];

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(0.5, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.025, now + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(bgmGainNode);

      osc.start(now);
      osc.stop(now + 0.7);

      stepIdx++;
      if (stepIdx % 4 === 0) {
        chordIdx = (chordIdx + 1) % chords.length;
      }
    };

    isBgmPlaying = true;
    playArpStep();
    bgmInterval = setInterval(playArpStep, 500);
  } catch {
    // Graceful fallback
  }
}

export function stopBgm() {
  isBgmPlaying = false;
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  if (bgmGainNode && audioCtx) {
    try {
      bgmGainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        try { bgmGainNode.disconnect(); } catch {}
        bgmGainNode = null;
      }, 550);
    } catch {
      bgmGainNode = null;
    }
  }
}

export function playSound(type, enabled = true, sfxVolumeParam) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const vol = Math.max(0, Math.min(1, sfxVolumeParam !== undefined ? sfxVolumeParam : sfxVolume));

    const createNote = (freq, startTime, duration, oscType = 'sine', gainValue = 0.08, rampType = 'exponential') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      if (rampType === 'linear') {
        gain.gain.linearRampToValueAtTime(gainValue * vol, startTime + 0.05);
      } else {
        gain.gain.exponentialRampToValueAtTime(gainValue * vol, startTime + 0.05);
      }
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(masterGainNode);
      osc.start(startTime);
      osc.stop(startTime + duration);
      return osc;
    };

    if (type === 'move') {
      // Soft subtle movement tick
      createNote(320, now, 0.06, 'sine', 0.035);
    } else if (type === 'eat') {
      // Cheerful chime: ascending arpeggio with soft sparkle
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        createNote(freq, now + idx * 0.055, 0.25, 'triangle', 0.1);
      });
      // Add a subtle sparkle layer
      setTimeout(() => {
        createNote(1318.51, ctx.currentTime, 0.15, 'sine', 0.06);
      }, 120);
    } else if (type === 'portalOpen') {
      // Magical harmonic portal swirl
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        createNote(freq, now + idx * 0.065, 0.4, 'sine', 0.08);
      });
      // Low hum
      createNote(110, now, 1.2, 'sine', 0.03);
    } else if (type === 'star') {
      // Crisp celebratory bell chime
      createNote(880, now, 0.4, 'triangle', 0.12);
      createNote(1320, now + 0.05, 0.35, 'triangle', 0.08);
      createNote(1760, now + 0.1, 0.3, 'triangle', 0.06);
    } else if (type === 'complete') {
      // Victory Fanfare: ascending harmonic chord
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        createNote(freq, now + idx * 0.07, 0.5, 'triangle', 0.1);
      });
      // Bass foundation
      createNote(130.81, now, 1.5, 'sine', 0.05);
      createNote(196.00, now + 0.2, 1.2, 'sine', 0.04);
    } else if (type === 'fail') {
      // Gentle cartoon bump
      createNote(160, now, 0.25, 'sawtooth', 0.1);
      createNote(120, now + 0.05, 0.2, 'sawtooth', 0.07);
      createNote(80, now + 0.1, 0.15, 'sawtooth', 0.05);
    } else if (type === 'undo') {
      // Soft rewind sound
      createNote(480, now, 0.1, 'sine', 0.05);
      createNote(360, now + 0.04, 0.08, 'sine', 0.04);
      createNote(280, now + 0.08, 0.06, 'sine', 0.03);
    } else if (type === 'boost') {
      // Power-up activation
      createNote(320, now, 0.3, 'triangle', 0.1);
      createNote(480, now + 0.05, 0.25, 'triangle', 0.08);
      createNote(720, now + 0.1, 0.2, 'triangle', 0.06);
      createNote(960, now + 0.15, 0.15, 'triangle', 0.05);
    } else if (type === 'click') {
      // UI click
      createNote(640, now, 0.03, 'sine', 0.02);
    } else if (type === 'levelUp') {
      // Level up fanfare
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        createNote(freq, now + idx * 0.05, 0.35, 'triangle', 0.08);
      });
    }
  } catch {
    // Graceful fallback
  }
}

// Initialize audio on first user interaction
export function initAudio() {
  getAudioContext();
}