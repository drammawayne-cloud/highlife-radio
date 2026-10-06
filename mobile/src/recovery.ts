export const MAX_RETRIES = 6;
export function recoveryDecision(input: {
  wanted: boolean; playing: boolean; loaded: boolean; buffering: boolean;
  failed: boolean; ended: boolean; lastProgress: number; now: number;
  attempts: number; retryAt: number;
}) {
  if (!input.wanted) return "idle";
  if (input.loaded && !input.playing && !input.buffering && !input.failed && !input.ended) return "paused";
  const stalled = input.now - input.lastProgress >= 30000;
  if (!(input.failed || input.ended || stalled)) return "wait";
  if (input.attempts >= MAX_RETRIES) return "stop";
  if (input.now < input.retryAt) return "wait";
  return "retry";
}
