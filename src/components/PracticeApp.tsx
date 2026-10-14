"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BANK } from "@/content/bank";
import { COMPS, compById } from "@/content/competencies";
import { completePractice, useProfile, type PracticeSummary } from "@/lib/progress";
import { DIFF_LABEL, type Diff, type Q } from "@/lib/types";
import { shuffle, uid } from "@/lib/util";
import { Bear } from "./Art";
import { CompChips, PageHead, ProgressBar, RewardRules } from "./Bits";
import { QuestionCard } from "./QuestionCard";
import { SpeakButton } from "./SpeakButton";

interface Rec { first: boolean | null; attempts: number; retryAttempts: number; mastered: boolean }
interface Run {
  sessionId: string; list: Q[]; pos: number; retry: string[]; cur: { q: Q; from: "sched" | "retry" } | null; serial: number;
  recs: Record<string, Rec>; ended: boolean;
}
interface Final { summary: PracticeSummary; list: Q[]; recs: Record<string, Rec>; earned: number; stars: number; ended: boolean }

/** Round-robin pick so every selected competency is represented. */
function pickQuestions(comps: number[], diff: "all" | Diff, count: number): Q[] {
  const ids = comps.length ? comps : COMPS.map((c) => c.id);
  const pools: Q[][] = ids.map((c) => shuffle(BANK.filter((q: Q) => q.comp === c && (diff === "all" || q.diff === diff))));
  const out: Q[] = [];
  let i = 0;
  while (out.length < count && pools.some((p) => p.length)) {
    const p = pools[i % pools.length];
    if (p.length) out.push(p.shift()!);
    i++;
  }
  return shuffle(out);
}

