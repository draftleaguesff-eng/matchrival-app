"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Design tokens ─────────────────────────────────────────────────────────────

const RING: Record<string, { border: string; shadow: string; color: string }> = {
  qb:  { border: "rgba(245,158,11,0.75)",  shadow: "0 0 10px rgba(245,158,11,0.2)",  color: "#F59E0B" },
  rb:  { border: "rgba(34,197,94,0.75)",   shadow: "0 0 10px rgba(34,197,94,0.2)",   color: "#22C55E" },
  wr:  { border: "rgba(59,130,246,0.75)",  shadow: "0 0 10px rgba(59,130,246,0.2)",  color: "#3B82F6" },
  te:  { border: "rgba(168,85,247,0.75)",  shadow: "0 0 10px rgba(168,85,247,0.2)",  color: "#A855F7" },
  de:  { border: "rgba(239,68,68,0.80)",   shadow: "0 0 8px rgba(239,68,68,0.18)",   color: "#EF4444" },
  dt:  { border: "rgba(239,68,68,0.50)",   shadow: "0 0 6px rgba(239,68,68,0.10)",   color: "#F87171" },
  lb:  { border: "rgba(251,146,60,0.75)",  shadow: "0 0 8px rgba(251,146,60,0.18)",  color: "#FB923C" },
  mlb: { border: "rgba(251,146,60,0.90)",  shadow: "0 0 12px rgba(251,146,60,0.25)", color: "#FBBF24" },
  cb:  { border: "rgba(99,179,237,0.75)",  shadow: "0 0 8px rgba(99,179,237,0.18)",  color: "#63B3ED" },
  ss:  { border: "rgba(6,182,212,0.75)",   shadow: "0 0 8px rgba(6,182,212,0.18)",   color: "#22D3EE" },
  fs:  { border: "rgba(6,182,212,0.75)",   shadow: "0 0 8px rgba(6,182,212,0.18)",   color: "#22D3EE" },
  nb:  { border: "rgba(99,179,237,0.75)",  shadow: "0 0 8px rgba(99,179,237,0.18)",  color: "#63B3ED" },
  ol:  { border: "rgba(148,163,184,0.45)", shadow: "0 0 6px rgba(148,163,184,0.08)", color: "#94A3B8" },
  nt:  { border: "rgba(239,68,68,0.45)",   shadow: "0 0 6px rgba(239,68,68,0.10)",   color: "#F87171" },
  olb: { border: "rgba(251,146,60,0.75)",  shadow: "0 0 8px rgba(251,146,60,0.18)",  color: "#FB923C" },
  ilb: { border: "rgba(251,146,60,0.75)",  shadow: "0 0 8px rgba(251,146,60,0.18)",  color: "#FB923C" },
};

const BADGE: Record<string, { bg: string; color: string }> = {
  qb:  { bg: "rgba(245,158,11,0.14)", color: "#F59E0B" },
  rb:  { bg: "rgba(34,197,94,0.14)",  color: "#22C55E" },
  wr:  { bg: "rgba(59,130,246,0.14)", color: "#60A5FA" },
  te:  { bg: "rgba(168,85,247,0.14)", color: "#A855F7" },
  de:  { bg: "rgba(239,68,68,0.14)",  color: "#EF4444" },
  dt:  { bg: "rgba(239,68,68,0.10)",  color: "#F87171" },
  lb:  { bg: "rgba(251,146,60,0.14)", color: "#FB923C" },
  mlb: { bg: "rgba(251,146,60,0.20)", color: "#FBBF24" },
  cb:  { bg: "rgba(99,179,237,0.14)", color: "#63B3ED" },
  ss:  { bg: "rgba(6,182,212,0.14)",  color: "#06B6D4" },
  fs:  { bg: "rgba(6,182,212,0.10)",  color: "#22D3EE" },
  nb:  { bg: "rgba(99,179,237,0.14)", color: "#63B3ED" },
  slot:{ bg: "rgba(59,130,246,0.14)", color: "#60A5FA" },
  ol:  { bg: "rgba(148,163,184,0.10)", color: "#94A3B8" },
  nt:  { bg: "rgba(239,68,68,0.10)",   color: "#F87171" },
  olb: { bg: "rgba(251,146,60,0.14)",  color: "#FB923C" },
  ilb: { bg: "rgba(251,146,60,0.14)",  color: "#FB923C" },
};

