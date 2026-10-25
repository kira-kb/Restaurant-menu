/**
 * Web Audio API & HTML5 Audio Sound Effects for Barch Coffee
 * Zero-dependency, synthesized acoustic chime & bell notifications.
 * Works seamlessly offline, in background tabs, with no external network requests.
 */

import { useState, useEffect, useCallback } from 'react';

let globalAudioCtx: AudioContext | null = null;
let audioUnlocked = false;

// Cached HTML5 audio elements generated in memory
let newOrderAudioEl: HTMLAudioElement | null = null;
let statusChangeAudioEl: HTMLAudioElement | null = null;
let orderReadyAudioEl: HTMLAudioElement | null = null;
let orderPlacedAudioEl: HTMLAudioElement | null = null;

/**
 * Generates an in-memory 16-bit PCM WAV Data URI.
 * Guarantees audio playback across all browsers, mobile devices, and background tabs.
 */
function createWavDataUri(
  duration: number,
  generateSample: (t: number) => number,
  sampleRate = 22050
): string {
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16 bits per sample
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = generateSample(t);
    const clamped = Math.max(-1, Math.min(1, sample));
    const intVal = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(offset, intVal, true);
    offset += 2;
  }

  // Base64 encode
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

/**
 * Lazily initializes fallback HTML5 Audio elements
 */
function getFallbackAudio(type: 'newOrder' | 'statusChange' | 'orderReady' | 'orderPlaced'): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  try {
    if (type === 'newOrder') {
      if (!newOrderAudioEl) {
        const uri = createWavDataUri(1.1, (t) => {
          let s = 0;
          if (t < 0.45) {
            const d1 = Math.exp(-t * 9);
            s += 0.55 * Math.sin(2 * Math.PI * 830.6 * t) * d1;
            s += 0.22 * Math.sin(2 * Math.PI * 1661 * t) * d1;
          }
          if (t >= 0.12) {
            const t2 = t - 0.12;
            const d2 = Math.exp(-t2 * 6);
            s += 0.65 * Math.sin(2 * Math.PI * 1108.7 * t2) * d2;
            s += 0.28 * Math.sin(2 * Math.PI * 2217 * t2) * d2;
          }
          return s;
        });
        newOrderAudioEl = new Audio(uri);
        newOrderAudioEl.volume = 0.9;
      }
      return newOrderAudioEl;
    }

    if (type === 'statusChange') {
      if (!statusChangeAudioEl) {
        const uri = createWavDataUri(0.7, (t) => {
          let s = 0;
          if (t < 0.25) {
            s += 0.5 * Math.sin(2 * Math.PI * 523.25 * t) * Math.exp(-t * 12);
          }
          if (t >= 0.1 && t < 0.38) {
            const t2 = t - 0.1;
            s += 0.55 * Math.sin(2 * Math.PI * 659.25 * t2) * Math.exp(-t2 * 10);
          }
          if (t >= 0.22) {
            const t3 = t - 0.22;
            s += 0.6 * Math.sin(2 * Math.PI * 783.99 * t3) * Math.exp(-t3 * 7);
          }
          return s;
        });
        statusChangeAudioEl = new Audio(uri);
        statusChangeAudioEl.volume = 0.85;
      }
      return statusChangeAudioEl;
    }

    if (type === 'orderReady') {
      if (!orderReadyAudioEl) {
        const uri = createWavDataUri(1.0, (t) => {
          let s = 0;
          if (t < 0.2) s += 0.4 * Math.sin(2 * Math.PI * 523.25 * t) * Math.exp(-t * 12);
          if (t >= 0.08 && t < 0.3) s += 0.45 * Math.sin(2 * Math.PI * 659.25 * (t - 0.08)) * Math.exp(-(t - 0.08) * 11);
          if (t >= 0.16 && t < 0.42) s += 0.5 * Math.sin(2 * Math.PI * 783.99 * (t - 0.16)) * Math.exp(-(t - 0.16) * 9);
          if (t >= 0.26) {
            const t4 = t - 0.26;
            s += 0.7 * Math.sin(2 * Math.PI * 1046.5 * t4) * Math.exp(-t4 * 5);
            s += 0.3 * Math.sin(2 * Math.PI * 2093.0 * t4) * Math.exp(-t4 * 7);
          }
          return s;
        });
        orderReadyAudioEl = new Audio(uri);
        orderReadyAudioEl.volume = 0.9;
      }
      return orderReadyAudioEl;
    }

    if (type === 'orderPlaced') {
      if (!orderPlacedAudioEl) {
        const uri = createWavDataUri(0.5, (t) => {
          let s = 0;
          if (t < 0.2) s += 0.5 * Math.sin(2 * Math.PI * 659.25 * t) * Math.exp(-t * 14);
          if (t >= 0.08) s += 0.6 * Math.sin(2 * Math.PI * 880.0 * (t - 0.08)) * Math.exp(-(t - 0.08) * 8);
          return s;
        });
        orderPlacedAudioEl = new Audio(uri);
        orderPlacedAudioEl.volume = 0.8;
      }
      return orderPlacedAudioEl;
    }
  } catch {
    // Ignore audio construction error
  }
  return null;
}

