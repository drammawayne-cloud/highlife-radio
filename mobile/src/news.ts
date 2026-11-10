import { BRAND, siteUrl } from "./brand";
export type NewsStory = {
  title: string;
  url: string;
  image?: string;
  alt: string;
  source?: string;
  publishedAt?: string;
  sourceStale?: boolean;
  kind?: "video";
};
export const NEWS_URL = siteUrl("api/world-news");
export function parseNews(value: unknown): NewsStory[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item): NewsStory[] => {
      if (
        !item ||
        typeof item.title !== "string" ||
        typeof item.url !== "string" ||
        item.status === "draft"
      )
        return [];
      try {
        const url = new URL(item.url, BRAND.website);
        if (
          url.origin !== new URL(BRAND.website).origin ||
          !url.pathname.startsWith("/news/") ||
          url.username ||
          url.password
        )
          return [];
        const image =
          typeof item.image === "string"
            ? new URL(item.image, BRAND.website)
            : undefined;
        return [
          {
            title: item.title,
            url: url.href,
            image: image?.origin === url.origin ? image.href : undefined,
            alt:
              typeof item.imageAlt === "string"
                ? item.imageAlt
                : "NYC High Life Radio newsroom",
          },
        ];
      } catch {
        return [];
      }
    })
    .slice(0, 6);
}

const PUBLISHERS: Record<string, string> = {
  reuters: "Reuters",
  ap: "Associated Press",
};
export function parseLiveReports(value: unknown, now = Date.now()): NewsStory[] {
  if (!value || typeof value !== "object" || !("stories" in value) || !Array.isArray(value.stories)) return [];
  const seen = new Set<string>();
  const reports = value.stories.flatMap((item): NewsStory[] => {
    if (!item || typeof item !== "object" || typeof item.videoId !== "string" || !/^[\w-]{11}$/.test(item.videoId) || typeof item.sourceId !== "string" || !Object.hasOwn(PUBLISHERS, item.sourceId) || PUBLISHERS[item.sourceId] !== item.sourcePublisher || typeof item.title !== "string" || !item.title.trim() || item.title.length > 400 || typeof item.publishedAt !== "string") return [];
    const published = Date.parse(item.publishedAt);
    if (!Number.isFinite(published) || published > now + 300000 || now - published >= 7 * 86400000 || seen.has(item.videoId)) return [];
    seen.add(item.videoId);
    return [{ title: item.title.trim(), url: siteUrl(`news/world/#report-${item.videoId}`), alt: `${PUBLISHERS[item.sourceId]} video report`, source: PUBLISHERS[item.sourceId], publishedAt: new Date(published).toISOString(), sourceStale: item.sourceStale === true, kind: "video" }];
  });
  reports.sort((a,b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!));
  return Object.values(PUBLISHERS).flatMap(source => reports.filter(item => item.source === source).slice(0, 3)).sort((a,b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!));
}
export function newsLabel(story: NewsStory): string {
  if (!story.source || !story.publishedAt) return "NEWS & COMMUNITY";
  const date = new Intl.DateTimeFormat("en-US", {month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZone:"America/New_York",timeZoneName:"short"}).format(new Date(story.publishedAt));
  return `${story.source === "Associated Press" ? "AP" : story.source} / ${date}${story.sourceStale ? " · Saved report" : ""}`;
}