// ── Player interface ───────────────────────────────────────────────────────────

interface Player {
  display: string;
  initials: string;
  ringType: string;
  badgeType: string;
  badgeLabel: string;
  headshot?: string;
  size?: number;
  maxWidth?: number;
  nameBold?: boolean;
  rating?: number;
}

// ── NE OFFENSE (Side 0 — bottom) ──────────────────────────────────────────────

// LOS row: WR · LT · LG · C · RG · RT · TE · WR
const NE_OFF_LOS: Player[] = [
  { display: "A.J. Brown",     initials: "AB", ringType: "wr", badgeType: "wr",   badgeLabel: "WR",  headshot: "Brown_A.J..jpg", rating: 89 },
  { display: "J. Hudson III",  initials: "JH", ringType: "ol", badgeType: "ol",   badgeLabel: "LT",  headshot: "Hudson_James.jpg",      maxWidth: 38, rating: 63 },
  { display: "A. Vera-Tucker", initials: "AV", ringType: "ol", badgeType: "ol",   badgeLabel: "LG",  headshot: "Vera-Tucker_Alijah.jpg", maxWidth: 38, rating: 83 },
  { display: "B. Brown",       initials: "BB", ringType: "ol", badgeType: "ol",   badgeLabel: "C",   headshot: "Brown_Ben.jpg",           maxWidth: 38, rating: 65 },
  { display: "M. Onwenu",      initials: "MO", ringType: "ol", badgeType: "ol",   badgeLabel: "RG",  headshot: "Onwenu_Mike.jpg",         maxWidth: 38, rating: 86 },
  { display: "M. Moses",       initials: "MM", ringType: "ol", badgeType: "ol",   badgeLabel: "RT",  headshot: "Moses_Morgan.jpg",        maxWidth: 38, rating: 82 },
  { display: "H. Henry",       initials: "HH", ringType: "te", badgeType: "te",   badgeLabel: "TE",  headshot: "Henry_Hunter.jpg", maxWidth: 38, rating: 86 },
  { display: "M. Hollins",     initials: "MH", ringType: "wr", badgeType: "wr",   badgeLabel: "WR",  headshot: "Hollins_Mack.jpg", rating: 77 },
];

// SLOT (rendered in QB row, offset)
const NE_OFF_SLOT: Player[] = [
  { display: "E. Chism III", initials: "EC", ringType: "wr", badgeType: "slot", badgeLabel: "SLOT", headshot: "Chism_Efton.jpg", rating: 68 },
];

// QB row
const NE_OFF_QB: Player[] = [
  { display: "D. Maye", initials: "DM", ringType: "qb", badgeType: "qb", badgeLabel: "QB · #10", headshot: "Maye_Drake.jpg", nameBold: true, rating: 93 },
];

// RB row
const NE_OFF_RB: Player[] = [
  { display: "R. Stevenson", initials: "RS", ringType: "rb", badgeType: "rb", badgeLabel: "RB · #38", headshot: "Stevenson_Rhamondre.jpg", rating: 77 },
];

// ── SEA DEFENSE (Side 0 — top), 3-4 Hybrid ────────────────────────────────────

// Secondary row (furthest from LOS)
const SEA_DEF_SEC: Player[] = [
  { display: "J. Jobe",  initials: "JJ", ringType: "cb", badgeType: "cb", badgeLabel: "CB · #29", headshot: "Jobe_Josh.jpg", rating: 77 },
  { display: "J. Love",  initials: "JL", ringType: "ss", badgeType: "ss", badgeLabel: "SS · #20", headshot: "Love_Julian.jpg", rating: 85 },
  { display: "D. Bell",  initials: "DB", ringType: "fs", badgeType: "fs", badgeLabel: "FS · #23", headshot: "Bell_D'Anthony.jpg", rating: 70 },
  { display: "B. Clark", initials: "BC", ringType: "nb", badgeType: "nb", badgeLabel: "NB · #9",  headshot: "Clark_Bud.jpg", rating: 68 },
];

