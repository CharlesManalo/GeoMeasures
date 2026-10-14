import type { DiagramSpec } from "@/lib/types";
import { fmt } from "@/lib/util";
import { COL, FILL, Frame, INK, Txt, clamp, type Pt } from "./base";

const W = 340;
const P = (x: number, y: number): Pt => ({ x, y });
const two = (n: number) => String(Math.floor(n)).padStart(2, "0");

export function ThermDiagram({ spec }: { spec: DiagramSpec }) {
  const c = spec.n?.[0] ?? 25;
  const f = (c * 9) / 5 + 32, k = c + 273.15;
  const y = (v: number) => 200 - ((clamp(v, -20, 120) + 20) * 180) / 140;
  const cTicks = [-20, 0, 20, 40, 60, 80, 100, 120];
  const fTicks = [0, 32, 68, 104, 140, 176, 212, 248];
  return (
    <Frame h={265} label={`Thermometer showing ${fmt(c, 1)} degrees Celsius, which is ${fmt(f, 1)} degrees Fahrenheit and ${fmt(k, 2)} kelvins`}>
      <g transform="translate(-40,0)">
      <rect x={158} y={14} width={24} height={196} rx={12} fill="#fff" stroke={INK} strokeWidth={2.4} />
      <circle cx={170} cy={228} r={22} fill="#ff7f9f" stroke={INK} strokeWidth={2.4} />
      <rect x={164} y={y(c)} width={12} height={228 - y(c)} fill="#ff7f9f" />
      <circle cx={170} cy={228} r={19} fill="#ff7f9f" />
      {cTicks.map((v) => <g key={v}><line x1={146} y1={y(v)} x2={158} y2={y(v)} stroke={INK} strokeWidth={2} /><Txt x={140} y={y(v) + 4} size={12} anchor="end">{v}</Txt></g>)}
      {fTicks.map((v) => { const cv = ((v - 32) * 5) / 9; return <g key={v}><line x1={182} y1={y(cv)} x2={194} y2={y(cv)} stroke={INK} strokeWidth={2} /><Txt x={200} y={y(cv) + 4} size={12} anchor="start">{v}</Txt></g>; })}
      <Txt x={110} y={12} bold color={COL.adj}>°C</Txt><Txt x={232} y={12} bold color={COL.opp}>°F</Txt>
      <line x1={110} y1={y(c)} x2={240} y2={y(c)} stroke={COL.hl} strokeWidth={2} strokeDasharray="5 3" />
      </g>
      <Txt x={W - 6} y={clamp(y(c), 30, 215) - 5} size={12} bold anchor="end" color={COL.hl}>{fmt(c, 1)}°C = {fmt(f, 1)}°F</Txt>
      <Txt x={W - 6} y={clamp(y(c), 30, 215) + 11} size={12} bold anchor="end" color={COL.hl}>= {fmt(k, 2)} K</Txt>
    </Frame>
  );
}

function ClockFace({ cx, cy, h, m, title }: { cx: number; cy: number; h: number; m: number; title?: string }) {
  const r = 58;
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  const pos = (a: number, d: number) => P(cx + d * Math.sin((a * Math.PI) / 180), cy - d * Math.cos((a * Math.PI) / 180));
  const hh = pos(ha, 31), mm = pos(ma, 46);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth={3} />
      {Array.from({ length: 12 }).map((_, i) => { const a = pos(i * 30, r - 3), b = pos(i * 30, r - 10), t = pos(i * 30, r - 20); return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeWidth={2} /><Txt x={t.x} y={t.y + 4} size={10}>{i === 0 ? 12 : i}</Txt></g>; })}
      <line x1={cx} y1={cy} x2={hh.x} y2={hh.y} stroke={COL.opp} strokeWidth={5} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={mm.x} y2={mm.y} stroke={COL.adj} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill={INK} />
      <Txt x={cx} y={cy + r + 20} size={15} bold>{title ? `${title}: ` : ""}{two(h)}:{two(m)}</Txt>
    </g>
  );
}
export function ClockDiagram({ spec }: { spec: DiagramSpec }) {
  const n = spec.n ?? [3, 0];
  const S = spec.s ?? [];
  if (n.length >= 4) {
    return (
      <Frame h={215} label={`Two clocks: ${two(n[0])}:${two(n[1])} and ${two(n[2])}:${two(n[3])}`}>
        <ClockFace cx={85} cy={90} h={n[0]} m={n[1]} title={S[0] ?? "Start"} />
        <ClockFace cx={255} cy={90} h={n[2]} m={n[3]} title={S[1] ?? "End"} />
        <path d="M148 90 H192 m-9 -7 l9 7 l-9 7" fill="none" stroke={COL.hl} strokeWidth={3.5} strokeLinecap="round" />
      </Frame>
    );
  }
  return <Frame h={215} label={`Clock showing ${two(n[0])}:${two(n[1])}`}><ClockFace cx={170} cy={92} h={n[0]} m={n[1]} /></Frame>;
}

