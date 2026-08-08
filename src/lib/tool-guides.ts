import { posts, type BlogPost } from "./blog";

/**
 * Reverse index: tool slug → the blog posts that talk about that tool.
 *
 * Every tool page needs at least one outbound editorial link so crawlers (and
 * readers) have somewhere to go other than "back". Rather than hand-maintaining
 * a second mapping that drifts from the articles, the index is derived from the
 * posts themselves: a post counts for a tool when it is the post's CTA target
 * or when the body links to /tools/<slug>.
 */
function buildIndex(): Map<string, BlogPost[]> {
  const index = new Map<string, BlogPost[]>();
  const primaryCount = new Map<string, number>();
  const add = (slug: string, post: BlogPost, primary: boolean) => {
    const list = index.get(slug) ?? [];
    if (list.some((p) => p.slug === post.slug)) return;
    const primaries = primaryCount.get(slug) ?? 0;
    if (primary) {
      // CTA targets come first, newest first among themselves.
      let at = 0;
      while (at < primaries && list[at]!.date > post.date) at++;
      list.splice(at, 0, post);
      primaryCount.set(slug, primaries + 1);
    } else {
      list.push(post);
    }
    index.set(slug, list);
  };

  for (const post of posts) {
    if (post.lang && post.lang !== "en") continue;
    add(post.cta.toolSlug, post, true);
    const haystack = JSON.stringify(post.body);
    for (const match of haystack.matchAll(/\/tools\/([a-z0-9-]+)/g)) {
      add(match[1]!, post, false);
    }
  }
  return index;
}

const INDEX = buildIndex();

export interface ToolGuide {
  slug: string;
  title: string;
  description: string;
  readMinutes: number;
}

/** Tool categories mapped onto the tags used across the blog. */
const CATEGORY_TAGS: Record<string, string[]> = {
  PDF: ["PDF"],
  Image: ["Image"],
  Convert: ["Convert", "Image", "PDF"],
  AI: ["AI", "Image"],
  "Data & Utility": ["Privacy", "How-to"],
};

/**
 * Up to `limit` English guides for this tool, most relevant first. When no
 * article mentions the tool directly, falls back to the newest posts sharing a
 * tag with the tool's category so every tool page still links out to content.
 */
export function getToolGuides(toolSlug: string, category?: string, limit = 2): ToolGuide[] {
  let matches = INDEX.get(toolSlug) ?? [];
  if (matches.length === 0 && category) {
    const tags = CATEGORY_TAGS[category] ?? [];
    matches = posts
      .filter((p) => (!p.lang || p.lang === "en") && p.tags.some((t) => tags.includes(t)))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  return matches.slice(0, limit).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    readMinutes: p.readMinutes,
  }));
}