// LB row
const SEA_DEF_LB: Player[] = [
  { display: "D. Witherspoon", initials: "DW", ringType: "lb",  badgeType: "lb",  badgeLabel: "SLB · #21", headshot: "Witherspoon_Devon.jpg", rating: 91 },
  { display: "D. Thomas",      initials: "DT", ringType: "lb",  badgeType: "lb",  badgeLabel: "OLB · #32", headshot: "Thomas_Drake.jpg", rating: 75 },
  { display: "E. Jones",       initials: "EJ", ringType: "mlb", badgeType: "mlb", badgeLabel: "ILB · #13", headshot: "Jones_Ernest.jpg", rating: 83 },
  { display: "U. Nwosu",       initials: "UN", ringType: "lb",  badgeType: "lb",  badgeLabel: "ILB · #7",  headshot: "Nwosu_Uchenna.jpg", rating: 77 },
];

// DL row (closest to LOS)
const SEA_DEF_DL: Player[] = [
  { display: "L. Williams", initials: "LW", ringType: "de", badgeType: "de", badgeLabel: "LDE · #99", headshot: "Williams_Leonard.jpg", rating: 88 },
  { display: "J. Reed",     initials: "JR", ringType: "dt", badgeType: "dt", badgeLabel: "NT · #90",  headshot: "Reed_Jarran.jpg", rating: 78 },
  { display: "D. Lawrence", initials: "DL", ringType: "de", badgeType: "de", badgeLabel: "RDE · #0",  headshot: "Lawrence_DeMarcus.jpg", rating: 87 },
];

// ── SEA OFFENSE (Side 1 — bottom) ─────────────────────────────────────────────

// LOS row: WR · LT · LG · C · RG · RT · TE · WR
const SEA_OFF_LOS: Player[] = [
  { display: "JSN",           initials: "JN", ringType: "wr", badgeType: "wr",   badgeLabel: "WR",  headshot: "Smith-Njigba_Jaxon.jpg", rating: 95 },
  { display: "C. Cross",      initials: "CC", ringType: "ol", badgeType: "ol",   badgeLabel: "LT",  headshot: "Cross_Charles.jpg",    maxWidth: 38, rating: 83 },
  { display: "J. Sundell",    initials: "JS", ringType: "ol", badgeType: "ol",   badgeLabel: "LG",  headshot: "Sundell_Jalen.jpg",    maxWidth: 38, rating: 69 },
  { display: "O. Oluwatimi",  initials: "OO", ringType: "ol", badgeType: "ol",   badgeLabel: "C",   headshot: "Oluwatimi_Olu.jpg",    maxWidth: 38, rating: 66 },
  { display: "A. Bradford",   initials: "AB", ringType: "ol", badgeType: "ol",   badgeLabel: "RG",  headshot: "Bradford_Anthony.jpg", maxWidth: 38, rating: 72 },
  { display: "A. Lucas",      initials: "AL", ringType: "ol", badgeType: "ol",   badgeLabel: "RT",  headshot: "Lucas_Abraham.jpg",    maxWidth: 38, rating: 83 },
  { display: "AJ Barner",     initials: "AB", ringType: "te", badgeType: "te",   badgeLabel: "TE",  headshot: "Barner_AJ.jpg", maxWidth: 38, rating: 75 },
  { display: "C. Kupp",       initials: "CK", ringType: "wr", badgeType: "wr",   badgeLabel: "WR",  headshot: "Kupp_Cooper.jpg", rating: 84 },
];

// SLOT (rendered in QB row, offset)
const SEA_OFF_SLOT: Player[] = [
  { display: "R. Shaheed", initials: "RS", ringType: "wr", badgeType: "slot", badgeLabel: "SLOT", headshot: "Shaheed_Rashid.jpg", rating: 79 },
];

// QB row
const SEA_OFF_QB: Player[] = [
  { display: "S. Darnold", initials: "SD", ringType: "qb", badgeType: "qb", badgeLabel: "QB · #14", headshot: "Darnold_Sam.jpg", nameBold: true, rating: 85 },
];

// RB row
const SEA_OFF_RB: Player[] = [
  { display: "Z. Charbonnet", initials: "ZC", ringType: "rb", badgeType: "rb", badgeLabel: "RB · #26", headshot: "Charbonnet_Zach.jpg", rating: 82 },
];

// ── NE DEFENSE (Side 1 — top), 3-4 Base ───────────────────────────────────────

