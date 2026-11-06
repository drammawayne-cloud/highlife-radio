import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { retryDelay } from "./station";
import { recoveryDecision } from "./recovery";

// Mounted once above the router: screens never create or dispose the stream.
export function useRadio(url: string, title: string, artist: string) {
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const [ready, setReady] = useState(Platform.OS === "web");
  const [wanted, setWanted] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(1);
  const intent = useRef(false);
  const attempts = useRef(0);
  const retryAt = useRef(0);
  const lastProgress = useRef(0);
  const previousTime = useRef(0);
  const startedAt = useRef(0);
  const latest = useRef(status);
  useEffect(() => { latest.current = status; }, [status]);
  useEffect(() => {
    if (Platform.OS === "web") return;
    let active = true;
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true,
      interruptionMode: "doNotMix", shouldRouteThroughEarpiece: false })
      .then(() => { if (active) setReady(true); })
      .catch(() => { if (active) setError("Audio could not start. Reopen the app to try again."); });
    return () => { active = false; };
  }, []);
  const pause = useCallback(() => {
    intent.current = false;
    setWanted(false);
    setError("");
    player.pause();
    if (Platform.OS !== "web") player.setActiveForLockScreen(false);
  }, [player]);
  const play = useCallback(() => {
    if (!ready) return;
    intent.current = true;
    setWanted(true);
    setError("");
    attempts.current = 0;
    retryAt.current = 0;
    lastProgress.current = Date.now();
    startedAt.current = Date.now();
    previousTime.current = 0;
    try {
      player.replace(url);
      if (Platform.OS !== "web") player.setActiveForLockScreen(true,
        { title, artist }, { showSeekBackward: false, showSeekForward: false, isLiveStream: true });
      player.play();
    } catch {
      intent.current = false;
      setWanted(false);
      setError("Unable to play the station. Tap Play to try again.");
    }
  }, [ready, player, url, title, artist]);
  useEffect(() => {
    player.replace(url);
    lastProgress.current = Date.now();
    previousTime.current = 0;
    attempts.current = 0;
    if (intent.current) { startedAt.current = Date.now(); player.play(); }
  }, [url, player]);
  useEffect(() => {
    if (Platform.OS !== "web" && status.playing) player.setActiveForLockScreen(true,
      { title, artist }, { showSeekBackward: false, showSeekForward: false, isLiveStream: true });
  }, [title, artist, status.playing, player]);
  useEffect(() => {
    const subscription = player.addListener("playbackStatusUpdate", next => {
      if (next.playing) { intent.current = true; setWanted(true); }
    });
    return () => subscription.remove();
  }, [player]);
  useEffect(() => {
    const check = () => {
      const s = latest.current;
      if (!intent.current) return;
      const now = Date.now();
      if (s.playing && s.currentTime > previousTime.current) {
        lastProgress.current = now;
        attempts.current = 0;
        setError("");
      }
      previousTime.current = s.currentTime;
      // Ignore the brief pause/load transition after replacing the live source.
      if (now - startedAt.current < 2000) return;
      const decision = recoveryDecision({ wanted: intent.current, playing: s.playing,
        loaded: s.isLoaded, buffering: s.isBuffering, failed: !!s.error,
        ended: s.didJustFinish, lastProgress: lastProgress.current, now,
        attempts: attempts.current, retryAt: retryAt.current });
      if (decision === "paused") {
        intent.current = false; setWanted(false); setError("");
      } else if (decision === "stop") {
        pause(); setError("The station connection is unavailable. Tap Play to retry.");
      } else if (decision === "retry") {
        retryAt.current = now + retryDelay(attempts.current++);
        lastProgress.current = now;
        startedAt.current = now;
        setError("Connection interrupted · reconnecting");
        try { player.replace(url); player.play(); }
        catch { /* The next bounded attempt handles native source errors. */ }
      }
    };
    const timer = setInterval(check, 2000);
    const subscription = AppState.addEventListener("change", state => { if (state === "active") check(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [player, url, pause]);
  const changeVolume = (value: number) => {
    const next = Math.max(0, Math.min(1, value));
    // Expo Audio exposes volume as a mutable native SharedObject property.
    // eslint-disable-next-line react-hooks/immutability
    player.volume = next;
    setVolume(next);
  };
  const busy = wanted && (!status.isLoaded || status.isBuffering || !status.playing);
  return { play, pause, toggle: () => wanted || status.playing ? pause() : play(),
    playing: status.playing, wanted, busy, ready, volume, changeVolume,
    currentTime: status.currentTime,
    message: error || (busy ? "Connecting to live stream" : status.playing && status.isLoaded
      ? "Streaming live" : "Ready when you are") };
}
