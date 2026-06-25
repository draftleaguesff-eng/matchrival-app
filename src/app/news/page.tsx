"use client";

import { useEffect, useState } from "react";
import MatchRivalLogo from "@/components/MatchRivalLogo";

interface NewsItem {
  id: string;
  team: string;
  abbr: string;
  tag: string;
  title: string;
  body: string;
  time: string;
  link: string;
  isCurated?: boolean;
}

const TAG_COLORS: Record<string, string> = {
  INJURY: "#EF4444",
  PRACTICE: "#3B82F6",
  "DEPTH CHART": "#8B5CF6",
  ROSTER: "#F59E0B",
  UPDATE: "#6B7280",
};

const ESPN_LOGO: Record<string, number> = {
  NE: 17, SEA: 26, KC: 12, BUF: 2, DAL: 6, PHI: 21, SF: 25, MIA: 15, CHI: 3, GB: 9,
};

function TeamLogo({ abbr }: { abbr: string }) {
  const id = ESPN_LOGO[abbr];
  if (!id) return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1E2130", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#8892AA", flexShrink: 0 }}>
      {abbr}
    </div>
  );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`}
      alt={abbr}
      width={36}
      height={36}
      style={{ borderRadius: "50%", objectFit: "contain", background: "#1E2130", flexShrink: 0 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

const TABS = ["All", "My Team", "My Players"];

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0F14", paddingBottom: 90, fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 0", background: "#0D0F14" }}>
        <div style={{ marginBottom: 2 }}>
          <MatchRivalLogo />
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#4B5268", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>NEWS FEED</div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ background: "none", border: "none", padding: "8px 16px", fontSize: 13, fontWeight: 600, color: activeTab === tab ? "#3B82F6" : "#4B5268", borderBottom: activeTab === tab ? "2px solid #3B82F6" : "2px solid transparent", cursor: "pointer", marginBottom: -1 }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Latest Updates row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 8px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4B5268", letterSpacing: "0.08em", textTransform: "uppercase" }}>Latest Updates</span>
        <button style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#3B82F6", cursor: "pointer" }}>Filter</button>
      </div>

      {/* Cards */}
      <div style={{ padding: "0 12px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4B5268", fontSize: 14 }}>Loading news…</div>
        )}
        {!loading && items.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#4B5268", fontSize: 14 }}>No news available right now.</div>
        )}
        {items.map(item => (
          <div key={item.id} onClick={() => setSelectedItem(item)} style={{ cursor: "pointer", display: "block" }}>
            <div style={{ background: "#13161F", borderRadius: 12, padding: "14px 14px 12px", marginBottom: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <TeamLogo abbr={item.abbr} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8892AA" }}>{item.team}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: TAG_COLORS[item.tag] ?? "#6B7280", background: `${TAG_COLORS[item.tag] ?? "#6B7280"}1A`, border: `1px solid ${TAG_COLORS[item.tag] ?? "#6B7280"}40`, borderRadius: 4, padding: "2px 6px", letterSpacing: "0.05em" }}>
                      {item.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.35, marginBottom: 6 }}>{item.title}</div>
                  {item.body && <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginBottom: 8 }}>{item.body}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#4B5268" }}>{item.time}</span>
                    {!item.isCurated && <span style={{ fontSize: 12, color: "#4B5268" }}>↗</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelectedItem(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 60 }}
          />
          {/* Sheet */}
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 70,
            background: "#13161F", borderRadius: "20px 20px 0 0",
            padding: "0 0 90px",
            maxHeight: "85vh", overflowY: "auto",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            </div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <TeamLogo abbr={selectedItem.abbr} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#8892AA" }}>{selectedItem.team}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: TAG_COLORS[selectedItem.tag] ?? "#6B7280", background: `${TAG_COLORS[selectedItem.tag] ?? "#6B7280"}1A`, border: `1px solid ${TAG_COLORS[selectedItem.tag] ?? "#6B7280"}40`, borderRadius: 4, padding: "2px 6px" }}>
                    {selectedItem.tag}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8892AA", fontSize: 18 }}>✕</button>
            </div>
            {/* Title */}
            <div style={{ padding: "0 16px 12px", fontSize: 18, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.3 }}>
              {selectedItem.title}
            </div>
            {/* Body */}
            <div style={{ padding: "0 16px 20px", fontSize: 14, color: "#C8CDD8", lineHeight: 1.7 }}>
              {selectedItem.body}
            </div>
            {/* Time */}
            <div style={{ padding: "0 16px" }}>
              <span style={{ fontSize: 12, color: "#4B5268" }}>{selectedItem.time}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
