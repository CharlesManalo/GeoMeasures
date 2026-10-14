import type { DiagramSpec } from "@/lib/types";
import { fmt } from "@/lib/util";
import { COL, FILL, Frame, INK, RightMark, Txt, pts, type Pt } from "./base";

const W = 340, H = 235;
const P = (x: number, y: number): Pt => ({ x, y });

export function PlaneDiagram({ spec }: { spec: DiagramSpec }) {
  const t = spec.t ?? "rect";
  const n = spec.n ?? [];
  const S = spec.s ?? [];
  const hl = spec.hl ?? [];
  const shade = hl.includes("shade") ? FILL.sun : FILL.mint;
  const lab = (i: number, d?: string) => S[i] ?? (n[i] !== undefined ? fmt(n[i]) : d ?? "");
  const stroke = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: "round" as const };
  if (t === "square" || t === "rect") {
    const l = n[0] ?? 5, w = t === "square" ? n[0] ?? 5 : n[1] ?? 3;
    const rw = (t === "square" ? lab(0) : lab(1)).length * 7.4 + 12;
    const k = Math.min((W - 30 - rw) / l, 135 / w), L = l * k, Hh = w * k, x0 = (W - L - rw) / 2 + 4, y0 = (H - Hh) / 2 - 6;
    return (
      <Frame label={t === "square" ? "Square" : "Rectangle with length and width"}>
        <rect x={x0} y={y0} width={L} height={Hh} fill={shade} {...stroke} />
        <RightMark v={P(x0, y0 + Hh)} p={P(x0 + L, y0 + Hh)} q={P(x0, y0)} s={10} />
        <Txt x={x0 + L / 2} y={y0 + Hh + 20} bold>{lab(0)}</Txt>
        <Txt x={x0 + L + 10} y={y0 + Hh / 2 + 4} anchor="start" bold>{t === "square" ? lab(0) : lab(1)}</Txt>
      </Frame>
    );
  }
  if (t === "para") {
    const b = n[0] ?? 8, h = n[1] ?? 4, sd = n[2] ?? 5;
    const off = Math.sqrt(Math.max(0.01, sd * sd - h * h));
    const k = Math.min(210 / (b + off), 125 / h), B = b * k, Hh = h * k, O = off * k;
    const x0 = (W - (B + O)) / 2, y0 = (H + Hh) / 2 + 6;
    return (
      <Frame label="Parallelogram with base, side and perpendicular height">
        <polygon points={pts(P(x0, y0), P(x0 + B, y0), P(x0 + B + O, y0 - Hh), P(x0 + O, y0 - Hh))} fill={shade} {...stroke} />
        <line x1={x0 + O} y1={y0 - Hh} x2={x0 + O} y2={y0} stroke={COL.opp} strokeWidth={2.6} strokeDasharray="6 4" />
        <RightMark v={P(x0 + O, y0)} p={P(x0 + O, y0 - Hh)} q={P(x0 + B, y0)} s={9} />
        <Txt x={x0 + B / 2} y={y0 + 20} bold>{lab(0)}</Txt>
        <Txt x={x0 + O + 8} y={y0 - Hh / 2 + 4} anchor="start" bold color={COL.opp}>{lab(1)}</Txt>
        <Txt x={x0 + B + O / 2 + 12} y={y0 - Hh / 2} anchor="start" bold>{lab(2, "side")}</Txt>
      </Frame>
    );
  }
  if (t === "trap") {
    const a = n[0] ?? 4, b = n[1] ?? 8, h = n[2] ?? 3;
    const k = Math.min(230 / b, 125 / h), A = a * k, B = b * k, Hh = h * k;
    const x0 = (W - B) / 2, y0 = (H + Hh) / 2 + 6, xt = x0 + (B - A) / 2;
    return (
      <Frame label="Trapezoid with two parallel bases and a perpendicular height">
        <polygon points={pts(P(x0, y0), P(x0 + B, y0), P(xt + A, y0 - Hh), P(xt, y0 - Hh))} fill={shade} {...stroke} />
        <line x1={xt} y1={y0 - Hh} x2={xt} y2={y0} stroke={COL.opp} strokeWidth={2.6} strokeDasharray="6 4" />
        <RightMark v={P(xt, y0)} p={P(xt, y0 - Hh)} q={P(x0 + B, y0)} s={9} />
        <Txt x={xt + A / 2} y={y0 - Hh - 8} bold>{lab(0, "a")}</Txt>
        <Txt x={x0 + B / 2} y={y0 + 20} bold>{lab(1, "b")}</Txt>
        <Txt x={xt + 8} y={y0 - Hh / 2 + 4} anchor="start" bold color={COL.opp}>{lab(2, "h")}</Txt>
      </Frame>
    );
  }
  if (t === "circle") {
    const r = 76, cx = W / 2, cy = H / 2 - 4;
    return (
      <Frame label="Circle with radius, diameter and circumference">
        <circle cx={cx} cy={cy} r={r} fill={shade} {...stroke} />
        {hl.includes("diameter") ? <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={COL.adj} strokeWidth={3} /> : <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={COL.opp} strokeWidth={3} />}
        <circle cx={cx} cy={cy} r={3.5} fill={INK} />
        <Txt x={hl.includes("diameter") ? cx : cx + r / 2} y={cy - 8} bold color={hl.includes("diameter") ? COL.adj : COL.opp}>{S[0] ?? (hl.includes("diameter") ? "d = 2r" : "r")}</Txt>
        {hl.includes("circ") && <Txt x={cx} y={cy + r + 18} bold>{S[1] ?? "circumference C = 2πr"}</Txt>}
      </Frame>
    );
  }
  if (t === "polygon") {
    const k = Math.max(3, Math.round(n[0] ?? 5)), r = 78, cx = W / 2, cy = H / 2;
    const ps = Array.from({ length: k }, (_, i) => P(cx + r * Math.sin((2 * Math.PI * i) / k), cy - r * Math.cos((2 * Math.PI * i) / k)));
    const m = P((ps[0].x + ps[1].x) / 2, (ps[0].y + ps[1].y) / 2);
    return (
      <Frame label={`Regular polygon with ${k} equal sides`}>
        <polygon points={pts(...ps)} fill={shade} {...stroke} />
        <Txt x={m.x + 14} y={m.y - 6} bold anchor="start">{S[0] ?? `${fmt(n[1] ?? 4)} each`}</Txt>
        <Txt x={cx} y={cy + 5} bold>{S[1] ?? `${k} sides`}</Txt>
      </Frame>
    );
  }
  if (t === "lshape") {
    const [Wd, Ht, cw, ch] = [n[0] ?? 10, n[1] ?? 8, n[2] ?? 4, n[3] ?? 3];
    const k = Math.min(230 / Wd, 150 / Ht), x0 = (W - Wd * k) / 2, y0 = (H + Ht * k) / 2 - 4;
    const p = [P(x0, y0), P(x0 + Wd * k, y0), P(x0 + Wd * k, y0 - (Ht - ch) * k), P(x0 + (Wd - cw) * k, y0 - (Ht - ch) * k), P(x0 + (Wd - cw) * k, y0 - Ht * k), P(x0, y0 - Ht * k)];
    return (
      <Frame label="Composite L-shaped figure with labeled dimensions">
        <polygon points={pts(...p)} fill={shade} {...stroke} />
        <Txt x={x0 + (Wd * k) / 2} y={y0 + 20} bold>{lab(0)}</Txt>
        <Txt x={x0 - 8} y={y0 - (Ht * k) / 2 + 4} anchor="end" bold>{lab(1)}</Txt>
        <Txt x={x0 + (Wd - cw / 2) * k} y={y0 - (Ht - ch) * k - 18} bold color={COL.opp}>{lab(2)}</Txt>
        <Txt x={x0 + (Wd - cw) * k - 8} y={y0 - (Ht - ch / 2) * k + 4} anchor="end" bold color={COL.opp}>{lab(3)}</Txt>
      </Frame>
    );
  }
  return <Frame label="Plane figure"><Txt x={170} y={118}>Plane figure</Txt></Frame>;
}

