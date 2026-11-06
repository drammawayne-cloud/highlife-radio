import { useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  CONFIG_URL,
  fallback,
  getJson,
  nowPlaying,
  parseStation,
} from "./station";
export function useStation() {
  const [station, setStation] = useState(fallback);
  const [configState, setConfigState] = useState("Connecting to station");
  const [metadata, setMetadata] = useState<any>(null);
  const [metadataError, setMetadataError] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        let next = parseStation(await getJson(CONFIG_URL));
        if (next.contentUrl)
          next = parseStation(await getJson(next.contentUrl), next);
        if (alive) {
          setStation(next);
          setConfigState("Station configuration connected");
        }
      } catch {
        if (alive)
          setConfigState(
            "Using last available station settings • configuration offline",
          );
      }
    }
    void refresh();
    const timer = setInterval(refresh, 60000);
    const subscription = AppState.addEventListener("change", state => { if (state === "active") void refresh(); });
    return () => {
      alive = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        const value = await getJson(station.nowPlayingUrl);
        if (alive) {
          setMetadata(value);
          setMetadataError(false);
        }
      } catch {
        if (alive) setMetadataError(true);
      }
    }
    void refresh();
    const timer = setInterval(refresh, 15000);
    const subscription = AppState.addEventListener("change", state => { if (state === "active") { setClock(Date.now()); void refresh(); } });
    return () => {
      alive = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [station.nowPlayingUrl]);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);
  return {
    station,
    clock,
    configState,
    track: nowPlaying(metadataError ? null : metadata, clock),
  };
}
