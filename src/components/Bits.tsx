"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { SpeakButton } from "./SpeakButton";
import type { F } from "@/lib/types";
import { Bear, BEARS } from "./Art";
import { COMPS, TONES, type Tone } from "@/content/competencies";

export function Formula({ f, id, big = false }: { f: F; id?: string; big?: boolean }) {
  return (
    <div className="math-box flex flex-wrap items-center justify-between gap-2">
      <div>
        <div className={`math font-semibold ${big ? "text-2xl" : "text-xl"}`}>{f.t}</div>
        {f.n && <div className="text-sm text-plum2">{f.n}</div>}
      </div>
      <SpeakButton id={id ?? `f:${f.t}`} text={f.s} compact label="Hear formula" />
    </div>
  );
}

export function ProgressBar({ value, label, className = "" }: { value: number; label: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className={className}>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function PageHead({ title, sub, bear = 0, children }: { title: string; sub?: string; bear?: number; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-center gap-4">
      <Bear i={bear} size={84} className="anim-wiggle shrink-0" />
      <div className="min-w-0 flex-1">
        <h1 className="page-title">{title}</h1>
        {sub && <p className="mt-1 text-lg text-plum2">{sub}</p>}
        {children}
      </div>
    </header>
  );
}

export function BearTip({ i, text }: { i: number; text: string }) {
  const b = BEARS[i % BEARS.length];
  return (
    <div className="flex items-center gap-3 rounded-3xl border-2 border-white bg-white/70 p-3">
      <Bear i={i} size={56} className="shrink-0" />
      <p className="text-base"><strong>{b.name} says:</strong> {text}</p>
    </div>
  );
}

export function Chip({ children, tone = "lilac" }: { children: ReactNode; tone?: Tone }) {
  return <span className="chip" style={{ background: TONES[tone].soft }}>{children}</span>;
}

export function RewardRules() {
  return (
    <details className="card">
      <summary className="cursor-pointer font-display text-lg font-semibold">⭐ How do I earn stars?</summary>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-base">
        <li><strong>Games:</strong> +1 star for finishing, +1 star for every correct answer, and a +3 star perfect-score bonus.</li>
        <li><strong>Lessons:</strong> finish the knowledge check for +1 star, +1 for every correct answer, and +1 bonus for a perfect check.</li>
        <li><strong>Practice:</strong> +1 for finishing, +1 for each question right on the first try, +2 for mastering every question (after retries), and +3 for a perfect first-try session.</li>
        <li><strong>Replays:</strong> you can always improve! Each activity (and each difficulty level) remembers your best score and only adds the <em>extra</em> stars you earn by beating it, so tapping buttons again never gives duplicate rewards.</li>
        <li><strong>New activities</strong> (a new game, a new difficulty, a new lesson or competency) always open up fresh stars.</li>
        <li>Wrong answers never take stars away. Mistakes are how we learn! 💜</li>
      </ul>
    </details>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="btn btn-white btn-sm">{children}</Link>;
}

export function CompChips({ selected, onToggle, onAll, allLabel = "All" }: { selected: number[]; onToggle: (id: number) => void; onAll: () => void; allLabel?: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose competencies">
      <button type="button" className="chip chip-btn" aria-pressed={selected.length === 0} onClick={onAll}>🌈 {allLabel}</button>
      {COMPS.map((c) => (
        <button key={c.id} type="button" className="chip chip-btn" aria-pressed={selected.includes(c.id)} onClick={() => onToggle(c.id)} title={c.title}>
          {c.icon} {c.id}. {c.short}
        </button>
      ))}
    </div>
  );
}
