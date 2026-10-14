"use client";
import Link from "next/link";
import { Bear } from "@/components/Art";
import { ProgressBar } from "@/components/Bits";
import { NickEditor } from "@/components/ProfileBits";
import { COMPS, TONES, type Tone } from "@/content/competencies";
import { GAMES } from "@/content/gamesMeta";
import {
  accuracy,
  activitiesDone,
  compProgress,
  gamesDone,
  lessonsDone,
  overallProgress,
  totalStars,
  useProfile,
} from "@/lib/progress";

const CARDS: {
  href: string;
  title: string;
  icon: string;
  desc: string;
  btn: string;
  tone: Tone;
  bear: number;
}[] = [
  {
    href: "/definitions",
    title: "DEFINITIONS",
    icon: "📖",
    desc: "Discover important words, units, formulas, and mathematical concepts.",
    btn: "Explore Definitions",
    tone: "sky",
    bear: 0,
  },
  {
    href: "/lessons",
    title: "LESSONS",
    icon: "📓",
    desc: "Learn step by step through visual explanations, audio lessons, worked examples, and formulas.",
    btn: "Start Learning",
    tone: "mint",
    bear: 2,
  },
  {
    href: "/games",
    title: "GAMES",
    icon: "🎮",
    desc: "Challenge yourself with interactive mathematics games and collect stars!",
    btn: "Play Games",
    tone: "blush",
    bear: 5,
  },
  {
    href: "/practice",
    title: "PRACTICES",
    icon: "📝",
    desc: "Test your understanding with interactive questions and personalized feedback.",
    btn: "Start Practice",
    tone: "lilac",
    bear: 9,
  },
];

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

export default function Dashboard() {
  const { p, loaded } = useProfile();
  const stars = loaded ? totalStars(p) : 0;
  const overall = loaded ? overallProgress(p) : 0;
  const acc = accuracy(p);
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <Bear i={2} size={100} className="anim-wiggle shrink-0" mood="cheer" />
        <div className="min-w-0 flex-1">
          <h1 className="page-title">Welcome to Your Learning World!</h1>
          <p className="mt-1 text-xl text-plum2">
            Choose your adventure and let the learning begin!
          </p>
          <div className="mt-2">{loaded && <NickEditor />}</div>
        </div>
      </header>

      <section
        aria-label="Choose your adventure"
        className="grid gap-5 sm:grid-cols-2"
      >
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card card-hover block !p-6 no-underline"
            style={{
              background: `linear-gradient(135deg, #fff 0%, ${TONES[c.tone].soft} 100%)`,
              borderColor: TONES[c.tone].bg,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-white text-5xl"
                style={{ background: TONES[c.tone].bg }}
                aria-hidden="true"
              >
                {c.icon}
              </div>
              <h2 className="text-3xl">{c.title}</h2>
              <Bear
                i={c.bear}
                size={70}
                className="ml-auto hidden shrink-0 sm:block"
              />
            </div>
            <p className="mt-3 text-lg">{c.desc}</p>
            <span className="btn mt-4" style={{ background: TONES[c.tone].bg }}>
              {c.btn} ➜
            </span>
          </Link>
        ))}
      </section>

      <section
        className="mt-8 grid gap-5 lg:grid-cols-3"
        aria-labelledby="stats"
      >
        <h2 id="stats" className="sr-only">
          Your progress summary
        </h2>
        <div className="card lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h3 className="text-2xl">🌈 Overall learning progress</h3>
            <span className="font-display text-3xl">
              {Math.round(overall * 100)}%
            </span>
          </div>
          <ProgressBar
            value={overall}
            label="Overall learning progress"
            className="mt-2"
          />
          <p className="mt-2 text-sm text-plum2">
            Progress combines lessons completed (35%), games played (30%) and
            practice questions mastered (35%) across all 10 competencies. Saved
            on this device.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["⭐", "Stars", String(stars), "#ffe89a"],
              ["📓", "Lessons", `${loaded ? lessonsDone(p) : 0}/10`, "#e3f6ec"],
              [
                "🎮",
                "Games",
                `${loaded ? gamesDone(p) : 0}/${GAMES.length * 3}`,
                "#ffe9f2",
              ],
              [
                "✏️",
                "Practice",
                String(loaded ? p.practiceCount : 0),
                "#e4f4fd",
              ],
            ].map(([i, l, v, bg]) => (
              <div
                key={l}
                className="rounded-2xl p-3 text-center"
                style={{ background: bg }}
              >
                <div className="text-2xl" aria-hidden="true">
                  {i}
                </div>
                <div className="font-display text-2xl">{v}</div>
                <div className="text-sm font-bold">{l}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 font-semibold">
            Completed activities: {loaded ? activitiesDone(p) : 0}
            {acc.t ? ` · Answer accuracy: ${acc.pct}%` : ""}
          </p>
          <div className="mt-3">
            <Link href="/progress" className="btn btn-sun">
              🏆 View achievements and rankings
            </Link>
          </div>
        </div>
        <div className="card">
          <h3 className="text-2xl">🕒 Recently completed</h3>
          {loaded && p.log.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {p.log.slice(0, 6).map((l, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-2 rounded-2xl bg-white p-2 text-sm"
                >
                  <span>
                    <strong>
                      {l.kind === "lesson"
                        ? "📓"
                        : l.kind === "game"
                          ? "🎮"
                          : "✏️"}{" "}
                      {l.label}
                    </strong>
                    <br />
                    <span className="text-plum2">{ago(l.at)}</span>
                  </span>
                  <span className="shrink-0 font-bold">
                    {l.earned > 0 ? `+${l.earned} ⭐` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">
              Nothing yet. Finish a lesson check, a game or a practice session
              and it will appear here!
            </p>
          )}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="comps">
        <h2 id="comps" className="mb-3 text-2xl">
          📚 Your 10 learning competencies
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPS.map((c) => {
            const pr = compProgress(p, c.id);
            return (
              <article
                key={c.id}
                className="card !p-4"
                style={{ borderColor: TONES[c.tone].bg }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
                    style={{ background: TONES[c.tone].bg }}
                    aria-hidden="true"
                  >
                    {c.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg leading-tight">
                      {c.id}. {c.title}
                    </h3>
                  </div>
                </div>
                <ProgressBar
                  value={loaded ? pr.total : 0}
                  label={`Progress in competency ${c.id}`}
                  className="mt-3"
                />
                <p className="mt-1 text-xs font-bold text-plum2">
                  {Math.round((loaded ? pr.total : 0) * 100)}% · Lesson{" "}
                  {pr.lesson ? "✓" : "–"} · Games {Math.round(pr.game * 100)}% ·
                  Practice {Math.round(pr.practice * 100)}%
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/lessons/${c.id}`}
                    className="btn btn-white btn-sm"
                  >
                    Lesson
                  </Link>
                  <Link
                    href={`/practice?c=${c.id}`}
                    className="btn btn-white btn-sm"
                  >
                    Practice
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
