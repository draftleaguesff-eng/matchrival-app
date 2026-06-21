"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Player {
  rank: number;
  name: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  bye_week: number;
  age: number;
}

type Mode = "rankings" | "watchlist" | "draft" | "myRankings";
type ScoringFormat = "PPR" | "HALF" | "STD";
type PosFilter = "ALL" | "QB" | "RB" | "WR" | "TE" | "K" | "DST";

// ── Helpers ───────────────────────────────────────────────────────────────────

const POS_RING: Record<string, string> = {
  RB:  "rgba(34,197,94,0.50)",
  WR:  "rgba(59,130,246,0.50)",
  QB:  "rgba(245,158,11,0.50)",
  TE:  "rgba(139,92,246,0.50)",
  K:   "rgba(100,116,139,0.40)",
  DST: "rgba(239,68,68,0.40)",
};

const POS_BADGE_BG: Record<string, string> = {
  RB:  "rgba(34,197,94,0.13)",
  WR:  "rgba(59,130,246,0.13)",
  QB:  "rgba(245,158,11,0.13)",
  TE:  "rgba(139,92,246,0.13)",
  K:   "rgba(100,116,139,0.13)",
  DST: "rgba(239,68,68,0.13)",
};

const POS_BADGE_COLOR: Record<string, string> = {
  RB:  "#22C55E",
  WR:  "#6BA5F8",
  QB:  "#F59E0B",
  TE:  "#A78BFA",
  K:   "#94A3B8",
  DST: "#F87171",
};

// Assign tiers based on rank
function getTier(rank: number): { label: string; color: string } | null {
  if (rank === 1)  return { label: "⚡ Tier 1 — Elite",      color: "#F59E0B" };
  if (rank === 13) return { label: "⚡ Tier 2 — Stars",      color: "#3B82F6" };
  if (rank === 25) return { label: "⚡ Tier 3 — Quality",    color: "#22C55E" };
  if (rank === 50) return { label: "⚡ Tier 4 — Solid",      color: "#8B5CF6" };
  if (rank === 100) return { label: "⚡ Tier 5 — Depth",     color: "#8892AA" };
  if (rank === 175) return { label: "⚡ Tier 6 — Sleepers",  color: "#4B5268" };
  if (rank === 250) return { label: "⚡ Tier 7 — Lottery",   color: "#4B5268" };
  return null;
}

// Compute positional rank within a position group
function computePosRanks(players: Player[]): Map<number, number> {
  const counters: Record<string, number> = {};
  const map = new Map<number, number>();
  for (const p of players) {
    counters[p.position] = (counters[p.position] || 0) + 1;
    map.set(p.rank, counters[p.position]);
  }
  return map;
}

function headshot(p: Player): string {
  return `/headshots/${p.last_name}_${p.first_name}.jpg`;
}

// Random trend (deterministic by rank to avoid hydration mismatch)
function trend(rank: number): "up" | "down" | "flat" {
  const v = rank % 3;
  return v === 0 ? "up" : v === 1 ? "down" : "flat";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 26, height: 26, background: "#3B82F6", borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 900, color: "#fff",
        boxShadow: "0 0 10px rgba(59,130,246,0.4)", flexShrink: 0,
      }}>MR</div>
      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.03em" }}>
        Match<span style={{ color: "#3B82F6" }}>.</span>Rival
      </span>
    </div>
  );
}

function PosBadge({ pos }: { pos: string }) {
  return (
    <span style={{
      fontSize: 7.5, fontWeight: 800, letterSpacing: "0.06em",
      padding: "2px 4px", borderRadius: 3, textTransform: "uppercase",
      background: POS_BADGE_BG[pos] || "rgba(100,116,139,0.13)",
      color: POS_BADGE_COLOR[pos] || "#94A3B8",
      flexShrink: 0,
    }}>
      {pos}
    </span>
  );
}

function StarButton({ starred, onToggle }: { starred: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24">
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill={starred ? "#F59E0B" : "none"}
          stroke={starred ? "#F59E0B" : "#4B5268"}
          strokeWidth="1.8"
        />
      </svg>
    </button>
  );
}

