import { useEffect, useState } from "react";
import { NEWS_URL, parseNews, type NewsStory } from "./news";
export function useNews() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    void fetch(NEWS_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("News unavailable");
        return response.json();
      })
      .then((value) => {
        if (!controller.signal.aborted) setStories(parseNews(value));
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);
  return stories;
}
