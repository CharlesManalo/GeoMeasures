"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { COMPS, TONES, compById } from "@/content/competencies";
import { DEFS, type Def } from "@/content/definitions";
import { lessonFor } from "@/content/lessons";
import type { Example } from "@/content/lessonTypes";
import { completeLesson, useProfile } from "@/lib/progress";
import { uid } from "@/lib/util";
import { Bear, BEARS } from "./Art";
import { BearTip, Formula, ProgressBar, RewardRules } from "./Bits";
import { Diagram } from "./diagrams/Diagram";
import { QuestionCard } from "./QuestionCard";
import { SpeakButton } from "./SpeakButton";
import { WIDGETS } from "./widgets";

const exScript = (e: Example) =>
  `Worked example: ${e.title}. Given: ${e.given.join(". ")}. We need to find: ${e.asks} We use: ${e.spoken ?? e.formula}. Substituting: ${e.sub}. ${e.steps.map((s, i) => `Step ${i + 1}: ${s}`).join(" ")} Final answer: ${e.answer}. Why this works: ${e.why}`;
const defScript = (d: Def) => `${d.term}. ${d.def} ${d.formula ? "Formula: " + d.formula.s : ""}`;

export function LessonView({ comp }: { comp: number }) {
  const lesson = lessonFor(comp);
  const c = compById(comp);
  const { p, loaded } = useProfile();
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const [i, setI] = useState(0);
  const [log, setLog] = useState<boolean[]>([]);
  const [sid, setSid] = useState("");
  const [res, setRes] = useState<{ earned: number; stars: number; correct: number } | null>(null);
  const fin = useRef("");
  if (!lesson) return null;
  const tone = TONES[c.tone];
  const defs = lesson.defIds.map((id) => DEFS.find((d) => d.id === id)).filter(Boolean) as Def[];
  const rec = loaded ? p.lessons[comp] : undefined;

  const startCheck = () => { setSid(uid()); fin.current = ""; setI(0); setLog([]); setRes(null); setPhase("run"); };
  const finish = (all: boolean[]) => {
    if (fin.current === sid) return;
    fin.current = sid;
    const correct = all.filter(Boolean).length;
    const r = completeLesson({ sessionId: sid, comp, title: c.short, correct, total: lesson.check.length, answers: all.map((ok) => ({ comp, ok })) });
    setRes({ earned: r.earned, stars: r.stars, correct });
    setPhase("done");
  };
  const nav = [["intro", "Intro"], ["defs", "Definitions"], ["learn", "Lesson"], ["try", "Try it"], ["examples", "Worked examples"], ["apply", "Real world"], ["mistakes", "Mistakes"], ["check", "Knowledge check"]];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/lessons" className="btn btn-white btn-sm">← All lessons</Link>
        <Link href="/dashboard" className="btn btn-white btn-sm">🌈 Dashboard</Link>
        <Link href={`/practice?c=${comp}`} className="btn btn-pink btn-sm ml-auto">✏️ Practice this topic</Link>
      </div>
      <header className="card flex flex-wrap items-center gap-4" style={{ background: `linear-gradient(135deg,#fff,${tone.soft})`, borderColor: tone.bg }}>
        <Bear i={c.bear} size={96} className="anim-wiggle shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-plum2">Lesson {comp} of 10 {rec ? "· ✅ knowledge check completed" : ""}</p>
          <h1 className="page-title">{c.icon} {c.title}</h1>
          <p className="text-lg text-plum2">Let’s Learn: Step-by-Step Mathematics!</p>
        </div>
      </header>
      <nav aria-label="Lesson sections" className="my-4 flex flex-wrap gap-2">
        {nav.map(([id, l]) => <a key={id} href={`#${id}`} className="chip chip-btn no-underline">{l}</a>)}
      </nav>

      <section id="intro" className="card scroll-mt-24">
        <h2 className="text-2xl">🌟 Introduction</h2>
        <p className="mt-2 text-lg leading-relaxed">{lesson.intro}</p>
        <div className="mt-2"><SpeakButton id={`l${comp}:intro`} text={`${c.title}. ${lesson.intro}`} label="Listen to the introduction" /></div>
        <h3 className="mt-5 text-xl">🎯 Learning objectives</h3>
        <ul className="mt-1 list-disc space-y-1 pl-6 text-lg">{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        <div className="mt-2"><SpeakButton id={`l${comp}:obj`} text={`Learning objectives. ${lesson.objectives.join(" ")}`} label="Listen to the objectives" /></div>
        <div className="mt-4"><BearTip i={c.bear} text={BEARS[c.bear].says} /></div>
      </section>

      <section id="defs" className="card mt-5 scroll-mt-24">
        <h2 className="text-2xl">📖 Important definitions</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {defs.map((d) => (
            <div key={d.id} className="rounded-2xl bg-white p-4">
              <h3 className="text-lg">{d.term}</h3>
              <p className="mt-1">{d.def}</p>
              {d.formula && <div className="mt-2"><Formula f={d.formula} id={`ld:${d.id}`} /></div>}
              <div className="mt-2"><SpeakButton id={`ld:${d.id}:s`} text={defScript(d)} compact label="Hear definition" /></div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm"><Link href="/definitions" className="underline">See all definitions →</Link></p>
      </section>

      <section id="learn" className="mt-5 space-y-5 scroll-mt-24">
        <h2 className="text-2xl">🧠 The lesson</h2>
        {lesson.sections.map((s, k) => (
          <article key={s.title} className="card" aria-labelledby={`sec-${k}`}>
            <h3 id={`sec-${k}`} className="text-xl"><span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-full text-base" style={{ background: tone.bg }}>{k + 1}</span>{s.title}</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-[1fr_minmax(0,22rem)] md:items-start">
              <div className="space-y-2 text-lg leading-relaxed">
                {s.body.map((b, j) => <p key={j}>{b}</p>)}
                {s.formulas?.map((f) => <Formula key={f.t} f={f} id={`ls${comp}-${k}:${f.t}`} />)}
                <SpeakButton id={`l${comp}:s${k}`} text={`${s.title}. ${s.body.join(" ")} ${(s.formulas ?? []).map((f) => f.s).join(" ")}`} label="Listen to this part" />
              </div>
              {s.diagram && <Diagram spec={s.diagram} />}
            </div>
          </article>
        ))}
      </section>

      <section id="try" className="mt-8 space-y-5 scroll-mt-24">
        <h2 className="text-2xl">🎛 Try it yourself: interactive tools</h2>
        {lesson.widgets.map((w) => { const W = WIDGETS[w]; return W ? <div key={w}>{W()}</div> : null; })}
      </section>

      <section id="examples" className="mt-8 space-y-5 scroll-mt-24">
        <h2 className="text-2xl">✏️ Worked examples</h2>
        {lesson.examples.map((e, k) => (
          <article key={e.title} className="card" aria-labelledby={`ex-${k}`} style={{ borderColor: tone.bg }}>
            <h3 id={`ex-${k}`} className="text-xl">Example {k + 1}: {e.title}</h3>
            <div className="mt-2"><SpeakButton id={`l${comp}:ex${k}`} text={exScript(e)} label="Listen to this example" /></div>
            <div className="mt-3 grid gap-4 md:grid-cols-[1fr_minmax(0,22rem)] md:items-start">
              <dl className="space-y-3 text-lg">
                <div><dt className="font-bold text-[#6240b5]">Given</dt><dd><ul className="list-disc pl-6">{e.given.map((g) => <li key={g}>{g}</li>)}</ul></dd></div>
                <div><dt className="font-bold text-[#6240b5]">What we need to find</dt><dd>{e.asks}</dd></div>
                <div><dt className="font-bold text-[#6240b5]">Formula or principle</dt><dd className="math font-semibold">{e.formula}</dd></div>
                <div><dt className="font-bold text-[#6240b5]">Substitution</dt><dd className="math font-semibold">{e.sub}</dd></div>
                <div><dt className="font-bold text-[#6240b5]">Step-by-step</dt><dd><ol className="list-decimal space-y-1 pl-6">{e.steps.map((s) => <li key={s}>{s}</li>)}</ol></dd></div>
                <div className="rounded-2xl bg-[#e3f6ec] p-3"><dt className="font-bold">✅ Final answer</dt><dd className="math text-xl font-bold">{e.answer}</dd></div>
                <div className="rounded-2xl bg-[#efe7fd] p-3"><dt className="font-bold">💡 Why this works</dt><dd>{e.why}</dd></div>
              </dl>
              {e.diagram && <Diagram spec={e.diagram} />}
            </div>
          </article>
        ))}
      </section>

      <section id="apply" className="card mt-8 scroll-mt-24">
        <h2 className="text-2xl">🌍 Real-world applications</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-lg">{lesson.applications.map((a) => <li key={a}>{a}</li>)}</ul>
        <div className="mt-2"><SpeakButton id={`l${comp}:app`} text={`Real world applications. ${lesson.applications.join(" ")}`} label="Listen" /></div>
      </section>

      <section id="mistakes" className="card mt-5 scroll-mt-24">
        <h2 className="text-2xl">⚠️ Common mistakes and how to avoid them</h2>
        <ul className="mt-3 space-y-3">
          {lesson.mistakes.map((m) => (
            <li key={m.wrong} className="grid gap-2 sm:grid-cols-2">
              <p className="no-box p-3"><strong>✗ Mistake:</strong> {m.wrong}</p>
              <p className="ok-box p-3"><strong>✓ Fix:</strong> {m.fix}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3"><SpeakButton id={`l${comp}:mist`} text={`Common mistakes. ${lesson.mistakes.map((m) => `Mistake: ${m.wrong} Fix: ${m.fix}`).join(" ")}`} label="Listen" /></div>
      </section>

      <section id="check" className="mt-8 scroll-mt-24" aria-labelledby="chk">
        <h2 id="chk" className="mb-3 text-2xl">✅ Knowledge check</h2>
        {phase === "idle" && (
          <div className="card text-center">
            <p className="text-lg">Three quick questions to check what you learned. Finish the check to earn stars and mark this lesson complete!</p>
            <button type="button" className="btn btn-purple btn-lg mt-4" onClick={startCheck}>{rec ? "Take the check again" : "Start the check"} ▶</button>
            {rec && <p className="mt-2 font-semibold">Your best: {rec.best} of {rec.total} correct</p>}
            <div className="mt-4 text-left"><RewardRules /></div>
          </div>
        )}
        {phase === "run" && (
          <>
            <ProgressBar className="mb-3" value={i / lesson.check.length} label="Knowledge check progress" />
            <QuestionCard key={`${sid}-${i}`} q={lesson.check[i]} tag={`Check question ${i + 1} of ${lesson.check.length}`} showMeta={false}
              onAnswered={(a) => setLog((l) => [...l, a.correct])}
              nextLabel={i + 1 < lesson.check.length ? "Next ➜" : "Finish the check 🎉"}
              onNext={() => { if (i + 1 < lesson.check.length) setI(i + 1); else finish(log); }} />
          </>
        )}
        {phase === "done" && res && (
          <div className="card text-center">
            <Bear i={c.bear} size={110} mood="cheer" className="anim-float mx-auto" />
            <h3 className="mt-2 text-2xl">{res.correct === lesson.check.length ? "Perfect! 🏆" : "Lesson complete! 🌟"} You answered {res.correct} of {lesson.check.length} correctly.</h3>
            <p className="mt-2 text-xl font-semibold" role="status">{res.earned > 0 ? `Yay! You did it! You earned ${res.earned} star${res.earned === 1 ? "" : "s"}!` : "You matched your best — beat it to earn more stars!"}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn btn-mint" onClick={startCheck}>🔁 Try the check again</button>
              <Link href={`/practice?c=${comp}`} className="btn btn-pink">✏️ Practice this topic</Link>
              <Link href="/games" className="btn btn-sun">🎮 Play games</Link>
            </div>
          </div>
        )}
      </section>

      <nav aria-label="Lesson navigation" className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {comp > 1 ? <Link href={`/lessons/${comp - 1}`} className="btn btn-blue">← Previous: {COMPS[comp - 2].short}</Link> : <span />}
        <Link href="/lessons" className="btn btn-white">All lessons</Link>
        {comp < 10 ? <Link href={`/lessons/${comp + 1}`} className="btn btn-mint">Next: {COMPS[comp].short} →</Link> : <Link href="/dashboard" className="btn btn-mint">Back to Dashboard 🌈</Link>}
      </nav>
    </div>
  );
}
