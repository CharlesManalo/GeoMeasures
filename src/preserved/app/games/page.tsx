"use client";
import Link from "next/link";
import { Bear } from "@/components/Art";
import { PageHead, RewardRules } from "@/components/Bits";
import { TONES } from "@/content/competencies";
import { GAMES } from "@/content/gamesMeta";
import { DIFFS } from "@/lib/types";
import { useProfile } from "@/lib/progress";

export default function GamesPage() {
  const { p, loaded } = useProfile();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PageHead title="Starland Games: Play, Learn, and Shine!" sub="10 games, 3 difficulty levels each. Collect stars and set new personal bests!" bear={5} />
      <div className="mb-6"><RewardRules /></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => {
          const played = loaded ? DIFFS.filter((d) => p.games[`${g.id}:${d}`]).length : 0;
          const stars = loaded ? DIFFS.reduce((s, d) => s + (p.rewards[`game:${g.id}:${d}`]?.stars ?? 0), 0) : 0;
          return (
            <Link key={g.id} href={`/games/${g.id}`} className="card card-hover flex flex-col !p-5 no-underline" style={{ borderColor: TONES[g.tone].bg, background: `linear-gradient(160deg,#fff,${TONES[g.tone].soft})` }}>
              <div className="flex items-center gap-3">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl border-4 border-white text-4xl" style={{ background: TONES[g.tone].bg }} aria-hidden="true">{g.icon}</span>
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-plum2">Game {g.n}</p><h2 className="text-xl leading-tight">{g.title}</h2></div>
                <Bear i={g.bear} size={54} className="shrink-0" />
              </div>
              <p className="mt-3 flex-1">{g.blurb}</p>
              <p className="mt-2 text-sm font-bold">Competencies: {g.comps.join(", ")} · Levels played: {played}/3 · ⭐ {stars}</p>
              <span className="btn mt-3" style={{ background: TONES[g.tone].bg }}>Play {g.title} ▶</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
