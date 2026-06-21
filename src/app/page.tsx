import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Game {
  time: string;
  isLive: boolean;
  liveLabel?: string;
  home: { abbr: string; score?: number; winning?: boolean };
  away: { abbr: string; score?: number };
}

interface InjuryAlert {
  name: string;
  headshot: string;
  posClass: "rb" | "wr" | "qb" | "te";
  badge: "Q" | "O" | "IR";
  desc: string;
  ago: string;
}

interface TrendPlayer {
  name: string;
  headshot: string;
  posClass: "rb" | "wr" | "qb" | "te";
  pos: string;
  team: string;
  dir: "up" | "down";
  pct: string;
}

interface NewsStory {
  emoji: string;
  source: string;
  ago: string;
  headline: string;
  tagLabel: string;
  tagColor: string;
  tagBg: string;
}

// ── Static data ────────────────────────────────────────────────────────────────

const GAMES: Game[] = [
  {
    time: "Q3 · 4:22",
    isLive: true,
    home: { abbr: "PHI", score: 24, winning: true },
    away: { abbr: "DAL", score: 17 },
  },
  {
    time: "Sun · 4:25 PM",
    isLive: false,
    home: { abbr: "KC" },
    away: { abbr: "BUF" },
  },
  {
    time: "Sun · 8:20 PM",
    isLive: false,
    home: { abbr: "SF" },
    away: { abbr: "DET" },
  },
  {
    time: "Mon · 8:15 PM",
    isLive: false,
    home: { abbr: "MIA" },
    away: { abbr: "BAL" },
  },
];

const INJURIES: InjuryAlert[] = [
  {
    name: "Jonathan Taylor",
    headshot: "/headshots/Taylor_Jonathan.jpg",
    posClass: "rb",
    badge: "Q",
    desc: "Limited Wednesday — hamstring. Monitor Thursday report.",
    ago: "2h ago",
  },
  {
    name: "A.J. Brown",
    headshot: "/headshots/Brown_A.J..jpg",
    posClass: "wr",
    badge: "O",
    desc: "Ruled out Sunday — knee. Expected back Week 15.",
    ago: "4h ago",
  },
  {
    name: "Tee Higgins",
    headshot: "/headshots/Higgins_Tee.jpg",
    posClass: "wr",
    badge: "Q",
    desc: "Questionable — rib. Was full practice Thursday.",
    ago: "6h ago",
  },
];

const TRENDING: TrendPlayer[] = [
  { name: "De'Von Achane", headshot: "/headshots/Achane_De'Von.jpg", posClass: "rb", pos: "RB", team: "MIA", dir: "up",   pct: "+18%" },
  { name: "Puka Nacua",    headshot: "/headshots/Nacua_Puka.jpg",    posClass: "wr", pos: "WR", team: "LAR", dir: "up",   pct: "+12%" },
  { name: "Ashton Jeanty", headshot: "/headshots/Jeanty_Ashton.jpg", posClass: "rb", pos: "RB", team: "LV",  dir: "up",   pct: "+9%"  },
  { name: "Tee Higgins",   headshot: "/headshots/Higgins_Tee.jpg",   posClass: "wr", pos: "WR", team: "CIN", dir: "down", pct: "−14%" },
  { name: "Brock Bowers",  headshot: "/headshots/Bowers_Brock.jpg",  posClass: "te", pos: "TE", team: "LV",  dir: "up",   pct: "+7%"  },
];

