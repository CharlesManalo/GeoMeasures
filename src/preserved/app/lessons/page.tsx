"use client";
import Link from "next/link";
import { Bear } from "@/components/Art";
import { PageHead, ProgressBar } from "@/components/Bits";
import { COMPS, TONES } from "@/content/competencies";
import { lessonFor } from "@/content/lessons";
import { compProgress, useProfile } from "@/lib/progress";

export default function LessonsPage() {
  const { p, loaded } = useProfile();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PageHead title="Let’s Learn: Step-by-Step Mathematics!" sub="10 complete lessons with pictures, audio, worked examples, interactive tools and a knowledge check." bear={2} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {COMPS.map((c) => {
          const done = loaded && !!p.lessons[c.id];
          const L = lessonFor(c.id)!;
          return (
            <Link key={c.id} href={`/lessons/${c.id}`} className="card card-hover flex flex-col !p-5 no-underline" style={{ borderColor: TONES[c.tone].bg, background: `linear-gradient(160deg,#fff,${TONES[c.tone].soft})` }}>
              <div className="flex items-start gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: TONES[c.tone].bg }} aria-hidden="true">{c.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-plum2">Lesson {c.id}</p>
                  <h2 className="text-xl leading-tight">{c.title}</h2>
                </div>
                <Bear i={c.bear} size={52} className="shrink-0" />
              </div>
              <p className="mt-3 flex-1 text-base">{c.objective}</p>
              <p className="mt-2 text-sm text-plum2">{L.examples.length} worked examples · {L.widgets.length} interactive tool{L.widgets.length > 1 ? "s" : ""} · {c.topics.join(" · ")}</p>
              <ProgressBar value={loaded ? compProgress(p, c.id).total : 0} label={`Progress in competency ${c.id}`} className="mt-3" />
              <span className="btn mt-3" style={{ background: TONES[c.tone].bg }}>{done ? "✅ Review lesson" : "Start lesson"} ➜</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