// Secondary row (furthest from LOS)
const NE_DEF_SEC: Player[] = [
  { display: "C. Davis",    initials: "CD", ringType: "cb", badgeType: "cb", badgeLabel: "CB · #7",  headshot: "Davis_Carlton.jpg", rating: 85 },
  { display: "K. Byard",   initials: "KB", ringType: "ss", badgeType: "ss", badgeLabel: "SS · #31", headshot: "Byard_Kevin.jpg", rating: 84 },
  { display: "M. Jones",   initials: "MJ", ringType: "nb", badgeType: "nb", badgeLabel: "NB · #25", headshot: "Jones_Marcus.jpg", rating: 82 },
  { display: "C. Gonzalez",initials: "CG", ringType: "cb", badgeType: "cb", badgeLabel: "CB · #0",  headshot: "Gonzalez_Christian.jpg", rating: 98 },
];

// LB row
const NE_DEF_LB: Player[] = [
  { display: "R. Spillane", initials: "RS", ringType: "lb",  badgeType: "lb",  badgeLabel: "OLB · #14", headshot: "Spillane_Robert.jpg", rating: 85 },
  { display: "K.J. Britt",  initials: "KB", ringType: "lb",  badgeType: "lb",  badgeLabel: "ILB · #35", headshot: "Britt_KJ.jpg", rating: 71 },
  { display: "C. Muma",     initials: "CM", ringType: "mlb", badgeType: "mlb", badgeLabel: "ILB · #49", headshot: "Muma_Chad.jpg", rating: 70 },
  { display: "D. Jones",    initials: "DJ", ringType: "lb",  badgeType: "lb",  badgeLabel: "OLB · #5",  headshot: "Jones_DReMont.jpg", rating: 75 },
];

// DL row (closest to LOS)
const NE_DEF_DL: Player[] = [
  { display: "C. Barmore", initials: "CB", ringType: "de", badgeType: "de", badgeLabel: "LDE · #90", headshot: "Barmore_Christian.jpg", rating: 79 },
  { display: "C. Durden",  initials: "CD", ringType: "dt", badgeType: "dt", badgeLabel: "NT · #94",  headshot: "Durden_Cory.jpg", rating: 68 },
  { display: "H. Landry",  initials: "HL", ringType: "de", badgeType: "de", badgeLabel: "RDE · #2",  headshot: "Landry_Harold.jpg", rating: 82 },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function PlayerImage({ src, initials, color }: { src: string; initials: string; color: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={initials}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (sib) sib.style.display = "flex";
        }}
      />
      <span style={{
        display: "none", position: "absolute", inset: 0,
        alignItems: "center", justifyContent: "center",
        fontSize: 8, fontWeight: 800, letterSpacing: "-0.02em", color,
        background: "#151B28",
      }}>
        {initials}
      </span>
    </>
  );
}

function PlayerBubble({ p }: { p: Player }) {
  const ring  = RING[p.ringType]  || RING.wr;
  const badge = BADGE[p.badgeType] || BADGE.wr;
  const size  = p.size ?? 30;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, maxWidth: p.maxWidth ?? 56, flexShrink: 0, overflow: "hidden" }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        border: `2px solid ${ring.border}`,
        boxShadow: ring.shadow,
        overflow: "hidden",
        background: "#151B28",
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {p.headshot ? (
          <PlayerImage src={`/headshots/${p.headshot}`} initials={p.initials} color={ring.color} />
        ) : (
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "-0.02em", color: ring.color }}>
            {p.initials}
          </span>
        )}
      </div>
      {p.rating !== undefined && (
        <span style={{
          fontSize: 6, fontWeight: 900, lineHeight: 1,
          background: "rgba(0,0,0,0.6)", borderRadius: 3, padding: "1px 3px",
          color: p.rating >= 90 ? "#FFD700" : p.rating >= 80 ? "#22C55E" : p.rating >= 70 ? "#60A5FA" : "#94A3B8",
        }}>
          {p.rating}
        </span>
      )}
      <span style={{
        fontSize: 6.5, fontWeight: p.nameBold ? 700 : 600,
        color: p.nameBold ? "#CBD5E1" : "#94A3B8",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        maxWidth: "100%", textAlign: "center",
      }}>
        {p.display}
      </span>
      <span style={{
        fontSize: 5.5, fontWeight: 800, letterSpacing: "0.04em",
        padding: "1px 5px", borderRadius: 4, textTransform: "uppercase",
        whiteSpace: "nowrap",
        background: badge.bg, color: badge.color,
      }}>
        {p.badgeLabel}
      </span>
    </div>
  );
}