export function MapDiagram({ spec }: { spec: DiagramSpec }) {
  const n = spec.n ?? [2, 2, 6, 2];
  const S = spec.s ?? ["Town A", "Town B"];
  const k = 24, ox = 26, oy = 14;
  const pts2: Pt[] = [];
  for (let i = 0; i + 1 < n.length; i += 2) pts2.push(P(ox + n[i] * k, oy + n[i + 1] * k));
  const dist = (i: number) => Math.hypot(n[2 * i] - n[0], n[2 * i + 1] - n[1]);
  const cols = [COL.opp, COL.adj, COL.hyp];
  return (
    <Frame h={262} label={`Map. Scale ${spec.t ?? ""}. ${S.join(", ")}`}>
      <rect x={ox} y={oy} width={12 * k} height={7 * k} rx={10} fill="#e4f6e8" stroke={INK} strokeWidth={2.4} />
      <path d={`M${ox + 8 * k} ${oy} C${ox + 6 * k} ${oy + 2 * k} ${ox + 9.5 * k} ${oy + 4 * k} ${ox + 7.5 * k} ${oy + 7 * k}`} fill="none" stroke="#9fd6f5" strokeWidth={14} strokeLinecap="round" opacity={0.85} />
      <ellipse cx={ox + 1.8 * k} cy={oy + 5.6 * k} rx={34} ry={20} fill="#cfeefc" />
      <path d={`M${ox} ${oy + 4 * k} H${ox + 12 * k}`} stroke="#fff" strokeWidth={5} strokeDasharray="10 7" opacity={0.9} />
      {Array.from({ length: 13 }).map((_, i) => <line key={i} x1={ox + i * k} y1={oy} x2={ox + i * k} y2={oy + 7 * k} stroke="#fff" strokeOpacity={0.45} />)}
      {pts2.slice(1).map((p, i) => (
        <g key={i}>
          <line x1={pts2[0].x} y1={pts2[0].y} x2={p.x} y2={p.y} stroke={cols[i % 3]} strokeWidth={3.4} strokeDasharray={i ? "7 4" : undefined} strokeLinecap="round" />
          <Txt x={(pts2[0].x + p.x) / 2} y={(pts2[0].y + p.y) / 2 - 8} size={12} bold color={cols[i % 3]}>{fmt(dist(i + 1), 1)} cm</Txt>
        </g>
      ))}
      {pts2.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r={6} fill="#fff" stroke={INK} strokeWidth={2.5} /><circle cx={p.x} cy={p.y} r={2.5} fill={INK} /><Txt x={p.x} y={p.y + 19} size={12} bold>{S[i] ?? ""}</Txt></g>)}
      <line x1={ox} y1={oy + 7 * k + 26} x2={ox + 12 * k} y2={oy + 7 * k + 26} stroke={INK} strokeWidth={2} />
      {Array.from({ length: 13 }).map((_, i) => <g key={i}><line x1={ox + i * k} y1={oy + 7 * k + 20} x2={ox + i * k} y2={oy + 7 * k + 32} stroke={INK} strokeWidth={2} />{i % 2 === 0 && <Txt x={ox + i * k} y={oy + 7 * k + 46} size={10}>{i === 12 ? "cm" : i}</Txt>}</g>)}
      <Txt x={ox + 6 * k} y={oy + 7 * k + 60} size={13} bold color="#6240b5">{spec.t ? `Scale: ${spec.t}` : ""}</Txt>
    </Frame>
  );
}

