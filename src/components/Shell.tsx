"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bear, PageDecor } from "./Art";
import { stopAudio, useAudio } from "@/lib/speech";
import { activitiesDone, clearReward, totalStars, useProfile, type RewardEvent } from "@/lib/progress";

const LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "🌈" },
  { href: "/definitions", label: "Definitions", icon: "📖" },
  { href: "/lessons", label: "Lessons", icon: "📓" },
  { href: "/games", label: "Games", icon: "🎮" },
  { href: "/practice", label: "Practice", icon: "✏️" },
  { href: "/progress", label: "Progress", icon: "🏆" },
];

function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { p, loaded } = useProfile();
  const a = useAudio();
  useEffect(() => { setOpen(false); }, [path]);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <nav aria-label="Main" className="sticky top-0 z-40 border-b-4 border-white bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-5">
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="GEO MEASURE dashboard">
          <Bear i={2} size={40} />
          <span className="font-display text-xl font-bold leading-none tracking-wide">GEO<span className="text-[#8a63d9]">MEASURE</span></span>
        </Link>
        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={active(l.href) ? "page" : undefined} className={`flex min-h-11 items-center gap-1 rounded-full px-3 font-display text-[0.95rem] font-medium hover:bg-lav ${active(l.href) ? "bg-[#cdb8f5]" : ""}`}>
                <span aria-hidden="true">{l.icon}</span>{l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          {a.status !== "idle" && <button type="button" className="btn btn-pink btn-sm" onClick={stopAudio} aria-label="Stop audio narration">⏹ Stop audio</button>}
          <Link href="/progress" className="chip min-h-10 !bg-[#ffe89a] text-base" aria-label={`${loaded ? totalStars(p) : 0} stars earned. Open progress`}>
            ⭐ <span>{loaded ? totalStars(p) : 0}</span>
          </Link>
          <button type="button" className="btn btn-purple btn-sm lg:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            {open ? "✕ Close" : "☰ Menu"}
          </button>
        </div>
      </div>
      {open && (
        <ul id="mobile-menu" className="grid grid-cols-2 gap-2 border-t-2 border-lav p-3 sm:grid-cols-3 lg:hidden">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={active(l.href) ? "page" : undefined} className={`btn btn-sm w-full ${active(l.href) ? "btn-purple" : "btn-white"}`}>{l.icon} {l.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

function AudioNotice() {
  const a = useAudio();
  if (!a.checked) return null;
  if (!a.supported) return <p role="note" className="mx-auto max-w-7xl px-4 pt-2 text-sm font-semibold text-[#a14a14]">🔇 Audio narration isn’t supported in this browser, so listen buttons are turned off. Everything can still be read on screen.</p>;
  return null;
}

function RewardToast() {
  const { store } = useProfile();
  const r = store.reward;
  const [shown, setShown] = useState<RewardEvent | null>(null);
  useEffect(() => {
    if (!r) return;
    setShown(r);
    const t = setTimeout(() => { setShown(null); clearReward(); }, 5500);
    return () => clearTimeout(t);
  }, [r]);
  if (!shown) return null;
  const n = 14;
  return (
    <>
      {shown.earned > 0 && Array.from({ length: n }).map((_, i) => {
        const ang = (i / n) * Math.PI * 2;
        const d = 120 + (i % 3) * 50;
        return <span key={i} aria-hidden="true" className="burst-star" style={{ ["--dx" as string]: `${Math.cos(ang) * d}px`, ["--dy" as string]: `${Math.sin(ang) * d}px` }}>{i % 2 ? "⭐" : "✨"}</span>;
      })}
      <div role="status" aria-live="polite" className="anim-pop fixed left-1/2 top-20 z-[80] flex w-[min(92vw,30rem)] -translate-x-1/2 items-center gap-3 rounded-3xl border-4 border-white bg-[#ffe89a] p-4 shadow-2xl">
        <Bear i={shown.earned > 0 ? 8 : 0} mood={shown.earned > 0 ? "cheer" : "happy"} size={64} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold leading-tight">{shown.message}</p>
          {shown.perfect && <p className="text-sm font-bold">🏆 Perfect score bonus!</p>}
        </div>
        <button type="button" className="btn btn-white btn-sm" onClick={() => { setShown(null); clearReward(); }} aria-label="Dismiss reward message">✕</button>
      </div>
    </>
  );
}

/** Opt-in: sends only anonymous code, nickname, stars and activity count to the shared leaderboard. */
function LeaderboardSync() {
  const { p, loaded } = useProfile();
  const stars = totalStars(p);
  const acts = activitiesDone(p);
  const last = useRef("");
  useEffect(() => {
    if (!loaded || !p.share) return;
    const body = JSON.stringify({ code: p.code, nickname: p.nickname, stars, activities: acts });
    if (body === last.current) return;
    const t = setTimeout(() => {
      fetch("/api/leaderboard", { method: "POST", headers: { "Content-Type": "application/json" }, body })
        .then((r) => { if (r.ok) last.current = body; })
        .catch(() => undefined);
    }, 1200);
    return () => clearTimeout(t);
  }, [loaded, p.share, p.code, p.nickname, stars, acts]);
  return null;
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  useEffect(() => { stopAudio(); }, [path]);
  const landing = path === "/";
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      {!landing && <Nav />}
      {!landing && <PageDecor />}
      {!landing && <AudioNotice />}
      <main id="main" className="flex-1">{children}</main>
      <footer className="px-4 pb-4 pt-8 text-center">
        <p className="text-xs text-mute">Tri-Angels · D G J</p>
      </footer>
      <RewardToast />
      <LeaderboardSync />
    </>
  );
}
