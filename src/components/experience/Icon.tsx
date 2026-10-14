import type { CSSProperties } from "react";

export type IconName = "home" | "book" | "shapes" | "game" | "practice" | "trophy" | "star" | "arrow" | "check" | "menu" | "close" | "search" | "sound" | "mute" | "heart" | "spark" | "chevron" | "clock" | "compass" | "ruler" | "bulb" | "retry" | "target" | "expand" | "contract" | "play" | "pause";
const paths: Record<IconName, React.ReactNode> = {
  play:<path d="m8 4 12 8-12 8Z"/>,
  pause:<><path d="M7 4v16M17 4v16"/></>,
  expand:<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
  contract:<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5"/>,
  mute:<><path d="m11 4-6 5H2v6h3l6 5ZM16 9l6 6m0-6-6 6"/></>,
  compass:<><circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/></>,
  ruler:<><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v5m4-5v3m4-3v5m4-5v3"/></>,
  bulb:<><path d="M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/></>,
  retry:<><path d="M3 10a9 9 0 1 1 1 8M3 3v7h7"/></>,
  target:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
  book: <><path d="M12 5v15M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2Z" /></>,
  shapes: <><circle cx="7" cy="7" r="4"/><path d="m17 3 4 7h-8Z"/><rect x="3" y="14" width="8" height="7" rx="1"/><path d="m17 13 5 4-5 5-5-5Z"/></>,
  game: <><path d="M7 7h10c3 0 5 8 4 11-1 3-4-1-6-2H9c-2 1-5 5-6 2-1-3 1-11 4-11Z"/><path d="M7 10v5m-2-2.5h4M15 11h.01M18 14h.01M9 7l1-3h4l1 3"/></>,
  practice: <><path d="M10 5h11M10 12h11M10 19h11M3 5l1 1 2-3M3 12l1 1 2-3M3 19l1 1 2-3"/></>,
  trophy: <><path d="M7 3h10v7a5 5 0 0 1-10 0ZM12 15v6M8 21h8M7 5H3v3c0 3 2 4 5 4M17 5h4v3c0 3-2 4-5 4"/></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>,
  arrow: <path d="M4 12h15m-5-5 5 5-5 5"/>, check: <path d="m5 12 4 4L19 6"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  sound: <><path d="m11 4-6 5H2v6h3l6 5ZM15 8c3 2 3 6 0 8M18 4c6 4 6 12 0 16"/></>,
  heart: <path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z"/>,
  spark: <path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/>,
  chevron: <path d="m9 5 7 7-7 7"/>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
};
export function Icon({name, className = "", style}: {name:IconName; className?:string; style?:CSSProperties}) {
  return <svg viewBox="0 0 24 24" className={`icon ${className}`} style={style} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
