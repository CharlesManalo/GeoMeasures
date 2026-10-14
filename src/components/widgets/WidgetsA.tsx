"use client";
import { useState, type ReactNode } from "react";
import { Diagram } from "../diagrams/Diagram";
import { dg, fmt, PI } from "@/lib/util";
import { Note, Panel, Slider, Steps, Tabs } from "./kit";
import { checkNum } from "@/lib/check";
import type { Q } from "@/lib/types";

/* ------------------------- units: compare & convert ------------------------- */
const METRIC: Record<string, Record<string, number>> = {
  length: { mm: 0.001, cm: 0.01, m: 1, km: 1000 },
  mass: { mg: 1e-6, g: 1e-3, kg: 1, t: 1000 },
  capacity: { mL: 0.001, L: 1, kL: 1000 },
};
const CONV: Record<string, { units: Record<string, number>; exact: string[] }> = {
  length: { units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, "in": 0.0254, ft: 0.3048, yd: 0.9144, mile: 1609.344 }, exact: ["in", "ft", "yd", "mile"] },
  mass: { units: { mg: 1e-6, g: 1e-3, kg: 1, t: 1000, oz: 0.028349523125, lb: 0.45359237 }, exact: ["oz", "lb"] },
  capacity: { units: { mL: 0.001, "cm³": 0.001, L: 1, kL: 1000, "m³": 1000, "US fl oz": 0.0295735295625, "US gal": 3.785411784 }, exact: ["US fl oz", "US gal"] },
  area: { units: { "mm²": 1e-6, "cm²": 1e-4, "m²": 1, ha: 1e4, "km²": 1e6, "in²": 0.00064516, "ft²": 0.09290304 }, exact: ["in²", "ft²"] },
};
const sig = (n: number) => (n !== 0 && (Math.abs(n) < 0.001 || Math.abs(n) >= 1e7) ? `${Number(n.toPrecision(6)).toExponential()}`.replace("e+", " × 10^").replace("e-", " × 10^-") : Number(n.toPrecision(7)).toLocaleString("en-US", { maximumFractionDigits: 10 }));

