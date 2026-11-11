import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { useVideoPlayer } from "expo-video";
import { createAudioMotion } from "./audioMotion";
const PROGRAM = "https://nychighliferadio.com/radio-program/index.m3u8";
const METER = "https://nychighliferadio.com/api/radio-waveform";
export function useProgramRadio(url: string, title: string, artist: string) {
  const player = useVideoPlayer(null, (p) => {
    p.staysActiveInBackground = true;
    p.showNowPlayingNotification = true;
    p.audioMixingMode = "doNotMix";
    p.timeUpdateEventInterval = 0.25;
  });
  const [motion] = useState(createAudioMotion),
    [playing, setPlaying] = useState(false),
    [wanted, setWanted] = useState(false),
    [busy, setBusy] = useState(false),
    [volume, setVolume] = useState(1),
    [message, setMessage] = useState("Ready when you are"),
    [picture, setPicture] = useState(false);
  const intent = useRef(false),
    generation = useRef(0),
    retry = useRef(0),
    attempts = useRef(0),
    frames = useRef<number[][]>([]),
    updated = useRef(0),
    lastProgress = useRef(0),
    previousTime = useRef(0),
    active = useRef(true),
    usingProgram = useRef(false),
    loading = useRef(false),
    lastPlaying = useRef(false);
  const pause = useCallback(() => {
    intent.current = false;
    generation.current++;
    clearTimeout(retry.current);
    player.pause();
    setWanted(false);
    setBusy(false);
    setMessage("Paused");
    motion.reset();
  }, [player, motion]);
  const connect = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    connect.current = async () => {
      if (!intent.current) return;
      clearTimeout(retry.current);
      const token = ++generation.current;
      loading.current = true;
      setBusy(true);
      setMessage("Connecting to live stream");
      lastProgress.current = Date.now();
      try {
        const fallback = Platform.OS === "web" || attempts.current >= 2;
        usingProgram.current = !fallback;
        setPicture(false);
        await player.replaceAsync({
          uri: fallback ? url : PROGRAM,
          contentType: fallback ? "auto" : "hls",
          metadata: { title, artist },
        });
        if (intent.current && token === generation.current) player.play();
      } catch {
        if (intent.current && token === generation.current) {
          attempts.current++;
          retry.current = setTimeout(
            () => void connect.current(),
            Math.min(15000, 1000 * 2 ** Math.min(attempts.current, 4)),
          ) as unknown as number;
        }
      }
    };
  }, [player, url, title, artist]);
  const play = useCallback(() => {
    intent.current = true;
    setWanted(true);
    attempts.current = 0;
    void connect.current();
  }, []);
  useEffect(() => {
    const playingListener = player.addListener(
      "playingChange",
      ({ isPlaying }) => {
        setPlaying(isPlaying);
        if (isPlaying) {
          intent.current = true;
          setWanted(true);
          lastPlaying.current = true;
          loading.current = false;
          setBusy(false);
          setMessage("Streaming live");
          lastProgress.current = Date.now();
        } else if (
          lastPlaying.current &&
          !loading.current &&
          player.status === "readyToPlay"
        ) {
          lastPlaying.current = false;
          pause();
        } else if (!intent.current) motion.reset();
      },
    );
    const statusListener = player.addListener("statusChange", ({ status }) => {
      if (status === "error" && intent.current) {
        setBusy(true);
        setMessage("Connection interrupted · reconnecting");
        attempts.current++;
        clearTimeout(retry.current);
        retry.current = setTimeout(
          () => void connect.current(),
          Math.min(15000, 1000 * 2 ** Math.min(attempts.current, 4)),
        ) as unknown as number;
      }
    });
    const app = AppState.addEventListener("change", (state) => {
      active.current = state === "active";
      if (!active.current) motion.reset();
    });
    const timer = setInterval(() => {
      if (!intent.current) return;
      if (player.playing && player.currentTime > previousTime.current) {
        lastProgress.current = Date.now();
      }
      previousTime.current = player.currentTime;
      if (Date.now() - lastProgress.current > 15000) {
        lastProgress.current = Date.now();
        attempts.current++;
        void connect.current();
      }
    }, 3000);
    return () => {
      playingListener.remove();
      statusListener.remove();
      app.remove();
      clearInterval(timer);
      clearTimeout(retry.current);
    };
  }, [player, motion, pause]);
  useEffect(() => {
    let alive = true,
      pending = false;
    const fetchLevels = async () => {
      if (!intent.current || !active.current || pending) return;
      pending = true;
      try {
        const response = await fetch(METER, {
          signal: AbortSignal.timeout(3500),
        });
        const data = await response.json();
        if (alive && Array.isArray(data.frames)) {
          frames.current = data.frames;
          setPicture(usingProgram.current && data.live_picture === true);
          updated.current = data.updated;
        }
      } catch {
      } finally {
        pending = false;
      }
    };
    const fetchTimer = setInterval(() => void fetchLevels(), 1000);
    const draw = setInterval(() => {
      if (
        !intent.current ||
        !player.playing ||
        !active.current ||
        Date.now() - updated.current > 6000
      ) {
        motion.reset();
        return;
      }
      const stamp = player.currentLiveTimestamp ?? Date.now() - 4000;
      const history = frames.current;
      let lo = 0,
        hi = history.length - 1,
        index = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (history[mid][0] <= stamp) {
          index = mid;
          lo = mid + 1;
        } else hi = mid - 1;
      }
      if (index < 0 || stamp - history[index][0] > 1500) {
        motion.reset();
        return;
      }
      const bars = Array.from(
        { length: 28 },
        (_, i) =>
          Math.max(
            0,
            Math.min(255, history[Math.max(0, index - (27 - i) * 2)][1]),
          ) / 255,
      );
      motion.levels(bars, player.currentTime);
    }, 80);
    return () => {
      alive = false;
      clearInterval(fetchTimer);
      clearInterval(draw);
    };
  }, [player, motion]);
  const changeVolume = (value: number) => {
    const next = Math.max(0, Math.min(1, value));
    // Expo Video exposes volume as a mutable native SharedObject property.
    // eslint-disable-next-line react-hooks/immutability
    player.volume = next;
    setVolume(next);
  };
  return {
    player,
    play,
    pause,
    toggle: () => (intent.current ? pause() : play()),
    playing,
    wanted,
    busy,
    ready: true,
    volume,
    changeVolume,
    motion,
    currentTime: player.currentTime,
    message,
    picture,
  };
}
