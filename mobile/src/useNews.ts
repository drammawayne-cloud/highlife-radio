import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { NEWS_URL, parseLiveReports, type NewsStory } from "./news";
export function useNews() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  useEffect(() => {
    let cancelled = false, loading = false;
    let activeController: AbortController | undefined;
    const refresh = async () => {
      if (cancelled || loading || AppState.currentState === "background" || AppState.currentState === "inactive") return;
      loading = true;
      const controller = new AbortController(); activeController = controller;
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(NEWS_URL, { signal: controller.signal });
        if (!response.ok) throw Error("News unavailable");
        const value = await response.json();
        if (!Array.isArray(value?.stories)) throw Error("Invalid news feed");
        if (!cancelled) setStories(parseLiveReports(value));
      } catch {
        if (!cancelled) setStories(current => current.filter(item => item.publishedAt && Date.now() - Date.parse(item.publishedAt) < 7 * 86400000).map(item => ({...item, sourceStale:true})));
      } finally { clearTimeout(timeout); loading = false; }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 300000);
    const appState = AppState.addEventListener("change", state => { if (state === "active") void refresh(); });
    return () => { cancelled = true; activeController?.abort(); clearInterval(timer); appState.remove(); };
  }, []);
  return stories;
}
