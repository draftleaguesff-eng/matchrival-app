"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = "home" | "rankings" | "matchup" | "feed" | "profile";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke={active ? "#3B82F6" : "#4B5268"}
        strokeWidth="1.8"
        fill={active ? "rgba(59,130,246,0.15)" : "none"}
      />
      <path d="M9 21V12h6v9" stroke={active ? "#3B82F6" : "#4B5268"} strokeWidth="1.8" />
    </svg>
  );
}

function RankingsIcon({ active }: { active: boolean }) {
  const c = active ? "#3B82F6" : "#4B5268";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="2" rx="1" fill={c} />
      <rect x="3" y="11" width="14" height="2" rx="1" fill={c} />
      <rect x="3" y="17" width="10" height="2" rx="1" fill={c} />
    </svg>
  );
}

function FeedIcon({ active }: { active: boolean }) {
  const c = active ? "#3B82F6" : "#4B5268";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={c}
        strokeWidth="1.8"
        fill={active ? "rgba(59,130,246,0.15)" : "none"}
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? "#3B82F6" : "#4B5268";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const tabs: { id: Tab; label: string; href: string }[] = [
  { id: "home",     label: "Home",     href: "/" },
  { id: "rankings", label: "Rankings", href: "/rankings" },
  { id: "matchup",  label: "Matchup",  href: "/matchup" },
  { id: "feed",     label: "Feed",     href: "/feed" },
  { id: "profile",  label: "Profile",  href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  function getActive(href: string): Tab {
    if (href === "/" && pathname === "/") return "home";
    if (href !== "/" && pathname.startsWith(href)) return href.slice(1) as Tab;
    return "" as Tab;
  }

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(13,15,20,0.97)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        zIndex: 50,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          maxWidth: 480,
          margin: "0 auto",
          padding: "6px 0 8px",
        }}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));

          if (tab.id === "matchup") {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  textDecoration: "none",
                  position: "relative",
                  top: -14,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "#141720",
                    border: "1.5px solid rgba(245,158,11,0.30)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(245,158,11,0.12)",
                  }}
                >
                  <Image src="/helmet_icon2_nobg.png" alt="Matchup" width={30} height={30} />
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#F59E0B",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Matchup
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                textDecoration: "none",
                minWidth: 52,
                paddingTop: 4,
              }}
            >
              {tab.id === "home"     && <HomeIcon     active={isActive} />}
              {tab.id === "rankings" && <RankingsIcon active={isActive} />}
              {tab.id === "feed"     && <FeedIcon     active={isActive} />}
              {tab.id === "profile"  && <ProfileIcon  active={isActive} />}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: isActive ? "#3B82F6" : "#4B5268",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
