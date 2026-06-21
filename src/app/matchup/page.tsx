"use client";

import { useState } from "react";
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
};

// ── Player data ───────────────────────────────────────────────────────────────

interface Player {
  display: string;
  initials: string;
  ringType: string;    // key into RING
  badgeType: string;   // key into BADGE
  badgeLabel: string;
  headshot?: string;   // path under /headshots/
  size?: number;       // ring diameter, default 44
  slotOffset?: boolean; // push down 18px (slot WR)
  nameBold?: boolean;
}

// PHI Offense — 11 Personnel
const PHI_OFF_R1: Player[] = [
  { display: "D. Smith",   initials: "DS", ringType: "wr", badgeType: "wr",   badgeLabel: "WR",     headshot: "Smith_DeVonta.jpg" },
  { display: "J. Dotson",  initials: "JD", ringType: "wr", badgeType: "slot", badgeLabel: "SLOT",   headshot: "Dotson_Jahan.jpg", slotOffset: true },
  { display: "D. Goedert", initials: "DG", ringType: "te", badgeType: "te",   badgeLabel: "TE",     headshot: "Goedert_Dallas.jpg" },
];
const PHI_OFF_R2: Player[] = [
  { display: "J. Hurts",   initials: "JH", ringType: "qb", badgeType: "qb",   badgeLabel: "QB · #1", headshot: "Hurts_Jalen.jpg", size: 52, nameBold: true },
];
const PHI_OFF_R3: Player[] = [
  { display: "S. Barkley", initials: "SB", ringType: "rb", badgeType: "rb",   badgeLabel: "RB · #26", headshot: "Barkley_Saquon.jpg" },
];

// DAL Defense — 4-3 Base
const DAL_DEF_R1: Player[] = [
  { display: "M. Parsons",     initials: "MP", ringType: "de", badgeType: "de", badgeLabel: "DE · #11" },
  { display: "O. Odighizuwa",  initials: "OO", ringType: "dt", badgeType: "dt", badgeLabel: "DT · #97", headshot: "Odighizuwa_Osa.jpg" },
  { display: "M. Smith",       initials: "MS", ringType: "dt", badgeType: "dt", badgeLabel: "DT · #58", headshot: "Smith_Mazi.jpg" },
  { display: "D. Armstrong",   initials: "DA", ringType: "de", badgeType: "de", badgeLabel: "DE · #92" },
];
const DAL_DEF_R2: Player[] = [
  { display: "L. Vander Esch", initials: "LV", ringType: "lb",  badgeType: "lb",  badgeLabel: "WLB · #55" },
  { display: "D. Clark",       initials: "DC", ringType: "mlb", badgeType: "mlb", badgeLabel: "MLB · #30", size: 50 },
  { display: "M. Bell",        initials: "MB", ringType: "lb",  badgeType: "lb",  badgeLabel: "SLB · #41" },
];
const DAL_DEF_R3: Player[] = [
  { display: "D. Bland",  initials: "DB", ringType: "cb",  badgeType: "cb", badgeLabel: "CB · #26", headshot: "Bland_DaRon.jpg" },
  { display: "A. Hooker", initials: "AH", ringType: "ss",  badgeType: "ss", badgeLabel: "SS · #28", headshot: "Hooker_Amani.jpg" },
  { display: "D. Wilson", initials: "DW", ringType: "fs",  badgeType: "fs", badgeLabel: "FS · #25" },
  { display: "T. Diggs",  initials: "TD", ringType: "cb",  badgeType: "cb", badgeLabel: "CB · #7" },
];