function Angle({ v, a1, a2, label, name, right = false, len = 78, r = 26 }: { v: Pt; a1: number; a2: number; label: string; name: string; right?: boolean; len?: number; r?: number }) {
  const p = (a: number, d: number) => P(v.x + d * Math.cos((-a * Math.PI) / 180), v.y + d * Math.sin((-a * Math.PI) / 180));
  const e1 = p(a1, len), e2 = p(a2, len), s = p(a1, r), e = p(a2, r), m = p((a1 + a2) / 2, r + 17);
  return (
    <g>
      <path d={`M${s.x} ${s.y} A${r} ${r} 0 ${Math.abs(a2 - a1) > 180 ? 1 : 0} 0 ${e.x} ${e.y}`} fill="none" stroke="#6240b5" strokeWidth={2.4} />
      <line x1={v.x} y1={v.y} x2={e1.x} y2={e1.y} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      <line x1={v.x} y1={v.y} x2={e2.x} y2={e2.y} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      {right && <RightMark v={v} p={e1} q={e2} s={13} />}
      <Txt x={m.x} y={m.y + 4} size={12} bold color="#6240b5">{label}</Txt>
      <Txt x={v.x + 40} y={v.y + 24} size={12} bold>{name}</Txt>
    </g>
  );
}

export function AnglesDiagram({ spec }: { spec: DiagramSpec }) {
  const t = spec.t ?? "types";
  const hl = spec.hl ?? [];
  if (t === "types") {
    return (
      <Frame label="Types of angles: acute, right, obtuse and straight">
        <Angle v={P(26, 92)} a1={0} a2={40} label="40°" name="acute (< 90°)" len={90} />
        <Angle v={P(196, 92)} a1={0} a2={90} label="90°" name="right (= 90°)" right len={70} />
        <Angle v={P(80, 206)} a1={0} a2={130} label="130°" name="obtuse (> 90°)" len={80} />
        <Angle v={P(196, 206)} a1={0} a2={180} label="180°" name="straight (= 180°)" len={75} />
      </Frame>
    );
  }
  if (t === "pairs") {
    return (
      <Frame label="Complementary angles add to 90 degrees; supplementary angles add to 180 degrees">
        <Angle v={P(20, 100)} a1={0} a2={35} label="35°" name="" len={90} r={30} />
        <Angle v={P(20, 100)} a1={35} a2={90} label="55°" name="" len={90} r={52} />
        <Txt x={170} y={128} bold>complementary: 35° + 55° = 90°</Txt>
        <Angle v={P(200, 210)} a1={0} a2={70} label="70°" name="" len={80} r={30} />
        <Angle v={P(200, 210)} a1={70} a2={180} label="110°" name="" len={80} r={52} />
        <Txt x={170} y={226} bold>supplementary: 70° + 110° = 180°</Txt>
      </Frame>
    );
  }
  if (t === "basics") {
    const cells = [
      { x: 0, y: 0, name: "Point A" }, { x: 170, y: 0, name: "Line AB" }, { x: 0, y: 118, name: "Segment AB" }, { x: 170, y: 118, name: "Ray AB" },
    ];
    return (
      <Frame label="A point, a line, a line segment and a ray">
        {cells.map((c) => <Txt key={c.name} x={c.x + 85} y={c.y + 105} bold>{c.name}</Txt>)}
        <circle cx={85} cy={50} r={5} fill={COL.opp} /><Txt x={85} y={38} bold>A</Txt>
        <line x1={185} y1={50} x2={325} y2={50} stroke={INK} strokeWidth={3} /><path d="M185 50 l9 -5 v10 z M325 50 l-9 -5 v10 z" fill={INK} />
        <circle cx={225} cy={50} r={4.5} fill={COL.opp} /><circle cx={285} cy={50} r={4.5} fill={COL.opp} /><Txt x={225} y={38} bold>A</Txt><Txt x={285} y={38} bold>B</Txt>
        <line x1={25} y1={168} x2={145} y2={168} stroke={INK} strokeWidth={3} /><circle cx={25} cy={168} r={4.5} fill={COL.opp} /><circle cx={145} cy={168} r={4.5} fill={COL.opp} /><Txt x={25} y={156} bold>A</Txt><Txt x={145} y={156} bold>B</Txt>
        <line x1={195} y1={168} x2={325} y2={168} stroke={INK} strokeWidth={3} /><path d="M325 168 l-9 -5 v10 z" fill={INK} /><circle cx={195} cy={168} r={4.5} fill={COL.opp} /><circle cx={255} cy={168} r={4.5} fill={COL.opp} /><Txt x={195} y={156} bold>A</Txt><Txt x={255} y={156} bold>B</Txt>
      </Frame>
    );
  }
  // parallel lines and a transversal
  const Pp = P(130, 85), Q = P(210, 155);
  const off = (c: Pt, i: number): Pt => [P(c.x - 36, c.y - 13), P(c.x + 10, c.y - 27), P(c.x + 36, c.y + 14), P(c.x - 10, c.y + 27)][i];
  const on = (n: number) => (hl.includes("corr") && (n === 1 || n === 5)) || (hl.includes("alt") && (n === 3 || n === 5)) || (hl.includes("co") && (n === 3 || n === 6)) || (hl.includes("vert") && (n === 1 || n === 3));
  return (
    <Frame label="Two parallel lines cut by a transversal with eight numbered angles">
      <line x1={20} y1={85} x2={320} y2={85} stroke={INK} strokeWidth={2.6} /><line x1={20} y1={155} x2={320} y2={155} stroke={INK} strokeWidth={2.6} />
      <path d="M296 85 l-8 -5 v10 z M296 155 l-8 -5 v10 z" fill={INK} />
      <line x1={130 - 40 * (80 / 70)} y1={45} x2={210 + 40 * (80 / 70)} y2={195} stroke={COL.opp} strokeWidth={2.8} />
      {[0, 1, 2, 3].map((i) => { const p = off(Pp, i); return <g key={i}><circle cx={p.x} cy={p.y} r={10.5} fill={on(i + 1) ? FILL.sun : "#fff"} stroke={on(i + 1) ? COL.hl : INK} strokeWidth={on(i + 1) ? 2.6 : 1.4} /><Txt x={p.x} y={p.y + 4} size={11} bold>{i + 1}</Txt></g>; })}
      {[0, 1, 2, 3].map((i) => { const p = off(Q, i); return <g key={i}><circle cx={p.x} cy={p.y} r={10.5} fill={on(i + 5) ? FILL.sun : "#fff"} stroke={on(i + 5) ? COL.hl : INK} strokeWidth={on(i + 5) ? 2.6 : 1.4} /><Txt x={p.x} y={p.y + 4} size={11} bold>{i + 5}</Txt></g>; })}
      <Txt x={310} y={78} size={11} anchor="end">line ℓ₁</Txt><Txt x={310} y={148} size={11} anchor="end">line ℓ₂ (∥ ℓ₁)</Txt>
    </Frame>
  );
}
