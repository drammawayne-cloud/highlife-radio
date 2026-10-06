import { test } from "node:test";
import assert from "node:assert/strict";
import { fallback, parseStation, nowPlaying, retryDelay } from "../src/station";
test("website legacy configuration preserves empty honest content", () => {
  const s = parseStation({
    streamUrl: fallback.streamUrl,
    nowPlayingUrl: fallback.nowPlayingUrl,
    stationName: "High Life Radio",
  });
  assert.equal(s.people.length, 0);
  assert.equal(s.schedule.length, 0);
});
test("remote config rotates public endpoints without changing app", () => {
  assert.equal(
    parseStation({
      streamUrl: "https://example.org/live.mp3",
      contentUrl: "https://example.org/content",
    }).streamUrl,
    "https://example.org/live.mp3",
  );
});
test("reject unsafe and malformed configuration", () => {
  for (const raw of [
    { streamUrl: "http://example.org/live" },
    { streamUrl: "https://user:password@example.org/live" },
    { nowPlayingUrl: "javascript:alert(1)" },
    { contentUrl: "file:///private" },
    { socialLinks: [{ label: "Bad", url: "javascript:alert(1)" }] },
    { people: [{}] },
    { timezone: "Not/AZone" },
    { schedule: [{ day: 9, start: "99:99", end: "12:00", showId: "unknown" }] },
  ])
    assert.throws(() => parseStation(raw));
});
test("stale radio track and up-next never shown as current", () => {
  const result = nowPlaying(
    {
      now_playing: { played_at: 1, duration: 167, song: { title: "Old song" } },
      playing_next: { song: { text: "Old next" } },
    },
    10000000,
  );
  assert.equal(result.fresh, false);
  assert.equal(result.next, "To be announced");
  assert.notEqual(result.title, "Old song");
});
test("fresh metadata distinguishes AutoDJ from human broadcast", () => {
  const raw = {
    now_playing: {
      played_at: 100,
      duration: 200,
      song: { title: "Song", artist: "Artist" },
    },
    live: { is_live: false },
  };
  assert.equal(nowPlaying(raw, 150000).title, "Song");
  assert.equal(nowPlaying(raw, 150000).dj, "AutoDJ");
  assert.equal(
    nowPlaying(
      { ...raw, live: { is_live: true, streamer_name: "Published host" } },
      150000,
    ).dj,
    "Published host",
  );
});
test("bounded reconnect backoff", () => {
  assert.deepEqual(
    [0, 1, 2, 5, 20].map(retryDelay),
    [1000, 2000, 4000, 30000, 30000],
  );
});
test("team membership is shared by stable person id", () => {
  const station = parseStation({
    people: [
      {
        id: "host",
        name: "Official host",
        role: "DJ",
        bio: "Published biography",
        teamUnstoppable: true,
      },
    ],
    shows: [
      {
        id: "show",
        name: "Official show",
        description: "Published",
        hostId: "host",
      },
    ],
    schedule: [{ day: 1, start: "08:00", end: "10:00", showId: "show" }],
  });
  assert.equal(station.shows[0].hostId, station.people[0].id);
  assert.equal(station.people.filter((x) => x.teamUnstoppable).length, 1);
});
import { programming, stationTime } from "../src/station";
test("schedule uses station timezone and wraps overnight week boundaries", () => {
  const s = parseStation({
    timezone: "America/New_York",
    shows: [{ id: "s", name: "Published show", description: "Approved" }],
    schedule: [
      { day: 6, start: "23:00", end: "02:00", showId: "s" },
      { day: 0, start: "10:00", end: "12:00", showId: "s" },
    ],
  });
  const date = new Date("2026-10-04T05:00:00Z");
  assert.equal(stationTime(s.timezone, date).day, 0);
  assert.equal(programming(s, date).current?.slot.day, 6);
  assert.equal(programming(s, date).next?.slot.start, "10:00");
});