// DAL Offense — 11 Personnel
const DAL_OFF_R1: Player[] = [
  { display: "C. Lamb",    initials: "CL", ringType: "wr", badgeType: "wr",   badgeLabel: "WR",       headshot: "Lamb_CeeDee.jpg" },
  { display: "J. Tolbert", initials: "JT", ringType: "wr", badgeType: "slot", badgeLabel: "SLOT",     headshot: "Tolbert_Jalen.jpg", slotOffset: true },
  { display: "J. Ferguson",initials: "JF", ringType: "te", badgeType: "te",   badgeLabel: "TE",       headshot: "Ferguson_Jake.jpg" },
];
const DAL_OFF_R2: Player[] = [
  { display: "D. Prescott",initials: "DP", ringType: "qb", badgeType: "qb",   badgeLabel: "QB · #4",  headshot: "Prescott_Dak.jpg", size: 52, nameBold: true },
];
const DAL_OFF_R3: Player[] = [
  { display: "R. Dowdle",  initials: "RD", ringType: "rb", badgeType: "rb",   badgeLabel: "RB · #23", headshot: "Dowdle_Rico.jpg" },
];

// PHI Defense — 4-2-5 Nickel
const PHI_DEF_R1: Player[] = [
  { display: "J. Carter", initials: "JC", ringType: "de", badgeType: "de", badgeLabel: "DE · #98", headshot: "Carter_Jalen.jpg" },
  { display: "J. Davis",  initials: "JD", ringType: "dt", badgeType: "dt", badgeLabel: "DT · #90", headshot: "Davis_Jordan.jpg" },
  { display: "B. Huff",   initials: "BH", ringType: "de", badgeType: "de", badgeLabel: "DE · #47" },
];
const PHI_DEF_R2: Player[] = [
  { display: "N. Dean",  initials: "ND", ringType: "lb",  badgeType: "lb",  badgeLabel: "LB · #17", headshot: "Dean_Nakobe.jpg" },
  { display: "Z. Baun",  initials: "ZB", ringType: "mlb", badgeType: "mlb", badgeLabel: "LB · #53", headshot: "Baun_Zack.jpg", size: 50 },
];
const PHI_DEF_R3: Player[] = [
  { display: "D. Slay",             initials: "DS", ringType: "cb", badgeType: "cb", badgeLabel: "CB · #2" },
  { display: "Q. Mitchell",         initials: "QM", ringType: "cb", badgeType: "cb", badgeLabel: "CB · #27", headshot: "Mitchell_Quinyon.jpg" },
  { display: "C. Gardner-Johnson",  initials: "CG", ringType: "fs", badgeType: "fs", badgeLabel: "FS · #23", headshot: "Gardner-Johnson_C.J..jpg" },
  { display: "R. Blankenship",      initials: "RB", ringType: "ss", badgeType: "ss", badgeLabel: "SS · #32", headshot: "Blankenship_Reed.jpg" },
  { display: "I. Rodgers",          initials: "IR", ringType: "nb", badgeType: "nb", badgeLabel: "NB · #0" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function PlayerBubble({ p }: { p: Player }) {
  const ring  = RING[p.ringType]  || RING.wr;
  const badge = BADGE[p.badgeType] || BADGE.wr;
  const size  = p.size ?? 44;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      maxWidth: 74, flexShrink: 0,
      marginTop: p.slotOffset ? 18 : 0,
    }}>
      {/* Ring + headshot / initials */}
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
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em", color: ring.color }}>
            {p.initials}
          </span>
        )}
      </div>
      {/* Name */}
      <span style={{
        fontSize: 8.5, fontWeight: p.nameBold ? 700 : 600,
        color: p.nameBold ? "#CBD5E1" : "#94A3B8",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        maxWidth: 72, textAlign: "center",
      }}>
        {p.display}
      </span>
      {/* Badge */}
      <span style={{
        fontSize: 7.5, fontWeight: 800, letterSpacing: "0.04em",
        padding: "1px 5px", borderRadius: 4, textTransform: "uppercase",
        whiteSpace: "nowrap",
        background: badge.bg, color: badge.color,
      }}>
        {p.badgeLabel}
      </span>
    </div>
  );
}

// img with initials fallback — must be a client component function
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
        fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em", color,
        background: "#151B28",
      }}>
        {initials}
      </span>
    </>
  );
}

