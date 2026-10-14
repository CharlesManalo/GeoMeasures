import type { DiagramSpec } from "@/lib/types";
import { anglesFromSides, fmt, isTriangle } from "@/lib/util";
import { COL, FILL, Frame, INK, RightMark, Txt, pts, unit, type Pt } from "./base";

export function TriDiagram({ spec }: { spec: DiagramSpec }) {
  const [a, b, c] = spec.n ?? [3, 4, 5];
  const hl = spec.hl ?? [];
  const S = spec.s ?? [];
  const W = 340, H = 235, pad = 38;
  if (!isTriangle(a, b, c)) {
    return <Frame label="These side lengths cannot form a triangle"><Txt x={170} y={110} size={17} color="#a14a14" bold>These sides cannot form a triangle</Txt></Frame>;
  }
  const xA = (a * a + c * c - b * b) / (2 * a);
  const yA = Math.sqrt(Math.max(0, c * c - xA * xA));
  const minX = Math.min(0, xA), maxX = Math.max(a, xA);
  const sc = Math.min((W - 2 * 54) / (maxX - minX), (H - 2 * pad - 6) / yA);
  const ox = (W - (maxX - minX) * sc) / 2 - minX * sc;
  const P = (x: number, y: number): Pt => ({ x: ox + x * sc, y: H - pad - y * sc + 8 });
  const B = P(0, 0), C = P(a, 0), A = P(xA, yA);
  const cen: Pt = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  const [aA, aB, aC] = anglesFromSides(a, b, c);
  const angs = [aA, aB, aC];
  const verts = [A, B, C];
  const nb: [Pt, Pt][] = [[B, C], [C, A], [A, B]];
  const names = ["A", "B", "C"];
  const sideNames = ["a", "b", "c"];
  const sideVals = [a, b, c];
  const sideSeg: [Pt, Pt, Pt][] = [[B, C, A], [C, A, B], [A, B, C]];
  const hlSide = (i: number) => hl.includes(sideNames[i]);
  const label = (i: number) => S[i] || (hl.includes("plain") ? sideNames[i] : `${sideNames[i]} = ${fmt(sideVals[i], 2)}`);
  const sidePos = (i: number) => {
    const [p, q, r] = sideSeg[i];
    const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    const u = unit(p, q);
    let n = { x: -u.y, y: u.x };
    if (n.x * (m.x - r.x) + n.y * (m.y - r.y) < 0) n = { x: -n.x, y: -n.y };
    const hw = (label(i).length * 6.4) / 2;
    const off = (i === 0 ? 14 : 10) + hw * Math.abs(n.x) + 6 * Math.abs(n.y);
    return { x: m.x + n.x * off, y: m.y + n.y * off + 4 };
  };
  const arcAt = (i: number, r = 24) => {
    const v = verts[i];
    const [p, q] = nb[i];
    const d1 = unit(v, p), d2 = unit(v, q);
    const s = { x: v.x + d1.x * r, y: v.y + d1.y * r }, e = { x: v.x + d2.x * r, y: v.y + d2.y * r };
    const sweep = d1.x * d2.y - d1.y * d2.x > 0 ? 1 : 0;
    const bis = unit({ x: 0, y: 0 }, { x: d1.x + d2.x, y: d1.y + d2.y });
    return { v, s, e, sweep, r, d1, d2, lab: { x: v.x + bis.x * (r + 15), y: v.y + bis.y * (r + 15) + 4 } };
  };
  return (
    <Frame label={`Triangle ABC with sides a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}`}>
      <polygon points={pts(A, B, C)} fill={hl.includes("shade") ? FILL.sun : FILL.mint} fillOpacity={0.55} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => hlSide(i) && <line key={i} x1={sideSeg[i][0].x} y1={sideSeg[i][0].y} x2={sideSeg[i][1].x} y2={sideSeg[i][1].y} stroke={COL.hl} strokeWidth={6} strokeLinecap="round" />)}
      {hl.includes("h") && (() => {
        const foot = P(xA, 0);
        return (
          <g>
            {xA < 0 && <line x1={B.x} y1={B.y} x2={foot.x} y2={foot.y} stroke={INK} strokeDasharray="5 4" />}
            {xA > a && <line x1={C.x} y1={C.y} x2={foot.x} y2={foot.y} stroke={INK} strokeDasharray="5 4" />}
            <line x1={A.x} y1={A.y} x2={foot.x} y2={foot.y} stroke={COL.opp} strokeWidth={2.6} strokeDasharray="6 4" />
            <RightMark v={foot} p={A} q={xA > a ? B : C} s={9} />
            <Txt x={foot.x + 8} y={A.y + 0.62 * (foot.y - A.y) + 4} color={COL.opp} bold anchor="start">{S[6] || "h"}</Txt>
          </g>
        );
      })()}
      {[0, 1, 2].map((i) => {
        const g = arcAt(i);
        const on = hl.includes(names[i]);
        const showVal = hl.includes("angles");
        const right = Math.abs(angs[i] - 90) < 0.05;
        return (
          <g key={i}>
            {on && <path d={`M${g.v.x} ${g.v.y} L${g.s.x} ${g.s.y} A${g.r} ${g.r} 0 0 ${g.sweep} ${g.e.x} ${g.e.y} Z`} fill={FILL.sun} stroke={COL.hl} strokeWidth={2} />}
            {!on && !right && (showVal || S[3 + i]) && <path d={`M${g.s.x} ${g.s.y} A${g.r} ${g.r} 0 0 ${g.sweep} ${g.e.x} ${g.e.y}`} fill="none" stroke={INK} strokeWidth={1.8} />}
            {right && <RightMark v={g.v} p={nb[i][0]} q={nb[i][1]} s={11} />}
            {(showVal || S[3 + i]) && !right && <Txt x={g.lab.x} y={g.lab.y} size={12} bold>{S[3 + i] || `${fmt(angs[i], 1)}°`}</Txt>}
          </g>
        );
      })}
      {[0, 1, 2].map((i) => {
        const p = sidePos(i);
        return <Txt key={i} x={p.x} y={p.y} bold={hlSide(i)} color={hlSide(i) ? COL.hl : INK}>{label(i)}</Txt>;
      })}
      {verts.map((v, i) => {
        const u = unit(cen, v);
        return <Txt key={i} x={v.x + u.x * 13} y={v.y + u.y * 13 + 5} size={16} bold color="#6240b5">{names[i]}</Txt>;
      })}
    </Frame>
  );
}

