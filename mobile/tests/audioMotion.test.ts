import test from "node:test";
import assert from "node:assert/strict";
import { createAudioMotion, envelope, STILL } from "../src/audioMotion";
test("waveform reflects PCM amplitude and remains flat for silence", () => {
  assert.ok(envelope([{ frames: Array(560).fill(0) }]).every((v) => v === 0));
  const soft = envelope([{ frames: Array(560).fill(0.05) }]);
  const loud = envelope([{ frames: Array(560).fill(0.2) }]);
  assert.ok(loud.every((v, i) => v > soft[i]));
  assert.ok(
    envelope([{ frames: [NaN, Infinity, 9, -9] }]).every(
      (v) => Number.isFinite(v) && v >= 0 && v <= 1,
    ),
  );
});
test("motion store samples a single shared stream, throttles and resets on pause", () => {
  const motion = createAudioMotion();
  let updates = 0;
  const off = motion.subscribe(() => updates++);
  motion.sample([{ frames: Array(560).fill(0.1) }], 5, 1000);
  assert.ok(motion.getSnapshot().energy > 0);
  motion.sample([{ frames: [0] }], 5, 1001);
  assert.equal(updates, 1);
  motion.reset();
  assert.equal(motion.getSnapshot(), STILL);
  assert.equal(updates, 2);
  off();
  motion.sample([{ frames: [1] }], 6, 2000);
  assert.equal(updates, 2);
});
