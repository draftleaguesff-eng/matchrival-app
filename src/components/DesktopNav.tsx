"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MatchRivalLogo from "@/components/MatchRivalLogo";

const NAV_LINKS = [
  { href: "/",         label: "Home" },
  { href: "/rankings", label: "Rankings" },
  { href: "/matchup",  label: "Matchup" },
  { href: "/feed",     label: "Feed" },
  { href: "/news",     label: "News" },
];

export default function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: 32,
      padding: "0 32px", height: 56,
      background: "#0D0F14",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <MatchRivalLogo />
      <div style={{ display: "flex", gap: 4, marginLeft: 16 }}>
        {NAV_LINKS.map(link => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} style={{
              padding: "6px 14px", borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              color: active ? "#FFFFFF" : "#4B5268",
              background: active ? "rgba(59,130,246,0.15)" : "transparent",
              textDecoration: "none",
              transition: "color 0.15s, background 0.15s",
            }}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
