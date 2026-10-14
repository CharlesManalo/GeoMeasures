import type { ReactNode } from "react";
import type { DiagramSpec } from "@/lib/types";
import { fmt } from "@/lib/util";
import { COL, FILL, Frame, INK, Dim, RightMark, Txt, clamp, pts, type Pt } from "./base";

const W = 340, H = 235;
const P = (x: number, y: number): Pt => ({ x, y });
const sw = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: "round" as const };

function Box({ x0, y0, L, Hh, dx, dy, hl }: { x0: number; y0: number; L: number; Hh: number; dx: number; dy: number; hl: string[] }) {
  const f = (name: string, def: string) => (hl.includes(name) ? FILL.sun : def);
  return (
    <g {...sw}>
      <polygon points={pts(P(x0, y0), P(x0 + L, y0), P(x0 + L + dx, y0 - dy), P(x0 + dx, y0 - dy))} fill={f("top", FILL.sky)} />
      <polygon points={pts(P(x0 + L, y0), P(x0 + L + dx, y0 - dy), P(x0 + L + dx, y0 + Hh - dy), P(x0 + L, y0 + Hh))} fill={f("side", FILL.mint)} />
      <rect x={x0} y={y0} width={L} height={Hh} fill={f("front", FILL.pink)} />
    </g>
  );
}