/**
 * Safely initializes or retrieves the AudioContext.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!globalAudioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioCtxClass) {
      globalAudioCtx = new AudioCtxClass();
    }
  }

  return globalAudioCtx;
}

/**
 * Checks if the browser AudioContext has been unlocked by user gesture.
 */
export function isAudioUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return audioUnlocked || (globalAudioCtx !== null && globalAudioCtx.state === 'running');
}

/**
 * Unlocks the AudioContext and HTML5 audio on first user gesture.
 */
export async function unlockAudio(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  audioUnlocked = true;
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Ignored
    }
  }

  // Pre-load audio elements
  getFallbackAudio('newOrder');
  getFallbackAudio('statusChange');
  return true;
}

// Auto-attach gesture unlock listener
if (typeof window !== 'undefined') {
  const handleUserGesture = () => {
    unlockAudio();
    window.removeEventListener('click', handleUserGesture);
    window.removeEventListener('touchstart', handleUserGesture);
    window.removeEventListener('keydown', handleUserGesture);
  };

  window.addEventListener('click', handleUserGesture, { passive: true, once: true });
  window.addEventListener('touchstart', handleUserGesture, { passive: true, once: true });
  window.addEventListener('keydown', handleUserGesture, { passive: true, once: true });
}

/**
 * Checks if sound is enabled in localStorage.
 */
export function isSoundEnabled(storageKey = 'barch_sound_alerts', defaultValue = true): boolean {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === null) return defaultValue;
    return saved === 'true';
  } catch {
    return defaultValue;
  }
}

/**
 * Saves sound enabled preference to localStorage.
 */
export function setSoundEnabled(
  enabled: boolean,
  storageKey = 'barch_sound_alerts'
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey, String(enabled));
    if (enabled) {
      unlockAudio();
    }
    notifySoundListeners();
  } catch {
    // Ignore storage errors
  }
}

const soundListeners = new Set<() => void>();

function notifySoundListeners() {
  soundListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore
    }
  });
}

/**
 * Hydration-safe React hook to read and update sound enabled preference.
 * Uses initial defaultValue on SSR/hydration and synchronizes with localStorage post-mount,
 * completely preventing SSR hydration mismatches.
 */
export function useSoundPreference(
  storageKey = 'barch_sound_alerts',
  defaultValue = true
): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(defaultValue);

  useEffect(() => {
    // Read persisted setting on client mount
    setEnabled(isSoundEnabled(storageKey, defaultValue));

    const onStorageOrChange = () => {
      setEnabled(isSoundEnabled(storageKey, defaultValue));
    };

    soundListeners.add(onStorageOrChange);
    window.addEventListener('storage', onStorageOrChange);

    return () => {
      soundListeners.delete(onStorageOrChange);
      window.removeEventListener('storage', onStorageOrChange);
    };
  }, [storageKey, defaultValue]);

  const updateSound = useCallback(
    (next: boolean) => {
      setEnabled(next);
      setSoundEnabled(next, storageKey);
    },
    [storageKey]
  );

  return [enabled, updateSound];
}

/**
 * Executes a sound generator safely with Web Audio and HTML5 audio fallback.
 */
function playAudioWithFallback(
  type: 'newOrder' | 'statusChange' | 'orderReady' | 'orderPlaced',
  playSynth: (ctx: AudioContext, now: number) => void
) {
  // 1. Try HTML5 Audio fallback element first for maximum background tab reliability
  const audioEl = getFallbackAudio(type);
  if (audioEl) {
    try {
      audioEl.currentTime = 0;
      const playPromise = audioEl.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Fallback if browser requires interaction
        });
      }
    } catch {
      // Fallback to Web Audio
    }
  }

  // 2. Play Web Audio API synthesized tones
  const ctx = getAudioContext();
  if (!ctx) return;

  const runSynth = () => {
    try {
      const now = ctx.currentTime;
      playSynth(ctx, now);
    } catch {
      // Ignore audio scheduling errors
    }
  };

  if (ctx.state === 'suspended') {
    ctx.resume().then(runSynth).catch(() => {});
  } else {
    runSynth();
  }
}