const NEWS: NewsStory[] = [
  {
    emoji: "🏈",
    source: "ESPN",
    ago: "1h ago",
    headline: "Taylor limited in practice, hamstring still a concern heading into Sunday",
    tagLabel: "Injury",
    tagColor: "#EF4444",
    tagBg: "rgba(239,68,68,0.12)",
  },
  {
    emoji: "💰",
    source: "NFL",
    ago: "3h ago",
    headline: "Eagles complete trade for WR depth ahead of playoff push",
    tagLabel: "Trade",
    tagColor: "#3B82F6",
    tagBg: "rgba(59,130,246,0.12)",
  },
  {
    emoji: "⚡",
    source: "The Athletic",
    ago: "5h ago",
    headline: "KC vs BUF preview: Mahomes vs Allen could be the game of the year",
    tagLabel: "Game Preview",
    tagColor: "#F59E0B",
    tagBg: "rgba(245,158,11,0.12)",
  },
  {
    emoji: "🌟",
    source: "PFF",
    ago: "8h ago",
    headline: "Ashton Jeanty on pace to break rookie rushing record in second half",
    tagLabel: "Rookie Watch",
    tagColor: "#8B5CF6",
    tagBg: "rgba(139,92,246,0.12)",
  },
];

// ── Position colors ─────────────────────────────────────────────────────────────

const POS_RING: Record<string, string> = {
  rb: "rgba(34,197,94,0.50)",
  wr: "rgba(59,130,246,0.50)",
  qb: "rgba(245,158,11,0.50)",
  te: "rgba(139,92,246,0.50)",
};

const POS_BADGE_BG: Record<string, string> = {
  rb: "rgba(34,197,94,0.13)",
  wr: "rgba(59,130,246,0.13)",
  qb: "rgba(245,158,11,0.13)",
  te: "rgba(139,92,246,0.13)",
};

