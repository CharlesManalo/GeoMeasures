"use client";
import { useState, type ReactNode } from "react";
import { Diagram } from "../diagrams/Diagram";
import { acosD, anglesFromSides, asinD, cosD, dg, fmt, heron, isTriangle, PI, sinD, tanD } from "@/lib/util";
import { Note, Panel, Slider, Steps, Tabs } from "./kit";

const two = (n: number) => String(n).padStart(2, "0");
const clock12 = (m: number) => { const t = ((m % 1440) + 1440) % 1440; const h = Math.floor(t / 60); return `${((h + 11) % 12) + 1}:${two(t % 60)} ${h < 12 ? "AM" : "PM"}`; };

/* ------------------------------- time ------------------------------- */
export function TimeWidget() {
  const [d, setD] = useState(0), [h, setH] = useState(3), [m, setM] = useState(45), [s, setS] = useState(0);
  const total = ((d * 24 + h) * 60 + m) * 60 + s;
  const [start, setStart] = useState("22:00");
  const [end, setEnd] = useState("06:30");
  const [durH, setDurH] = useState(2), [durM, setDurM] = useState(50);
  const [t0, setT0] = useState("08:45");
  const toMin = (x: string) => { const [a, b] = x.split(":").map(Number); return (a || 0) * 60 + (b || 0); };
  const s0 = toMin(start), e0 = toMin(end);
  const elapsed = e0 > s0 ? e0 - s0 : e0 + 1440 - s0;
  const crosses = e0 <= s0;
  const a0 = toMin(t0), a1 = a0 + durH * 60 + durM;
  return (
    <>
      <Panel title="Duration converter" hint="Enter days, hours, minutes and seconds to see the total in each unit.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([["Days", d, setD], ["Hours", h, setH], ["Minutes", m, setM], ["Seconds", s, setS]] as [string, number, (n: number) => void][]).map(([l, v, f]) => (
            <label key={l} className="font-bold">{l}<input className="field mt-1" type="number" min={0} inputMode="numeric" value={v} onChange={(e) => f(Math.max(0, Math.floor(Number(e.target.value))))} /></label>
          ))}
        </div>
        <ul className="math mt-3 grid gap-2 sm:grid-cols-2 font-bold">
          <li className="rounded-2xl bg-white p-3">{fmt(total, 0)} seconds</li>
          <li className="rounded-2xl bg-white p-3">{fmt(total / 60, 2)} minutes</li>
          <li className="rounded-2xl bg-[#ffe89a] p-3">{fmt(total / 3600, 4)} hours</li>
          <li className="rounded-2xl bg-white p-3">{fmt(total / 86400, 4)} days</li>
        </ul>
        <Steps items={[`${d} days × 24 + ${h} hours = ${d * 24 + h} hours.`, `${d * 24 + h} hours × 60 + ${m} minutes = ${(d * 24 + h) * 60 + m} minutes.`, `${(d * 24 + h) * 60 + m} minutes × 60 + ${s} seconds = ${fmt(total, 0)} seconds.`, "Going to a smaller unit: multiply. Going to a larger unit: divide."]} />
      </Panel>
      <Panel title="Elapsed time and schedules" hint="See the clocks and the timeline. Try a start time later than the end time to cross midnight.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="font-bold">Start time<input className="field mt-1" type="time" value={start} onChange={(e) => setStart(e.target.value || "00:00")} /></label>
          <label className="font-bold">End time<input className="field mt-1" type="time" value={end} onChange={(e) => setEnd(e.target.value || "00:00")} /></label>
        </div>
        <div className="mt-3"><Diagram spec={dg("clock", { n: [Math.floor(s0 / 60), s0 % 60, Math.floor(e0 / 60), e0 % 60], s: ["Start", "End"] })} /></div>
        <div className="mt-2"><Diagram spec={dg("timeline", { n: [s0, s0 + elapsed] })} /></div>
        <Note ok>Elapsed time: {Math.floor(elapsed / 60)} h {elapsed % 60} min ({elapsed} minutes){crosses ? ". The span crosses midnight, so we added 24 hours to the end time." : "."}</Note>
        <h4 className="mt-5 font-display text-lg">Find the end time</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <label className="font-bold">Start<input className="field mt-1" type="time" value={t0} onChange={(e) => setT0(e.target.value || "00:00")} /></label>
          <label className="font-bold">Hours<input className="field mt-1" type="number" min={0} value={durH} onChange={(e) => setDurH(Math.max(0, Math.floor(Number(e.target.value))))} /></label>
          <label className="font-bold">Minutes<input className="field mt-1" type="number" min={0} value={durM} onChange={(e) => setDurM(Math.max(0, Math.floor(Number(e.target.value))))} /></label>
        </div>
        <Note ok>{clock12(a0)} + {durH} h {durM} min = <strong>{clock12(a1)}</strong>{a1 >= 1440 ? " (the next day)" : ""}</Note>
      </Panel>
    </>
  );
}