export function PracticeApp() {
  const { p } = useProfile();
  const [phase, setPhase] = useState<"setup" | "run" | "done">("setup");
  const [comps, setComps] = useState<number[]>([]);
  const [diff, setDiff] = useState<"all" | Diff>("all");
  const [count, setCount] = useState(10);
  const [run, setRun] = useState<Run | null>(null);
  const [fin, setFin] = useState<Final | null>(null);
  const done = useRef("");

  useEffect(() => {
    const c = Number(new URLSearchParams(window.location.search).get("c"));
    if (c >= 1 && c <= 10) setComps([c]);
  }, []);

  const avail = BANK.filter((q) => (comps.length === 0 || comps.includes(q.comp)) && (diff === "all" || q.diff === diff)).length;

  const next = (r: Run): Run => {
    if (r.pos < r.list.length) return { ...r, cur: { q: r.list[r.pos], from: "sched" }, pos: r.pos + 1, serial: r.serial + 1 };
    if (r.retry.length) {
      const q = r.list.find((x) => x.id === r.retry[0])!;
      return { ...r, cur: { q, from: "retry" }, serial: r.serial + 1 };
    }
    return { ...r, cur: null };
  };
  const begin = () => {
    const list = pickQuestions(comps, diff, count);
    if (!list.length) return;
    const recs: Record<string, Rec> = {};
    list.forEach((q) => { recs[q.id] = { first: null, attempts: 0, retryAttempts: 0, mastered: false }; });
    done.current = "";
    setRun(next({ sessionId: uid(), list, pos: 0, retry: [], cur: null, serial: 0, recs, ended: false }));
    setPhase("run");
    window.scrollTo({ top: 0 });
  };

  const onAnswered = (ok: boolean) => {
    setRun((r) => {
      if (!r || !r.cur) return r;
      const id = r.cur.q.id;
      const rec = { ...r.recs[id] };
      rec.attempts += 1;
      if (rec.first === null) rec.first = ok; else rec.retryAttempts += 1;
      let retry = r.retry.filter((x) => x !== id);
      if (ok) rec.mastered = true; else retry = [...retry, id]; // wrong -> goes to the END of the queue
      return { ...r, recs: { ...r.recs, [id]: rec }, retry };
    });
  };

  const finalize = (r: Run, ended: boolean) => {
    if (done.current === r.sessionId) return;
    done.current = r.sessionId;
    const comps2: PracticeSummary["comps"] = {};
    let first = 0, mastered = 0, attempts = 0;
    for (const q of r.list) {
      const rec = r.recs[q.id];
      const c = (comps2[q.comp] ??= { t: 0, f: 0, m: 0 });
      c.t++;
      if (rec.first) { c.f++; first++; }
      if (rec.mastered) { c.m++; mastered++; }
      attempts += rec.attempts;
    }
    const key = `practice:${comps.length === 1 ? "c" + comps[0] : "mixed"}:${diff}`;
    const label = `Practice: ${comps.length === 1 ? compById(comps[0]).short : comps.length ? "selected topics" : "all topics"} (${diff === "all" ? "all levels" : DIFF_LABEL[diff]})`;
    const summary: PracticeSummary = { at: Date.now(), key, total: r.list.length, first, mastered, attempts, comps: comps2 };
    const res = completePractice({
      sessionId: r.sessionId, key, label, summary,
      masteredIds: r.list.filter((q) => r.recs[q.id].mastered).map((q) => q.id),
      firstAnswers: r.list.filter((q) => r.recs[q.id].first !== null).map((q) => ({ comp: q.comp, ok: !!r.recs[q.id].first })),
    });
    setFin({ summary, list: r.list, recs: r.recs, earned: res.earned, stars: res.stars, ended });
    setPhase("done");
    window.scrollTo({ top: 0 });
  };

  const goNext = () => {
    if (!run) return;
    const n = next(run);
    if (!n.cur) { finalize(run, false); return; }
    setRun(n);
  };
  const retryNow = () => setRun((r) => (r && r.cur ? { ...r, cur: { q: r.cur.q, from: "retry" }, serial: r.serial + 1 } : r));

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <PageHead title="Practice Paradise: Try, Learn, and Improve!" sub="Mixed questions with diagrams, audio and step-by-step explanations." bear={5} />
        <section className="card mb-5">
          <h2 className="text-xl">1. Pick your topics</h2>
          <p className="mb-3 text-sm text-plum2">Choose one or more competencies, or leave “All” selected to practice everything.</p>
          <CompChips selected={comps} onAll={() => setComps([])} onToggle={(id) => setComps((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))} />
          <h2 className="mt-5 text-xl">2. Difficulty</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["all", "easy", "intermediate", "challenge"] as const).map((d) => <button key={d} type="button" className="chip chip-btn" aria-pressed={diff === d} onClick={() => setDiff(d)}>{d === "all" ? "🌈 All levels" : DIFF_LABEL[d]}</button>)}
          </div>
          <h2 className="mt-5 text-xl">3. How many questions?</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {[5, 10, 15, 20].map((n) => <button key={n} type="button" className="chip chip-btn" aria-pressed={count === n} onClick={() => setCount(n)}>{n} questions</button>)}
          </div>
          <p className="mt-4 font-bold">{avail} questions available for this selection{avail < count && avail > 0 ? ` — your session will have ${avail}.` : "."}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-purple btn-lg" disabled={avail === 0} onClick={begin}>Start practice ✏️</button>
            <SpeakButton id="pr:how" text="Welcome to Practice Paradise. Choose your topics, a difficulty, and the number of questions. If you miss a question, it comes back at the end of the session until you answer it correctly." label="Hear instructions" />
          </div>
        </section>
        <section className="card mb-5">
          <h2 className="text-xl">🔁 How retries work</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>If you miss a question, you see the full explanation and it joins the <strong>retry queue</strong>.</li>
            <li>The question comes back at the <strong>end</strong> of your session, after every other question. (You can also tap “Try this one again now”.)</li>
            <li>It keeps coming back until you answer it correctly. Then it is <strong>mastered</strong>.</li>
            <li>Your results show <strong>first-attempt accuracy</strong> and <strong>mastery after retries</strong> separately.</li>
          </ul>
        </section>
        <RewardRules />
        {p.practice.length > 0 && <p className="mt-4 text-center text-sm font-semibold text-plum2">You have completed {p.practiceCount} practice session{p.practiceCount === 1 ? "" : "s"}. <Link href="/progress" className="underline">See your progress</Link></p>}
      </div>
    );
  }

  if (phase === "run" && run && run.cur) {
    const answered = run.list.filter((q) => run.recs[q.id].first !== null).length;
    const masteredN = run.list.filter((q) => run.recs[q.id].mastered).length;
    const inRetry = run.cur.from === "retry";
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="chip !bg-[#cdb8f5]">Scheduled: {answered}/{run.list.length}</span>
          <span className="chip !bg-[#b8e6d0]">Mastered: {masteredN}/{run.list.length}</span>
          <span className={`chip ${run.retry.length ? "!bg-[#ffe89a]" : ""}`}>🔁 Retry queue: {run.retry.length}</span>
          <button type="button" className="btn btn-white btn-sm ml-auto" onClick={() => { if (window.confirm("End this session now? Unmastered questions will be counted as not yet mastered.")) finalize(run, true); }}>End session</button>
        </div>
        <ProgressBar className="mb-4" value={masteredN / run.list.length} label="Questions mastered" />
        {inRetry && <p className="mb-3 rounded-2xl bg-[#fff5cf] p-3 font-bold" role="note">🔁 Retry round: you saw this question before. Use the explanation you read to master it this time!</p>}
        <QuestionCard
          key={run.serial}
          q={run.cur.q}
          tag={inRetry ? "Retry question" : `Question ${Math.min(run.pos, run.list.length)} of ${run.list.length}`}
          onAnswered={(a) => onAnswered(a.correct)}
          onRetryNow={retryNow}
          nextLabel="Next question ➜"
          onNext={goNext}
        />
      </div>
    );
  }

  if (phase === "done" && fin) {
    const s = fin.summary;
    const firstPct = Math.round((s.first / Math.max(1, s.total)) * 100);
    const masteryPct = Math.round((s.mastered / Math.max(1, s.total)) * 100);
    const retried = fin.list.filter((q) => fin.recs[q.id].first === false).length;
    const review = Object.entries(s.comps).filter(([, v]) => v.f / v.t < 0.8).map(([k]) => Number(k));
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <PageHead title="Practice Results" sub={fin.ended ? "Session ended early — here’s how far you got." : "You finished the session. Every missed question came back until it was mastered!"} bear={8} />
        <section className="card text-center">
          <Bear i={8} size={110} mood="cheer" className="anim-float mx-auto" />
          <p className="mt-2 text-2xl font-semibold" role="status">{fin.earned > 0 ? `Yay! You did it! You earned ${fin.earned} star${fin.earned === 1 ? "" : "s"}!` : "You matched your best for this setup — beat it to earn more stars!"}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-left md:grid-cols-4">
            {[
              ["Scheduled questions", String(s.total), "#efe7fd"],
              ["Right on first attempt", `${s.first} (${firstPct}%)`, "#e3f6ec"],
              ["Needed retries", String(retried), "#fff5cf"],
              ["Total answer attempts", String(s.attempts), "#e4f4fd"],
              ["First-attempt accuracy", `${firstPct}%`, "#e3f6ec"],
              ["Mastery after retries", `${masteryPct}%`, "#e3f6ec"],
              ["Mastered", `${s.mastered} of ${s.total}`, "#efe7fd"],
              ["Stars this level (best)", `⭐ ${fin.stars}`, "#fff5cf"],
            ].map(([k, v, bg]) => <div key={k} className="rounded-2xl p-3" style={{ background: bg }}><dt className="text-sm font-bold">{k}</dt><dd className="font-display text-2xl">{v}</dd></div>)}
          </dl>
          <p className="mt-3 text-sm text-plum2"><strong>First-attempt accuracy</strong> counts only your first try at each question. <strong>Mastery</strong> counts questions you eventually answered correctly after retries.</p>
        </section>
        <section className="card mt-5" aria-labelledby="cp">
          <h2 id="cp" className="text-xl">Performance by competency</h2>
          <ul className="mt-3 space-y-3">
            {Object.entries(s.comps).map(([k, v]) => (
              <li key={k}>
                <div className="flex flex-wrap justify-between gap-2 font-semibold"><span>{compById(Number(k)).icon} {k}. {compById(Number(k)).title}</span><span>First try {v.f}/{v.t} · Mastered {v.m}/{v.t}</span></div>
                <ProgressBar value={v.f / v.t} label={`First attempt accuracy in competency ${k}`} />
              </li>
            ))}
          </ul>
        </section>
        <section className="card mt-5" aria-labelledby="rec">
          <h2 id="rec" className="text-xl">📚 What to review next</h2>
          {review.length === 0 ? <p className="mt-2 text-lg">Amazing! Your first-attempt accuracy was strong in every competency you practiced. Try a harder level next! 🌟</p> : (
            <ul className="mt-2 space-y-2">{review.map((c) => <li key={c}><Link className="btn btn-blue btn-sm" href={`/lessons/${c}`}>Review Lesson {c}: {compById(c).short}</Link></li>)}</ul>
          )}
          {retried > 0 && (
            <>
              <h3 className="mt-4 text-lg">Questions that needed retries</h3>
              <ul className="mt-1 list-disc pl-6">{fin.list.filter((q) => fin.recs[q.id].first === false).map((q) => <li key={q.id}>{q.text.slice(0, 90)}{q.text.length > 90 ? "…" : ""} — {fin.recs[q.id].mastered ? `mastered after ${fin.recs[q.id].attempts} attempts` : "not mastered yet"}</li>)}</ul>
            </>
          )}
        </section>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-mint" onClick={begin}>🔁 Practice again</button>
          <button type="button" className="btn btn-sun" onClick={() => setPhase("setup")}>⚙️ Change settings</button>
          <Link href="/dashboard" className="btn btn-purple">🌈 Dashboard</Link>
        </div>
      </div>
    );
  }
  return null;
}