export function RulerDiagram({ spec }: { spec: DiagramSpec }) {
  const len = spec.n?.[0] ?? 7.5;
  const name = spec.s?.[0] ?? "pencil";
  const maxCm = len <= 12 ? 12 : Math.ceil(len / 5) * 5;
  const k = 300 / maxCm, x0 = 20;
  const lstep = maxCm > 15 ? 2 : 1;
  return (
    <Frame h={150} label={`A ${name} measured with a centimeter ruler: ${fmt(len, 1)} centimeters`}>
      <rect x={x0 - 4} y={78} width={maxCm * k + 8} height={46} rx={6} fill={FILL.sun} stroke={INK} strokeWidth={2.4} />
      {Array.from({ length: maxCm * 10 + 1 }).map((_, i) => { const x = x0 + (i * k) / 10, big = i % 10 === 0, mid = i % 5 === 0; return <line key={i} x1={x} y1={78} x2={x} y2={78 + (big ? 22 : mid ? 16 : 10)} stroke={INK} strokeWidth={big ? 2 : 1.2} />; })}
      {Array.from({ length: maxCm + 1 }).filter((_, i) => i % lstep === 0).map((_, j) => <Txt key={j} x={x0 + j * lstep * k} y={116} size={11}>{j * lstep}</Txt>)}
      <Txt x={x0 + maxCm * k - 6} y={140} size={10} anchor="end">cm</Txt>
      {spec.t === "bar" ? <rect x={x0} y={34} width={len * k} height={22} rx={5} fill={FILL.pink} stroke={INK} strokeWidth={2.2} /> : (
        <g stroke={INK} strokeWidth={2.2} strokeLinejoin="round"><rect x={x0 + 12} y={34} width={Math.max(0, len * k - 30)} height={22} fill="#ffd966" /><polygon points={`${x0 + len * k - 18},34 ${x0 + len * k},45 ${x0 + len * k - 18},56`} fill="#f7d9b4" /><rect x={x0} y={34} width={12} height={22} fill={FILL.pink} /></g>
      )}
      <line x1={x0 + len * k} y1={30} x2={x0 + len * k} y2={96} stroke={COL.opp} strokeWidth={2} strokeDasharray="4 3" />
      <Txt x={x0 + (len * k) / 2} y={24} size={13} bold>{name}: {fmt(len, 1)} cm</Txt>
    </Frame>
  );
}

const LADDERS: Record<string, string[]> = {
  length: ["km", "hm", "dam", "m", "dm", "cm", "mm"],
  mass: ["kg", "hg", "dag", "g", "dg", "cg", "mg"],
  cap: ["kL", "hL", "daL", "L", "dL", "cL", "mL"],
};
export function LadderDiagram({ spec }: { spec: DiagramSpec }) {
  const units = LADDERS[spec.t ?? "length"] ?? LADDERS.length;
  const [from, to] = spec.s ?? ["km", "m"];
  const fi = units.indexOf(from), ti = units.indexOf(to);
  const bw = 44, x0 = (W - 7 * bw) / 2;
  const steps = fi >= 0 && ti >= 0 ? ti - fi : 0;
  const cx = (i: number) => x0 + i * bw + bw / 2;
  return (
    <Frame h={176} label={`Metric ladder: from ${from} to ${to} is ${Math.abs(steps)} steps, ${steps >= 0 ? "multiply" : "divide"} by ${Math.pow(10, Math.abs(steps))}`}>
      {units.map((u, i) => <g key={u}><rect x={x0 + i * bw + 2} y={86} width={bw - 4} height={40} rx={10} fill={i === fi ? FILL.pink : i === ti ? FILL.mint : FILL.lav} stroke={INK} strokeWidth={i === fi || i === ti ? 3 : 1.6} /><Txt x={cx(i)} y={112} size={14} bold>{u}</Txt></g>)}
      {steps !== 0 && fi >= 0 && ti >= 0 && (
        <g>
          <path d={`M${cx(fi)} 80 Q${(cx(fi) + cx(ti)) / 2} 18 ${cx(ti)} 80`} fill="none" stroke={COL.hl} strokeWidth={3.2} />
          <path d={`M${cx(ti)} 80 l${ti > fi ? -8 : 8} -9 m${ti > fi ? 8 : -8} 9 l${ti > fi ? 1 : -1} -12`} fill="none" stroke={COL.hl} strokeWidth={3.2} strokeLinecap="round" />
          <Txt x={(cx(fi) + cx(ti)) / 2} y={36} size={14} bold color={COL.hl}>{steps > 0 ? "×" : "÷"} {Math.pow(10, Math.abs(steps)).toLocaleString("en-US")}</Txt>
        </g>
      )}
      <Txt x={W / 2} y={146} size={12} bold>Right (smaller units): × 10 for each step</Txt>
      <Txt x={W / 2} y={162} size={12} bold>Left (larger units): ÷ 10 for each step</Txt>
    </Frame>
  );
}

