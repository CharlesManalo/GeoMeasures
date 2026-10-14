"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BANK } from "@/content/bank";
import { COMPS, TONES } from "@/content/competencies";
import { Bear } from "./Art";
import { PageHead, ProgressBar, RewardRules } from "./Bits";
import { NickEditor } from "./ProfileBits";
import { SpeakButton } from "./SpeakButton";
import { useAudio } from "@/lib/speech";
import {
  accuracy, activitiesDone, badges, compProgress, createProfile, deleteProfile, gamesTried, lessonsDone, overallProgress, resetActive, setShare, switchProfile, totalStars, useProfile,
} from "@/lib/progress";

interface Row { nickname: string; stars: number; activities: number }

export function ProgressView() {
  const { p, loaded, store } = useProfile();
  const audio = useAudio();
  const [tab, setTab] = useState<"local" | "shared">("local");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [newName, setNewName] = useState("");
  const [nameErr, setNameErr] = useState("");

  const load = useCallback(() => {
    setErr("");
    fetch("/api/leaderboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { ok: boolean; rows: Row[] }) => { if (d.ok) setRows(d.rows); else setErr("The shared leaderboard is not available right now."); })
      .catch(() => setErr("Couldn’t reach the shared leaderboard. Check your connection."));
  }, []);
  useEffect(() => { if (tab === "shared") load(); }, [tab, load]);

  const stars = loaded ? totalStars(p) : 0;
  const acc = accuracy(p);
  const bs = loaded ? badges(p) : [];
  const local = Object.values(store.profiles).map((x) => ({ id: x.id, nickname: x.nickname, stars: totalStars(x), acts: activitiesDone(x) })).sort((a, b) => b.stars - a.stars || b.acts - a.acts);
  const masteredN = Object.keys(p.mastered).length;
  const optOut = () => {
    setShare(false);
    fetch("/api/leaderboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: p.code }) }).then(() => load()).catch(() => undefined);
  };
  const optIn = () => { setShare(true); setTimeout(load, 2500); };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <PageHead title="Your Stars, Progress, and Rankings" sub="See how far you’ve come, collect badges and check the leaderboards." bear={8} />

      <section className="grid gap-5 lg:grid-cols-3" aria-label="Summary">
        <div className="card lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["⭐", "Total stars", stars, "#ffe89a"], ["📓", "Lessons done", `${loaded ? lessonsDone(p) : 0}/10`, "#e3f6ec"], ["🎮", "Games tried", `${loaded ? gamesTried(p) : 0}/10`, "#ffe9f2"], ["✏️", "Practice sessions", loaded ? p.practiceCount : 0, "#e4f4fd"]].map(([i, l, v, bg]) => (
              <div key={String(l)} className="rounded-2xl p-3 text-center" style={{ background: String(bg) }}><div className="text-2xl" aria-hidden="true">{i}</div><div className="font-display text-3xl">{v}</div><div className="text-sm font-bold">{l}</div></div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-3"><div className="text-sm font-bold">Overall progress</div><div className="font-display text-2xl">{Math.round((loaded ? overallProgress(p) : 0) * 100)}%</div><ProgressBar value={loaded ? overallProgress(p) : 0} label="Overall progress" /></div>
            <div className="rounded-2xl bg-white p-3"><div className="text-sm font-bold">Answer accuracy (first tries)</div><div className="font-display text-2xl">{acc.t ? `${acc.pct}%` : "—"}</div><div className="text-xs text-plum2">{acc.c} right of {acc.t} answered</div></div>
            <div className="rounded-2xl bg-white p-3"><div className="text-sm font-bold">Practice questions mastered</div><div className="font-display text-2xl">{masteredN} / {BANK.length}</div><ProgressBar value={masteredN / BANK.length} label="Questions mastered" /></div>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl">🐻 Student profile</h2>
          <div className="mt-2">{loaded && <NickEditor />}</div>
          <p className="mt-3 text-sm">Anonymous student code: <strong className="math">{loaded ? p.code : "…"}</strong><br /><span className="text-plum2">No real names or personal details are collected. Use a nickname or this code.</span></p>
        </div>
      </section>

      <section className="card mt-6" aria-labelledby="bdg">
        <h2 id="bdg" className="text-2xl">🏅 Achievement badges ({bs.filter((b) => b.earned).length}/{bs.length})</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {bs.map((b) => (
            <li key={b.id} className={`rounded-2xl p-3 text-center ${b.earned ? "bg-[#fff5cf]" : "bg-white opacity-70"}`}>
              <div className={`text-4xl ${b.earned ? "" : "grayscale"}`} aria-hidden="true">{b.earned ? b.emoji : "🔒"}</div>
              <div className="font-display text-lg">{b.label}</div>
              <div className="text-sm">{b.desc}</div>
              <div className="mt-1 text-xs font-bold">{b.earned ? "✓ Earned" : "Locked"}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-6" aria-labelledby="cprog">
        <h2 id="cprog" className="text-2xl">📊 Progress in all 10 competencies</h2>
        <ul className="mt-3 space-y-4">
          {COMPS.map((c) => {
            const pr = compProgress(p, c.id);
            const a = p.acc[c.id];
            const m = Object.keys(p.mastered).filter((id) => id.startsWith(`c${c.id}-`)).length;
            const n = BANK.filter((q) => q.comp === c.id).length;
            return (
              <li key={c.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold"><span className="mr-1 inline-grid h-8 w-8 place-items-center rounded-full" style={{ background: TONES[c.tone].bg }}>{c.icon}</span> {c.id}. {c.title}</span>
                  <span className="font-display text-xl">{Math.round(pr.total * 100)}%</span>
                </div>
                <ProgressBar value={pr.total} label={`Progress in competency ${c.id}`} className="mt-1" />
                <p className="mt-1 text-sm text-plum2">Lesson {pr.lesson ? "✓" : "not yet"} · Games {Math.round(pr.game * 100)}% · Practice mastered {m}/{n} · First-try accuracy {a && a.t ? `${Math.round((a.c / a.t) * 100)}% (${a.c}/${a.t})` : "—"} · <Link className="underline" href={`/lessons/${c.id}`}>Lesson</Link> · <Link className="underline" href={`/practice?c=${c.id}`}>Practice</Link></p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card mt-6" aria-labelledby="rank">
        <h2 id="rank" className="text-2xl">🏆 Rankings</h2>
        <div className="mt-2 flex gap-2" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "local"} className="chip chip-btn" aria-pressed={tab === "local"} onClick={() => setTab("local")}>💻 This device</button>
          <button type="button" role="tab" aria-selected={tab === "shared"} className="chip chip-btn" aria-pressed={tab === "shared"} onClick={() => setTab("shared")}>🌐 Shared online</button>
        </div>
        {tab === "local" ? (
          <>
            <p className="mt-3 rounded-2xl bg-[#e4f4fd] p-3 text-sm font-semibold">This ranking is <strong>local to this browser and device</strong>. It only lists students who use this device (use “Add a student” below so classmates can share an iPad or laptop). It is not an online leaderboard.</p>
            <Table rows={local.map((r) => ({ nickname: r.nickname, stars: r.stars, activities: r.acts, me: r.id === p.id }))} />
          </>
        ) : (
          <>
            <p className="mt-3 rounded-2xl bg-[#e4f4fd] p-3 text-sm font-semibold">The <strong>shared leaderboard</strong> is stored in the website’s database and shows only students who chose to join, using nicknames. Stars are sent from each student’s browser and are not verified, so treat it as a friendly classroom board.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {p.share ? <button type="button" className="btn btn-white btn-sm" onClick={optOut}>Leave the shared leaderboard</button> : <button type="button" className="btn btn-mint btn-sm" onClick={optIn}>Join with my nickname “{p.nickname}”</button>}
              <button type="button" className="btn btn-white btn-sm" onClick={load}>🔄 Refresh</button>
              <span className="text-sm font-semibold">{p.share ? "You are sharing your nickname, star total and activity count." : "You are not sharing. Nothing is sent unless you join."}</span>
            </div>
            {err ? <p role="alert" className="mt-3 font-bold text-[#a14a14]">{err}</p> : rows === null ? <p className="mt-3">Loading…</p> : rows.length === 0 ? <p className="mt-3 font-semibold">Nobody has joined yet. Be the first!</p> : <Table rows={rows.map((r) => ({ ...r, me: p.share && r.nickname === p.nickname }))} />}
          </>
        )}
      </section>

      <section className="card mt-6" aria-labelledby="stu">
        <h2 id="stu" className="text-2xl">👭 Students on this device</h2>
        <ul className="mt-2 space-y-2">
          {local.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-2">
              <span className="min-w-0 flex-1 font-bold">{r.nickname} {r.id === p.id ? "(you)" : ""} · ⭐ {r.stars}</span>
              {r.id !== p.id && <button type="button" className="btn btn-purple btn-sm" onClick={() => switchProfile(r.id)}>Switch to this student</button>}
              {local.length > 1 && <button type="button" className="btn btn-white btn-sm" onClick={() => { if (window.confirm(`Delete ${r.nickname} and all of their progress on this device?`)) deleteProfile(r.id); }}>Delete</button>}
            </li>
          ))}
        </ul>
        <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (createProfile(newName)) { setNewName(""); setNameErr(""); } else setNameErr("Use 2 to 16 letters, numbers, spaces, _ or -"); }}>
          <label className="font-bold">Add a student (nickname only)<input className="field mt-1 w-60" maxLength={16} value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
          <button type="submit" className="btn btn-mint btn-sm">➕ Add student</button>
          {nameErr && <span role="alert" className="font-bold text-[#a14a14]">{nameErr}</span>}
        </form>
        <p className="mt-3 text-sm text-plum2">Progress is saved in this browser’s localStorage: it survives page changes and refreshes, but clearing browser data or using another device starts fresh.</p>
        <button type="button" className="btn btn-white btn-sm mt-3" onClick={() => { if (window.confirm(`Reset all progress for ${p.nickname}? This cannot be undone.`)) { if (p.share) optOut(); resetActive(); } }}>♻️ Reset {p.nickname}’s progress</button>
      </section>

      <section className="card mt-6" aria-labelledby="hist">
        <h2 id="hist" className="text-2xl">🕒 Recent activity and practice sessions</h2>
        {p.log.length === 0 ? <p className="mt-2">No activities yet.</p> : (
          <ul className="mt-2 space-y-1">{p.log.slice(0, 10).map((l, i) => <li key={i} className="flex justify-between gap-2 rounded-xl bg-white px-3 py-1.5 text-sm"><span>{l.kind === "lesson" ? "📓" : l.kind === "game" ? "🎮" : "✏️"} {l.label}</span><strong>{l.earned > 0 ? `+${l.earned} ⭐` : "no new stars"}</strong></li>)}</ul>
        )}
        {p.practice.length > 0 && (
          <>
            <h3 className="mt-4 text-lg">Practice results (first-attempt accuracy vs. mastery)</h3>
            <ul className="mt-1 space-y-1">{[...p.practice].reverse().slice(0, 6).map((s, i) => <li key={i} className="rounded-xl bg-white px-3 py-1.5 text-sm">{new Date(s.at).toLocaleDateString()} · {s.total} questions · first try {Math.round((s.first / s.total) * 100)}% · mastery after retries {Math.round((s.mastered / s.total) * 100)}% · {s.attempts} attempts</li>)}</ul>
          </>
        )}
      </section>

      <section className="card mt-6" aria-labelledby="aud">
        <h2 id="aud" className="text-2xl">🔊 Audio narration</h2>
        {!audio.checked ? <p className="mt-2">Checking your device…</p> : !audio.supported ? <p className="mt-2 font-semibold text-[#a14a14]">Audio narration is not supported in this browser. Every explanation is still written on screen. Try a recent version of Chrome, Edge, Safari or Firefox.</p> : (
          <>
            <p className="mt-2">Voice in use: <strong>{audio.voiceName}</strong> ({audio.voiceLang}){audio.likelyFemale ? " — a female-sounding English voice." : audio.hasEnglishVoice ? " — the best English voice this device offers (it may not sound female)." : " — no English voice found, so your device’s default voice is used."}</p>
            <p className="mt-1 text-sm text-plum2">GEO MEASURE uses your browser’s built-in text-to-speech and picks one English female-sounding voice when your device has one. Voices differ between devices; no recordings or paid services are used.</p>
            <div className="mt-3"><SpeakButton id="audio:test" text="Hello! I am your Geo Measure reader. Surface area equals two pi r squared plus two pi r h. Let's learn together!" label="Hear a sample" /></div>
          </>
        )}
      </section>

      <div className="mt-6"><RewardRules /></div>
      <div className="mt-6 flex justify-center"><Bear i={9} size={90} className="anim-float" /></div>
    </div>
  );
}

function Table({ rows }: { rows: { nickname: string; stars: number; activities: number; me?: boolean }[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[22rem] text-left">
        <caption className="sr-only">Ranking by total stars</caption>
        <thead><tr className="border-b-2 border-lav"><th className="p-2">Rank</th><th className="p-2">Student</th><th className="p-2">⭐ Stars</th><th className="p-2">Activities</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.nickname}-${i}`} className={r.me ? "bg-[#fff5cf] font-bold" : ""}>
              <td className="p-2">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""} {i + 1}</td>
              <td className="p-2">{r.nickname}{r.me ? " (you)" : ""}</td>
              <td className="p-2">{r.stars}</td>
              <td className="p-2">{r.activities}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-plum2">Ranked by total stars, then by number of completed activities.</p>
    </div>
  );
}