export function SolidDiagram({ spec }: { spec: DiagramSpec }) {
  const t = spec.t ?? "prism";
  const n = spec.n ?? [];
  const S = spec.s ?? [];
  const hl = spec.hl ?? [];
  const lab = `3D diagram of a ${t}`;
  if (t === "prism" || t === "cube") {
    const [l, w, h] = t === "cube" ? [n[0] ?? 3, n[0] ?? 3, n[0] ?? 3] : [n[0] ?? 6, n[1] ?? 4, n[2] ?? 3];
    const k = Math.min(135 / l, 100 / h, 90 / w);
    const L = clamp(l * k, 40, 135), Hh = clamp(h * k, 32, 100), Dp = clamp(w * k, 26, 90);
    const dx = Dp * 0.6, dy = Dp * 0.45;
    const x0 = 66 + (200 - (L + dx)) / 2, y0 = (H - (Hh + dy)) / 2 + dy - 4;
    return (
      <Frame label={`${t === "cube" ? "Cube" : "Rectangular prism"} with labeled edges`}>
        <Box x0={x0} y0={y0} L={L} Hh={Hh} dx={dx} dy={dy} hl={hl} />
        <Txt x={x0 + L / 2} y={y0 + Hh + 19} bold>{S[0] ?? (t === "cube" ? "s" : "l")}</Txt>
        <Txt x={x0 - 8} y={y0 + Hh / 2 + 4} anchor="end" bold>{S[2] ?? (t === "cube" ? "s" : "h")}</Txt>
        <Txt x={x0 + L + dx / 2 + 12} y={y0 - dy / 2 - 12} anchor="start" bold>{S[1] ?? (t === "cube" ? "s" : "w")}</Txt>
      </Frame>
    );
  }
  if (t === "cylinder") {
    const r = n[0] ?? 3, h = n[1] ?? 8;
    const k = Math.min(70 / r, 120 / h);
    const R = clamp(r * k, 28, 72), Hc = clamp(h * k, 50, 130), ry = R * 0.32;
    const cx = W / 2 - 24, yT = (H - Hc - 2 * ry) / 2 + ry + 2, yB = yT + Hc;
    return (
      <Frame label="Cylinder with radius and height labeled">
        <g {...sw}>
          <path d={`M${cx - R} ${yT} L${cx - R} ${yB} A${R} ${ry} 0 0 0 ${cx + R} ${yB} L${cx + R} ${yT}`} fill={hl.includes("lateral") ? FILL.sun : FILL.sky} />
          <ellipse cx={cx} cy={yT} rx={R} ry={ry} fill={hl.includes("bases") ? FILL.pink : FILL.lav} />
        </g>
        <Dim a={P(cx, yT)} b={P(cx + R, yT)} label="" color={COL.opp} />
        <Txt x={cx + R / 2 + 4} y={yT - ry - 6} bold color={COL.opp}>{S[0] ?? "r"}</Txt>
        <Dim a={P(cx + R + 22, yT)} b={P(cx + R + 22, yB)} label={S[1] ?? "h"} off={14} anchor="start" color={COL.adj} />
      </Frame>
    );
  }
  if (t === "cone") {
    const r = n[0] ?? 3, h = n[1] ?? 4;
    const k = Math.min(70 / r, 130 / h);
    const R = clamp(r * k, 28, 72), Hc = clamp(h * k, 60, 150), ry = R * 0.3;
    const cx = W / 2 - 24, yA = (H - Hc - ry) / 2 + 4, yB = yA + Hc;
    return (
      <Frame label="Cone with radius, height and slant height labeled">
        <g {...sw}>
          <path d={`M${cx} ${yA} L${cx - R} ${yB} A${R} ${ry} 0 0 0 ${cx + R} ${yB} Z`} fill={hl.includes("lateral") ? FILL.sun : FILL.mint} />
          <path d={`M${cx - R} ${yB} A${R} ${ry} 0 0 1 ${cx + R} ${yB}`} fill={FILL.lav} strokeDasharray="5 4" />
        </g>
        <Dim a={P(cx, yA)} b={P(cx, yB)} label="" color={COL.adj} />
        <Txt x={cx - R * 0.5 - 8} y={yA + (yB - yA) * 0.5} anchor="end" bold size={12} color={COL.adj}>{S[1] ?? "h"}</Txt>
        <Dim a={P(cx, yB)} b={P(cx + R, yB)} label="" color={COL.opp} />
        <Txt x={cx + R / 2} y={yB + ry + 15} bold color={COL.opp}>{S[0] ?? "r"}</Txt>
        <Txt x={cx + R / 2 + 22} y={(yA + yB) / 2} anchor="start" bold color={COL.hyp}>{S[2] ?? "ℓ"}</Txt>
        <RightMark v={P(cx, yB)} p={P(cx, yA)} q={P(cx + R, yB)} s={9} />
      </Frame>
    );
  }
  if (t === "sphere" || t === "hemisphere") {
    const r = 70, cx = W / 2 - 10, cy = H / 2;
    return (
      <Frame label="Sphere with radius labeled">
        <defs><radialGradient id="sph" cx="35%" cy="30%"><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor="#ffc5dd" /><stop offset="1" stopColor="#e89cc0" /></radialGradient></defs>
        <circle cx={cx} cy={cy} r={r} fill="url(#sph)" {...sw} />
        <path d={`M${cx - r} ${cy} A${r} ${r * 0.28} 0 0 0 ${cx + r} ${cy}`} fill="none" {...sw} strokeWidth={1.6} />
        <path d={`M${cx - r} ${cy} A${r} ${r * 0.28} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray="5 4" />
        <Dim a={P(cx, cy)} b={P(cx + r, cy)} label="" color={COL.opp} />
        <Txt x={cx + r + 8} y={cy + 4} anchor="start" bold color={COL.opp}>{S[0] ?? "r"}</Txt>
      </Frame>
    );
  }
  if (t === "pyramid") {
    const base = n[0] ?? 6, h = n[1] ?? 8;
    const L = clamp(base * 22, 100, 150), Hp = clamp(h * 16, 90, 140);
    const dx = L * 0.45, dy = L * 0.3;
    const x0 = (W - (L + dx)) / 2, y0 = H - 40;
    const FL = P(x0, y0), FR = P(x0 + L, y0), BR = P(x0 + L + dx, y0 - dy), BL = P(x0 + dx, y0 - dy);
    const ctr = P(x0 + L / 2 + dx / 2, y0 - dy / 2);
    const ap = P(ctr.x, ctr.y - Hp);
    const mid = P(x0 + L / 2, y0);
    return (
      <Frame label="Square pyramid with base edge, height and slant height labeled">
        <g {...sw}>
          <polygon points={pts(FL, FR, BR, BL)} fill={FILL.lav} />
          <polygon points={pts(FR, BR, ap)} fill={FILL.mint} />
          <polygon points={pts(FL, FR, ap)} fill={hl.includes("faces") ? FILL.sun : FILL.pink} />
          <g strokeDasharray="5 4" strokeWidth={1.5}><line x1={BL.x} y1={BL.y} x2={ap.x} y2={ap.y} /><line x1={BL.x} y1={BL.y} x2={FL.x} y2={FL.y} /><line x1={BL.x} y1={BL.y} x2={BR.x} y2={BR.y} /></g>
        </g>
        <Dim a={ctr} b={ap} label={S[1] ?? "h"} off={8} anchor="start" color={COL.adj} />
        <line x1={ap.x} y1={ap.y} x2={mid.x} y2={mid.y} stroke={COL.hyp} strokeWidth={3} />
        <Txt x={(ap.x + mid.x) / 2 - 8} y={(ap.y + mid.y) / 2 + 12} anchor="end" bold color={COL.hyp}>{S[2] ?? "ℓ"}</Txt>
        <Txt x={x0 + L / 2} y={y0 + 20} bold>{S[0] ?? "s"}</Txt>
      </Frame>
    );
  }
  if (t === "triprism") {
    const b = n[0] ?? 6, h = n[1] ?? 4, len = n[2] ?? 10;
    const Bw = clamp(b * 14, 70, 120), Hh = clamp(h * 14, 50, 90), Dp = clamp(len * 8, 60, 110);
    const dx = Dp * 0.75, dy = Dp * 0.4;
    const x0 = (W - (Bw + dx)) / 2, yb = (H + Hh - dy) / 2 + 6;
    const FL = P(x0, yb), FR = P(x0 + Bw, yb), FT = P(x0 + Bw / 2, yb - Hh);
    const o = (p: Pt) => P(p.x + dx, p.y - dy);
    return (
      <Frame label="Triangular prism with base, height and length labeled">
        <g {...sw}>
          <polygon points={pts(FL, FT, o(FT), o(FL))} fill={FILL.lav} />
          <polygon points={pts(FT, FR, o(FR), o(FT))} fill={FILL.mint} />
          <polygon points={pts(FL, FR, FT)} fill={FILL.pink} />
        </g>
        <Txt x={x0 + Bw / 2} y={yb + 19} bold>{S[0] ?? "b"}</Txt>
        <Dim a={P(FT.x, FT.y)} b={P(FT.x, yb)} label={S[1] ?? "h"} off={-8} anchor="end" color={COL.adj} />
        <Txt x={FR.x + dx / 2 + 14} y={FR.y - dy / 2 + 12} anchor="start" bold>{S[2] ?? "ℓ"}</Txt>
      </Frame>
    );
  }
  if (t === "house") {
    const [l, w, h, hr] = [n[0] ?? 6, n[1] ?? 6, n[2] ?? 4, n[3] ?? 3];
    const L = 110, Hh = clamp(h * 14, 40, 80), Dp = 80, dx = Dp * 0.55, dy = Dp * 0.4;
    const x0 = (W - (L + dx)) / 2, y0 = H - 40 - Hh + 6;
    const T1 = P(x0, y0), T2 = P(x0 + L, y0), T3 = P(x0 + L + dx, y0 - dy), T4 = P(x0 + dx, y0 - dy);
    const ap = P(x0 + L / 2 + dx / 2, y0 - dy / 2 - clamp(hr * 14, 36, 70));
    return (
      <Frame label="Composite solid: a rectangular prism with a pyramid roof">
        <Box x0={x0} y0={y0} L={L} Hh={Hh} dx={dx} dy={dy} hl={[]} />
        <g {...sw}><polygon points={pts(T2, T3, ap)} fill={FILL.sun} /><polygon points={pts(T1, T2, ap)} fill="#ffd77a" /><line x1={T4.x} y1={T4.y} x2={ap.x} y2={ap.y} strokeDasharray="4 3" strokeWidth={1.4} /></g>
        <Txt x={x0 + L / 2} y={y0 + Hh + 19} bold>{S[0] ?? `${l} × ${w}`}</Txt>
        <Txt x={x0 - 8} y={y0 + Hh / 2 + 4} anchor="end" bold>{S[1] ?? `h = ${h}`}</Txt>
        <Txt x={ap.x + 14} y={(ap.y + T1.y) / 2 - 6} anchor="start" bold color={COL.hl}>{S[2] ?? `roof ${hr}`}</Txt>
      </Frame>
    );
  }
  if (t === "capsule") {
    const r = n[0] ?? 3, h = n[1] ?? 8;
    const R = clamp(r * 12, 28, 52), Hc = clamp(h * 11, 50, 100), cx = W / 2 - 20;
    const yT = (H - Hc - 2 * R) / 2 + R, yB = yT + Hc;
    return (
      <Frame label="Composite solid: a cylinder with a hemisphere on each end">
        <g {...sw}>
          <path d={`M${cx - R} ${yT} A${R} ${R} 0 0 1 ${cx + R} ${yT} L${cx + R} ${yB} A${R} ${R} 0 0 1 ${cx - R} ${yB} Z`} fill={FILL.sky} />
          <path d={`M${cx - R} ${yT} A${R} ${R * 0.3} 0 0 0 ${cx + R} ${yT}`} fill="none" strokeDasharray="5 4" strokeWidth={1.6} />
          <path d={`M${cx - R} ${yB} A${R} ${R * 0.3} 0 0 0 ${cx + R} ${yB}`} fill="none" strokeDasharray="5 4" strokeWidth={1.6} />
        </g>
        <Dim a={P(cx, yT)} b={P(cx + R, yT)} label={S[0] ?? "r"} dy={-8} color={COL.opp} />
        <Dim a={P(cx + R + 20, yT)} b={P(cx + R + 20, yB)} label={S[1] ?? "h"} off={14} anchor="start" color={COL.adj} />
      </Frame>
    );
  }
  return <Frame label={lab}><Txt x={170} y={120}>3D diagram</Txt></Frame>;
}

export function NetDiagram({ spec }: { spec: DiagramSpec }) {
  const [l, w, h] = spec.n ?? [4, 3, 2];
  const hl = spec.hl ?? [];
  const S = spec.s ?? [];
  const k = Math.min(300 / (2 * l + 2 * w), 190 / (2 * w + h));
  const totalW = (2 * l + 2 * w) * k, totalH = (2 * w + h) * k;
  const ox = (W - totalW) / 2, oy = (H - totalH) / 2;
  const areas = hl.includes("areas");
  const faces: { name: string; x: number; y: number; w: number; h: number; fill: string; a: string; dims: [number, number] }[] = [
    { name: "left", x: 0, y: w, w: w, h: h, fill: FILL.mint, a: "w × h", dims: [w, h] },
    { name: "front", x: w, y: w, w: l, h: h, fill: FILL.pink, a: "l × h", dims: [l, h] },
    { name: "right", x: w + l, y: w, w: w, h: h, fill: FILL.mint, a: "w × h", dims: [w, h] },
    { name: "back", x: 2 * w + l, y: w, w: l, h: h, fill: FILL.pink, a: "l × h", dims: [l, h] },
    { name: "top", x: w, y: 0, w: l, h: w, fill: FILL.sky, a: "l × w", dims: [l, w] },
    { name: "bottom", x: w, y: w + h, w: l, h: w, fill: FILL.sky, a: "l × w", dims: [l, w] },
  ];
  const any = faces.some((f) => hl.includes(f.name));
  return (
    <Frame label={`Net of a rectangular prism ${fmt(l)} by ${fmt(w)} by ${fmt(h)}`}>
      {faces.map((f) => {
        const on = hl.includes(f.name);
        return (
          <g key={f.name}>
            <rect x={ox + f.x * k} y={oy + f.y * k} width={f.w * k} height={f.h * k} fill={on ? FILL.sun : f.fill} fillOpacity={any && !on ? 0.45 : 0.95} stroke={on ? COL.hl : INK} strokeWidth={on ? 4 : 2} />
            <Txt x={ox + (f.x + f.w / 2) * k} y={oy + (f.y + f.h / 2) * k - 2} size={Math.min(11, Math.max(7, (f.w * k - 4) / 5.6))} bold>{f.name}</Txt>
            <Txt x={ox + (f.x + f.w / 2) * k} y={oy + (f.y + f.h / 2) * k + 11} size={Math.max(6.5, Math.min(11, (f.w * k - 4) / 0.72 / ((areas ? `${fmt(f.dims[0])}×${fmt(f.dims[1])}=${fmt(f.dims[0] * f.dims[1])}${S[0] ?? ""}` : f.a).length * 0.62)))}>{areas ? `${fmt(f.dims[0])}×${fmt(f.dims[1])}=${fmt(f.dims[0] * f.dims[1])}${S[0] ?? ""}` : f.a}</Txt>
          </g>
        );
      })}
    </Frame>
  );
}

export function CubesDiagram({ spec }: { spec: DiagramSpec }) {
  const [l, w, h] = (spec.n ?? [4, 3, 2]).map((v) => Math.round(clamp(v, 1, 8)));
  const hl = spec.hl ?? [];
  const u = Math.min(40, 250 / (l + 0.55 * w), 165 / (h + 0.4 * w));
  const dx = u * 0.55, dy = u * 0.4;
  const totalW = l * u + w * dx, totalH = h * u + w * dy;
  const x0 = (W - totalW) / 2, yBase = (H - 22 + totalH) / 2; // front-bottom-left of front layer
  const cubes: ReactNode[] = [];
  for (let z = 0; z < h; z++)
    for (let y = w - 1; y >= 0; y--)
      for (let x = 0; x < l; x++) {
        const fx = x0 + x * u + y * dx, fy = yBase - z * u - y * dy; // bottom-left of front face
        const fl = hl.includes("layer") && z === 0;
        cubes.push(
          <g key={`${x}-${y}-${z}`} stroke={INK} strokeWidth={1.1} strokeLinejoin="round">
            <polygon points={pts(P(fx, fy - u), P(fx + u, fy - u), P(fx + u + dx, fy - u - dy), P(fx + dx, fy - u - dy))} fill={FILL.sky} />
            <polygon points={pts(P(fx + u, fy), P(fx + u + dx, fy - dy), P(fx + u + dx, fy - u - dy), P(fx + u, fy - u))} fill={FILL.mint} />
            <rect x={fx} y={fy - u} width={u} height={u} fill={fl ? FILL.sun : FILL.pink} />
          </g>,
        );
      }
  return (
    <Frame label={`${l} by ${w} by ${h} arrangement of unit cubes, ${l * w * h} cubes in total`}>
      {cubes}
      <Txt x={W / 2} y={H - 8} size={13} bold>{l} × {w} × {h} = {l * w * h} unit cubes</Txt>
    </Frame>
  );
}