export function UnitsCompare() {
  const [kind, setKind] = useState("length");
  const units = Object.keys(METRIC[kind]);
  const [unit, setUnit] = useState("cm");
  const [val, setVal] = useState(175);
  const u = units.includes(unit) ? unit : units[0];
  const base = val * METRIC[kind][u];
  const best = [...units].sort((a, b) => METRIC[kind][b] - METRIC[kind][a]).find((x) => base / METRIC[kind][x] >= 1) ?? units[0];
  return (
    <Panel title="Metric unit comparison tool" hint="Type a quantity, then see it in every metric unit and which unit is easiest to read.">
      <Tabs tabs={[["length", "📏 Length"], ["mass", "⚖️ Mass"], ["capacity", "🥛 Capacity"]]} value={kind} onChange={(k) => { setKind(k); setUnit(Object.keys(METRIC[k])[1]); setVal(k === "length" ? 175 : k === "mass" ? 2500 : 750); }} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="font-bold">Amount<input className="field mt-1 w-40" type="number" inputMode="decimal" min={0} value={val} onChange={(e) => setVal(Math.max(0, Number(e.target.value)))} /></label>
        <label className="font-bold">Unit<select className="field mt-1 w-32" value={u} onChange={(e) => setUnit(e.target.value)}>{units.map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {units.map((x) => (
          <li key={x} className={`math rounded-2xl p-3 text-lg font-bold ${x === best ? "bg-[#ffe89a]" : "bg-white"}`}>{sig(base / METRIC[kind][x])} {x}{x === best ? "  ⭐ easiest to read" : ""}</li>
        ))}
      </ul>
      <div className="mt-4"><Diagram spec={dg("ladder", { t: kind === "capacity" ? "cap" : kind, s: [kind === "length" ? "km" : kind === "mass" ? "kg" : "kL", kind === "length" ? "mm" : kind === "mass" ? "mg" : "mL"] })} /></div>
    </Panel>
  );
}

export function UnitConverter() {
  const [cat, setCat] = useState("length");
  const U = CONV[cat].units;
  const names = Object.keys(U);
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");
  const [val, setVal] = useState(3.5);
  const f = names.includes(from) ? from : names[0];
  const t = names.includes(to) ? to : names[1];
  const factor = U[f] / U[t];
  const ans = val * factor;
  const exact = !(CONV[cat].exact.includes(f) || CONV[cat].exact.includes(t)) || true;
  const customary = CONV[cat].exact.includes(f) || CONV[cat].exact.includes(t);
  return (
    <Panel title="Visual conversion tool" hint="Choose the original unit, enter a value, choose the target unit, and watch the conversion factor work.">
      <Tabs tabs={[["length", "📏 Length"], ["mass", "⚖️ Mass"], ["capacity", "🥛 Capacity"], ["area", "⬛ Area"]]} value={cat} onChange={(k) => { setCat(k); const n = Object.keys(CONV[k].units); setFrom(n[2]); setTo(n[1]); }} />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="font-bold">Value<input className="field mt-1" type="number" inputMode="decimal" value={val} onChange={(e) => setVal(Number(e.target.value))} /></label>
        <label className="font-bold">From<select className="field mt-1" value={f} onChange={(e) => setFrom(e.target.value)}>{names.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="font-bold">To<select className="field mt-1" value={t} onChange={(e) => setTo(e.target.value)}>{names.map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
      <div className="math mt-4 rounded-2xl bg-[#efe7fd] p-4 text-xl font-bold" aria-live="polite">{sig(val)} {f} = {sig(ans)} {t}</div>
      <Steps items={[<>Conversion factor: 1 {f} = <span className="math">{sig(factor)}</span> {t}</>, <>Multiply: {sig(val)} {f} × ({sig(factor)} {t} / 1 {f}) = {sig(ans)} {t}. The {f} cancels.</>, <>{factor >= 1 ? `A ${f} is bigger than a ${t}, so the number gets bigger.` : `A ${f} is smaller than a ${t}, so the number gets smaller.`}</>]} />
      <p className="mt-2 text-sm font-semibold">{customary ? "These customary factors are exact by international definition. If you round the factor (for example 1 mile ≈ 1.609 km) your answer becomes approximate." : "Metric-to-metric conversions are exact."} {exact ? "" : ""}</p>
    </Panel>
  );
}

/* ----------------------- solid explorer: SA and volume ----------------------- */
type S = "prism" | "cube" | "cylinder" | "cone" | "sphere" | "pyramid";
export function SolidExplorer({ focus }: { focus: "sa" | "volume" }) {
  const [t, setT] = useState<S>("prism");
  const [l, setL] = useState(6);
  const [w, setW] = useState(4);
  const [h, setH] = useState(3);
  const [r, setR] = useState(3);
  const hh = Math.max(1, h);
  let sa = 0, v = 0;
  let diagram = dg("solid", { t: "prism" });
  let info: string[] = [];
  let sliders: ReactNode = null;
  const u = "cm";
  if (t === "prism") {
    sa = 2 * (l * w + l * hh + w * hh); v = l * w * hh;
    diagram = focus === "sa" ? dg("net", { n: [l, w, hh], hl: ["areas"], s: [""] }) : dg("cubes", { n: [l, w, hh] });
    info = [`SA = 2(lw + lh + wh) = 2(${l}×${w} + ${l}×${hh} + ${w}×${hh}) = 2(${l * w + l * hh + w * hh}) = ${sa} cm²`, `V = lwh = ${l} × ${w} × ${hh} = ${v} cm³`];
    sliders = <><Slider label="Length l" value={l} min={1} max={8} onChange={setL} unit=" cm" /><Slider label="Width w" value={w} min={1} max={8} onChange={setW} unit=" cm" /><Slider label="Height h" value={hh} min={1} max={8} onChange={setH} unit=" cm" /></>;
  } else if (t === "cube") {
    sa = 6 * l * l; v = l ** 3; diagram = dg("solid", { t: "cube", n: [l], s: [`${l} cm`, `${l} cm`, `${l} cm`] });
    info = [`SA = 6s² = 6 × ${l}² = ${sa} cm²`, `V = s³ = ${l}³ = ${v} cm³`];
    sliders = <Slider label="Side s" value={l} min={1} max={10} onChange={setL} unit=" cm" />;
  } else if (t === "cylinder") {
    sa = 2 * PI * r * r + 2 * PI * r * hh; v = PI * r * r * hh; diagram = dg("solid", { t: "cylinder", n: [r, hh], s: [`r = ${r} cm`, `h = ${hh} cm`], hl: focus === "sa" ? ["lateral"] : [] });
    info = [`Lateral = 2πrh = 2π(${r})(${hh}) = ${fmt(2 * PI * r * hh, 2)} cm²`, `Two bases = 2πr² = ${fmt(2 * PI * r * r, 2)} cm²`, `SA = ${fmt(sa, 2)} cm²`, `V = πr²h = π(${r}²)(${hh}) = ${fmt(v, 2)} cm³`];
    sliders = <><Slider label="Radius r" value={r} min={1} max={8} onChange={setR} unit=" cm" /><Slider label="Height h" value={hh} min={1} max={12} onChange={setH} unit=" cm" /></>;
  } else if (t === "cone") {
    const sl = Math.sqrt(r * r + hh * hh);
    sa = PI * r * r + PI * r * sl; v = (PI * r * r * hh) / 3; diagram = dg("solid", { t: "cone", n: [r, hh], s: [`r = ${r} cm`, `h = ${hh} cm`, `ℓ = ${fmt(sl, 2)} cm`] });
    info = [`Slant height ℓ = √(r² + h²) = √(${r * r} + ${hh * hh}) = ${fmt(sl, 2)} cm`, `SA = πr² + πrℓ = ${fmt(PI * r * r, 2)} + ${fmt(PI * r * sl, 2)} = ${fmt(sa, 2)} cm²`, `V = ⅓πr²h = ⅓π(${r}²)(${hh}) = ${fmt(v, 2)} cm³`];
    sliders = <><Slider label="Radius r" value={r} min={1} max={8} onChange={setR} unit=" cm" /><Slider label="Height h" value={hh} min={1} max={12} onChange={setH} unit=" cm" /></>;
  } else if (t === "sphere") {
    sa = 4 * PI * r * r; v = (4 / 3) * PI * r ** 3; diagram = dg("solid", { t: "sphere", s: [`r = ${r} cm`] });
    info = [`SA = 4πr² = 4π(${r}²) = ${fmt(sa, 2)} cm²`, `V = ⁴⁄₃πr³ = ⁴⁄₃π(${r}³) = ${fmt(v, 2)} cm³`];
    sliders = <Slider label="Radius r" value={r} min={1} max={10} onChange={setR} unit=" cm" />;
  } else {
    const sl = Math.sqrt(hh * hh + (l / 2) ** 2);
    sa = l * l + 2 * l * sl; v = (l * l * hh) / 3; diagram = dg("solid", { t: "pyramid", n: [l, hh], s: [`s = ${l} cm`, `h = ${hh} cm`, `ℓ = ${fmt(sl, 2)} cm`] });
    info = [`Slant height ℓ = √(h² + (s/2)²) = √(${hh * hh} + ${(l / 2) ** 2}) = ${fmt(sl, 2)} cm`, `SA = s² + 2sℓ = ${l * l} + 2(${l})(${fmt(sl, 2)}) = ${fmt(sa, 2)} cm²`, `V = ⅓s²h = ⅓(${l}²)(${hh}) = ${fmt(v, 2)} cm³`];
    sliders = <><Slider label="Base edge s" value={l} min={1} max={10} onChange={setL} unit=" cm" /><Slider label="Height h" value={hh} min={1} max={12} onChange={setH} unit=" cm" /></>;
  }
  void u;
  return (
    <Panel title={focus === "sa" ? "Interactive surface-area explorer" : "Interactive volume explorer"} hint="Choose a solid and move the sliders. The picture, the formulas and the numbers all update together.">
      <Tabs tabs={[["prism", "Rectangular prism"], ["cube", "Cube"], ["cylinder", "Cylinder"], ["cone", "Cone"], ["sphere", "Sphere"], ["pyramid", "Square pyramid"]]} value={t} onChange={(k) => setT(k as S)} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">{sliders}</div>
        <div className="space-y-2">
          <Diagram spec={diagram} />
          {t === "prism" && <p className="text-sm text-plum2">{focus === "sa" ? "The net shows each face with its area (l × w etc.)." : "Each little cube is 1 cm³. Count them to see lwh."}</p>}
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className={`rounded-2xl p-3 ${focus === "sa" ? "bg-[#ffe89a]" : "bg-white"}`}><div className="text-sm font-bold">Surface area</div><div className="font-display text-2xl">{fmt(sa, 2)} cm²</div></div>
        <div className={`rounded-2xl p-3 ${focus === "volume" ? "bg-[#ffe89a]" : "bg-white"}`}><div className="text-sm font-bold">Volume</div><div className="font-display text-2xl">{fmt(v, 2)} cm³</div></div>
      </div>
      <ul className="math mt-3 list-disc space-y-1 pl-6 font-semibold">{info.map((x) => <li key={x}>{x}</li>)}</ul>
    </Panel>
  );
}

/* ---------------------------- scale / maps ---------------------------- */
const TOWNS: { n: string; x: number; y: number }[] = [{ n: "Rosewood", x: 2, y: 1 }, { n: "Maple Bay", x: 8, y: 1 }, { n: "Pine Hill", x: 2, y: 5.5 }, { n: "Sunport", x: 8, y: 5.5 }];
const SCALES: [number, string][] = [[0.5, "1 cm : 0.5 km"], [2, "1 cm : 2 km"], [5, "1 cm : 5 km"], [10, "1 cm : 10 km"]];
export function ScaleWidget() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [sc, setSc] = useState(2);
  const [ans, setAns] = useState("");
  const [res, setRes] = useState<null | boolean>(null);
  const A = TOWNS[a], B = TOWNS[b === a ? (a + 1) % 4 : b];
  const d = Math.hypot(A.x - B.x, A.y - B.y);
  const actual = d * sc;
  const q: Q = { id: "w", comp: 5, topic: "", diff: "easy", type: "num", text: "", answer: actual, dp: 2, unit: "km", answerText: "", steps: [] };
  return (
    <Panel title="Map explorer: measure, scale, calculate" hint="Pick two towns and a scale. Read the ruler distance on the map, then calculate the real distance.">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="font-bold">From<select className="field mt-1" value={a} onChange={(e) => { setA(Number(e.target.value)); setRes(null); }}>{TOWNS.map((t, i) => <option key={t.n} value={i}>{t.n}</option>)}</select></label>
        <label className="font-bold">To<select className="field mt-1" value={b === a ? (a + 1) % 4 : b} onChange={(e) => { setB(Number(e.target.value)); setRes(null); }}>{TOWNS.map((t, i) => i !== a && <option key={t.n} value={i}>{t.n}</option>)}</select></label>
        <label className="font-bold">Scale<select className="field mt-1" value={sc} onChange={(e) => { setSc(Number(e.target.value)); setRes(null); }}>{SCALES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      </div>
      <div className="mt-3"><Diagram spec={dg("map", { n: [A.x, A.y, B.x, B.y], s: [A.n, B.n], t: SCALES.find((s) => s[0] === sc)![1] })} /></div>
      <p className="mt-2 text-lg font-semibold">Map distance (from the ruler): <span className="math">{fmt(d, 1)} cm</span></p>
      <form className="mt-2 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); setRes(checkNum(q, ans).ok); }}>
        <label className="font-bold">Actual distance (km)<input className="field mt-1 w-44" inputMode="decimal" value={ans} onChange={(e) => { setAns(e.target.value); setRes(null); }} /></label>
        <button className="btn btn-mint" type="submit">Check ✔</button>
      </form>
      {res !== null && <Note ok={res}>{res ? `Correct! ${fmt(d, 1)} cm × ${sc} km per cm = ${fmt(actual, 2)} km.` : `Not yet. Multiply the map distance by the scale: ${fmt(d, 1)} × ${sc}.`}</Note>}
      <p className="mt-3 font-bold">Compare: real distances from {A.n}</p>
      <ul className="math list-disc pl-6">{TOWNS.filter((_, i) => i !== a).map((t) => <li key={t.n}>{t.n}: {fmt(Math.hypot(A.x - t.x, A.y - t.y), 1)} cm → {fmt(Math.hypot(A.x - t.x, A.y - t.y) * sc, 2)} km</li>)}</ul>
    </Panel>
  );
}

/* ------------------------------ currency ------------------------------ */
const RATES: Record<string, number> = { USD: 56, EUR: 61.5, SGD: 41, AED: 15, JPY: 0.38, KRW: 0.04 };
export function CurrencyWidget() {
  const [amt, setAmt] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PHP");
  const codes = ["PHP", ...Object.keys(RATES)];
  const pesos = from === "PHP" ? amt : amt * RATES[from];
  const out = to === "PHP" ? pesos : pesos / RATES[to];
  const steps: string[] = [];
  if (from !== "PHP") steps.push(`${from} → PHP: multiply by the rate. ${fmt(amt, 2)} × ${fmt(RATES[from], 2)} = ${fmt(pesos, 2)} PHP.`);
  if (to !== "PHP") steps.push(`PHP → ${to}: divide by the rate. ${fmt(pesos, 2)} ÷ ${fmt(RATES[to], 2)} = ${fmt(out, 2)} ${to}.`);
  if (from === to) steps.push("Same currency: nothing to convert.");
  const [price, setPrice] = useState({ usd: 45, php: 2600, pick: "" });
  const online = price.usd * RATES.USD;
  const better = online < price.php ? "online" : "local";
  return (
    <>
      <Panel title="Currency calculator (sample rates)">
        <p className="mb-3 rounded-2xl bg-[#fff5cf] p-3 font-bold" role="note">⚠️ These are SAMPLE exchange rates for classroom practice. They are not live, real-world rates.</p>
        <table className="mb-4 w-full text-left text-sm"><caption className="sr-only">Sample exchange rates</caption><thead><tr><th>Currency</th><th>Sample rate</th></tr></thead><tbody>{Object.entries(RATES).map(([c, r]) => <tr key={c}><td>1 {c}</td><td>= {fmt(r, 2)} PHP</td></tr>)}</tbody></table>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="font-bold">Amount<input className="field mt-1" type="number" min={0} inputMode="decimal" value={amt} onChange={(e) => setAmt(Math.max(0, Number(e.target.value)))} /></label>
          <label className="font-bold">From<select className="field mt-1" value={from} onChange={(e) => setFrom(e.target.value)}>{codes.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="font-bold">To<select className="field mt-1" value={to} onChange={(e) => setTo(e.target.value)}>{codes.map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        <div className="math mt-4 rounded-2xl bg-[#ffe9f2] p-4 text-xl font-bold" aria-live="polite">{fmt(amt, 2)} {from} = {fmt(out, 2)} {to}</div>
        <Steps items={steps} />
        <div className="mt-3"><Diagram spec={dg("currency", { n: [from === "PHP" ? 1 : RATES[from], amt], s: [from === "PHP" ? to : from, "PHP"] })} /></div>
      </Panel>
      <Panel title="Shopping scenario" hint="Which price is lower? Use the sample rate 1 USD = 56 PHP.">
        <p className="text-lg font-semibold">A pair of shoes costs <strong>{price.usd} USD</strong> online or <strong>{fmt(price.php, 0)} PHP</strong> in a local shop.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[["online", "The online price is lower"], ["local", "The local price is lower"]].map(([k, label]) => <button key={k} type="button" className="btn btn-purple btn-sm" onClick={() => setPrice({ ...price, pick: k })}>{label}</button>)}
          <button type="button" className="btn btn-sun btn-sm" onClick={() => { const usd = 20 + Math.floor(Math.random() * 60); setPrice({ usd, php: Math.round((usd * 56 * (0.85 + Math.random() * 0.3)) / 10) * 10, pick: "" }); }}>🔄 New scenario</button>
        </div>
        {price.pick && <Note ok={price.pick === better}>{price.pick === better ? "Correct! " : "Not quite. "}{price.usd} USD × 56 = {fmt(online, 2)} PHP, compared with {fmt(price.php, 0)} PHP, so the {better} price is lower.</Note>}
      </Panel>
    </>
  );
}
