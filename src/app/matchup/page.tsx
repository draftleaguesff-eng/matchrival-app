"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { GameMatchupData } from "@/lib/matchup-types";
import { NE_SEA } from "@/lib/matchup-data/ne-sea";
import { ALL_GAMES } from "@/lib/matchup-data";

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


// ── Sub-components ─────────────────────────────────────────────────────────────

function PlayerImage({ src, initials, color }: { src: string; initials: string; color: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={initials}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block", borderRadius: "50%" }}
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
  const size  = p.size ?? 28;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, maxWidth: p.maxWidth ?? 52, flexShrink: 0, overflow: "hidden" }}>
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
  teamColor, teamName, subLabel, pillLabel, pillType, logo, onPillClick,
}: {
  teamColor: string; teamName: string; subLabel: string;
  pillLabel: string; pillType: "off" | "def"; logo: string;
  onPillClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const pillStyle = pillType === "off"
    ? { bg: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }
    : { bg: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" };
  const pillBase: React.CSSProperties = {
    fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 9px",
    borderRadius: 6, textTransform: "uppercase", flexShrink: 0,
    background: pillStyle.bg, color: pillStyle.color, border: pillStyle.border,
  };
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
      {onPillClick ? (
        <div>
          <button
            onClick={(e) => { e.stopPropagation(); onPillClick(e); }}
            style={{ ...pillBase, background: "none", cursor: "pointer", textDecorationLine: "underline", textDecorationStyle: "dotted" }}
          >
            {pillLabel}
          </button>
        </div>
      ) : (
        <span style={pillBase}>{pillLabel}</span>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

const MATCHUP_GAMES = [
  { time: "Wed · Sep 9 · 8:20 PM",  away: "NE",  home: "SEA", awayLogo: "/headshots/logo_ne.png",                                        homeLogo: "/headshots/logo_sea.png",                                        available: true  },
  { time: "Thu · Sep 10 · 8:35 PM", away: "SF",  home: "LAR", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",              homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",              available: true},
  { time: "Sun · Sep 13 · 1:00 PM", away: "CHI", home: "CAR", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",              available: true},
  { time: "Sun · Sep 13 · 1:00 PM", away: "TB",  home: "CIN", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png",              homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png",              available: true},
  { time: "Sun · Sep 13 · 1:00 PM", away: "NO",  home: "DET", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/no.png",              homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png",              available: true},
  { time: "Sun · Sep 13 · 1:00 PM", away: "BUF", home: "HOU", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png",              available: true},
  { time: "Sun · Sep 13 · 1:00 PM", away: "BAL", home: "IND", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png",              available: true},
  { time: "Sun · Sep 13 · 1:00 PM", away: "CLE", home: "JAX", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png",              available: true},
  { time: "Sun · Sep 13 · 1:00 PM", away: "ATL", home: "PIT", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",              available: true},
  { time: "Sun · Sep 13 · 1:00 PM", away: "NYJ", home: "TEN", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png",              available: true},
  { time: "Sun · Sep 13 · 4:25 PM", away: "ARI", home: "LAC", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",              available: true},
  { time: "Sun · Sep 13 · 4:25 PM", away: "MIA", home: "LV",  awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",               available: true},
  { time: "Sun · Sep 13 · 4:25 PM", away: "GB",  home: "MIN", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",              homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png",              available: true},
  { time: "Sun · Sep 13 · 4:25 PM", away: "WAS", home: "PHI", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",              available: true},
  { time: "Sun · Sep 13 · 8:20 PM", away: "DAL", home: "NYG", awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",              available: true},
  { time: "Mon · Sep 14 · 8:15 PM", away: "DEN", home: "KC",  awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png",             homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",               available: true},
];

export default function MatchupPage() {
  const [side, setSide] = useState<0 | 1>(0); // 0 = away Off / home Def  |  1 = home Off / away Def
  const [defTooltip, setDefTooltip] = useState<null | { side: 0 | 1; x: number; y: number }>(null);
  const [selectedGame, setSelectedGame] = useState(0);
  const gameData: GameMatchupData = ALL_GAMES[selectedGame] ?? NE_SEA;

  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const update = () => setZoom(window.innerWidth > 430 ? window.innerWidth / 430 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const awayOff = gameData.away.offense;
  const homeOff = gameData.home.offense;
  const awayDef = gameData.away.defense;
  const homeDef = gameData.home.defense;

  const OFF_LOS  = side === 0
    ? [awayOff.WR_LEFT, awayOff.LT, awayOff.LG, awayOff.C, awayOff.RG, awayOff.RT, awayOff.TE, awayOff.WR_RIGHT]
    : [homeOff.WR_LEFT, homeOff.LT, homeOff.LG, homeOff.C, homeOff.RG, homeOff.RT, homeOff.TE, homeOff.WR_RIGHT];
  const OFF_SLOT = side === 0 ? [awayOff.SLOT] : [homeOff.SLOT];
  const OFF_QB   = side === 0 ? awayOff.QB : homeOff.QB;
  const OFF_RB   = side === 0 ? awayOff.RB : homeOff.RB;

  const DEF_LB  = side === 0
    ? [homeDef.OLB_L, homeDef.ILB_L, homeDef.ILB_R, homeDef.OLB_R]
    : [awayDef.OLB_L, awayDef.ILB_L, awayDef.ILB_R, awayDef.OLB_R];
  const DEF_DL  = side === 0
    ? [homeDef.DE_L, homeDef.NT, homeDef.DE_R]
    : [awayDef.DE_L, awayDef.NT, awayDef.DE_R];
  const DEF_SAF = side === 0 ? [homeDef.SS, homeDef.FS] : [awayDef.SS, awayDef.FS];
  const DEF_CB  = side === 0
    ? { left: homeDef.CB_LEFT, right: homeDef.NB }
    : { left: awayDef.CB_LEFT, right: awayDef.NB };

  const defTeam = side === 0 ? gameData.home : gameData.away;
  const offTeam = side === 0 ? gameData.away : gameData.home;

  const fieldBg = `
    repeating-linear-gradient(180deg,
      rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px,
      transparent 1px, transparent 50px
    ),
    linear-gradient(180deg, #040D05 0%, #050E06 40%, #050E06 60%, #040D05 100%)
  `;

  return (
    <div onClick={() => setDefTooltip(null)} style={{ maxWidth: 430, margin: "0 auto", background: "#0D0F14", minHeight: "100vh", paddingBottom: 112, ...(zoom > 1 ? { zoom } as unknown as React.CSSProperties : {}) }}>

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

      {/* ── Game Picker ── */}
      <div style={{ background: "#0A0C10", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 0 10px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#4B5268", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 16px 8px" }}>Week 1 · 2026</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px" }}>
          {MATCHUP_GAMES.map((g, i) => {
            const isSelected = i === selectedGame;
            const isAvailable = g.available;
            return (
              <div
                key={i}
                onClick={() => isAvailable && setSelectedGame(i)}
                style={{
                  flexShrink: 0, width: 130, borderRadius: 12, padding: "10px 12px",
                  background: isSelected ? "rgba(59,130,246,0.08)" : "#141720",
                  border: `1px solid ${isSelected ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.06)"}`,
                  cursor: isAvailable ? "pointer" : "default",
                  opacity: isAvailable ? 1 : 0.4,
                  position: "relative",
                }}
              >
                {isSelected && (
                  <div style={{ position: "absolute", top: 6, right: 8, width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 6px rgba(59,130,246,0.8)" }} />
                )}
                <div style={{ fontSize: 8, fontWeight: 700, color: isSelected ? "#3B82F6" : "#4B5268", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{g.time}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.awayLogo} alt={g.away} width={18} height={18} style={{ objectFit: "contain" }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#E8EBF4" }}>{g.away}</span>
                  </div>
                  <span style={{ fontSize: 9, color: "#334155", fontWeight: 600 }}>@</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.homeLogo} alt={g.home} width={18} height={18} style={{ objectFit: "contain" }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#E8EBF4" }}>{g.home}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Side toggle ── */}
      <div style={{ display: "flex", background: "#0E1016", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 4px" }}>
        {[
          { label: `${gameData.away.abbr} Off vs ${gameData.home.abbr} Def`, pipColor: gameData.away.color },
          { label: `${gameData.home.abbr} Off vs ${gameData.away.abbr} Def`, pipColor: gameData.home.color },
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

<>
          {/* ── Defense — top ── */}
          <div style={{ background: "linear-gradient(180deg,rgba(239,68,68,0.05) 0%,transparent 100%)" }}>
            <FormationHeader
              teamColor={defTeam.color} teamName={defTeam.name}
              subLabel="Defensive Formation" pillLabel={defTeam.defFormation} pillType="def"
              logo={defTeam.logo}
              onPillClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setDefTooltip(defTooltip?.side === side ? null : { side, x: rect.left + rect.width / 2, y: rect.bottom });
              }}
            />
          </div>
          <div style={{ padding: "24px 4px 4px", background: "linear-gradient(180deg,rgba(239,68,68,0.04) 0%,transparent 100%)" }}>
            {/* Safeties — deep */}
            <div style={{ marginBottom: 12 }}>
              <FormationRow players={DEF_SAF} justify="center" gap={60} />
            </div>
            {/* LBs */}
            <div style={{ marginBottom: 12 }}>
              <FormationRow players={DEF_LB} justify="space-evenly" padding="0 24px" />
            </div>
            {/* DL + CBs at LOS */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "0 4px" }}>
              <div style={{ position: "absolute", left: 4 }}>
                <PlayerBubble p={DEF_CB.left} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>
                {DEF_DL.map((p, i) => <PlayerBubble key={i} p={p} />)}
              </div>
              <div style={{ position: "absolute", right: 4 }}>
                <PlayerBubble p={DEF_CB.right} />
              </div>
            </div>
          </div>

          <LOS />

          {/* ── Offense — bottom ── */}
          <div style={{ padding: "20px 4px 55px", background: "linear-gradient(180deg,transparent 0%,rgba(34,197,94,0.04) 100%)" }}>
            {/* LOS row: WR-L pinned left | OL+TE centered | SLOT+WR-R pinned right */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "0 4px", marginBottom: 54 }}>
              <div style={{ position: "absolute", left: 4 }}>
                <PlayerBubble p={OFF_LOS[0]} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                {OFF_LOS.slice(1, 7).map((p, i) => <PlayerBubble key={i} p={p} />)}
              </div>
              <div style={{ position: "absolute", right: 4, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <PlayerBubble p={OFF_SLOT[0]} />
                <PlayerBubble p={OFF_LOS[7]} />
              </div>
            </div>
            {/* Shotgun backfield: QB behind C, RB to QB's right */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingLeft: "43%", marginBottom: 0 }}>
              <PlayerBubble p={OFF_QB} />
              <PlayerBubble p={OFF_RB} />
            </div>
          </div>
          <div style={{ background: "linear-gradient(180deg,transparent 0%,rgba(34,197,94,0.05) 100%)" }}>
            <FormationHeader
              teamColor={offTeam.color} teamName={offTeam.name}
              subLabel="Offensive Formation" pillLabel={offTeam.personnel} pillType="off"
              logo={offTeam.logo}
            />
          </div>
        </>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display: "flex", background: "#0E1016", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", gap: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pass Yds/G</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#22C55E" }}>284.3</span>
          <span style={{ fontSize: 9, color: "#374151" }}>{side === 0 ? `${gameData.away.abbr} Off` : `${gameData.home.abbr} Off`}</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, borderLeft: "1px solid rgba(255,255,255,0.06)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Season</span>
          <span style={{ fontSize: 11, color: "#374151", marginTop: 3, fontWeight: 800 }}>PRE-SEASON</span>
          <span style={{ fontSize: 9, color: "#374151" }}>No data yet</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, overflow: "hidden" }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pts Allowed</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#22C55E" }}>18.2</span>
          <span style={{ fontSize: 9, color: "#374151" }}>{side === 0 ? `${gameData.home.abbr} Def` : `${gameData.away.abbr} Def`}</span>
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

      {/* ── Formation popover ── */}
      {defTooltip !== null && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            zIndex: 50,
            top: defTooltip.y + 8,
            left: Math.min(
              Math.max(defTooltip.x - 110, 8),
              (typeof window !== "undefined" ? window.innerWidth : 430) - 228
            ),
            width: 220,
            background: "#1a1d24",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 12,
            lineHeight: 1.5,
            color: "#c8cdd8",
            textAlign: "left" as const,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {defTooltip.side === 0 ? (
            <><strong>{gameData.home.defFormation}</strong><p style={{ margin: "6px 0 0" }}>{gameData.home.defScheme}</p></>
          ) : (
            <><strong>{gameData.away.defFormation}</strong><p style={{ margin: "6px 0 0" }}>{gameData.away.defScheme}</p></>
          )}
        </div>
      )}

    </div>
  );
}
