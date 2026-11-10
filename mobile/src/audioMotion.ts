export type MotionSnapshot = {
  bars: readonly number[];
  energy: number;
  timestamp: number;
  sampledAt: number;
};
export const STILL: MotionSnapshot = {
  bars: Array(28).fill(0),
  energy: 0,
  timestamp: 0,
  sampledAt: 0,
};
// RMS windows use the actual playback PCM, never a generated animation pattern.
export function envelope(
  channels: readonly { frames: readonly number[] }[],
  count = 28,
): number[] {
  const length = channels[0]?.frames.length || 0;
  if (!length || !count) return Array(count).fill(0);
  return Array.from({ length: count }, (_, bin) => {
    const start = Math.floor((bin * length) / count),
      end = Math.max(start + 1, Math.floor(((bin + 1) * length) / count));
    let power = 0,
      n = 0;
    for (const channel of channels)
      for (let i = start; i < end && i < channel.frames.length; i++) {
        const value = channel.frames[i];
        if (Number.isFinite(value)) {
          power += value * value;
          n++;
        }
      }
    return n ? Math.min(1, Math.sqrt(power / n) * 2.6) : 0;
  });
}
export function createAudioMotion() {
  let current = STILL;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => current,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    sample: (
      channels: readonly { frames: readonly number[] }[],
      timestamp: number,
      now = Date.now(),
    ) => {
      if (now - current.sampledAt < 65) return;
      const bars = envelope(channels);
      current = {
        bars,
        energy: bars.reduce((a, b) => a + b, 0) / bars.length,
        timestamp:
          Number.isFinite(timestamp) && timestamp >= 0 ? timestamp : now / 1000,
        sampledAt: now,
      };
      listeners.forEach((listener) => listener());
    },
    reset: () => {
      if (current === STILL) return;
      current = STILL;
      listeners.forEach((listener) => listener());
    },
  };
}
export type AudioMotion = ReturnType<typeof createAudioMotion>;
