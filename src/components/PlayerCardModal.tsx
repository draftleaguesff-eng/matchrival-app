"use client";

import { useEffect, useState } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────────

const POS_COLOR: Record<string, string> = {
  RB: "#22C55E", WR: "#6BA5F8", QB: "#F59E0B",
  TE: "#A78BFA", K:  "#94A3B8", DST: "#F87171",
};
const POS_RING: Record<string, string> = {
  RB: "rgba(34,197,94,0.45)",  WR: "rgba(59,130,246,0.45)",
  QB: "rgba(245,158,11,0.45)", TE: "rgba(139,92,246,0.45)",
  K:  "rgba(100,116,139,0.35)", DST: "rgba(239,68,68,0.40)",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface Stat     { label: string; value: string }
interface NewsItem { date: string; headline: string; detail: string }

interface PlayerCardData {
  name: string;
  firstName: string;
  lastName: string;
  position: string;
  team: string;
  number: number;
  age: number;
  byeWeek: number;
  height: string;
  weight: string;
  college: string;
  experience: number;
  rank: number;
  posRank: string;
  adp: number;
  adpTrend: number;
  pointsLast: number;
  pointsProj: number;
  stats: Stat[];
  strengths: string[];
  risks: string[];
  analysis: string;
  news: NewsItem[];
}

// ── Modal ──────────────────────────────────────────────────────────────────────

export default function PlayerCardModal({
  playerKey,
  onClose,
}: {
  playerKey: string | null;
  onClose: () => void;
}) {
  const [card, setCard] = useState<PlayerCardData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!playerKey) {
      setVisible(false);
      const t = setTimeout(() => setCard(null), 300);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    setVisible(false);
    setCard(null);
    fetch("/data/player-cards.json")
      .then(r => r.json())
      .then((data: Record<string, PlayerCardData>) => {
        if (cancelled) return;
        setCard(data[playerKey] ?? null);
        setTimeout(() => setVisible(true), 10);
      })
      .catch(() => { if (!cancelled) setVisible(true); });
    return () => { cancelled = true; };
  }, [playerKey]);

  if (!playerKey && !card) return null;

  const posColor = card ? (POS_COLOR[card.position] || "#94A3B8") : "#94A3B8";
  const posRing  = card ? (POS_RING[card.position]  || "rgba(148,163,184,0.35)") : "rgba(148,163,184,0.35)";
  const maxProj  = card ? Math.max(card.pointsProj, card.pointsLast) : 1;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.62)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      />

      {/* ── Sheet ── */}
      <div
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 201,
          maxWidth: 520, margin: "0 auto",
          height: 620,
          background: "#0D0F14",
          borderRadius: "20px 20px 0 0",
          border: "1px solid rgba(255,255,255,0.09)",
          borderBottom: "none",
          boxShadow: "0 -10px 48px rgba(0,0,0,0.55)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Section 1: Handle + close ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "12px 16px 0",
          flexShrink: 0,
          position: "relative",
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
          <button
            onClick={onClose}
            style={{
              position: "absolute", right: 16, top: 7,
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "50%",
              color: "#8892AA", fontSize: 15, cursor: "pointer",
              padding: 0, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 40px" }}>

          {!card ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#4B5268", fontSize: 13 }}>
              No card data available
            </div>
          ) : (
            <>
              {/* ── Section 2: Hero ── */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 0 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                  border: `3px solid ${posRing}`,
                  background: "#141720", overflow: "hidden",
                  boxShadow: `0 0 18px ${posRing}`,
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/headshots/${card.lastName}_${card.firstName}.jpg`}
                    alt={card.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#E8EBF4", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 6 }}>
                    {card.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 8.5, fontWeight: 800, letterSpacing: "0.06em",
                      padding: "3px 7px", borderRadius: 4,
                      background: `${posColor}22`, color: posColor,
                      textTransform: "uppercase",
                    }}>{card.position}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8892AA" }}>
                      {card.team} · #{card.number}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Rank / ADP chips ── */}
              <div style={{
                display: "flex", gap: 8, padding: "12px 0 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                {[
                  { label: "Overall",  value: `#${card.rank}`,     color: "#F59E0B" },
                  { label: "Pos Rank", value: card.posRank,        color: posColor },
                  {
                    label: "ADP",
                    value: `${card.adp}  ${card.adpTrend > 0 ? `↑${card.adpTrend}` : card.adpTrend < 0 ? `↓${Math.abs(card.adpTrend)}` : "—"}`,
                    color: card.adpTrend > 0 ? "#22C55E" : card.adpTrend < 0 ? "#EF4444" : "#8892AA",
                  },
                ].map(chip => (
                  <div key={chip.label} style={{
                    flex: 1,
                    background: "#141720",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, padding: "8px 10px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  }}>
                    <span style={{ fontSize: 7.5, fontWeight: 700, color: "#4B5268", letterSpacing: "0.1em", textTransform: "uppercase" }}>{chip.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: chip.color, letterSpacing: "-0.02em" }}>{chip.value}</span>
                  </div>
                ))}
              </div>

              {/* ── Section 4: Bio row ── */}
              <div style={{
                display: "flex",
                padding: "12px 0 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                {[
                  { label: "Ht",   value: card.height },
                  { label: "Wt",   value: card.weight },
                  { label: "Age",  value: `${card.age}` },
                  { label: "Exp",  value: `${card.experience}yr` },
                  { label: "Bye",  value: `Wk ${card.byeWeek}` },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{
                    flex: 1, textAlign: "center", minWidth: 0,
                    borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}>
                    <div style={{ fontSize: 7.5, fontWeight: 700, color: "#4B5268", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#E8EBF4" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* ── Section 5: Season stats grid ── */}
              <div style={{ padding: "14px 0 0" }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, color: "#4B5268", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>2025 Season Stats</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {card.stats.map(s => (
                    <div key={s.label} style={{
                      background: "#141720",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8, padding: "8px 10px",
                    }}>
                      <div style={{ fontSize: 7.5, fontWeight: 700, color: "#4B5268", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#E8EBF4", letterSpacing: "-0.02em" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Section 6: Projection vs last year bars ── */}
              <div style={{ padding: "16px 0 0" }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, color: "#4B5268", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>PPR Points — Projected vs Actual</div>
                {[
                  { label: "2026 Proj",   value: card.pointsProj, color: "#3B82F6" },
                  { label: "2025 Actual", value: card.pointsLast, color: "#4B5268" },
                ].map(bar => (
                  <div key={bar.label} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#8892AA" }}>{bar.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: bar.color }}>{bar.value}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${(bar.value / maxProj) * 100}%`,
                        background: bar.color,
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Section 7: Strengths ── */}
              <div style={{ padding: "16px 0 0" }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, color: "#22C55E", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Strengths</div>
                {card.strengths.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "#22C55E", fontSize: 10, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 12, color: "#8892AA", lineHeight: 1.4 }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* ── Section 8: Risks ── */}
              <div style={{ padding: "12px 0 0" }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, color: "#EF4444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Risks</div>
                {card.risks.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "#EF4444", fontSize: 9, flexShrink: 0, marginTop: 2 }}>⚠</span>
                    <span style={{ fontSize: 12, color: "#8892AA", lineHeight: 1.4 }}>{r}</span>
                  </div>
                ))}
              </div>

              {/* ── Section 9: Analysis + News ── */}
              <div style={{ padding: "16px 0 0" }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, color: "#4B5268", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Analysis</div>
                <p style={{ fontSize: 12, color: "#8892AA", lineHeight: 1.6, margin: 0 }}>{card.analysis}</p>
              </div>

              {card.news.length > 0 && (
                <div style={{ padding: "16px 0 0" }}>
                  <div style={{ fontSize: 7.5, fontWeight: 800, color: "#4B5268", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Recent News</div>
                  {card.news.map((item, i) => (
                    <div key={i} style={{
                      background: "#141720",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10, padding: "10px 12px",
                      marginBottom: 8,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#3B82F6" }}>{item.date}</span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#E8EBF4", marginBottom: 4, lineHeight: 1.3 }}>{item.headline}</div>
                      <p style={{ fontSize: 11, color: "#4B5268", margin: 0, lineHeight: 1.4 }}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
