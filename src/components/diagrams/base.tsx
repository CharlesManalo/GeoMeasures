import type { ReactNode } from "react";

export const INK = "#49385c";
export const COL = { opp: "#c23f7e", adj: "#23719f", hyp: "#1f7a58", hl: "#d98a00" };
export const FILL = { pink: "#ffc5dd", mint: "#b8e6d0", lilac: "#cdb8f5", sky: "#b9e3fa", sun: "#ffe89a", lav: "#e9deff", cream: "#fff9f2" };

export function Frame({ w = 340, h = 235, label, children }: { w?: number; h?: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="mx-auto block h-auto w-full max-w-[440px] rounded-2xl bg-white/70">
      {children}
    </svg>
  );
}

export function Txt({ x, y, children, size = 13, color = INK, bold = false, anchor = "middle" }: { x: number; y: number; children: ReactNode; size?: number; color?: string; bold?: boolean; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fontSize={size} fill={color} fontWeight={bold ? 800 : 700} textAnchor={anchor} stroke="#fff" strokeWidth={3} paintOrder="stroke" strokeLinejoin="round" style={{ fontFamily: "Nunito, system-ui, sans-serif" }}>
      {children}
    </text>
  );
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export type Pt = { x: number; y: number };
export const pts = (...p: Pt[]) => p.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
export const unit = (a: Pt, b: Pt): Pt => {
  const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
};

/** Small square marking a right angle at vertex v between directions toward p and q. */
export function RightMark({ v, p, q, s = 11 }: { v: Pt; p: Pt; q: Pt; s?: number }) {
  const a = unit(v, p), b = unit(v, q);
  return <polyline points={pts({ x: v.x + a.x * s, y: v.y + a.y * s }, { x: v.x + (a.x + b.x) * s, y: v.y + (a.y + b.y) * s }, { x: v.x + b.x * s, y: v.y + b.y * s })} fill="none" stroke={INK} strokeWidth={1.8} />;
}

/** Double-headed dimension line with a label. */
export function Dim({ a, b, label, off = 0, color = INK, anchor = "middle", dy = 0 }: { a: Pt; b: Pt; label: string; off?: number; color?: string; anchor?: "start" | "middle" | "end"; dy?: number }) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={1.8} strokeDasharray="5 3" />
      <circle cx={a.x} cy={a.y} r={2.5} fill={color} /><circle cx={b.x} cy={b.y} r={2.5} fill={color} />
      <Txt x={mx + off} y={my + dy} color={color} bold anchor={anchor}>{label}</Txt>
    </g>
  );
}
