"use client";
import { useState } from "react";
import type { Diff } from "@/lib/types";
import { sample, shuffle } from "@/lib/util";
import { SpeakButton } from "./SpeakButton";

interface Pair { a: string; b: string; why: string; comp: number }
const POOL: Record<Diff, Pair[]> = {
  easy: [
    { a: "1 kilometer", b: "1,000 meters", why: "The prefix kilo- means one thousand.", comp: 1 },
    { a: "1 meter", b: "100 centimeters", why: "The prefix centi- means one hundredth, so 100 cm make 1 m.", comp: 1 },
    { a: "1 centimeter", b: "10 millimeters", why: "Milli- means one thousandth of a meter; 10 mm = 1 cm.", comp: 1 },
    { a: "1 kilogram", b: "1,000 grams", why: "Kilo- again means one thousand.", comp: 1 },
    { a: "1 liter", b: "1,000 milliliters", why: "Milli- means one thousandth, so 1,000 mL = 1 L.", comp: 1 },
    { a: "1 gram", b: "1,000 milligrams", why: "1 mg is one thousandth of a gram.", comp: 1 },
    { a: "1 metric tonne", b: "1,000 kilograms", why: "A metric tonne is 1,000 kg.", comp: 1 },
    { a: "Length of a pencil", b: "centimeters (cm)", why: "A pencil is about 15 to 19 cm long, so cm is the sensible unit.", comp: 1 },
    { a: "Distance between two cities", b: "kilometers (km)", why: "Large distances are measured in km.", comp: 1 },
    { a: "Mass of an apple", b: "grams (g)", why: "An apple is a couple of hundred grams.", comp: 1 },
    { a: "Water in a large bottle", b: "liters (L)", why: "Bottles hold about one to two liters.", comp: 1 },
    { a: "Dose of liquid medicine", b: "milliliters (mL)", why: "Small liquid amounts are measured in mL.", comp: 1 },
  ],
  intermediate: [
    { a: "2.5 km", b: "2,500 m", why: "2.5 × 1,000 = 2,500.", comp: 2 },
    { a: "350 cm", b: "3.5 m", why: "350 ÷ 100 = 3.5.", comp: 2 },
    { a: "0.75 kg", b: "750 g", why: "0.75 × 1,000 = 750.", comp: 2 },
    { a: "4,500 mL", b: "4.5 L", why: "4,500 ÷ 1,000 = 4.5.", comp: 2 },
    { a: "6,000 mg", b: "6 g", why: "6,000 ÷ 1,000 = 6.", comp: 2 },
    { a: "1.2 m", b: "120 cm", why: "1.2 × 100 = 120.", comp: 2 },
    { a: "8 mm", b: "0.8 cm", why: "8 ÷ 10 = 0.8.", comp: 2 },
    { a: "3 tonnes", b: "3,000 kg", why: "3 × 1,000 = 3,000.", comp: 2 },
    { a: "Mass of a vitamin tablet", b: "milligrams (mg)", why: "Tablets contain only a tiny mass, so mg is the sensible unit.", comp: 1 },
    { a: "1 hour", b: "3,600 seconds", why: "60 min × 60 s = 3,600 s.", comp: 2 },
    { a: "1 m³", b: "1,000 L", why: "A 1 m by 1 m by 1 m cube holds 1,000 liters.", comp: 2 },
    { a: "5 L", b: "5,000 cm³", why: "1 L = 1,000 cm³, so 5 L = 5,000 cm³.", comp: 2 },
  ],
  challenge: [
    { a: "1 m²", b: "10,000 cm²", why: "100 cm × 100 cm = 10,000 cm². Area units are squared!", comp: 2 },
    { a: "1 km²", b: "1,000,000 m²", why: "1,000 m × 1,000 m = 1,000,000 m².", comp: 2 },
    { a: "1 cm³", b: "1 mL", why: "A cube 1 cm on each side holds exactly 1 mL.", comp: 2 },
    { a: "1 inch", b: "2.54 cm (exact)", why: "The inch is defined as exactly 2.54 cm.", comp: 2 },
    { a: "1 mile", b: "≈ 1.609 km", why: "1 mile = 1.609344 km, so 1.609 is a rounded value.", comp: 2 },
    { a: "1 pound", b: "≈ 0.454 kg", why: "1 lb = 0.45359237 kg exactly; 0.454 is rounded.", comp: 2 },
    { a: "5 × 10³ m", b: "5 km", why: "5 × 10³ = 5,000 m = 5 km.", comp: 2 },
    { a: "3.2 × 10⁻³ m", b: "3.2 mm", why: "10⁻³ m is one millimeter.", comp: 2 },
    { a: "1 m³", b: "1,000,000 cm³", why: "100 × 100 × 100 = 1,000,000.", comp: 2 },
    { a: "1 hectare", b: "10,000 m²", why: "A hectare is a 100 m by 100 m square.", comp: 2 },
    { a: "1 foot", b: "30.48 cm (exact)", why: "1 ft = 12 in × 2.54 cm = 30.48 cm exactly.", comp: 2 },
    { a: "1 US gallon", b: "≈ 3.785 L", why: "1 US gallon is about 3.785 liters.", comp: 2 },
  ],
};
const COUNT: Record<Diff, number> = { easy: 5, intermediate: 6, challenge: 7 };