function FormationRow({ players, justify = "space-evenly", padded = false }: {
  players: Player[];
  justify?: "space-evenly" | "center";
  padded?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", width: "100%",
      justifyContent: justify,
      padding: padded ? "0 8px" : undefined,
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
  pillLabel: string; pillType: "off" | "def"; logo?: string;
}) {
  const pillStyle = pillType === "off"
    ? { bg: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }
    : { bg: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 4px", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1, overflow: "hidden" }}>
        <img
          src={logo}
          alt={teamName}
          style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }}
        />
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
  const [side, setSide] = useState<0 | 1>(0); // 0 = PHI Off / DAL Def, 1 = DAL Off / PHI Def

  const fieldBg = `
    repeating-linear-gradient(180deg,
      rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px,
      transparent 1px, transparent 50px
    ),
    linear-gradient(180deg, #040D05 0%, #050E06 40%, #050E06 60%, #040D05 100%)
  `;

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: "#0D0F14", minHeight: "100vh", paddingBottom: 112 }}>

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
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase" }}>NFL · 2025</span>
        <button style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 10px", color: "#94A3B8", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          Share
        </button>
      </div>

      {/* ── Scoreboard ── */}
      <div style={{ background: "linear-gradient(180deg,#111318 0%,#0E1016 100%)", padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* PHI */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
            <img src="/headshots/logo_phi.png" alt="PHI" style={{ width: 44, height: 44, objectFit: "contain" }} />
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#00C9A7" }}>PHI</span>
            <span style={{ fontSize: 10, color: "#4B5563", fontWeight: 500 }}>Away · 0–0</span>
          </div>
          {/* Score center */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: "0 0 120px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#F1F5F9", letterSpacing: "-0.04em" }}>0</span>
              <span style={{ fontSize: 20, color: "#334155" }}>–</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#F1F5F9", letterSpacing: "-0.04em" }}>0</span>
            </div>
            <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
              Thu · 8:20 PM ET
            </div>
            <div style={{ fontSize: 11, color: "#64748B", textAlign: "center" }}>Sep 4 · Opening Night</div>
          </div>
          {/* DAL */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
            <img src="/headshots/logo_dal.png" alt="DAL" style={{ width: 44, height: 44, objectFit: "contain" }} />
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#7EC8E3" }}>DAL</span>
            <span style={{ fontSize: 10, color: "#4B5563", fontWeight: 500 }}>Home · 0–0</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#374151", textAlign: "center", marginTop: 10 }}>AT&T Stadium · Arlington, TX</div>
      </div>

      {/* ── Side toggle ── */}
      <div style={{ display: "flex", background: "#0E1016", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 4px" }}>
        {[
          { label: "PHI Off vs DAL Def", pipColor: "#00C9A7" },
          { label: "DAL Off vs PHI Def", pipColor: "#7EC8E3" },
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
      <div style={{ position: "relative", background: fieldBg, overflow: "hidden" }}>
        {/* Zone labels */}
        <span style={{ position: "absolute", fontSize: 8, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.12, right: 14, top: 24, color: "#22C55E" }}>OFFENSE</span>
        <span style={{ position: "absolute", fontSize: 8, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.12, right: 14, bottom: 24, color: "#EF4444" }}>DEFENSE</span>

        {side === 0 ? (
          <>
            {/* ── PHI Offense header ── */}
            <div style={{ background: "linear-gradient(180deg,rgba(0,201,167,0.05) 0%,transparent 100%)" }}>
              <FormationHeader teamColor="#00C9A7" teamName="EAGLES" subLabel="Offensive Formation" pillLabel="11 Personnel" pillType="off" logo="/headshots/logo_phi.png" />
            </div>

            {/* PHI Offense zone */}
            <div style={{ padding: "10px 4px 4px", background: "linear-gradient(180deg,rgba(0,201,167,0.04) 0%,transparent 100%)" }}>
              <div style={{ marginBottom: 10 }}><FormationRow players={PHI_OFF_R1} /></div>
              <div style={{ marginBottom: 8 }}><FormationRow players={PHI_OFF_R2} justify="center" /></div>
              <FormationRow players={PHI_OFF_R3} justify="center" />
            </div>

            <LOS />

            {/* DAL Defense header */}
            <div style={{ background: "linear-gradient(180deg,transparent 0%,rgba(239,68,68,0.04) 100%)" }}>
              <FormationHeader teamColor="#7EC8E3" teamName="COWBOYS" subLabel="Defensive Formation" pillLabel="4-3 Base" pillType="def" logo="/headshots/logo_dal.png" />
            </div>

            {/* DAL Defense zone */}
            <div style={{ padding: "4px 4px 14px", background: "linear-gradient(180deg,transparent 0%,rgba(239,68,68,0.04) 100%)" }}>
              <div style={{ marginBottom: 10 }}><FormationRow players={DAL_DEF_R1} /></div>
              <div style={{ marginBottom: 10 }}><FormationRow players={DAL_DEF_R2} padded /></div>
              <FormationRow players={DAL_DEF_R3} />
            </div>
          </>
        ) : (
          <>
            {/* ── DAL Offense header ── */}
            <div style={{ background: "linear-gradient(180deg,rgba(126,200,227,0.05) 0%,transparent 100%)" }}>
              <FormationHeader teamColor="#7EC8E3" teamName="COWBOYS" subLabel="Offensive Formation" pillLabel="11 Personnel" pillType="off" logo="/headshots/logo_dal.png" />
            </div>

            {/* DAL Offense zone */}
            <div style={{ padding: "10px 4px 4px", background: "linear-gradient(180deg,rgba(126,200,227,0.04) 0%,transparent 100%)" }}>
              <div style={{ marginBottom: 10 }}><FormationRow players={DAL_OFF_R1} /></div>
              <div style={{ marginBottom: 8 }}><FormationRow players={DAL_OFF_R2} justify="center" /></div>
              <FormationRow players={DAL_OFF_R3} justify="center" />
            </div>

            <LOS />

            {/* PHI Defense header */}
            <div style={{ background: "linear-gradient(180deg,transparent 0%,rgba(239,68,68,0.04) 100%)" }}>
              <FormationHeader teamColor="#00C9A7" teamName="EAGLES" subLabel="Defensive Formation" pillLabel="4-2-5 Nickel" pillType="def" logo="/headshots/logo_phi.png" />
            </div>

            {/* PHI Defense zone */}
            <div style={{ padding: "4px 4px 14px", background: "linear-gradient(180deg,transparent 0%,rgba(239,68,68,0.04) 100%)" }}>
              <div style={{ marginBottom: 10 }}><FormationRow players={PHI_DEF_R1} /></div>
              <div style={{ marginBottom: 10 }}><FormationRow players={PHI_DEF_R2} padded /></div>
              <FormationRow players={PHI_DEF_R3} />
            </div>
          </>
        )}
      </div>

      {/* ── Stats strip ── */}
      <div style={{ display: "flex", background: "#0E1016", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", gap: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pass Yds/G</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#22C55E" }}>284.3</span>
          <span style={{ fontSize: 9, color: "#374151" }}>{side === 0 ? "PHI Off" : "DAL Off"}</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, borderLeft: "1px solid rgba(255,255,255,0.06)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Season</span>
          <span style={{ fontSize: 11, color: "#374151", marginTop: 3, fontWeight: 800 }}>PRE-SEASON</span>
          <span style={{ fontSize: 9, color: "#374151" }}>No data yet</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, overflow: "hidden" }}>
          <span style={{ fontSize: 9, color: "#4B5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pts Allowed</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#22C55E" }}>18.2</span>
          <span style={{ fontSize: 9, color: "#374151" }}>{side === 0 ? "DAL Def" : "PHI Def"}</span>
        </div>
      </div>

      {/* ── Injury strip ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "rgba(239,68,68,0.04)", borderTop: "1px solid rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94A3B8" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
          <span><span style={{ fontWeight: 700, color: "#F1F5F9" }}>D. Goedert</span> — Questionable</span>
        </div>
        <span style={{ fontSize: 10, color: "#F87171", fontWeight: 600 }}>⚠ Hamstring</span>
      </div>

    </div>
  );
}
