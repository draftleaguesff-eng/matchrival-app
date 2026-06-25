import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const RSS_URLS = [
  "https://www.espn.com/espn/rss/nfl/news",
  "https://www.nfl.com/rss/rsslanding?searchString=news",
];

const TEAM_KEYWORDS: Record<string, string[]> = {
  "New England Patriots": ["patriots", "new england", "pats"],
  "Seattle Seahawks": ["seahawks", "seattle"],
  "Kansas City Chiefs": ["chiefs", "kansas city"],
  "Buffalo Bills": ["bills", "buffalo"],
  "Dallas Cowboys": ["cowboys", "dallas"],
  "Philadelphia Eagles": ["eagles", "philadelphia"],
  "San Francisco 49ers": ["49ers", "san francisco", "niners"],
  "Miami Dolphins": ["dolphins", "miami"],
  "Chicago Bears": ["bears", "chicago"],
  "Green Bay Packers": ["packers", "green bay"],
};

const TEAM_ABBR: Record<string, string> = {
  "New England Patriots": "NE",
  "Seattle Seahawks": "SEA",
  "Kansas City Chiefs": "KC",
  "Buffalo Bills": "BUF",
  "Dallas Cowboys": "DAL",
  "Philadelphia Eagles": "PHI",
  "San Francisco 49ers": "SF",
  "Miami Dolphins": "MIA",
  "Chicago Bears": "CHI",
  "Green Bay Packers": "GB",
};

function detectTeam(text: string): string {
  const lower = text.toLowerCase();
  for (const [team, keywords] of Object.entries(TEAM_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return team;
  }
  return "NFL";
}

function detectTag(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("injur") || lower.includes("hurt") || lower.includes("questionable") || lower.includes("out ") || lower.includes("sidelined")) return "INJURY";
  if (lower.includes("practice") || lower.includes("walkthrough") || lower.includes("drill")) return "PRACTICE";
  if (lower.includes("depth chart") || lower.includes("starter") || lower.includes("no. 1") || lower.includes("role")) return "DEPTH CHART";
  if (lower.includes("sign") || lower.includes("trade") || lower.includes("cut") || lower.includes("waiv") || lower.includes("roster") || lower.includes("release")) return "ROSTER";
  return "UPDATE";
}

function parseRSS(xml: string) {
  const items: { title: string; description: string; pubDate: string; link: string }[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const match of itemMatches) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const description = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    if (title) items.push({ title, description: description.replace(/<[^>]+>/g, "").slice(0, 400), pubDate, link });
  }
  return items;
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `${Math.floor(ms / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export async function GET() {
  try {
    let curated: object[] = [];
    try {
      const raw = readFileSync(join(process.cwd(), "public", "curated-news.json"), "utf-8");
      curated = JSON.parse(raw);
    } catch {
      curated = [];
    }
    const curatedLinks = new Set((curated as { link?: string }[]).map(i => i.link));

    const results = await Promise.allSettled(
      RSS_URLS.map(url => fetch(url, { next: { revalidate: 300 } }).then(r => r.text()))
    );
    const allItems: object[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        const items = parseRSS(result.value);
        for (const item of items) {
          const combined = item.title + " " + item.description;
          const team = detectTeam(combined);
          allItems.push({
            id: item.link,
            team,
            abbr: TEAM_ABBR[team] ?? "NFL",
            tag: detectTag(combined),
            title: item.title,
            body: item.description,
            time: timeAgo(item.pubDate),
            link: item.link,
            isCurated: false,
          });
        }
      }
    }
    const taggedCurated = (curated as object[]).map(i => ({ ...(i as object), isCurated: true }));
    const rssFiltered = allItems.filter((i: object) => !curatedLinks.has((i as { id: string }).id));
    return NextResponse.json([...taggedCurated, ...rssFiltered].slice(0, 30));
  } catch {
    return NextResponse.json([]);
  }
}