const POS_BADGE_COLOR: Record<string, string> = {
  rb: "#22C55E",
  wr: "#6BA5F8",
  qb: "#F59E0B",
  te: "#A78BFA",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function SectionHeader({ title, link }: { title: string; link: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 10px" }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: "#E8EBF4", letterSpacing: "-0.01em" }}>{title}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", cursor: "pointer" }}>{link}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>

      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 16px 14px",
        position: "sticky", top: 0, zIndex: 10,
        background: "#0D0F14",
        borderBottom: "1px solid #1A1F2E",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, background: "#3B82F6", borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900, color: "#fff",
            boxShadow: "0 0 12px rgba(59,130,246,0.4)", flexShrink: 0,
          }}>MR</div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: "#E8EBF4" }}>
            Match<span style={{ color: "#3B82F6" }}>Rival</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            cursor: "pointer",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892AA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#EF4444", border: "1.5px solid #0D0F14" }} />
          </div>
        </div>
      </header>

      {/* ── Greeting ── */}
      <div style={{ padding: "16px 16px 4px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#4B5268", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
          Welcome back
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#E8EBF4", letterSpacing: "-0.03em" }}>
          JDawg 👋
        </div>
      </div>

      {/* ── Games Today ── */}
      <SectionHeader title="Games Today" link="Full Schedule →" />
      <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px 4px" }}>
        {GAMES.map((g, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              background: g.isLive ? "rgba(34,197,94,0.04)" : "#141720",
              border: `1px solid ${g.isLive ? "rgba(34,197,94,0.30)" : "#1A1F2E"}`,
              borderRadius: 14,
              padding: "12px 14px",
              width: 150,
            }}
          >
            {/* Time / live badge */}
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: g.isLive ? "#22C55E" : "#4B5268", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
              {g.isLive && (
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 4px rgba(34,197,94,0.8)", display: "inline-block" }} />
              )}
              {g.time}
            </div>

            {/* Home team */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 4, background: "#1C2133", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 900, color: "#4B5268" }}>
                  {g.home.abbr}
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#E8EBF4" }}>{g.home.abbr}</span>
              </div>
              <span style={{ fontSize: g.home.score !== undefined ? 14 : 11, fontWeight: 900, color: g.home.winning ? "#22C55E" : g.home.score !== undefined ? "#E8EBF4" : "#4B5268", letterSpacing: "-0.02em" }}>
                {g.home.score !== undefined ? g.home.score : "—"}
              </span>
            </div>

            <div style={{ height: 1, background: "#1A1F2E", margin: "7px 0" }} />

            {/* Away team */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 4, background: "#1C2133", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 900, color: "#4B5268" }}>
                  {g.away.abbr}
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#E8EBF4" }}>{g.away.abbr}</span>
              </div>
              <span style={{ fontSize: g.away.score !== undefined ? 14 : 11, fontWeight: 900, color: g.away.score !== undefined ? "#E8EBF4" : "#4B5268", letterSpacing: "-0.02em" }}>
                {g.away.score !== undefined ? g.away.score : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Injury Alerts ── */}
      <SectionHeader title="🚨 Injury Alerts" link="See All →" />
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {INJURIES.map((inj, i) => (
          <div
            key={i}
            style={{
              background: "#141720", border: "1px solid #1A1F2E",
              borderRadius: 12, padding: "11px 13px",
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            {/* Headshot */}
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              overflow: "hidden", flexShrink: 0,
              background: "#1C2133",
              border: `2px solid ${POS_RING[inj.posClass]}`,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inj.headshot} alt={inj.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#E8EBF4" }}>{inj.name}</span>
                <span style={{
                  fontSize: 7, fontWeight: 900, letterSpacing: "0.06em",
                  padding: "1.5px 4px", borderRadius: 3, flexShrink: 0,
                  ...(inj.badge === "Q"  ? { background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.30)" } :
                      inj.badge === "O"  ? { background: "rgba(239,68,68,0.15)",  color: "#EF4444", border: "1px solid rgba(239,68,68,0.30)"  } :
                                           { background: "rgba(100,116,139,0.15)", color: "#94A3B8", border: "1px solid rgba(100,116,139,0.30)" }),
                }}>
                  {inj.badge}
                </span>
              </div>
              <div style={{ fontSize: 10.5, color: "#4B5268", fontWeight: 500, lineHeight: 1.35 }}>{inj.desc}</div>
            </div>
            {/* Time */}
            <span style={{ fontSize: 9, color: "#4B5268", flexShrink: 0 }}>{inj.ago}</span>
          </div>
        ))}
      </div>

      {/* ── Trending Players ── */}
      <SectionHeader title="🔥 Trending" link="See All →" />
      <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px 4px" }}>
        {TRENDING.map((t, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0, width: 110,
              background: "#141720", border: "1px solid #1A1F2E",
              borderRadius: 14, padding: "13px 10px 11px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", background: "#1C2133", border: `2px solid ${POS_RING[t.posClass]}`, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.headshot} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#E8EBF4", textAlign: "center", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{t.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.06em", padding: "1.5px 4px", borderRadius: 3, textTransform: "uppercase", background: POS_BADGE_BG[t.posClass], color: POS_BADGE_COLOR[t.posClass] }}>{t.pos}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#4B5268" }}>{t.team}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 800, color: t.dir === "up" ? "#22C55E" : "#EF4444" }}>
              {t.dir === "up" ? "↑" : "↓"} {t.pct}
            </div>
          </div>
        ))}
      </div>

      {/* ── Top News ── */}
      <SectionHeader title="📰 Top News" link="See All →" />
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 1 }}>
        {NEWS.map((n, i) => (
          <div
            key={i}
            style={{
              background: "#141720", border: "1px solid #1A1F2E",
              padding: "13px 14px",
              display: "flex", gap: 12, alignItems: "flex-start",
              borderRadius: i === 0 ? "14px 14px 0 0" : i === NEWS.length - 1 ? "0 0 14px 14px" : 0,
            }}
          >
            {/* Thumb */}
            <div style={{ width: 58, height: 52, borderRadius: 8, flexShrink: 0, overflow: "hidden", background: "#1C2133", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{n.emoji}</span>
            </div>
            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3B82F6" }}>{n.source}</span>
                <div style={{ width: 2, height: 2, borderRadius: "50%", background: "#4B5268" }} />
                <span style={{ fontSize: 9, color: "#4B5268", fontWeight: 500 }}>{n.ago}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#E8EBF4", lineHeight: 1.4, letterSpacing: "-0.01em" }}>{n.headline}</div>
              <span style={{ display: "inline-block", marginTop: 5, fontSize: 8, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: n.tagBg, color: n.tagColor }}>
                {n.tagLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom padding */}
      <div style={{ height: 24 }} />
    </div>
  );
}
