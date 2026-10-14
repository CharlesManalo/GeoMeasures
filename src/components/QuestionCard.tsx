"use client";
import { useEffect, useRef, useState } from "react";
import type { Q } from "@/lib/types";
import { DIFF_LABEL } from "@/lib/types";
import { checkNum, checkShort, explainFailure, type Result } from "@/lib/check";
import { shuffle } from "@/lib/util";
import { Diagram } from "./diagrams/Diagram";
import { SpeakButton } from "./SpeakButton";

export interface Answered { correct: boolean; response: string; ms: number }

export function QuestionCard({ q, tag, onAnswered, onNext, nextLabel = "Next ➜", onRetryNow, timeLimit, showMeta = true }: {
  q: Q; tag?: string; onAnswered?: (a: Answered) => void; onNext?: () => void; nextLabel?: string; onRetryNow?: () => void; timeLimit?: number; showMeta?: boolean;
}) {
  const [order, setOrder] = useState<number[]>(() => (q.choices ?? []).map((_, i) => i));
  const [sel, setSel] = useState<number | null>(null);
  const [val, setVal] = useState("");
  const [unit, setUnit] = useState("");
  const [warn, setWarn] = useState("");
  const [res, setRes] = useState<(Result & { late?: boolean }) | null>(null);
  const [left, setLeft] = useState(timeLimit ?? 0);
  const [hint, setHint] = useState(false);
  const t0 = useRef(0);
  const lock = useRef(false);

  useEffect(() => {
    t0.current = Date.now();
    if (q.type === "mc" && q.choices) setOrder(shuffle(q.choices.map((_, i) => i)));
  }, [q]);

  const finish = (r: Result & { late?: boolean }, response: string) => {
    if (lock.current) return;
    lock.current = true;
    setRes(r);
    onAnswered?.({ correct: r.ok, response, ms: Date.now() - t0.current });
  };

  useEffect(() => {
    if (!timeLimit || res) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [timeLimit, res]);
  useEffect(() => {
    if (timeLimit && left <= 0 && !res) finish({ ok: false, late: true, reason: "value" }, val || "(no answer)");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const submit = () => {
    if (res) return;
    setWarn("");
    if (q.type === "mc") {
      if (sel === null) { setWarn("Please choose an answer first."); return; }
      finish({ ok: order[sel] === q.correct }, q.choices?.[order[sel]] ?? "");
      return;
    }
    if (q.type === "num" && q.unitChoices && !unit && !/[a-zA-Z°]/.test(val)) { setWarn("Please choose a unit for your answer."); return; }
    const r = q.type === "num" ? checkNum(q, val, unit) : checkShort(q, val);
    if (r.reason === "empty" || r.reason === "format") { setWarn(explainFailure(r, q)); return; }
    finish(r, `${val}${unit ? " " + unit : ""}`);
  };

  const script = `${q.spoken ?? q.text}${q.type === "mc" && q.choices ? " The choices are: " + order.map((o, i) => `${"ABCD"[i]}. ${q.choices![o]}.`).join(" ") : ""}`;
  const explain = `${res?.ok ? "Correct!" : "Not quite."} The correct answer is ${q.answerText}. Here is how to solve it. ${q.steps.map((s, i) => `Step ${i + 1}. ${s}`).join(" ")}`;
  const feedbackNote = res && !res.ok && res.reason === "unit" ? explainFailure(res, q) : "";

  return (
    <article className="card anim-pop mx-auto w-full max-w-3xl" aria-label="Question">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tag && <span className="chip !bg-[#ffe89a]">{tag}</span>}
        {showMeta && <span className="chip">{DIFF_LABEL[q.diff]}</span>}
        {showMeta && <span className="chip !bg-[#b8e6d0]">Competency {q.comp} · {q.topic}</span>}
        {timeLimit ? <span className={`chip ml-auto ${left <= 5 && !res ? "!bg-[#ffc5dd]" : ""}`} role="timer" aria-label={`${Math.max(0, left)} seconds left`}>⏱ {Math.max(0, left)}s</span> : null}
      </div>
      <p className="text-xl font-semibold leading-snug">{q.text}</p>
      <div className="mt-2"><SpeakButton id={`${q.id}:q`} text={script} label="Read question" /></div>
      {q.diagram && <div className="my-4"><Diagram spec={q.diagram} /></div>}

      {q.type === "mc" && (
        <div role="radiogroup" aria-label="Answer choices" className="mt-4 grid gap-3 sm:grid-cols-2">
          {order.map((o, i) => {
            const picked = sel === i;
            const right = res && o === q.correct;
            const wrong = res && picked && o !== q.correct;
            return (
              <button key={i} type="button" role="radio" aria-checked={picked} disabled={!!res} onClick={() => setSel(i)}
                className={`flex min-h-14 items-center gap-3 rounded-2xl border-4 px-4 py-2 text-left text-lg font-semibold transition ${right ? "border-[#2f8f6b] bg-[#e3f6ec]" : wrong ? "border-[#c9702a] bg-[#fff1e0]" : picked ? "border-[#7a5bc4] bg-[#efe7fd]" : "border-white bg-white hover:bg-lav"}`}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#cdb8f5] font-display text-base">{"ABCD"[i]}</span>
                <span className="math flex-1">{q.choices![o]}</span>
                {right && <span className="text-sm font-bold text-[#1f7a58]">✓ Correct answer</span>}
                {wrong && <span className="text-sm font-bold text-[#a14a14]">✗ Your answer</span>}
              </button>
            );
          })}
        </div>
      )}

      {q.type !== "mc" && (
        <form className="mt-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <label htmlFor={`ans-${q.id}`} className="mb-1 block font-bold">Your answer{q.type === "num" && q.dp !== undefined ? ` (round to ${q.dp} decimal place${q.dp === 1 ? "" : "s"} if needed)` : ""}</label>
          <div className="flex flex-wrap items-center gap-2">
            <input id={`ans-${q.id}`} className="field max-w-xs" value={val} onChange={(e) => setVal(e.target.value)} disabled={!!res} autoComplete="off" autoCapitalize="off" spellCheck={false} inputMode={q.type === "num" ? "decimal" : "text"} placeholder={q.type === "num" ? "Type a number" : "Type your answer"} />
            {q.type === "num" && q.unitChoices && (
              <select className="field max-w-[10rem]" aria-label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} disabled={!!res}>
                <option value="">Unit…</option>
                {q.unitChoices.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            )}
            {q.type === "num" && !q.unitChoices && q.unit && <span className="text-lg font-bold">{q.unit}</span>}
          </div>
        </form>
      )}

      {q.hint && !res && (
        <div className="mt-3">
          <button type="button" className="btn btn-white btn-sm" onClick={() => setHint((h) => !h)} aria-expanded={hint}>💡 {hint ? "Hide hint" : "Need a hint?"}</button>
          {hint && <p className="mt-2 rounded-2xl bg-[#fff5cf] p-3 font-semibold">{q.hint}</p>}
        </div>
      )}
      {warn && <p role="alert" className="mt-3 font-bold text-[#a14a14]">⚠️ {warn}</p>}

      {!res && <div className="mt-5"><button type="button" className="btn btn-mint btn-lg !min-h-14 !px-8 !text-xl" onClick={submit}>Check ✔</button></div>}

      {res && (
        <div role="status" aria-live="polite" className={`mt-5 p-4 ${res.ok ? "ok-box" : "no-box"}`}>
          <p className="font-display text-2xl font-semibold">{res.ok ? "✅ Correct! Great job!" : res.late ? "⏰ Time’s up — no worries!" : "💡 Not quite yet — let’s learn from it!"}</p>
          {feedbackNote && <p className="mt-1 font-bold">{feedbackNote}</p>}
          <p className="mt-2 text-lg"><strong>Correct answer:</strong> <span className="math font-bold">{q.answerText}</span></p>
          {q.formulas && q.formulas.length > 0 && <p className="mt-2"><strong>Formula:</strong> {q.formulas.map((f) => <span key={f} className="math mr-2 inline-block rounded-lg bg-white px-2 py-0.5 font-semibold">{f}</span>)}</p>}
          <ol className="mt-2 list-decimal space-y-1 pl-6">{q.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <SpeakButton id={`${q.id}:e`} text={explain} label="Hear explanation" />
            {!res.ok && onRetryNow && <button type="button" className="btn btn-sun btn-sm" onClick={onRetryNow}>🔁 Try this one again now</button>}
            {onNext && <button type="button" className="btn btn-purple" onClick={onNext}>{nextLabel}</button>}
          </div>
          {!res.ok && onRetryNow && <p className="mt-2 text-sm font-semibold">Or keep going — this question will come back at the end so you can master it.</p>}
        </div>
      )}
    </article>
  );
}