function TierDivider({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px 7px", background: "rgba(255,255,255,0.015)" }}>
      <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#1A1F2E" }} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RankingsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [mode, setMode] = useState<Mode>("rankings");
  const [scoring, setScoring] = useState<ScoringFormat>("PPR");
  const [posFilter, setPosFilter] = useState<PosFilter>("ALL");
  const [search, setSearch] = useState("");
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set());
  const [drafted, setDrafted] = useState<Set<number>>(new Set());
  const [myPicks, setMyPicks] = useState<number[]>([]); // ranks of my picks
  const [showAvailable, setShowAvailable] = useState(false);
  const [myRankings, setMyRankings] = useState<number[]>([]); // rank order for my rankings
  const [editedMoves, setEditedMoves] = useState(0);

  useEffect(() => {
    fetch("/data/top350_rankings.json")
      .then(r => r.json())
      .then((data: Player[]) => {
        setPlayers(data);
        setMyRankings(data.map(p => p.rank));
      });
  }, []);

  const posRanks = useMemo(() => computePosRanks(players), [players]);

  const filtered = useMemo(() => {
    let list = players;

    if (mode === "watchlist") {
      list = list.filter(p => watchlist.has(p.rank));
    }

    if (mode === "draft" && showAvailable) {
      list = list.filter(p => !drafted.has(p.rank));
    }

    if (posFilter !== "ALL") {
      if (posFilter === "DST") {
        list = list.filter(p => p.position === "DST");
      } else {
        list = list.filter(p => p.position === posFilter);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
    }

    return list;
  }, [players, mode, posFilter, search, watchlist, drafted, showAvailable]);

  function toggleWatchlist(rank: number) {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(rank)) next.delete(rank); else next.add(rank);
      return next;
    });
  }

  function toggleDrafted(rank: number, p: Player) {
    setDrafted(prev => {
      const next = new Set(prev);
      if (next.has(rank)) {
        next.delete(rank);
        setMyPicks(picks => picks.filter(r => r !== rank));
      } else {
        next.add(rank);
        setMyPicks(picks => [...picks, rank]);
      }
      return next;
    });
  }

  function movePlayer(idx: number, dir: -1 | 1) {
    const newOrder = [...myRankings];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setMyRankings(newOrder);
    setEditedMoves(m => m + 1);
  }

  // Build player map for quick lookup
  const playerByRank = useMemo(() => {
    const m = new Map<number, Player>();
    players.forEach(p => m.set(p.rank, p));
    return m;
  }, [players]);

  const myRankingsPlayers = useMemo(() => {
    if (mode !== "myRankings") return [];
    return myRankings
      .map(r => playerByRank.get(r))
      .filter((p): p is Player => !!p)
      .filter(p => posFilter === "ALL" || p.position === posFilter);
  }, [mode, myRankings, playerByRank, posFilter]);

  const myPickPlayers = myPicks.map(r => playerByRank.get(r)).filter(Boolean) as Player[];

  // ── Render ──────────────────────────────────────────────────────────────────

  const headerStyle: React.CSSProperties = {
    padding: "16px 14px 0",
    background: "#0D0F14",
    position: "sticky", top: 0, zIndex: 10,
    borderBottom: "1px solid #1A1F2E",
    paddingBottom: 10,
  };

  const posFilters: { id: PosFilter; label: string }[] = [
    { id: "ALL", label: "All" },
    { id: "QB",  label: "QB" },
    { id: "RB",  label: "RB" },
    { id: "WR",  label: "WR" },
    { id: "TE",  label: "TE" },
    { id: "K",   label: "K" },
    { id: "DST", label: "DST" },
  ];

  // ── Draft mode header ──
  if (mode === "draft") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Draft header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#F59E0B", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 6px rgba(245,158,11,0.7)", display: "inline-block" }} />
                Draft Mode
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#4B5268" }}>
                Drafted: <span style={{ color: "#8892AA", fontWeight: 800 }}>{drafted.size}</span>/350
              </span>
            </div>
            <button
              onClick={() => setMode("rankings")}
              style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}
            >
              ✕ Exit Draft
            </button>
          </div>

          {/* Available toggle */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
              {["All Players", "Available"].map(opt => {
                const active = opt === "Available" ? showAvailable : !showAvailable;
                return (
                  <button
                    key={opt}
                    onClick={() => setShowAvailable(opt === "Available")}
                    style={{ fontSize: 10.5, fontWeight: 700, padding: "5px 14px", color: active ? "#22C55E" : "#4B5268", background: active ? "rgba(34,197,94,0.18)" : "transparent", border: "none", cursor: "pointer" }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pos filter */}
          <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
            {posFilters.map(f => (
              <button key={f.id} onClick={() => setPosFilter(f.id)} style={{
                fontSize: 10, fontWeight: 700, padding: "5px 9px", borderRadius: 20,
                whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, border: "none",
                background: posFilter === f.id ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.03)",
                color: posFilter === f.id ? "#3B82F6" : "#4B5268",
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* My picks strip */}
        {myPickPlayers.length > 0 && (
          <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.04)", borderBottom: "1px solid rgba(34,197,94,0.12)" }}>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#22C55E", marginBottom: 7 }}>My Picks</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
              {myPickPlayers.map((p, i) => (
                <div key={p.rank} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 20, padding: "4px 8px 4px 5px", flexShrink: 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", background: "#1C2133", flexShrink: 0 }}>
                    <img src={headshot(p)} alt={p.name} width={22} height={22} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: "#22C55E", whiteSpace: "nowrap" }}>{p.first_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player list */}
        <PlayerList
          players={filtered}
          posRanks={posRanks}
          mode="draft"
          watchlist={watchlist}
          drafted={drafted}
          onToggleWatchlist={toggleWatchlist}
          onToggleDrafted={toggleDrafted}
          showTiers
        />
      </div>
    );
  }

  // ── My Rankings mode ──
  if (mode === "myRankings") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#A78BFA", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#8B5CF6", boxShadow: "0 0 6px rgba(139,92,246,0.8)", display: "inline-block" }} />
                My Rankings
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#4B5268" }}>
                Edited: <span style={{ color: "#8892AA", fontWeight: 800 }}>{editedMoves}</span> moves
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setMode("rankings")} style={{ fontSize: 10, fontWeight: 700, color: "#4B5268", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}>← Back</button>
              <button style={{ fontSize: 10, fontWeight: 700, color: "#A78BFA", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}>Save</button>
            </div>
          </div>
          <div style={{ padding: "7px 0", fontSize: 9.5, color: "rgba(167,139,250,0.75)", fontWeight: 600, letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="5" r="1.5" fill="#A78BFA"/><circle cx="9" cy="12" r="1.5" fill="#A78BFA"/><circle cx="9" cy="19" r="1.5" fill="#A78BFA"/><circle cx="15" cy="5" r="1.5" fill="#A78BFA"/><circle cx="15" cy="12" r="1.5" fill="#A78BFA"/><circle cx="15" cy="19" r="1.5" fill="#A78BFA"/></svg>
            Drag rows to reorder your personal rankings
          </div>
          {/* Pos filter */}
          <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none", marginTop: 8 }}>
            {posFilters.map(f => (
              <button key={f.id} onClick={() => setPosFilter(f.id)} style={{
                fontSize: 10, fontWeight: 700, padding: "5px 9px", borderRadius: 20,
                whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, border: "none",
                background: posFilter === f.id ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.03)",
                color: posFilter === f.id ? "#A78BFA" : "#4B5268",
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {myRankingsPlayers.map((p, idx) => {
            const originalRank = players.indexOf(p);
            const currentPos = myRankings.indexOf(p.rank);
            const delta = originalRank - currentPos; // positive = moved up
            return (
              <div key={p.rank} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.035)", background: "transparent" }}>
                {/* Drag grip */}
                <button onClick={() => movePlayer(myRankings.indexOf(p.rank), -1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, opacity: 0.35 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="5" r="1.5" fill="#E8EBF4"/><circle cx="9" cy="12" r="1.5" fill="#E8EBF4"/><circle cx="9" cy="19" r="1.5" fill="#E8EBF4"/><circle cx="15" cy="5" r="1.5" fill="#E8EBF4"/><circle cx="15" cy="12" r="1.5" fill="#E8EBF4"/><circle cx="15" cy="19" r="1.5" fill="#E8EBF4"/></svg>
                </button>
                {/* Rank */}
                <span style={{ fontSize: 12, fontWeight: 800, color: idx < 12 ? "#F59E0B" : "#4B5268", minWidth: 22, textAlign: "right", flexShrink: 0 }}>{idx + 1}</span>
                {/* Headshot */}
                <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", background: "#1C2133", border: `2px solid ${POS_RING[p.position] || "transparent"}`, flexShrink: 0, position: "relative" }}>
                  <img src={headshot(p)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"; }} />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#E8EBF4", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                    {delta !== 0 && (
                      <span style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: "0.04em", padding: "1.5px 5px", borderRadius: 3, flexShrink: 0, background: delta > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: delta > 0 ? "#22C55E" : "#EF4444", border: delta > 0 ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(239,68,68,0.25)" }}>
                        {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <PosBadge pos={p.position} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5268" }}>{p.team}</span>
                  </div>
                </div>
                {/* Right */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 9, color: "#4B5268", background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "2px 5px", whiteSpace: "nowrap" }}>Bye {p.bye_week}</span>
                  <StarButton starred={watchlist.has(p.rank)} onToggle={() => toggleWatchlist(p.rank)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Default: Rankings / Watchlist ──
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Sticky header */}
      <div style={headerStyle}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <Logo />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4B5268", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginTop: 2 }}>Draft Rankings</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setMode(mode === "watchlist" ? "rankings" : "watchlist")}
              style={{ display: "flex", alignItems: "center", gap: 5, background: mode === "watchlist" ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.30)", borderRadius: 9, padding: "7px 10px", fontSize: 11, fontWeight: 800, color: "#A78BFA", cursor: "pointer" }}
            >
              ★ My Rankings
            </button>
            <button
              onClick={() => setMode("draft")}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "#3B82F6", border: "none", borderRadius: 9, padding: "7px 12px", fontSize: 11, fontWeight: 800, color: "#fff", boxShadow: "0 2px 12px rgba(59,130,246,0.40)", cursor: "pointer" }}
            >
              ⚡ Draft Mode
            </button>
          </div>
        </div>

        {/* Search + scoring */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "7px 10px", flex: 1, minWidth: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#4B5268" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="#4B5268" strokeWidth="2"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search players…"
              style={{ background: "none", border: "none", outline: "none", fontSize: 12, color: "#E8EBF4", fontWeight: 500, width: "100%", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
            {(["PPR", "HALF", "STD"] as ScoringFormat[]).map(s => (
              <button key={s} onClick={() => setScoring(s)} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", padding: "5px 10px", color: scoring === s ? "#fff" : "#4B5268", background: scoring === s ? "#3B82F6" : "transparent", border: "none", cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Position filter */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          <button
            onClick={() => setMode(mode === "watchlist" ? "rankings" : "watchlist")}
            style={{ fontSize: 10, fontWeight: 700, padding: "5px 9px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, border: "none", background: mode === "watchlist" ? "rgba(245,158,11,0.16)" : "rgba(245,158,11,0.07)", color: "#F59E0B" }}
          >
            ⭐ Watchlist
          </button>
          {posFilters.map(f => (
            <button key={f.id} onClick={() => setPosFilter(f.id)} style={{
              fontSize: 10, fontWeight: 700, padding: "5px 9px", borderRadius: 20,
              whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, border: "none",
              background: posFilter === f.id ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.03)",
              color: posFilter === f.id ? "#3B82F6" : "#4B5268",
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Player list */}
      <PlayerList
        players={filtered}
        posRanks={posRanks}
        mode={mode}
        watchlist={watchlist}
        drafted={drafted}
        onToggleWatchlist={toggleWatchlist}
        onToggleDrafted={toggleDrafted}
        showTiers={false}
        onEnterMyRankings={() => setMode("myRankings")}
      />

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#4B5268", fontSize: 14 }}>
          {mode === "watchlist" ? "No players starred yet — tap ★ to add to watchlist" : "No players found"}
        </div>
      )}
    </div>
  );
}

// ── PlayerList ──────────────────────────────────────────────────────────────────

interface PlayerListProps {
  players: Player[];
  posRanks: Map<number, number>;
  mode: Mode;
  watchlist: Set<number>;
  drafted: Set<number>;
  onToggleWatchlist: (rank: number) => void;
  onToggleDrafted: (rank: number, p: Player) => void;
  showTiers: boolean;
  onEnterMyRankings?: () => void;
}

function PlayerList({ players, posRanks, mode, watchlist, drafted, onToggleWatchlist, onToggleDrafted, showTiers }: PlayerListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {players.map((p, idx) => {
        const tier = showTiers ? getTier(p.rank) : null;
        const isDrafted = drafted.has(p.rank);

        return (
          <div key={p.rank}>
            {tier && <TierDivider label={tier.label} color={tier.color} />}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.035)",
                opacity: isDrafted ? 0.32 : 1,
                position: "relative",
              }}
            >
              {/* Rank */}
              <span style={{ fontSize: 12, fontWeight: 800, color: p.rank <= 12 ? "#F59E0B" : "#4B5268", minWidth: 22, textAlign: "right", flexShrink: 0, letterSpacing: "-0.02em" }}>
                {p.rank}
              </span>

              {/* Headshot */}
              <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", background: "#1C2133", border: `2px solid ${POS_RING[p.position] || "transparent"}`, flexShrink: 0 }}>
                <img
                  src={headshot(p)}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"; }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#E8EBF4", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: isDrafted ? "line-through" : "none", textDecorationColor: "#4B5268" }}>
                    {p.name}
                  </span>
                  {isDrafted && (
                    <span style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: "0.06em", color: "#4B5268", background: "rgba(255,255,255,0.06)", borderRadius: 3, padding: "2px 5px", flexShrink: 0 }}>DRAFTED</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <PosBadge pos={p.position} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5268" }}>{p.team}</span>
                </div>
              </div>

              {/* Right side */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#8892AA", letterSpacing: "-0.01em", textAlign: "right", minWidth: 30 }}>
                  {p.position}{posRanks.get(p.rank) || ""}
                </span>
                <span style={{ fontSize: 8.5, fontWeight: 600, color: "#4B5268", background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "2px 5px", whiteSpace: "nowrap" }}>
                  Bye {p.bye_week}
                </span>
                <StarButton starred={watchlist.has(p.rank)} onToggle={() => onToggleWatchlist(p.rank)} />
                {mode === "draft" ? (
                  <button
                    onClick={() => onToggleDrafted(p.rank, p)}
                    style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: isDrafted ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.10)", border: isDrafted ? "1px solid rgba(239,68,68,0.30)" : "1px solid rgba(34,197,94,0.25)", borderRadius: 4, cursor: "pointer", fontSize: 9, fontWeight: 800, color: isDrafted ? "#EF4444" : "#22C55E", padding: 0 }}
                  >
                    {isDrafted ? "✕" : "✓"}
                  </button>
                ) : (
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: trend(p.rank) === "up" ? "#22C55E" : trend(p.rank) === "down" ? "#EF4444" : "#4B5268", boxShadow: trend(p.rank) === "up" ? "0 0 4px rgba(34,197,94,0.6)" : trend(p.rank) === "down" ? "0 0 4px rgba(239,68,68,0.6)" : "none", flexShrink: 0 }} />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
