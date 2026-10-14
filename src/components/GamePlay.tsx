"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { GAMES } from "@/content/gamesMeta";
import { makeGameQuestions } from "@/content/gameGen";
import { TONES } from "@/content/competencies";
import { completeGame, useProfile } from "@/lib/progress";
import { DIFFS, DIFF_LABEL, type Diff, type Q } from "@/lib/types";
import { uid } from "@/lib/util";
import { Bear } from "./Art";
import { BackLink, ProgressBar, RewardRules } from "./Bits";
import { MatchGame } from "./MatchGame";
import { QuestionCard } from "./QuestionCard";
import { SpeakButton } from "./SpeakButton";

const TL: Record<Diff, number> = { easy: 35, intermediate: 30, challenge: 45 };
const DIFF_NOTE: Record<Diff, string> = { easy: "Friendly warm-up questions", intermediate: "A good Grade 11 challenge", challenge: "Extra-tricky problems for superstars" };
interface Entry { q: Q; ok: boolean; response: string }
interface Outcome { earned: number; stars: number; correct: number; total: number; ms: number; newBest: boolean; entries: Entry[] }

export function GamePlay({ gameId }: { gameId: string }) {
  const game = GAMES.find((g) => g.id === gameId);
  const { p, loaded } = useProfile();
  const [phase, setPhase] = useState<"menu" | "play" | "done">("menu");
  const [diff, setDiff] = useState<Diff>("easy");
  const [qs, setQs] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<Entry[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [out, setOut] = useState<Outcome | null>(null);
  const t0 = useRef(0);
  const finished = useRef("");
  if (!game) return <p className="p-6">Game not found. <Link href="/games" className="underline">Back to games</Link></p>;
  const tone = TONES[game.tone];
  const isMatch = game.id === "measurement-match-up";
  const timed = game.id === "conversion-race";

  const start = (d: Diff) => {
    setDiff(d);
    setSessionId(uid());
    finished.current = "";
    setQs(isMatch ? [] : makeGameQuestions(game.id, d));
    setIdx(0);
    setLog([]);
    setOut(null);
    t0.current = Date.now();
    setPhase("play");
    window.scrollTo({ top: 0 });
  };
  const finish = (correct: number, total: number, answers: { comp: number; ok: boolean }[], ms: number, entries: Entry[]) => {
    if (finished.current === sessionId) return;
    finished.current = sessionId;
    const prev = p.games[`${game.id}:${diff}`];
    const r = completeGame({ sessionId, game: game.id, title: game.title, diff, correct, total, timeMs: timed ? ms : undefined, answers });
    setOut({ earned: r.earned, stars: r.stars, correct, total, ms, entries, newBest: !!prev && correct >= prev.best && (!timed || prev.bestTimeMs === undefined || ms < prev.bestTimeMs) && (correct > prev.best || (timed && prev.bestTimeMs !== undefined && ms < prev.bestTimeMs)) });
    setPhase("done");
    window.scrollTo({ top: 0 });
  };

  const header = (
    <header className="mb-5 flex flex-wrap items-center gap-4">
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-white text-4xl" style={{ background: tone.bg }} aria-hidden="true">{game.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-plum2">Game {game.n} of 10</p>
        <h1 className="page-title">{game.title}</h1>
        <p className="text-lg text-plum2">{game.blurb}</p>
      </div>
      <BackLink href="/games">← Back to Games</BackLink>
    </header>
  );

  if (phase === "menu") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        {header}
        <section className="card mb-5" aria-labelledby="how">
          <h2 id="how" className="text-xl">How to play</h2>
          <p className="mt-1 text-lg">{game.how}</p>
          <p className="mt-1">Wrong answers never lose stars. After every question you will see a full explanation.</p>
          <div className="mt-3 flex flex-wrap items-center gap-4"><SpeakButton id={`gi:${game.id}`} text={`${game.title}. ${game.how} Choose a difficulty to begin.`} label="Hear instructions" /><Bear i={game.bear} size={64} className="anim-wiggle" /></div>
        </section>
        <h2 className="mb-3 text-2xl">Choose your level</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {DIFFS.map((d) => {
            const rec = loaded ? p.games[`${game.id}:${d}`] : undefined;
            const rw = loaded ? p.rewards[`game:${game.id}:${d}`] : undefined;
            return (
              <div key={d} className="card flex flex-col gap-2">
                <h3 className="text-xl">{d === "easy" ? "🌱" : d === "intermediate" ? "🌟" : "🚀"} {DIFF_LABEL[d]}</h3>
                <p className="text-sm text-plum2">{DIFF_NOTE[d]}{timed ? ` · ${TL[d]} seconds per question` : ""}</p>
                <p className="text-sm font-bold">{rec ? `Best: ${rec.best}/${rec.total} · ⭐ ${rw?.stars ?? 0} stars${rec.bestTimeMs ? ` · fastest ${(rec.bestTimeMs / 1000).toFixed(0)}s` : ""}` : "Not played yet"}</p>
                <button type="button" className="btn btn-purple mt-auto" onClick={() => start(d)}>{rec ? "Play again" : "Play"} ▶</button>
              </div>
            );
          })}
        </div>
        <div className="mt-6"><RewardRules /></div>
      </div>
    );
  }

  if (phase === "play") {
    const total = isMatch ? 0 : qs.length;
    const score = log.filter((l) => l.ok).length;
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        {header}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="chip !bg-[#cdb8f5]">{DIFF_LABEL[diff]}</span>
          {!isMatch && <span className="chip">Question {Math.min(idx + 1, total)} of {total}</span>}
          {!isMatch && <span className="chip !bg-[#ffe89a]">⭐ Score {score}</span>}
          <button type="button" className="btn btn-white btn-sm ml-auto" onClick={() => setPhase("menu")}>Quit game</button>
        </div>
        {!isMatch && <ProgressBar className="mb-5" value={idx / total} label="Game progress" />}
        {isMatch ? (
          <MatchGame key={sessionId} diff={diff} onDone={(r) => finish(r.correct, r.total, r.answers, r.ms, [])} />
        ) : qs[idx] ? (
          <QuestionCard
            key={`${sessionId}-${idx}`}
            q={qs[idx]}
            tag={`Question ${idx + 1} of ${total}`}
            timeLimit={timed ? TL[diff] : undefined}
            showMeta={false}
            onAnswered={(a) => setLog((l) => [...l, { q: qs[idx], ok: a.correct, response: a.response }])}
            nextLabel={idx + 1 < total ? "Next question ➜" : "See my results 🎉"}
            onNext={() => {
              if (idx + 1 < total) setIdx(idx + 1);
              else finish(log.filter((l) => l.ok).length, total, log.map((l) => ({ comp: l.q.comp, ok: l.ok })), Date.now() - t0.current, log);
            }}
          />
        ) : null}
      </div>
    );
  }

  const o = out!;
  const perfect = o.correct === o.total;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {header}
      <section className="card text-center" aria-labelledby="res">
        <Bear i={game.bear} size={120} mood="cheer" className="anim-float mx-auto" />
        <h2 id="res" className="mt-2 text-3xl">{perfect ? "Perfect score! 🏆" : o.correct >= o.total / 2 ? "Great work! 🌟" : "Good try! Let’s keep learning 💜"}</h2>
        <p className="mt-2 text-2xl font-semibold" role="status">{o.earned > 0 ? `Yay! You did it! You earned ${o.earned} star${o.earned === 1 ? "" : "s"}!` : "You matched your best — beat it to earn more stars!"}</p>
        <div className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#e3f6ec] p-3"><div className="font-display text-3xl">{o.correct}/{o.total}</div><div className="text-sm font-bold">Correct</div></div>
          <div className="rounded-2xl bg-[#ffe89a] p-3"><div className="font-display text-3xl">⭐ {o.stars}</div><div className="text-sm font-bold">Best for this level</div></div>
          <div className="rounded-2xl bg-[#e4f4fd] p-3"><div className="font-display text-3xl">{Math.round((o.correct / Math.max(1, o.total)) * 100)}%</div><div className="text-sm font-bold">Score</div></div>
        </div>
        {timed && <p className="mt-3 font-bold">⏱ Total time: {(o.ms / 1000).toFixed(0)} seconds{o.newBest ? " — new personal best! 🎉" : ""}</p>}
        <p className="mt-2 text-sm text-plum2">Stars so far this level: {o.stars} (replaying only adds stars when you beat your best).</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-mint" onClick={() => start(diff)}>🔁 Play again</button>
          <button type="button" className="btn btn-sun" onClick={() => setPhase("menu")}>🎚 Try another level</button>
          <Link href="/games" className="btn btn-purple">🎮 Back to Games</Link>
        </div>
      </section>
      {o.entries.length > 0 && (
        <section className="card mt-5" aria-labelledby="rev">
          <h2 id="rev" className="text-xl">Question review</h2>
          <ul className="mt-2 space-y-2">
            {o.entries.map((e, i) => (
              <li key={i} className="rounded-2xl bg-white p-3">
                <p className="font-semibold">{e.ok ? "✅" : "💡"} {i + 1}. {e.q.text}</p>
                <p className="text-sm">Correct answer: <strong className="math">{e.q.answerText}</strong>{!e.ok && e.response ? ` · You answered: ${e.response}` : ""}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