/* ---------------------------- temperature ---------------------------- */
const CONTEXT: [number, string][] = [[-273.15, "absolute zero"], [-18, "a household freezer"], [0, "water freezes"], [4, "a refrigerator"], [25, "a comfortable room"], [37, "normal body temperature"], [100, "water boils"], [180, "a typical oven"]];
export function TempWidget() {
  const [c, setC] = useState(25);
  const [scale, setScale] = useState("C");
  const [txt, setTxt] = useState("25");
  const f = (c * 9) / 5 + 32, k = c + 273.15;
  const near = CONTEXT.reduce((a, b) => (Math.abs(b[0] - c) < Math.abs(a[0] - c) ? b : a));
  const set = (sc: string, raw: string) => {
    setTxt(raw);
    const v = Number(raw);
    if (raw.trim() === "" || Number.isNaN(v)) return;
    setC(sc === "C" ? v : sc === "F" ? ((v - 32) * 5) / 9 : v - 273.15);
  };
  return (
    <Panel title="Temperature converter and thermometer" hint="Type a temperature in any scale, or drag the slider (Celsius).">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex gap-2">
            <label className="flex-1 font-bold">Temperature<input className="field mt-1" inputMode="decimal" value={txt} onChange={(e) => set(scale, e.target.value)} /></label>
            <label className="w-28 font-bold">Scale<select className="field mt-1" value={scale} onChange={(e) => { setScale(e.target.value); const v = e.target.value === "C" ? c : e.target.value === "F" ? f : k; setTxt(String(Number(v.toFixed(2)))); }}><option value="C">°C</option><option value="F">°F</option><option value="K">K</option></select></label>
          </div>
          <Slider label="Celsius slider" value={Math.round(Math.max(-50, Math.min(150, c)))} min={-50} max={150} onChange={(v) => { setC(v); setScale("C"); setTxt(String(v)); }} unit=" °C" />
          <ul className="math space-y-1 text-lg font-bold" aria-live="polite">
            <li>{fmt(c, 2)} °C</li><li>{fmt(f, 2)} °F</li><li>{fmt(k, 2)} K</li>
          </ul>
          {k < 0 && <Note ok={false}>Temperatures below 0 K (−273.15 °C) are impossible.</Note>}
          <Steps items={[`°F = (°C × 9/5) + 32 = (${fmt(c, 2)} × 9/5) + 32 = ${fmt(f, 2)}`, `°C = (°F − 32) × 5/9 = (${fmt(f, 2)} − 32) × 5/9 = ${fmt(c, 2)}`, `K = °C + 273.15 = ${fmt(c, 2)} + 273.15 = ${fmt(k, 2)} (no degree symbol)`]} />
          <p className="font-semibold">🌍 Closest everyday reference: {near[1]} ({near[0]} °C).</p>
        </div>
        <Diagram spec={dg("therm", { n: [c] })} />
      </div>
    </Panel>
  );
}

