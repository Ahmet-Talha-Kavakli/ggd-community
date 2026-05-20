// Web Audio API ile programatik ses efektleri. Dosya indirme yok.
// Profilden açılır; default kapalıdır.
//
// Tasarım: yumuşak, mat tonlar (kare/triangle yerine sine/triangle karışımı),
// her tıklamada ±randomization ile robotik hissi kırılır, butonun rolüne
// göre farklı palet seçilir.

const STORAGE_KEY = "goose-sounds-enabled";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  window.dispatchEvent(
    new CustomEvent("goose-sounds-changed", { detail: { enabled } }),
  );
}

type Tone = {
  freq: number;
  toFreq?: number; // varsa frekans kayar (slide)
  duration: number;
  type?: OscillatorType;
  volume?: number;
  delay?: number;
  attack?: number; // saniye
};

function playTones(tones: Tone[]) {
  if (!isSoundEnabled()) return;
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") audio.resume().catch(() => {});

  const now = audio.currentTime;
  for (const t of tones) {
    const start = now + (t.delay ?? 0);
    const stop = start + t.duration;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = t.type ?? "sine";

    osc.frequency.setValueAtTime(t.freq, start);
    if (t.toFreq != null) {
      osc.frequency.exponentialRampToValueAtTime(t.toFreq, stop);
    }

    const vol = t.volume ?? 0.05;
    const attack = t.attack ?? 0.008;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, stop);

    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(stop + 0.02);
  }
}

// Hafif randomizasyon — aynı sesi peş peşe basınca sıkıcı olmasın
function jitter(base: number, range = 30): number {
  return base + (Math.random() - 0.5) * range * 2;
}

// ----------------------------------------------------------------------------
// Palet — yumuşak, mat sesler
// ----------------------------------------------------------------------------

// Default tıklama — kısa, sıcak, dokunmatik hissi
export function playTap() {
  playTones([
    {
      freq: jitter(380, 20),
      toFreq: jitter(280, 20),
      duration: 0.05,
      type: "sine",
      volume: 0.04,
      attack: 0.003,
    },
  ]);
}

// Birincil aksiyon — yuvarlak "pop"
export function playPop() {
  playTones([
    {
      freq: jitter(480, 20),
      toFreq: jitter(360, 20),
      duration: 0.07,
      type: "sine",
      volume: 0.05,
      attack: 0.004,
    },
    {
      freq: jitter(720, 30),
      duration: 0.04,
      type: "sine",
      volume: 0.02,
      delay: 0.01,
      attack: 0.002,
    },
  ]);
}

// Yumuşak nokta atışı — link/nav clicks
export function playClick() {
  playTones([
    {
      freq: jitter(440, 25),
      duration: 0.04,
      type: "triangle",
      volume: 0.025,
      attack: 0.003,
    },
  ]);
}

// Tehlikeli aksiyon — daha boğuk, derin
export function playThud() {
  playTones([
    {
      freq: jitter(180, 15),
      toFreq: jitter(120, 10),
      duration: 0.09,
      type: "sine",
      volume: 0.06,
      attack: 0.004,
    },
  ]);
}

// Başarı — yumuşak C → E majör 3'lü, çan tarzı
export function playSuccess() {
  playTones([
    {
      freq: 523.25, // C5
      duration: 0.14,
      type: "sine",
      volume: 0.05,
      attack: 0.006,
    },
    {
      freq: 659.25, // E5
      duration: 0.22,
      type: "sine",
      volume: 0.06,
      delay: 0.09,
      attack: 0.006,
    },
  ]);
}

// Hata — alçalan iki nota, uyarıcı ama agresif değil
export function playError() {
  playTones([
    {
      freq: 392, // G4
      duration: 0.12,
      type: "sine",
      volume: 0.05,
      attack: 0.005,
    },
    {
      freq: 261.63, // C4
      duration: 0.20,
      type: "sine",
      volume: 0.055,
      delay: 0.08,
      attack: 0.005,
    },
  ]);
}

// Toggle açılıyor — yukarı slide
export function playToggleOn() {
  playTones([
    {
      freq: 440,
      toFreq: 660,
      duration: 0.10,
      type: "triangle",
      volume: 0.04,
      attack: 0.005,
    },
  ]);
}

// Toggle kapanıyor — aşağı slide
export function playToggleOff() {
  playTones([
    {
      freq: 660,
      toFreq: 440,
      duration: 0.10,
      type: "triangle",
      volume: 0.04,
      attack: 0.005,
    },
  ]);
}

// Bildirim — kısa iki tıklama
export function playNotify() {
  playTones([
    {
      freq: 880,
      duration: 0.05,
      type: "sine",
      volume: 0.04,
      attack: 0.003,
    },
    {
      freq: 880,
      duration: 0.05,
      type: "sine",
      volume: 0.04,
      delay: 0.07,
      attack: 0.003,
    },
  ]);
}