function FormationRow({ players, justify = "space-evenly", padded = false, gap, padding }: {
  players: Player[];
  justify?: "space-evenly" | "center" | "space-between";
  padded?: boolean;
  gap?: number;
  padding?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", width: "100%",
      justifyContent: justify,
      padding: padding ?? (padded ? "0 8px" : undefined),
      gap,
    }}>
      {players.map((p, i) => <PlayerBubble key={i} p={p} />)}
    </div>
  );
}

function LOS() {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "6px 14px", margin: "2px 0" }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), rgba(245,158,11,0.85), rgba(245,158,11,0.55), transparent)" }} />
      <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(245,158,11,0.55)", letterSpacing: "0.18em", textTransform: "uppercase", padding: "0 10px", whiteSpace: "nowrap" }}>
        Line of Scrimmage
      </span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), rgba(245,158,11,0.85), rgba(245,158,11,0.55), transparent)" }} />
    </div>
  );
}

function FormationHeader({
  teamColor, teamName, subLabel, pillLabel, pillType, logo,
}: {
  teamColor: string; teamName: string; subLabel: string;
  pillLabel: string; pillType: "off" | "def"; logo: string;
}) {
  const pillStyle = pillType === "off"
    ? { bg: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }
    : { bg: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 4px", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt={teamName} style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }} />
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: teamColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {teamName}
          </div>
          <div style={{ fontSize: 10, color: "#4B5563", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {subLabel}
          </div>
        </div>
      </div>
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 6, textTransform: "uppercase", flexShrink: 0, background: pillStyle.bg, color: pillStyle.color, border: pillStyle.border }}>
        {pillLabel}
      </span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function MatchupPage() {
  const [side, setSide] = useState<0 | 1>(0); // 0 = NE Off / SEA Def  |  1 = SEA Off / NE Def

  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const update = () => setZoom(window.innerWidth > 430 ? window.innerWidth / 430 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fieldBg = `
    repeating-linear-gradient(180deg,
      rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px,
      transparent 1px, transparent 50px
    ),
    linear-gradient(180deg, #040D05 0%, #050E06 40%, #050E06 60%, #040D05 100%)
  `;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: "#0D0F14", minHeight: "100vh", paddingBottom: 112, ...(zoom > 1 ? { zoom } as unknown as React.CSSProperties : {}) }}>

      {/* ── Sticky header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px 10px",
        background: "rgba(13,15,20,0.98)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0, zIndex: 60,
        backdropFilter: "blur(16px)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, background: "none", color: "#94A3B8", fontSize: 13, fontWeight: 600, textDecoration: "none", padding: "4px 8px", borderRadius: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Week 1
        </Link>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase" }}>NFL · 2026</span>
        <button style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", color: "#94A3B8", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          Share
        </button>
      </div>

      {/* ── Scoreboard ── */}
      <div style={{ background: "linear-gradient(180deg,#111318 0%,#0E1016 100%)", padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* NE — away */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "1 1 0", minWidth: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/headshots/logo_ne.png" alt="NE" style={{ width: 44, height: 44, objectFit: "contain" }} />
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#C8102E" }}>NE</span>
            <span style={{ fontSize: 10, color: "#4B5563", fontWeight: 500 }}>Away · 0–0</span>
          </div>
          {/* Score center */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "1 1 0", maxWidth: 150 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#F1F5F9", letterSpacing: "-0.04em" }}>0</span>
              <span style={{ fontSize: 20, color: "#334155" }}>–</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#F1F5F9", letterSpacing: "-0.04em" }}>0</span>
            </div>
            <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
              Wed · 8:20 PM ET
            </div>
            <div style={{ fontSize: 11, color: "#64748B", textAlign: "center" }}>Sep 9 · Opening Night</div>
          </div>
          {/* SEA — home */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "1 1 0", minWidth: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/headshots/logo_sea.png" alt="SEA" style={{ width: 44, height: 44, objectFit: "contain" }} />
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#69BE28" }}>SEA</span>
            <span style={{ fontSize: 10, color: "#4B5563", fontWeight: 500 }}>Home · 0–0</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#374151", textAlign: "center", marginTop: 10 }}>Lumen Field · Seattle, WA</div>
      </div>

      {/* ── Side toggle ── */}
      <div style={{ display: "flex", background: "#0E1016", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 4px" }}>
        {[
          { label: "NE Off vs SEA Def",  pipColor: "#C8102E" },
          { label: "SEA Off vs NE Def",  pipColor: "#69BE28" },
        ].map((opt, i) => (
          <button
            key={i}
            onClick={() => setSide(i as 0 | 1)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "11px 8px", background: "none", border: "none",
              borderBottom: side === i ? "2px solid #3B82F6" : "2px solid transparent",
              fontSize: 12, fontWeight: 600, color: side === i ? "#E2E8F0" : "#4B5563",
              cursor: "pointer",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.pipColor, display: "inline-block" }} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Field ── */}
      <div style={{ position: "relative", background: fieldBg, overflow: "hidden", paddingTop: 16, paddingBottom: 16 }}>
        {/* Zone labels — DEFENSE top, OFFENSE bottom */}
        <span style={{ position: "absolute", fontSize: 8, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.12, right: 14, top: 24, color: "#EF4444" }}>DEFENSE</span>
        <span style={{ position: "absolute", fontSize: 8, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.12, right: 14, bottom: 24, color: "#22C55E" }}>OFFENSE</span>

        {side === 0 ? (
          <>
            {/* ── SEA Defense — top ── */}
            <div style={{ background: "linear-gradient(180deg,rgba(239,68,68,0.05) 0%,transparent 100%)" }}>
              <FormationHeader
                teamColor="#69BE28" teamName="SEAHAWKS"
                subLabel="Defensive Formation" pillLabel="3-4 Hybrid" pillType="def"
                logo="/headshots/logo_sea.png"
              />
            </div>
            <div style={{ padding: "24px 4px 4px", background: "linear-gradient(180deg,rgba(239,68,68,0.04) 0%,transparent 100%)" }}>
              {/* Safeties — deep */}
              <div style={{ marginBottom: 12 }}>
                <FormationRow players={[SEA_DEF_SEC[1], SEA_DEF_SEC[2]]} justify="center" gap={60} />
              </div>
              {/* LBs */}
              <div style={{ marginBottom: 12 }}>
                <FormationRow players={SEA_DEF_LB} justify="space-evenly" padding="0 24px" />
              </div>
              {/* DL + CBs — at LOS, facing off against OL/WRs */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "0 4px" }}>
                <div style={{ position: "absolute", left: 4 }}>
                  <PlayerBubble p={SEA_DEF_SEC[0]} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>
                  <PlayerBubble p={SEA_DEF_DL[0]} />
                  <PlayerBubble p={SEA_DEF_DL[1]} />
                  <PlayerBubble p={SEA_DEF_DL[2]} />
                </div>
                <div style={{ position: "absolute", right: 4 }}>
                  <PlayerBubble p={SEA_DEF_SEC[3]} />
                </div>
              </div>
            </div>

            <LOS />

            {/* ── NE Offense — bottom ── */}
            <div style={{ padding: "20px 4px 55px", background: "linear-gradient(180deg,transparent 0%,rgba(34,197,94,0.04) 100%)" }}>
              {/* LOS row: WR-L pinned left | OL+TE centered | SLOT+WR-R pinned right */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "0 4px", marginBottom: 54 }}>
                <div style={{ position: "absolute", left: 4 }}>
                  <PlayerBubble p={NE_OFF_LOS[0]} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                  {NE_OFF_LOS.slice(1, 7).map((p, i) => <PlayerBubble key={i} p={p} />)}
                </div>
                <div style={{ position: "absolute", right: 4, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <PlayerBubble p={NE_OFF_SLOT[0]} />
                  <PlayerBubble p={NE_OFF_LOS[7]} />
                </div>
              </div>
              {/* Shotgun backfield: QB behind C, RB to QB's right */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingLeft: "43%", marginBottom: 0 }}>
                <PlayerBubble p={NE_OFF_QB[0]} />
                <PlayerBubble p={NE_OFF_RB[0]} />
              </div>
            </div>
            <div style={{ background: "linear-gradient(180deg,transparent 0%,rgba(34,197,94,0.05) 100%)" }}>
              <FormationHeader
                teamColor="#C8102E" teamName="PATRIOTS"
                subLabel="Offensive Formation" pillLabel="11 Personnel" pillType="off"
                logo="/headshots/logo_ne.png"
              />
            </div>
          </>
        ) : (
          <>
            {/* ── NE Defense — top ── */}
            <div style={{ background: "linear-gradient(180deg,rgba(239,68,68,0.05) 0%,transparent 100%)" }}>
              <FormationHeader
                teamColor="#C8102E" teamName="PATRIOTS"
                subLabel="Defensive Formation" pillLabel="3-4 Base" pillType="def"
                logo="/headshots/logo_ne.png"
              />
            </div>
            <div style={{ padding: "24px 4px 4px", background: "linear-gradient(180deg,rgba(239,68,68,0.04) 0%,transparent 100%)" }}>
              {/* Safety — deep */}
              <div style={{ marginBottom: 12 }}>
                <FormationRow players={[NE_DEF_SEC[1]]} justify="center" />
              </div>
              {/* LBs */}
              <div style={{ marginBottom: 12 }}>
                <FormationRow players={NE_DEF_LB} justify="space-evenly" padding="0 24px" />
              </div>
              {/* DL + CBs — at LOS, facing off against OL/WRs */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "0 4px" }}>
                <div style={{ position: "absolute", left: 4 }}>
                  <PlayerBubble p={NE_DEF_SEC[0]} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>
                  <PlayerBubble p={NE_DEF_DL[0]} />
                  <PlayerBubble p={NE_DEF_DL[1]} />
                  <PlayerBubble p={NE_DEF_DL[2]} />
                </div>
                <div style={{ position: "absolute", right: 4, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <PlayerBubble p={NE_DEF_SEC[2]} />
                  <PlayerBubble p={NE_DEF_SEC[3]} />
                </div>
              </div>
            </div>

            <LOS />

            {/* ── SEA Offense — bottom ── */}
            <div style={{ padding: "20px 4px 55px", background: "linear-gradient(180deg,transparent 0%,rgba(34,197,94,0.04) 100%)" }}>
              {/* LOS row: WR-L pinned left | OL+TE centered | SLOT+WR-R pinned right */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "0 4px", marginBottom: 54 }}>
                <div style={{ position: "absolute", left: 4 }}>
                  <PlayerBubble p={SEA_OFF_LOS[0]} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                  {SEA_OFF_LOS.slice(1, 7).map((p, i) => <PlayerBubble key={i} p={p} />)}
                </div>
                <div style={{ position: "absolute", right: 4, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <PlayerBubble p={SEA_OFF_SLOT[0]} />
                  <PlayerBubble p={SEA_OFF_LOS[7]} />
                </div>
              </div>
              {/* Shotgun backfield: QB behind C, RB to QB's right */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingLeft: "43%", marginBottom: 0 }}>
                <PlayerBubble p={SEA_OFF_QB[0]} />
                <PlayerBubble p={SEA_OFF_RB[0]} />
              </div>
            </div>
            <div style={{ background: "linear-gradient(180deg,transparent 0%,rgba(34,197,94,0.05) 100%)" }}>
              <FormationHeader
                teamColor="#69BE28" teamName="SEAHAWKS"
                subLabel="Offensive Formation" pillLabel="11 Personnel" pillType="off"
                logo="/headshots/logo_sea.png"
              />
            </div>
          </>
        )}
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display: "flex", background: "#0E1016", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", gap: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pass Yds/G</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#22C55E" }}>284.3</span>
          <span style={{ fontSize: 9, color: "#374151" }}>{side === 0 ? "NE Off" : "SEA Off"}</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, borderLeft: "1px solid rgba(255,255,255,0.06)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Season</span>
          <span style={{ fontSize: 11, color: "#374151", marginTop: 3, fontWeight: 800 }}>PRE-SEASON</span>
          <span style={{ fontSize: 9, color: "#374151" }}>No data yet</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, overflow: "hidden" }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pts Allowed</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#22C55E" }}>18.2</span>
          <span style={{ fontSize: 9, color: "#374151" }}>{side === 0 ? "SEA Def" : "NE Def"}</span>
        </div>
      </div>

      {/* ── Injury strip ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "rgba(239,68,68,0.04)", borderTop: "1px solid rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94A3B8" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
          <span><span style={{ fontWeight: 700, color: "#F1F5F9" }}>D. Maye</span> — Questionable</span>
        </div>
        <span style={{ fontSize: 10, color: "#F87171", fontWeight: 600 }}>⚠ Shoulder</span>
      </div>

    </div>
  );
}
