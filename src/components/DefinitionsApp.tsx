"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { COMPS, TONES, compById } from "@/content/competencies";
import { DEFS, type Def } from "@/content/definitions";
import { Diagram } from "./diagrams/Diagram";
import { CompChips, Formula, PageHead } from "./Bits";
import { SpeakButton } from "./SpeakButton";

const script = (d: Def) => `${d.term}. ${d.def} ${d.formula ? `Formula: ${d.formula.s}` : ""} Real world example: ${d.real} ${(d.extra ?? []).length ? "More examples: " + d.extra!.join(" ") : ""}`;

export function DefinitionsApp() {
  const [q, setQ] = useState("");
  const [comps, setComps] = useState<number[]>([]);
  const [sel, setSel] = useState(DEFS[0].id);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return DEFS.filter((d) => (comps.length === 0 || comps.includes(d.comp)) && (!s || `${d.term} ${d.def} ${d.formula?.t ?? ""} ${d.real}`.toLowerCase().includes(s)));
  }, [q, comps]);
  const cur = DEFS.find((d) => d.id === sel) ?? DEFS[0];
  const idx = list.findIndex((d) => d.id === cur.id);
  const c = compById(cur.comp);
  const pick = (id: string) => { setSel(id); if (window.innerWidth < 1024) document.getElementById("def-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PageHead title="Definitions: Learn the Language of Mathematics!" sub="Search, browse and select a term. Every definition has a picture, a real-world example and audio." bear={0} />
      <div className="card mb-5 space-y-3">
        <label className="block font-bold" htmlFor="defsearch">🔎 Search terms, formulas and examples</label>
        <input id="defsearch" type="search" className="field" placeholder="Try “volume”, “Heron”, “Kelvin”, “slant”…" value={q} onChange={(e) => setQ(e.target.value)} />
        <CompChips selected={comps} onAll={() => setComps([])} onToggle={(id) => setComps((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))} />
        <p className="text-sm font-semibold text-plum2" aria-live="polite">{list.length} term{list.length === 1 ? "" : "s"} found · {DEFS.length} in total</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <nav aria-label="Terms" className="card max-h-[32rem] overflow-y-auto !p-3 lg:max-h-[70vh]">
          {list.length === 0 && <p className="p-3">No matching terms. Try a different word or clear the filters.</p>}
          {COMPS.filter((cc) => list.some((d) => d.comp === cc.id)).map((cc) => (
            <div key={cc.id} className="mb-3">
              <h2 className="sticky top-0 rounded-xl px-2 py-1 font-display text-base" style={{ background: TONES[cc.tone].bg }}>{cc.icon} {cc.id}. {cc.short}</h2>
              <ul className="mt-1">
                {list.filter((d) => d.comp === cc.id).map((d) => (
                  <li key={d.id}><button type="button" aria-current={d.id === cur.id} onClick={() => pick(d.id)} className={`min-h-11 w-full rounded-xl px-3 py-1.5 text-left font-semibold hover:bg-lav ${d.id === cur.id ? "bg-[#cdb8f5]" : ""}`}>{d.term}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <article id="def-detail" className="card scroll-mt-24" aria-labelledby="def-term" style={{ borderColor: TONES[c.tone].bg }}>
          <p className="chip" style={{ background: TONES[c.tone].bg }}>{c.icon} Competency {c.id}: {c.title}</p>
          <h2 id="def-term" className="mt-2 text-3xl">{cur.term}</h2>
          <div className="mt-2"><SpeakButton id={`def:${cur.id}`} text={script(cur)} label="Listen to this definition" /></div>
          <p className="mt-3 text-xl leading-relaxed">{cur.def}</p>
          {cur.formula && <div className="mt-4"><Formula f={cur.formula} id={`deff:${cur.id}`} big /></div>}
          <div className="mt-4"><Diagram spec={cur.diagram} /></div>
          <div className="mt-4 rounded-2xl bg-[#e3f6ec] p-4"><h3 className="text-lg">🌍 Real-world example</h3><p className="mt-1 text-lg">{cur.real}</p></div>
          {cur.extra && cur.extra.length > 0 && <div className="mt-3 rounded-2xl bg-[#efe7fd] p-4"><h3 className="text-lg">➕ More examples and notes</h3><ul className="mt-1 list-disc pl-6">{cur.extra.map((e) => <li key={e}>{e}</li>)}</ul></div>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn btn-white btn-sm" disabled={idx <= 0} onClick={() => setSel(list[idx - 1].id)}>← Previous term</button>
            <button type="button" className="btn btn-white btn-sm" disabled={idx < 0 || idx >= list.length - 1} onClick={() => setSel(list[idx + 1].id)}>Next term →</button>
            <Link href={`/lessons/${cur.comp}`} className="btn btn-mint btn-sm">📓 Open the lesson</Link>
            <Link href={`/practice?c=${cur.comp}`} className="btn btn-pink btn-sm">✏️ Practice this topic</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