/* ------------------------ perimeter and area ------------------------ */
export function PerimWidget() {
  const [shape, setShape] = useState("rect");
  const [a, setA] = useState(8), [b, setB] = useState(12), [h, setH] = useState(5), [r, setR] = useState(5);
  let per = 0, area = 0, dgm = dg("plane", { t: "rect" }), perS = "", areaS = "", sliders: ReactNode = null;
  if (shape === "rect") {
    per = 2 * (a + h); area = a * h; dgm = dg("plane", { t: "rect", n: [a, h], s: [`${a} cm`, `${h} cm`] });
    perS = `P = 2(l + w) = 2(${a} + ${h}) = ${per} cm`; areaS = `A = lw = ${a} × ${h} = ${area} cm²`;
    sliders = <><Slider label="Length" value={a} min={1} max={15} onChange={setA} unit=" cm" /><Slider label="Width" value={h} min={1} max={10} onChange={setH} unit=" cm" /></>;
  } else if (shape === "circle") {
    per = 2 * PI * r; area = PI * r * r; dgm = dg("plane", { t: "circle", hl: ["circ"], s: [`r = ${r} cm`, `C = 2πr`] });
    perS = `C = 2πr = 2π(${r}) = ${fmt(per, 2)} cm`; areaS = `A = πr² = π(${r}²) = ${fmt(area, 2)} cm²`;
    sliders = <Slider label="Radius" value={r} min={1} max={12} onChange={setR} unit=" cm" />;
  } else if (shape === "trap") {
    const top = Math.min(a, b), bot = Math.max(a, b);
    const leg = Math.sqrt(h * h + ((bot - top) / 2) ** 2);
    per = top + bot + 2 * leg; area = ((top + bot) * h) / 2; dgm = dg("plane", { t: "trap", n: [top, bot, h], s: [`${top} cm`, `${bot} cm`, `${h} cm`] });
    perS = `Each slanted side = √(h² + ((b − a)/2)²) = ${fmt(leg, 2)} cm, so P = ${top} + ${bot} + 2(${fmt(leg, 2)}) = ${fmt(per, 2)} cm`; areaS = `A = ½(a + b)h = ½(${top} + ${bot})(${h}) = ${fmt(area, 2)} cm²`;
    sliders = <><Slider label="Top side a" value={a} min={1} max={15} onChange={setA} unit=" cm" /><Slider label="Bottom side b" value={b} min={1} max={15} onChange={setB} unit=" cm" /><Slider label="Height h" value={h} min={1} max={10} onChange={setH} unit=" cm" /></>;
  } else {
    const side = Math.max(r, h);
    per = 2 * (a + side); area = a * h; dgm = dg("plane", { t: "para", n: [a, h, side], s: [`${a} cm`, `${h} cm`, `${fmt(side, 1)} cm`] });
    perS = `P = 2(base + slanted side) = 2(${a} + ${fmt(side, 1)}) = ${fmt(per, 1)} cm`; areaS = `A = bh = ${a} × ${h} = ${area} cm² (use the PERPENDICULAR height ${h} cm)`;
    sliders = <><Slider label="Base" value={a} min={1} max={15} onChange={setA} unit=" cm" /><Slider label="Perpendicular height" value={h} min={1} max={10} onChange={setH} unit=" cm" /><Slider label="Slanted side (≥ height)" value={Math.max(r, h)} min={1} max={14} onChange={setR} unit=" cm" /></>;
  }
  return (
    <Panel title="Perimeter and area explorer" hint="Change the dimensions and watch the perimeter (cm) and the area (cm²) change.">
      <Tabs tabs={[["rect", "Rectangle"], ["circle", "Circle"], ["trap", "Trapezoid"], ["para", "Parallelogram"]]} value={shape} onChange={setShape} />
      <div className="grid gap-4 md:grid-cols-2"><div className="space-y-3">{sliders}</div><Diagram spec={dgm} /></div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-3"><div className="text-sm font-bold">Perimeter (around)</div><div className="font-display text-2xl">{fmt(per, 2)} cm</div></div>
        <div className="rounded-2xl bg-[#ffe89a] p-3"><div className="text-sm font-bold">Area (inside)</div><div className="font-display text-2xl">{fmt(area, 2)} cm²</div></div>
      </div>
      <ul className="math mt-3 list-disc space-y-1 pl-6 font-semibold"><li>{perS}</li><li>{areaS}</li></ul>
    </Panel>
  );
}

