import { BRAND, siteUrl } from "./brand";
export type NewsStory = {
  title: string;
  url: string;
  image?: string;
  alt: string;
};
export const NEWS_URL = siteUrl("news/index.json");
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
