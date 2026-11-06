export const BRAND = {
  name: "NYC High Life Radio",
  website: "https://nychighliferadio.com/",
  tagline: "New York energy. Caribbean soul.",
  owner: "NYC High Life Entertainment",
} as const;
export const siteUrl = (path: string) => new URL(path, BRAND.website).href;
