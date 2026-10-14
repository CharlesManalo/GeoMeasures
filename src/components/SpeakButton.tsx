"use client";
import { pauseAudio, resumeAudio, speak, stopAudio, useAudio } from "@/lib/speech";

/** Reusable narration control used everywhere: listen / pause / resume / replay / stop with visible status. */
export function SpeakButton({ id, text, label = "Listen", compact = false, className = "" }: { id: string; text: string; label?: string; compact?: boolean; className?: string }) {
  const a = useAudio();
  const mine = a.id === id;
  const status = mine ? a.status : "idle";
  const finished = !mine && a.finishedId === id;
  if (a.checked && !a.supported) {
    return (
      <button type="button" disabled className={`btn btn-white btn-sm ${className}`} title="Audio is not supported in this browser" aria-label="Audio unavailable in this browser">
        🔇 {compact ? "" : "Audio unavailable"}
      </button>
    );
  }
  const sm = "btn btn-sm";
  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      {status === "idle" && (
        <button type="button" className={`${sm} ${finished ? "btn-mint" : "btn-purple"}`} onClick={() => speak(id, text)} aria-label={`${finished ? "Replay" : label} audio`}>
          {finished ? "🔁" : "🔊"} {compact ? "" : finished ? "Replay" : label}
        </button>
      )}
      {status === "playing" && (
        <>
          <button type="button" className={`${sm} btn-sun`} onClick={pauseAudio} aria-label="Pause audio">⏸ {compact ? "" : "Pause"}</button>
          <button type="button" className={`${sm} btn-white`} onClick={stopAudio} aria-label="Stop audio">⏹ {compact ? "" : "Stop"}</button>
          <span className="inline-flex h-5 items-end gap-[3px]" aria-hidden="true"><i className="eq-bar" /><i className="eq-bar" /><i className="eq-bar" /></span>
        </>
      )}
      {status === "paused" && (
        <>
          <button type="button" className={`${sm} btn-mint`} onClick={resumeAudio} aria-label="Resume audio">▶ {compact ? "" : "Resume"}</button>
          <button type="button" className={`${sm} btn-white`} onClick={() => speak(id, text)} aria-label="Replay from the start">🔁 {compact ? "" : "Replay"}</button>
          <button type="button" className={`${sm} btn-white`} onClick={stopAudio} aria-label="Stop audio">⏹ {compact ? "" : "Stop"}</button>
        </>
      )}
      <span className="sr-live" role="status" aria-live="polite">
        {status === "playing" ? "Audio playing" : status === "paused" ? "Audio paused" : finished ? "Audio finished" : ""}
      </span>
      {!compact && status === "paused" && <span className="text-sm font-bold">Paused</span>}
      {!compact && finished && <span className="text-sm font-bold text-[#1f7a58]">✓ Finished</span>}
      {mine && a.error && <span className="text-sm font-bold text-[#a14a14]">{a.error}</span>}
    </span>
  );
}