/* ----------------------------- triangles ----------------------------- */
const classify = (a: number, b: number, c: number) => {
  const sides = a === b && b === c ? "equilateral" : a === b || b === c || a === c ? "isosceles" : "scalene";
  const [x, y, z] = [a, b, c].sort((p, q) => p - q);
  const d = x * x + y * y - z * z;
  const angle = Math.abs(d) < 1e-9 ? "right" : d > 0 ? "acute" : "obtuse";
  return `${sides} and ${angle}`;
};
export function TriangleWidget() {
  const [tab, setTab] = useState("area");
  const [bs, setBs] = useState(10), [ht, setHt] = useState(6), [px, setPx] = useState(3);
  const [a, setA] = useState(13), [b, setB] = useState(14), [c, setC] = useState(15);
  const apex = Math.min(px, bs + 4);
  const sideB = Math.hypot(bs - apex, ht), sideC = Math.hypot(apex, ht);
  const ok = isTriangle(a, b, c);
  const s = (a + b + c) / 2;
  const A = ok ? heron(a, b, c) : 0;
  const ha = ok ? (2 * A) / a : 0;
  let why = "";
  if (!ok) { const [x, y, z] = [a, b, c].sort((p, q) => p - q); why = `The two shorter sides add to ${fmt(x + y, 1)}, which is not greater than the longest side ${fmt(z, 1)}. The sides can’t reach each other, so there is no triangle.`; }
  return (
    <Panel title="Triangle explorer" hint="Explore area with a base and perpendicular height, then explore Heron’s formula with three sides.">
      <Tabs tabs={[["area", "½ × base × height"], ["heron", "Three sides · Heron"]]} value={tab} onChange={setTab} />
      {tab === "area" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Slider label="Base b" value={bs} min={2} max={16} onChange={setBs} unit=" cm" />
            <Slider label="Perpendicular height h" value={ht} min={1} max={12} onChange={setHt} unit=" cm" />
            <Slider label="Move the top vertex sideways" value={apex} min={-4} max={bs + 4} onChange={setPx} unit=" cm" />
            <div className="rounded-2xl bg-[#ffe89a] p-3"><div className="text-sm font-bold">Area = ½bh</div><div className="font-display text-2xl">½ × {bs} × {ht} = {fmt((bs * ht) / 2, 2)} cm²</div></div>
            <p className="text-sm font-semibold">Notice: moving the top vertex sideways changes the slanted sides, but the area stays the same because the base and perpendicular height do not change.</p>
          </div>
          <Diagram spec={dg("tri", { n: [bs, sideB, sideC], hl: ["h", "shade"], s: [`b = ${bs} cm`, `${fmt(sideB, 1)}`, `${fmt(sideC, 1)}`, "", "", "", `h = ${ht} cm`] })} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Slider label="Side a" value={a} min={1} max={20} step={0.5} onChange={setA} unit=" cm" />
            <Slider label="Side b" value={b} min={1} max={20} step={0.5} onChange={setB} unit=" cm" />
            <Slider label="Side c" value={c} min={1} max={20} step={0.5} onChange={setC} unit=" cm" />
            {!ok ? <Note ok={false}>{why}</Note> : (
              <>
                <Note ok>These sides form a valid triangle: {classify(a, b, c)}.</Note>
                <ul className="math list-disc space-y-1 pl-6 font-semibold">
                  <li>Perimeter P = {fmt(a + b + c, 2)} cm</li>
                  <li>s = (a + b + c) / 2 = {fmt(s, 2)} cm</li>
                  <li>A = √[s(s−a)(s−b)(s−c)] = √[{fmt(s, 2)} × {fmt(s - a, 2)} × {fmt(s - b, 2)} × {fmt(s - c, 2)}] = √{fmt(s * (s - a) * (s - b) * (s - c), 3)}</li>
                  <li><strong>Area ≈ {fmt(A, 3)} cm²</strong></li>
                  <li>Check: height on side a = 2A / a = {fmt(ha, 2)} cm, so ½ × {fmt(a, 1)} × {fmt(ha, 2)} = {fmt(0.5 * a * ha, 2)} cm² ✓</li>
                  <li>Angles: {anglesFromSides(a, b, c).map((x) => `${fmt(x, 1)}°`).join(", ")}</li>
                </ul>
              </>
            )}
          </div>
          <Diagram spec={dg("tri", { n: [a, b, c], hl: ["angles", "shade"] })} />
        </div>
      )}
    </Panel>
  );
}

