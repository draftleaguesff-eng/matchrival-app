export default function MatchRivalLogo() {
  return (
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
  );
}