export function RightDiagram({ spec }: { spec: DiagramSpec }) {
  const [hh, vv] = spec.n ?? [4, 3];
  const S = spec.s ?? [];
  const hl = spec.hl ?? [];
  const refA = spec.t === "A";
  const sq = hl.includes("squares");
  const W = 340, H = 245, pad = 30;
  const cc = Math.hypot(hh, vv);
  const base: [number, number][] = [[0, 0], [hh, 0], [0, vv]];
  const sqs: [number, number][][] = [
    [[0, 0], [hh, 0], [hh, -hh], [0, -hh]],
    [[0, 0], [0, vv], [-vv, vv], [-vv, 0]],
    [[0, vv], [hh, 0], [hh + vv, hh], [vv, vv + hh]],
  ];
  const all = sq ? [...base, ...sqs.flat()] : base;
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const rolesPre = refA ? ["opp", "adj", "hyp"] : ["adj", "opp", "hyp"];
  const valsPre = [hh, vv, cc];
  const tagLen: Record<string, number> = { opp: 10, adj: 10, hyp: 12 };
  const lenOf = (i: number) => Math.max((S[i] ?? (hl.includes("noval") ? "" : fmt(valsPre[i], 2))).length * 7.6, hl.includes(rolesPre[i]) ? tagLen[rolesPre[i]] * 6.8 : 0);
  const anyTag = !sq && rolesPre.some((r) => hl.includes(r));
  const padL = sq ? pad : Math.max(pad, 16 + lenOf(1));
  const padR = sq ? pad : Math.max(pad, padL - W + 36 + 2 * lenOf(2));
  const padB = anyTag ? 52 : pad;
  const sc = Math.min((W - padL - padR) / (maxX - minX), (H - pad - padB) / (maxY - minY));
  const ox = padL + (W - padL - padR - (maxX - minX) * sc) / 2 - minX * sc;
  const oy = pad + (H - pad - padB - (maxY - minY) * sc) / 2 + maxY * sc;
  const P = (x: number, y: number): Pt => ({ x: ox + x * sc, y: oy - y * sc });
  const C = P(0, 0), Bp = P(hh, 0), Ap = P(0, vv);
  const roles = refA ? ["opp", "adj", "hyp"] : ["adj", "opp", "hyp"]; // horizontal, vertical, hypotenuse
  const colorOf = (i: number) => (hl.includes(roles[i]) ? COL[roles[i] as "opp" | "adj" | "hyp"] : INK);
  const tagOf = (i: number) => (hl.includes(roles[i]) ? { opp: "opposite", adj: "adjacent", hyp: "hypotenuse" }[roles[i] as "opp" | "adj" | "hyp"] : "");
  const segs: [Pt, Pt][] = [[C, Bp], [C, Ap], [Ap, Bp]];
  const val = [hh, vv, cc];
  const defLabel = (i: number) => S[i] ?? (hl.includes("noval") ? "" : fmt(val[i], 2));
  const showTheta = hl.some((h) => ["opp", "adj", "hyp", "theta"].includes(h));
  const tv = refA ? Ap : Bp;
  const t1 = refA ? C : C, t2 = refA ? Bp : Ap;
  const d1 = unit(tv, t1), d2 = unit(tv, t2);
  const R = 28;
  const sw = d1.x * d2.y - d1.y * d2.x > 0 ? 1 : 0;
  const bis = unit({ x: 0, y: 0 }, { x: d1.x + d2.x, y: d1.y + d2.y });
  const angBetween = Math.acos(Math.max(-1, Math.min(1, d1.x * d2.x + d1.y * d2.y)));
  const rl = Math.min(110, Math.max(R + 12, 20 / Math.max(0.05, Math.sin(angBetween / 2))));
  return (
    <Frame h={H} label={`Right triangle with legs ${fmt(hh)} and ${fmt(vv)} and hypotenuse ${fmt(cc, 2)}`}>
      {sq && sqs.map((s, i) => {
        const P4 = s.map((p) => P(p[0], p[1]));
        const cx = P4.reduce((t, p) => t + p.x, 0) / 4, cy = P4.reduce((t, p) => t + p.y, 0) / 4;
        const fills = [FILL.sky, FILL.pink, FILL.mint];
        const lab = S[i] ?? `${fmt(val[i === 0 ? 0 : i === 1 ? 1 : 2], 2)}² = ${fmt(val[i] * val[i], 2)}`;
        return <g key={i}><polygon points={pts(...P4)} fill={fills[i]} fillOpacity={0.75} stroke={INK} strokeWidth={1.8} /><Txt x={cx} y={cy + 4} size={13} bold>{lab}</Txt></g>;
      })}
      <polygon points={pts(C, Bp, Ap)} fill={FILL.lav} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      {segs.map(([p, q], i) => hl.includes(roles[i]) && <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={colorOf(i)} strokeWidth={6} strokeLinecap="round" />)}
      <RightMark v={C} p={Bp} q={Ap} />
      {showTheta && (
        <g>
          <path d={`M${tv.x + d1.x * R} ${tv.y + d1.y * R} A${R} ${R} 0 0 ${sw} ${tv.x + d2.x * R} ${tv.y + d2.y * R}`} fill="none" stroke="#6240b5" strokeWidth={2.4} />
          <Txt x={tv.x + bis.x * rl} y={tv.y + bis.y * rl + 5} size={16} color="#6240b5" bold>{S[3] ?? "θ"}</Txt>
        </g>
      )}
      {!sq && (
        <>
          {[[0, (C.x + Bp.x) / 2, C.y + 19, "middle"], [1, C.x - 8, (C.y + Ap.y) / 2 - (tagOf(1) ? 2 : -4), "end"], [2, (Ap.x + Bp.x) / 2 + 10, (Ap.y + Bp.y) / 2 - (tagOf(2) ? 16 : 8), "start"]].map(([i, x, y, a]) => {
            const k = i as number, anchor = a as "start" | "middle" | "end";
            return (
              <g key={k}>
                <Txt x={x as number} y={y as number} color={colorOf(k)} bold={!!tagOf(k)} anchor={anchor}>{defLabel(k)}</Txt>
                {tagOf(k) && <Txt x={x as number} y={(y as number) + 14} size={11} color={colorOf(k)} bold anchor={anchor}>({tagOf(k)})</Txt>}
              </g>
            );
          })}
        </>
      )}
      {hl.includes("verts") && (<><Txt x={C.x - 14} y={C.y + 16} size={15} bold color="#6240b5">C</Txt><Txt x={Bp.x + 12} y={Bp.y + 16} size={15} bold color="#6240b5">B</Txt><Txt x={Ap.x - 12} y={Ap.y - 6} size={15} bold color="#6240b5">A</Txt></>)}
    </Frame>
  );
}
