/** Procedural lo-fi loop and soft alarm built with Web Audio — no external files needed. */
let ctx: AudioContext | null = null;
let music: { stop: () => void } | null = null;

const getCtx = () => {
  try {
    ctx ??= new AudioContext();
    void ctx.resume().catch(() => undefined);
    return ctx;
  } catch { return null; }
};

/** Call from a user gesture so browsers allow playback later. */
export const unlockAudio = () => { getCtx(); };

const CHORDS = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 349.23], // G7
];
const BEAT = 0.75; // seconds per beat (~80 bpm)

export const startMusic = () => {
  const c = getCtx();
  if (!c || music) return;
  const master = c.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.18, c.currentTime + 2);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1400;
  filter.connect(master);
  master.connect(c.destination);

  // vinyl crackle / hiss
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.001 ? 0.6 : 0.03);
  const noise = c.createBufferSource();
  noise.buffer = buf; noise.loop = true;
  const ng = c.createGain(); ng.gain.value = 0.25;
  noise.connect(ng); ng.connect(master); noise.start();

  let next = c.currentTime + 0.1;
  let bar = 0;
  const schedule = () => {
    while (next < c.currentTime + 2) {
      const chord = CHORDS[bar % CHORDS.length];
      const len = BEAT * 4;
      chord.forEach((f, i) => {
        const o = c.createOscillator(); const g = c.createGain();
        o.type = i === 0 ? "triangle" : "sine";
        o.frequency.value = i === 0 ? f / 2 : f;
        o.detune.value = (Math.random() - 0.5) * 8;
        g.gain.setValueAtTime(0, next);
        g.gain.linearRampToValueAtTime(0.09, next + 0.4);
        g.gain.linearRampToValueAtTime(0.0001, next + len);
        o.connect(g); g.connect(filter); o.start(next); o.stop(next + len + 0.05);
      });
      // soft melody pluck on beats
      for (let b = 0; b < 4; b++) {
        if (Math.random() < 0.45) continue;
        const t = next + b * BEAT;
        const o = c.createOscillator(); const g = c.createGain();
        o.type = "sine"; o.frequency.value = chord[Math.floor(Math.random() * 4)] * 2;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        o.connect(g); g.connect(filter); o.start(t); o.stop(t + 1);
      }
      next += len; bar++;
    }
  };
  schedule();
  const id = setInterval(schedule, 500);
  music = {
    stop: () => {
      clearInterval(id);
      const t = c.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.8);
      setTimeout(() => { noise.stop(); master.disconnect(); }, 900);
    },
  };
};

export const stopMusic = () => { music?.stop(); music = null; };

/** Gentle chime repeated for about five seconds. */
export const playAlarm = (seconds = 5) => {
  const c = getCtx();
  if (!c) return;
  const notes = [880, 1108.73, 1318.51];
  for (let t = 0; t < seconds; t += 1.25) {
    notes.forEach((f, i) => {
      const at = c.currentTime + t + i * 0.15;
      const o = c.createOscillator(); const g = c.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.12, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1);
      o.connect(g); g.connect(c.destination); o.start(at); o.stop(at + 1.05);
    });
  }
};
