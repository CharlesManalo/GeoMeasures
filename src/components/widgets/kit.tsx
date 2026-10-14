"use client";
import { useId, type ReactNode } from "react";

export function Slider({ label, value, min, max, step = 1, onChange, unit = "" }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 font-bold">
        <span>{label}</span>
        <span className="math text-lg">{value}{unit}</span>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={`${value}${unit}`} />
    </div>
  );
}

export function Panel({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return (
    <section className="card" aria-label={title}>
      <h3 className="text-xl">🧪 {title}</h3>
      {hint && <p className="mb-3 text-sm text-plum2">{hint}</p>}
      {children}
    </section>
  );
}

export function Steps({ items }: { items: ReactNode[] }) {
  return <ol className="mt-2 list-decimal space-y-1 pl-6">{items.map((s, i) => <li key={i}>{s}</li>)}</ol>;
}

export function Tabs({ tabs, value, onChange }: { tabs: [string, string][]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3 flex flex-wrap gap-2" role="tablist">
      {tabs.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={value === k} aria-pressed={value === k} className="chip chip-btn" onClick={() => onChange(k)}>{label}</button>)}
    </div>
  );
}

export const Note = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <p role="status" className={`mt-3 p-3 font-semibold ${ok ? "ok-box" : "no-box"}`}>{ok ? "✅ " : "⚠️ "}{children}</p>
);
