export const CONFIG_URL =
  process.env.EXPO_PUBLIC_STATION_CONFIG_URL ||
  "https://drammawayne-cloud.github.io/highlife-radio/station.json";
export type Show = {
  id: string;
  name: string;
  description: string;
  hostId?: string;
};
export type Person = {
  id: string;
  name: string;
  role: string;
  bio: string;
  teamUnstoppable?: boolean;
};
export type Slot = { day: number; start: string; end: string; showId: string };
export type Event = {
  id: string;
  name: string;
  description: string;
  startsAt: string;
  venue: string;
  url?: string;
};
export type Station = {
  stationName: string;
  streamUrl: string;
  nowPlayingUrl: string;
  contentUrl?: string;
  timezone: string;
  contactEmail?: string;
  socialLinks: { label: string; url: string }[];
  shows: Show[];
  people: Person[];
  schedule: Slot[];
  events: Event[];
};
export const fallback: Station = {
  stationName: "High Life Radio",
  streamUrl:
    "https://richrow-radio.129-213-164-255.sslip.io/listen/rich_row_radio/radio.mp3",
  nowPlayingUrl:
    "https://richrow-radio.129-213-164-255.sslip.io/api/nowplaying/rich_row_radio",
  timezone: "America/New_York",
  socialLinks: [],
  shows: [],
  people: [],
  schedule: [],
  events: [],
};
export function https(value: unknown): value is string {
  try {
    if (typeof value !== "string") return false;
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function parseStation(raw: any, base: Station = fallback): Station {
  if (
    !raw ||
    !https(raw.streamUrl ?? base.streamUrl) ||
    !https(raw.nowPlayingUrl ?? base.nowPlayingUrl)
  )
    throw new Error("Station endpoints must use HTTPS.");
  if (raw.contentUrl && !https(raw.contentUrl))
    throw new Error("Content endpoint must use HTTPS.");
  const next = { ...base, ...raw };
  if (typeof next.stationName !== "string")
    throw new Error("Missing station name.");
  new Intl.DateTimeFormat("en", { timeZone: next.timezone });
  for (const key of ["shows", "people", "schedule", "events", "socialLinks"])
    if (!Array.isArray(next[key]))
      throw new Error("Invalid content collection.");
  if (
    !next.shows.every(
      (s: any) =>
        typeof s.id === "string" &&
        typeof s.name === "string" &&
        typeof s.description === "string",
    )
  )
    throw new Error("Invalid show.");
  if (
    !next.people.every(
      (p: any) =>
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        typeof p.role === "string" &&
        typeof p.bio === "string",
    )
  )
    throw new Error("Invalid person.");
  if (
    !next.schedule.every(
      (s: any) =>
        Number.isInteger(s.day) &&
        s.day >= 0 &&
        s.day <= 6 &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(s.start) &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(s.end) &&
        next.shows.some((x: Show) => x.id === s.showId),
    )
  )
    throw new Error("Invalid schedule.");
  if (
    !next.events.every(
      (e: any) =>
        typeof e.id === "string" &&
        typeof e.name === "string" &&
        typeof e.description === "string" &&
        typeof e.venue === "string" &&
        Number.isFinite(Date.parse(e.startsAt)) &&
        (!e.url || https(e.url)),
    )
  )
    throw new Error("Invalid event.");
  if (
    !next.socialLinks.every(
      (s: any) => typeof s.label === "string" && https(s.url),
    )
  )
    throw new Error("Invalid social link.");
  if (
    next.contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.contactEmail)
  )
    throw new Error("Invalid email.");
  return next;
}
export function nowPlaying(raw: any, now = Date.now()) {
  const track = raw?.now_playing;
  const fresh =
    !!track &&
    Number.isFinite(track.played_at) &&
    now / 1000 >= track.played_at - 60 &&
    now / 1000 <
      track.played_at + Math.max(Number(track.duration) || 300, 30) + 90;
  return {
    fresh,
    title: fresh
      ? String(track.song?.title || "High Life Radio")
      : "Track information unavailable",
    artist: fresh
      ? String(track.song?.artist || "")
      : "Waiting for fresh station metadata",
    dj: raw?.live?.is_live
      ? String(raw.live.streamer_name || "Live host")
      : "AutoDJ",
    live: !!raw?.live?.is_live,
    next: fresh
      ? String(raw?.playing_next?.song?.text || "To be announced")
      : "To be announced",
  };
}
export const retryDelay = (attempt: number) =>
  Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
export async function getJson(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}
export function stationTime(timezone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (name: string) =>
    parts.find((p) => p.type === name)?.value || "";
  return {
    day: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].indexOf(value("weekday")),
    minute: Number(value("hour")) * 60 + Number(value("minute")),
  };
}
export function programming(station: Station, date = new Date()) {
  const { day, minute } = stationTime(station.timezone, date);
  const week = 7 * 1440,
    point = day * 1440 + minute;
  const slots = station.schedule.map((slot) => {
    const clock = (v: string) =>
      Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
    const start = slot.day * 1440 + clock(slot.start);
    let end = slot.day * 1440 + clock(slot.end);
    if (end <= start) end += 1440;
    return {
      slot,
      start,
      end,
      show: station.shows.find((s) => s.id === slot.showId),
    };
  });
  const current = slots.find(
    (s) =>
      (point >= s.start && point < s.end) ||
      (point + week >= s.start && point + week < s.end),
  );
  const next = slots
    .map((s) => ({ ...s, distance: (s.start - point + week) % week }))
    .filter((s) => s.distance > 0)
    .sort((a, b) => a.distance - b.distance)[0];
  return { current, next };
}