/* --------------------------- Pythagoras --------------------------- */
export function PythagWidget() {
  const [mode, setMode] = useState("hyp");
  const [a, setA] = useState(6), [b, setB] = useState(8), [c, setC] = useState(17);
  const [x, setX] = useState("5"), [y, setY] = useState("12"), [z, setZ] = useState("13");
  const leg = c > a ? Math.sqrt(c * c - a * a) : NaN;
  const hyp = Math.sqrt(a * a + b * b);
  const [p, q, r] = [Number(x), Number(y), Number(z)].sort((u, v) => u - v);
  const valid = [p, q, r].every((n) => n > 0) && isTriangle(p, q, r);
  const right = valid && Math.abs(p * p + q * q - r * r) < 1e-9;
  return (
    <Panel title="Pythagorean theorem explorer" hint="Remember: a² + b² = c² works only for RIGHT triangles.">
      <Tabs tabs={[["hyp", "Find the hypotenuse"], ["leg", "Find a missing leg"], ["test", "Is it a right triangle?"]]} value={mode} onChange={setMode} />
      {mode === "hyp" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Slider label="Leg a" value={a} min={1} max={15} onChange={setA} unit=" cm" /><Slider label="Leg b" value={b} min={1} max={15} onChange={setB} unit=" cm" />
            <Steps items={[`c² = a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`, `c = √${a * a + b * b} = ${fmt(hyp, 3)} cm`]} />
            <p className="font-semibold">{Number.isInteger(hyp) ? "🎉 A whole-number answer: this is a Pythagorean triple!" : "The hypotenuse is not a whole number here."}</p>
          </div>
          <Diagram spec={dg("right", { n: [b, a], hl: ["squares"], s: [`${b}² = ${b * b}`, `${a}² = ${a * a}`, `c² = ${a * a + b * b}`] })} />
        </div>
      )}
      {mode === "leg" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Slider label="Hypotenuse c" value={c} min={2} max={25} onChange={setC} unit=" cm" /><Slider label="Known leg a" value={Math.min(a, 24)} min={1} max={24} onChange={setA} unit=" cm" />
            {c <= a ? <Note ok={false}>The hypotenuse must be longer than a leg. Make c bigger than a.</Note> : <Steps items={[`b² = c² − a² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${c * c - a * a}`, `b = √${c * c - a * a} = ${fmt(leg, 3)} cm`]} />}
          </div>
          {c > a ? <Diagram spec={dg("right", { n: [a, leg], s: [`${a} cm`, `b = ${fmt(leg, 2)} cm`, `${c} cm`] })} /> : <div />}
        </div>
      )}
      {mode === "test" && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">{([["Side 1", x, setX], ["Side 2", y, setY], ["Side 3", z, setZ]] as [string, string, (v: string) => void][]).map(([l, v, f]) => <label key={l} className="font-bold">{l}<input className="field mt-1" type="number" inputMode="decimal" min={0} value={v} onChange={(e) => f(e.target.value)} /></label>)}</div>
          {!valid ? <Note ok={false}>Enter three positive lengths that can form a triangle (the two shorter sides must add to more than the longest).</Note> : (
            <>
              <p className="math font-semibold">{fmt(p, 2)}² + {fmt(q, 2)}² = {fmt(p * p + q * q, 3)} and {fmt(r, 2)}² = {fmt(r * r, 3)}</p>
              <Note ok={right}>{right ? "They are equal, so this IS a right triangle." : p * p + q * q > r * r ? "The sum is greater, so the largest angle is acute: NOT a right triangle." : "The sum is smaller, so the largest angle is obtuse: NOT a right triangle."}</Note>
              <Diagram spec={dg("tri", { n: [r, q, p], hl: ["angles", "plain"] })} />
            </>
          )}
        </div>
      )}
    </Panel>
  );
}

/* ------------------------- trig ratios ------------------------- */
export function TrigWidget() {
  const [th, setTh] = useState(35);
  const [hy, setHy] = useState(10);
  const [ref, setRef] = useState<"B" | "A">("B");
  const [show, setShow] = useState("sin");
  const opp = hy * sinD(th), adj = hy * cosD(th);
  const hl = show === "sin" ? ["opp", "hyp"] : show === "cos" ? ["adj", "hyp"] : ["opp", "adj"];
  const n = ref === "B" ? [adj, opp] : [opp, adj];
  const num = show === "sin" ? opp : show === "cos" ? adj : opp;
  const den = show === "sin" ? hy : show === "cos" ? hy : adj;
  const unk = (th: number) => `θ = ${th}°`;
  void unk;
  return (
    <Panel title="Trigonometric ratio explorer" hint="Change the angle θ and the hypotenuse. The highlighted sides show which sides are in the ratio.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Slider label="Angle θ" value={th} min={1} max={89} onChange={setTh} unit="°" />
          <Slider label="Hypotenuse" value={hy} min={1} max={20} onChange={setHy} unit=" cm" />
          <Tabs tabs={[["sin", "sin θ (SOH)"], ["cos", "cos θ (CAH)"], ["tan", "tan θ (TOA)"]]} value={show} onChange={setShow} />
          <div className="flex gap-2"><button type="button" className="chip chip-btn" aria-pressed={ref === "B"} onClick={() => setRef("B")}>θ at the bottom-right vertex</button><button type="button" className="chip chip-btn" aria-pressed={ref === "A"} onClick={() => setRef("A")}>θ at the top vertex</button></div>
          <ul className="math space-y-1 text-lg font-bold" aria-live="polite">
            <li>opposite = {fmt(opp, 3)} cm · adjacent = {fmt(adj, 3)} cm</li>
            <li>sin {th}° = {fmt(opp, 3)} / {hy} = {fmt(sinD(th), 4)}</li>
            <li>cos {th}° = {fmt(adj, 3)} / {hy} = {fmt(cosD(th), 4)}</li>
            <li>tan {th}° = {fmt(opp, 3)} / {fmt(adj, 3)} = {fmt(tanD(th), 4)}</li>
          </ul>
          <Note ok>Selected: {show} {th}° = {fmt(num, 3)} / {fmt(den, 3)} = {fmt(num / den, 4)}. Notice the ratios depend only on the angle, not on the triangle’s size!</Note>
        </div>
        <Diagram spec={dg("right", { n, t: ref, hl: [...hl, "theta"], s: ref === "B" ? [fmt(adj, 2), fmt(opp, 2), `${hy}`, `${th}°`] : [fmt(opp, 2), fmt(adj, 2), `${hy}`, `${th}°`] })} />
      </div>
    </Panel>
  );
}

