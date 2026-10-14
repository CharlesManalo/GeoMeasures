import type { CSSProperties } from "react";
import { Mascot, MASCOTS, type MascotName } from "./experience/Mascot";

// Compatibility for the preserved feature screens: only the three official mascots.
const names: MascotName[] = ["luna", "nori", "mimi"];
export const BEARS = Array.from({ length: 10 }, (_, i) => {
  const mascot = MASCOTS[names[i % 3]];
  return { name: mascot.name, title: mascot.title, color: mascot.color, symbol: "", acc: "none" as const, says: mascot.quote };
});
export function Bear({ i = 0, size = 96, label, className = "", style }: { i?: number; size?: number; mood?: "happy" | "wow" | "cheer"; label?: string; className?: string; style?: CSSProperties }) {
  return <Mascot name={names[i % 3]} className={className} decorative={!label} style={{ width: size, ...style }} />;
}
export function ShapeIcon({ type, size = 64, className = "", style }: { type: string; size?: number; className?: string; style?: CSSProperties }) {
  const st = "#49385c";
  const p = { stroke: st, strokeWidth: 2.2, strokeLinejoin: "round" as const };
  let body;
  switch (type) {
    case "cube": body = (<g {...p}><polygon points="32,6 56,18 32,30 8,18" fill="#e9deff" /><polygon points="8,18 32,30 32,58 8,46" fill="#cdb8f5" /><polygon points="32,30 56,18 56,46 32,58" fill="#b9e3fa" /></g>); break;
    case "sphere": body = (<g {...p}><circle cx="32" cy="32" r="26" fill="#ffc5dd" /><ellipse cx="32" cy="34" rx="26" ry="8" fill="none" strokeDasharray="4 3" /><ellipse cx="24" cy="22" rx="6" ry="4" fill="#fff" stroke="none" opacity=".7" /></g>); break;
    case "cone": body = (<g {...p}><path d="M32 5 L57 50 Q32 64 7 50 Z" fill="#b8e6d0" /><ellipse cx="32" cy="50" rx="25" ry="7" fill="#9fdcc2" /></g>); break;
    case "cylinder": body = (<g {...p}><path d="M10 16 V48 A22 8 0 0 0 54 48 V16" fill="#b9e3fa" /><ellipse cx="32" cy="16" rx="22" ry="8" fill="#e4f4fd" /></g>); break;
    case "prism": body = (<g {...p}><polygon points="8,48 30,48 19,14" fill="#ffc5dd" /><polygon points="19,14 41,14 52,48 30,48" fill="#e9deff" /><polygon points="30,48 52,48 52,56 30,56" fill="#cdb8f5" /></g>); break;
    case "pyramid": body = (<g {...p}><polygon points="32,6 6,46 34,58" fill="#ffe89a" /><polygon points="32,6 34,58 58,44" fill="#ffc5dd" /></g>); break;
    case "triangle": body = <polygon points="32,8 58,54 6,54" fill="#b8e6d0" {...p} />; break;
    case "circle": body = <circle cx="32" cy="32" r="24" fill="#b9e3fa" {...p} />; break;
    case "rect": body = <rect x="8" y="16" width="48" height="32" rx="4" fill="#ffc5dd" {...p} />; break;
    case "ruler": body = (<g {...p}><rect x="4" y="22" width="56" height="20" rx="4" fill="#ffe89a" />{[12, 20, 28, 36, 44, 52].map((x, i) => <line key={x} x1={x} y1="22" x2={x} y2={i % 2 ? 31 : 35} />)}</g>); break;
    default: body = <path d="M32 4 L39 24 L60 25 L43 38 L49 59 L32 47 L15 59 L21 38 L4 25 L25 24 Z" fill="#ffe89a" {...p} />;
  }
  return <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className={className} style={style}>{body}</svg>;
}

export function Cloud({ w = 150, className = "", style }: { w?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 160 80" width={w} height={w / 2} aria-hidden="true" className={className} style={style}>
      <path d="M30 70 Q6 70 10 50 Q14 34 34 38 Q38 12 66 14 Q88 4 102 26 Q130 18 138 42 Q158 46 150 64 Q146 72 130 70 Z" fill="#fff" stroke="#e9deff" strokeWidth="3" />
    </svg>
  );
}
export function Rainbow({ w = 420, className = "", style }: { w?: number; className?: string; style?: CSSProperties }) {
  const cols = ["#ffc5dd", "#ffe89a", "#b8e6d0", "#b9e3fa", "#cdb8f5"];
  return (
    <svg viewBox="0 0 220 112" width={w} height={w / 1.96} aria-hidden="true" className={className} style={style}>
      {cols.map((c, i) => <path key={c} d={`M${10 + i * 11} 110 A${100 - i * 11} ${100 - i * 11} 0 0 1 ${210 - i * 11} 110`} fill="none" stroke={c} strokeWidth="11" />)}
    </svg>
  );
}
export function Sparkle({ size = 20, color = "#ffe89a", className = "", style }: { size?: number; color?: string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className={className} style={style}>
      <path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" fill={color} stroke="#49385c" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** Light page background decoration; purely decorative. */
export function PageDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Cloud w={190} className="anim-drift absolute -left-10 top-24 opacity-80" />
      <Cloud w={150} className="anim-drift absolute right-4 top-56 opacity-70" style={{ animationDelay: "-5s" }} />
      <Sparkle className="anim-twinkle absolute left-[12%] top-[42%]" size={22} />
      <Sparkle className="anim-twinkle absolute right-[10%] top-[70%]" size={26} color="#ffc5dd" style={{ animationDelay: "-1s" }} />
      <Sparkle className="anim-twinkle absolute left-[60%] top-[18%]" size={16} color="#b9e3fa" style={{ animationDelay: "-2s" }} />
    </div>
  );
}