interface Item { id: number; text: string }
export function MatchGame({ diff, onDone }: { diff: Diff; onDone: (r: { correct: number; total: number; answers: { comp: number; ok: boolean }[]; ms: number }) => void }) {
  const [init] = useState(() => {
    const pairs = sample(POOL[diff], COUNT[diff]);
    return { pairs, left: shuffle(pairs.map((p, i) => ({ id: i, text: p.a }))), right: shuffle(pairs.map((p, i) => ({ id: i, text: p.b }))), t0: Date.now() };
  });
  const { pairs, left, right } = init;
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [miss, setMiss] = useState<Record<number, number>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const attempt = (l: number, r: number) => {
    if (l === r) {
      const nd = new Set(done); nd.add(l);
      setDone(nd);
      setMsg({ ok: true, text: `✅ Match! ${pairs[l].a} = ${pairs[l].b}. ${pairs[l].why}` });
      if (nd.size === pairs.length) {
        const answers = pairs.map((p, i) => ({ comp: p.comp, ok: !miss[i] }));
        setTimeout(() => onDone({ correct: answers.filter((a) => a.ok).length, total: pairs.length, answers, ms: Date.now() - init.t0 }), 900);
      }
    } else {
      setMiss((m) => ({ ...m, [l]: (m[l] ?? 0) + 1 }));
      setMsg({ ok: false, text: `💡 Not a match yet. Check “${pairs[l].a}” again and think about the unit prefix or size. Try another card!` });
    }
    setSelL(null); setSelR(null);
  };
  const pickL = (id: number) => { if (done.has(id)) return; setSelL(id); if (selR !== null) attempt(id, selR); };
  const pickR = (id: number) => { if (done.has(id)) return; setSelR(id); if (selL !== null) attempt(selL, id); };

  const col = (items: Item[], sel: number | null, pick: (id: number) => void, side: string) => (
    <ul className="grid gap-3" aria-label={`${side} cards`}>
      {items.map((it) => {
        const ok = done.has(it.id);
        return (
          <li key={it.id}>
            <button type="button" disabled={ok} aria-pressed={sel === it.id} onClick={() => pick(it.id)}
              className={`math min-h-14 w-full rounded-2xl border-4 px-3 py-2 text-lg font-bold transition ${ok ? "border-[#2f8f6b] bg-[#e3f6ec]" : sel === it.id ? "border-[#7a5bc4] bg-[#efe7fd]" : "border-white bg-white hover:bg-lav"}`}>
              {ok ? "✓ " : ""}{it.text}
            </button>
          </li>
        );
      })}
    </ul>
  );
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="card">
        <p className="text-lg font-semibold">Tap a card on the left, then tap the card on the right that means the same thing.</p>
        <div className="mt-2"><SpeakButton id="mm:how" text="Tap a card on the left, then tap the card on the right that means the same thing. Match every pair to finish the round." label="Hear instructions" /></div>
        <p className="mt-3 font-bold">Matched {done.size} of {pairs.length}</p>
        <div className="mt-4 grid grid-cols-2 gap-4">{col(left, selL, pickL, "Left")}{col(right, selR, pickR, "Right")}</div>
        <div role="status" aria-live="polite" className="mt-4 min-h-14">{msg && <p className={`p-3 font-semibold ${msg.ok ? "ok-box" : "no-box"}`}>{msg.text}</p>}</div>
      </div>
    </div>
  );
}