export function CurrencyDiagram({ spec }: { spec: DiagramSpec }) {
  const [rate, amt] = spec.n ?? [56, 100];
  const [from, to] = spec.s ?? ["USD", "PHP"];
  return (
    <Frame h={200} label={`Currency conversion: ${fmt(amt)} ${from} equals ${fmt(amt * rate)} ${to} at the sample rate 1 ${from} = ${fmt(rate)} ${to}`}>
      <rect x={14} y={60} width={118} height={70} rx={18} fill={FILL.sky} stroke={INK} strokeWidth={2.4} />
      <rect x={208} y={60} width={118} height={70} rx={18} fill={FILL.pink} stroke={INK} strokeWidth={2.4} />
      <Txt x={73} y={92} size={20} bold>{fmt(amt)}</Txt><Txt x={73} y={116} size={14} bold>{from}</Txt>
      <Txt x={267} y={92} size={20} bold>{fmt(amt * rate)}</Txt><Txt x={267} y={116} size={14} bold>{to}</Txt>
      <path d="M138 76 H200 m-9 -7 l9 7 l-9 7" fill="none" stroke={COL.hyp} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M200 114 H138 m9 -7 l-9 7 l9 7" fill="none" stroke={COL.opp} strokeWidth={3.5} strokeLinecap="round" />
      <Txt x={170} y={62} size={13} bold color={COL.hyp}>× {fmt(rate, 4)}</Txt>
      <Txt x={170} y={140} size={13} bold color={COL.opp}>÷ {fmt(rate, 4)}</Txt>
      <Txt x={170} y={172} size={13} bold>Sample rate: 1 {from} = {fmt(rate, 4)} {to}</Txt>
      <Txt x={170} y={190} size={11}>(a classroom example, not a live exchange rate)</Txt>
    </Frame>
  );
}

export function TimelineDiagram({ spec }: { spec: DiagramSpec }) {
  const [s, e] = spec.n ?? [540, 900];
  const total = Math.max(1440, Math.ceil(e / 360) * 360);
  const x0 = 18, wd = W - 36, X = (m: number) => x0 + (m / total) * wd;
  const clock = (m: number) => `${two(Math.floor((m % 1440) / 60))}:${two(m % 60)}`;
  const ticks: number[] = [];
  const tstep = total > 1440 ? 360 : 180;
  for (let m = 0; m <= total; m += tstep) ticks.push(m);
  return (
    <Frame h={158} label={`Timeline from ${clock(s)} to ${clock(e)}${e > 1440 ? " the next day" : ""}, lasting ${Math.floor((e - s) / 60)} hours ${(e - s) % 60} minutes`}>
      <rect x={x0} y={62} width={wd} height={26} rx={13} fill="#fff" stroke={INK} strokeWidth={2} />
      <rect x={X(s)} y={62} width={X(e) - X(s)} height={26} rx={13} fill={FILL.mint} stroke={INK} strokeWidth={2.4} />
      {ticks.map((m) => <g key={m}><line x1={X(m)} y1={88} x2={X(m)} y2={98} stroke={INK} strokeWidth={1.6} /><Txt x={X(m)} y={112} size={10}>{(m / 60) % 24}:00</Txt></g>)}
      {total > 1440 && <g><line x1={X(1440)} y1={52} x2={X(1440)} y2={98} stroke={COL.opp} strokeWidth={2.4} strokeDasharray="4 3" /><Txt x={X(1440)} y={127} size={11} bold color={COL.opp}>midnight</Txt></g>}
      <Txt x={clamp(X(s), 40, W - 60)} y={30} size={13} bold color={COL.adj}>Start {clock(s)}</Txt>
      <Txt x={clamp(X(e), 40, W - 45)} y={50} size={13} bold color={COL.opp}>End {clock(e)}</Txt>
      <Txt x={W / 2} y={150} size={13} bold>Duration: {Math.floor((e - s) / 60)} h {(e - s) % 60} min = {e - s} minutes</Txt>
    </Frame>
  );
}

const BARS: Record<string, [string, string][]> = {
  length: [["1 mm", "thickness of a coin"], ["1 cm", "width of a fingertip"], ["1 m", "one big step"], ["1 km", "a 12-min walk"]],
  mass: [["1 mg", "a tiny pinch of powder"], ["1 g", "a paper clip"], ["1 kg", "a bag of sugar"], ["1 t", "a small car"]],
  cap: [["5 mL", "a teaspoon"], ["250 mL", "a cup"], ["1 L", "a large bottle"], ["1000 L", "a big tank (1 m³)"]],
};
export function BarsDiagram({ spec }: { spec: DiagramSpec }) {
  const rows = BARS[spec.t ?? "length"] ?? BARS.length;
  const fills = [FILL.pink, FILL.mint, FILL.sky, FILL.lilac];
  return (
    <Frame h={190} label={`Everyday examples of ${spec.t ?? "length"} units`}>
      {rows.map(([u, d], i) => (
        <g key={u}>
          <rect x={14} y={14 + i * 42} width={70 + i * 42} height={32} rx={16} fill={fills[i]} stroke={INK} strokeWidth={2.2} />
          <Txt x={14 + (70 + i * 42) / 2} y={35 + i * 42} size={14} bold>{u}</Txt>
          <Txt x={14 + 70 + i * 42 + 10} y={35 + i * 42} size={13} anchor="start">{d}</Txt>
        </g>
      ))}
    </Frame>
  );
}
