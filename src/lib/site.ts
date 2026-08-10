export const SITE_URL = "https://www.easyfilemagic.com";
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Branded fallback share card used by pages without their own artwork. */
export const DEFAULT_OG_IMAGE = "/og-default.jpg";

/**
 * og:image + twitter:image meta for one page. Social crawlers require absolute
 * URLs, and these must live on leaf routes — a root-level og:image would
 * override every child's share preview.
 */
export function ogImageMeta(src: string = DEFAULT_OG_IMAGE, alt = "EasyFileMagic — free browser-based PDF, image and AI tools") {
  const url = abs(src);
  return [
    { property: "og:image", content: url },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: alt },
    { name: "twitter:image", content: url },
    { name: "twitter:image:alt", content: alt },
  ];
}
