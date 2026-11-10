import { test } from "node:test";
import assert from "node:assert/strict";
import { rotation } from "../src/rotation";
import { parseNews } from "../src/news";
test("approved rotation covers each hourly boundary without gaps", () => {
  assert.equal(rotation[0].start, "00:00");
  assert.equal(rotation.at(-1)?.end, "00:00");
  rotation.forEach((slot, i) => {
    assert.match(slot.start, /^\d{2}:00$/);
    assert.match(slot.end, /^\d{2}:00$/);
    if (i) assert.equal(rotation[i - 1].end, slot.start);
  });
  assert.equal(
    rotation.find((x) => x.start === "06:00")?.name,
    "Sunshine Morning Show",
  );
});
test("news only opens published same-site newsroom addresses", () => {
  assert.deepEqual(
    parseNews([
      { title: "Bad", url: "https://evil.example/news/" },
      { title: "Bad", url: "javascript:alert(1)" },
      { title: "Draft", url: "/news/draft/", status: "draft" },
    ]),
    [],
  );
  assert.equal(
    parseNews([{ title: "Current", url: "/news/current/" }])[0].url,
    "https://nychighliferadio.com/news/current/",
  );
});