/* ---------------------- Law of Sines and Cosines ---------------------- */
export function LawsWidget() {
  const [tab, setTab] = useState("sines");
  const [pair, setPair] = useState("a");
  const [A, setA] = useState(40), [B, setB] = useState(60), [a, setAa] = useState(10);
  const [sa, setSa] = useState(8), [sb, setSb] = useState(11), [C, setC] = useState(45);
  const [x, setX] = useState(9), [y, setY] = useState(7), [z, setZ] = useState(8);
  const [ssaA, setSsaA] = useState(30), [ssaa, setSsaa] = useState(8), [ssab, setSsab] = useState(10);
  const hlp = pair === "a" ? ["a", "A"] : pair === "b" ? ["b", "B"] : ["c", "C"];
  const pairTabs = <Tabs tabs={[["a", "a ↔ A"], ["b", "b ↔ B"], ["c", "c ↔ C"]]} value={pair} onChange={setPair} />;
  let body: ReactNode = null;
  if (tab === "sines") {
    const Cc = 180 - A - B;
    if (Cc <= 0) body = <Note ok={false}>Angles A + B must be less than 180°. Reduce one of them.</Note>;
    else {
      const bb = (a * sinD(B)) / sinD(A), cc = (a * sinD(Cc)) / sinD(A);
      body = (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Slider label="Angle A" value={A} min={10} max={150} onChange={setA} unit="°" /><Slider label="Angle B" value={B} min={10} max={150} onChange={setB} unit="°" /><Slider label="Side a (opposite A)" value={a} min={1} max={20} onChange={setAa} unit=" cm" />
            {pairTabs}
            <Steps items={[`C = 180° − ${A}° − ${B}° = ${Cc}°`, `a / sin A = ${a} / sin ${A}° = ${fmt(a / sinD(A), 4)}`, `b = a × sin B / sin A = ${a} × sin ${B}° / sin ${A}° = ${fmt(bb, 3)} cm`, `c = a × sin C / sin A = ${a} × sin ${Cc}° / sin ${A}° = ${fmt(cc, 3)} cm`, `Check: b / sin B = ${fmt(bb / sinD(B), 4)} and c / sin C = ${fmt(cc / sinD(Cc), 4)}: all equal ✓`]} />
          </div>
          <Diagram spec={dg("tri", { n: [a, bb, cc], hl: [...hlp], s: [`a = ${a}`, `b = ${fmt(bb, 2)}`, `c = ${fmt(cc, 2)}`, `A = ${A}°`, `B = ${B}°`, `C = ${Cc}°`] })} />
        </div>
      );
    }
  } else if (tab === "sas") {
    const cc = Math.sqrt(sa * sa + sb * sb - 2 * sa * sb * cosD(C));
    const Aa = acosD((sb * sb + cc * cc - sa * sa) / (2 * sb * cc));
    const Bb = 180 - Aa - C;
    body = (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Slider label="Side a" value={sa} min={1} max={20} onChange={setSa} unit=" cm" /><Slider label="Side b" value={sb} min={1} max={20} onChange={setSb} unit=" cm" /><Slider label="Included angle C" value={C} min={5} max={170} onChange={setC} unit="°" />
          {pairTabs}
          <Steps items={[`c² = a² + b² − 2ab cos C = ${sa}² + ${sb}² − 2(${sa})(${sb}) cos ${C}°`, `c² = ${sa * sa + sb * sb} − ${fmt(2 * sa * sb * cosD(C), 3)} = ${fmt(cc * cc, 3)}`, `c = ${fmt(cc, 3)} cm`, `cos A = (b² + c² − a²) / (2bc), so A = ${fmt(Aa, 2)}°`, `B = 180° − ${fmt(Aa, 2)}° − ${C}° = ${fmt(Bb, 2)}°`]} />
        </div>
        <Diagram spec={dg("tri", { n: [sa, sb, cc], hl: [...hlp, "angles"], s: [`a = ${sa}`, `b = ${sb}`, `c = ${fmt(cc, 2)}`] })} />
      </div>
    );
  } else if (tab === "sss") {
    const ok = isTriangle(x, y, z);
    body = (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Slider label="Side a" value={x} min={1} max={20} onChange={setX} unit=" cm" /><Slider label="Side b" value={y} min={1} max={20} onChange={setY} unit=" cm" /><Slider label="Side c" value={z} min={1} max={20} onChange={setZ} unit=" cm" />
          {!ok ? <Note ok={false}>These lengths cannot form a triangle: the two shorter sides must add to more than the longest.</Note> : (
            <Steps items={(() => { const [Aa, Bb, Cc] = anglesFromSides(x, y, z); return [`cos A = (b² + c² − a²) / (2bc) = (${y * y} + ${z * z} − ${x * x}) / (2 × ${y} × ${z}) → A = ${fmt(Aa, 2)}°`, `cos B = (a² + c² − b²) / (2ac) → B = ${fmt(Bb, 2)}°`, `C = 180° − A − B = ${fmt(Cc, 2)}°`]; })()} />
          )}
        </div>
        {ok ? <Diagram spec={dg("tri", { n: [x, y, z], hl: ["angles"] })} /> : <Diagram spec={dg("tri", { n: [x, y, z] })} />}
      </div>
    );
  } else {
    const sinB = (ssab * sinD(ssaA)) / ssaa;
    const sols: { B: number; C: number; c: number }[] = [];
    if (sinB <= 1) {
      const B1 = asinD(sinB);
      for (const Bv of [B1, 180 - B1]) {
        if (ssaA + Bv < 180 - 1e-9 && !sols.some((s) => Math.abs(s.B - Bv) < 1e-6)) { const Cv = 180 - ssaA - Bv; sols.push({ B: Bv, C: Cv, c: (ssaa * sinD(Cv)) / sinD(ssaA) }); }
      }
    }
    body = (
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3"><Slider label="Angle A" value={ssaA} min={10} max={80} onChange={setSsaA} unit="°" /><Slider label="Side a (opposite A)" value={ssaa} min={2} max={20} onChange={setSsaa} unit=" cm" /><Slider label="Side b" value={ssab} min={2} max={20} onChange={setSsab} unit=" cm" /></div>
        <p className="math font-semibold">sin B = b sin A / a = {ssab} × sin {ssaA}° / {ssaa} = {fmt(sinB, 4)}</p>
        <Note ok={sols.length > 0}>{sinB > 1 ? "sin B is greater than 1, which is impossible: NO triangle exists." : sols.length === 2 ? "TWO different triangles fit this information (the ambiguous SSA case)." : sols.length === 1 ? "Exactly ONE triangle fits." : "No triangle fits."}</Note>
        <div className="grid gap-4 md:grid-cols-2">
          {sols.map((s, i) => (
            <div key={i}><p className="math mb-1 font-bold">Solution {i + 1}: B = {fmt(s.B, 2)}°, C = {fmt(s.C, 2)}°, c = {fmt(s.c, 2)} cm</p><Diagram spec={dg("tri", { n: [ssaa, ssab, s.c], s: [`a = ${ssaa}`, `b = ${ssab}`, `c = ${fmt(s.c, 2)}`, `A = ${ssaA}°`, `B = ${fmt(s.B, 1)}°`, `C = ${fmt(s.C, 1)}°`] })} /></div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <Panel title="Law of Sines and Law of Cosines explorer" hint="Change the known values. Use the a↔A, b↔B, c↔C buttons to highlight a side with its opposite angle.">
      <Tabs tabs={[["sines", "Law of Sines (AAS)"], ["sas", "Law of Cosines (SAS)"], ["sss", "Law of Cosines (SSS)"], ["ssa", "SSA: how many triangles?"]]} value={tab} onChange={setTab} />
      {body}
    </Panel>
  );
}

/* --------------------------- choose a method --------------------------- */
const SCEN: { q: string; ans: string; why: string; d: ReturnType<typeof dg> }[] = [
  { q: "A right triangle has legs 5 cm and 12 cm. Find the hypotenuse.", ans: "Pythagorean theorem", why: "Right triangle with two sides known and the third wanted: a² + b² = c².", d: dg("right", { n: [12, 5], s: ["12", "5", "c = ?"] }) },
  { q: "A right triangle has hypotenuse 10 cm and an angle of 35°. Find the side opposite the 35° angle.", ans: "SOH-CAH-TOA", why: "Right triangle with an angle: opposite and hypotenuse appear in sin θ.", d: dg("right", { n: [10 * cosD(35), 10 * sinD(35)], s: ["", "?", "10", "35°"], hl: ["opp", "adj", "hyp"] }) },
  { q: "In a non-right triangle, A = 50°, B = 70° and a = 8 cm. Find side b.", ans: "Law of Sines", why: "You know a matching pair (a with A) and another angle B: a / sin A = b / sin B.", d: dg("tri", { n: [8, (8 * sinD(70)) / sinD(50), (8 * sinD(60)) / sinD(50)], s: ["a = 8", "b = ?", "", "A = 50°", "B = 70°", "C = 60°"] }) },
  { q: "In a non-right triangle, two sides are 7 cm and 9 cm and the angle between them is 40°. Find the third side.", ans: "Law of Cosines", why: "SAS: there is no side-angle pair to start the Law of Sines, so use c² = a² + b² − 2ab cos C.", d: dg("tri", { n: [7, 9, Math.sqrt(49 + 81 - 126 * cosD(40))], s: ["a = 7", "b = 9", "c = ?", "", "", "C = 40°"] }) },
  { q: "A triangle has sides 6 cm, 7 cm and 9 cm (not a right triangle). Find its largest angle.", ans: "Law of Cosines", why: "SSS: rearrange the Law of Cosines to find an angle.", d: dg("tri", { n: [9, 6, 7], s: ["a = 9", "b = 6", "c = 7", "A = ?", "", ""] }) },
  { q: "A right triangle has opposite side 4 cm and adjacent side 7 cm. Find the angle θ.", ans: "SOH-CAH-TOA", why: "Opposite and adjacent are in tan θ, and the inverse tangent gives the angle.", d: dg("right", { n: [7, 4], s: ["7", "4", "", "θ = ?"], hl: ["theta"] }) },
  { q: "A 5 m ladder leans against a wall and makes a 70° angle with the ground. How high up the wall does it reach?", ans: "SOH-CAH-TOA", why: "A right triangle: the height is opposite the 70° angle and the ladder is the hypotenuse, so use sine.", d: dg("right", { n: [5 * cosD(70), 5 * sinD(70)], s: ["", "h = ?", "5 m", "70°"], hl: ["opp", "adj", "hyp"] }) },
  { q: "A right triangle has hypotenuse 13 cm and one leg 5 cm. Find the other leg.", ans: "Pythagorean theorem", why: "Two sides of a right triangle are known: b² = c² − a².", d: dg("right", { n: [5, 12], s: ["5", "? ", "13"] }) },
  { q: "In a non-right triangle, two sides are 5 cm and 8 cm and the included angle is 100°. Find the third side.", ans: "Law of Cosines", why: "SAS again: use the Law of Cosines.", d: dg("tri", { n: [5, 8, Math.sqrt(25 + 64 - 80 * cosD(100))], s: ["a = 5", "b = 8", "c = ?", "", "", "C = 100°"] }) },
  { q: "In a non-right triangle, A = 30°, C = 80° and side c = 12 cm. Find side a.", ans: "Law of Sines", why: "Matching pair (c with C) plus angle A: a / sin A = c / sin C.", d: dg("tri", { n: [(12 * sinD(30)) / sinD(80), (12 * sinD(70)) / sinD(80), 12], s: ["a = ?", "", "c = 12", "A = 30°", "B = 70°", "C = 80°"] }) },
];
const METHODS = ["Pythagorean theorem", "SOH-CAH-TOA", "Law of Sines", "Law of Cosines"];
export function MethodWidget() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState("");
  const [score, setScore] = useState({ c: 0, t: 0 });
  const sc = SCEN[i];
  const choose = (m: string) => { if (pick) return; setPick(m); setScore((s) => ({ c: s.c + (m === sc.ans ? 1 : 0), t: s.t + 1 })); };
  return (
    <Panel title="Choose the correct method" hint="Read the given information, decide which method fits, and learn why.">
      <p className="text-lg font-semibold">{sc.q}</p>
      <div className="my-3"><Diagram spec={sc.d} /></div>
      <div className="grid gap-2 sm:grid-cols-2">
        {METHODS.map((m) => <button key={m} type="button" disabled={!!pick} onClick={() => choose(m)} className={`btn btn-sm ${pick ? (m === sc.ans ? "btn-mint" : m === pick ? "btn-pink" : "btn-white") : "btn-purple"}`}>{pick && m === sc.ans ? "✓ " : pick && m === pick ? "✗ " : ""}{m}</button>)}
      </div>
      {pick && <Note ok={pick === sc.ans}>{pick === sc.ans ? "Correct! " : `Not quite — the best method is ${sc.ans}. `}{sc.why}</Note>}
      <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" className="btn btn-sun btn-sm" onClick={() => { setI((i + 1) % SCEN.length); setPick(""); }}>Next scenario ➜</button><span className="font-bold">Score: {score.c} / {score.t}</span></div>
    </Panel>
  );
}