interface ToneOptions {
  frequency: number;
  startTime: number;
  duration: number;
  gain?: number;
  type?: OscillatorType;
  decay?: number;
}

function playSynthTone(ctx: AudioContext, opts: ToneOptions) {
  const {
    frequency,
    startTime,
    duration,
    gain = 0.35,
    type = 'sine',
    decay = 0.05,
  } = opts;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + Math.max(0.04, duration - decay)
  );

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * 1. Barista New Order Alert:
 * Distinct, loud, rich dual-tone counter bell sound (classic coffee bar service bell).
 */
export function playNewOrderSound(storageKey = 'barch_sound_alerts'): void {
  if (!isSoundEnabled(storageKey)) return;

  playAudioWithFallback('newOrder', (ctx, now) => {
    // Chime 1: Ab5 (830.6Hz) with octave harmonic
    playSynthTone(ctx, {
      frequency: 830.6,
      startTime: now,
      duration: 0.45,
      gain: 0.45,
      type: 'triangle',
    });
    playSynthTone(ctx, {
      frequency: 1661.2,
      startTime: now,
      duration: 0.35,
      gain: 0.2,
      type: 'sine',
    });

    // Chime 2: Db6 (1108.7Hz) with sparkling high harmonic
    playSynthTone(ctx, {
      frequency: 1108.7,
      startTime: now + 0.14,
      duration: 0.75,
      gain: 0.55,
      type: 'triangle',
    });
    playSynthTone(ctx, {
      frequency: 2217.4,
      startTime: now + 0.14,
      duration: 0.5,
      gain: 0.25,
      type: 'sine',
    });
  });
}

/**
 * 2. Status Change Sound:
 * Melodic 3-note chime (C5 -> E5 -> G5) indicating order progress.
 */
export function playStatusChangeSound(storageKey = 'barch_sound_alerts'): void {
  if (!isSoundEnabled(storageKey)) return;

  playAudioWithFallback('statusChange', (ctx, now) => {
    // C5 (523.25Hz)
    playSynthTone(ctx, {
      frequency: 523.25,
      startTime: now,
      duration: 0.22,
      gain: 0.35,
      type: 'sine',
    });

    // E5 (659.25Hz)
    playSynthTone(ctx, {
      frequency: 659.25,
      startTime: now + 0.11,
      duration: 0.28,
      gain: 0.38,
      type: 'sine',
    });

    // G5 (783.99Hz)
    playSynthTone(ctx, {
      frequency: 783.99,
      startTime: now + 0.22,
      duration: 0.5,
      gain: 0.42,
      type: 'sine',
    });
  });
}

/**
 * 3. Order Ready / Completed Sound:
 * Ascending 4-note celebration chime (C5 -> E5 -> G5 -> C6).
 */
export function playOrderReadySound(storageKey = 'barch_sound_alerts'): void {
  if (!isSoundEnabled(storageKey)) return;

  playAudioWithFallback('orderReady', (ctx, now) => {
    // C5
    playSynthTone(ctx, {
      frequency: 523.25,
      startTime: now,
      duration: 0.2,
      gain: 0.35,
      type: 'sine',
    });

    // E5
    playSynthTone(ctx, {
      frequency: 659.25,
      startTime: now + 0.09,
      duration: 0.22,
      gain: 0.38,
      type: 'sine',
    });

    // G5
    playSynthTone(ctx, {
      frequency: 783.99,
      startTime: now + 0.18,
      duration: 0.28,
      gain: 0.42,
      type: 'sine',
    });

    // C6
    playSynthTone(ctx, {
      frequency: 1046.5,
      startTime: now + 0.28,
      duration: 0.7,
      gain: 0.48,
      type: 'triangle',
    });
    playSynthTone(ctx, {
      frequency: 2093.0,
      startTime: now + 0.28,
      duration: 0.45,
      gain: 0.18,
      type: 'sine',
    });
  });
}

/**
 * 4. Customer Order Placed Feedback Sound:
 * Instant confirmation chime when placing order.
 */
export function playOrderPlacedSound(storageKey = 'barch_sound_alerts'): void {
  if (!isSoundEnabled(storageKey)) return;

  playAudioWithFallback('orderPlaced', (ctx, now) => {
    playSynthTone(ctx, {
      frequency: 659.25,
      startTime: now,
      duration: 0.18,
      gain: 0.35,
      type: 'sine',
    });

    playSynthTone(ctx, {
      frequency: 880.0,
      startTime: now + 0.09,
      duration: 0.4,
      gain: 0.42,
      type: 'sine',
    });
  });
}
