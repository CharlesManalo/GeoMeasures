"use client";
import { useState } from "react";
import { setNickname, useProfile } from "@/lib/progress";

export function NickEditor() {
  const { p } = useProfile();
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  if (!edit) {
    return (
      <p className="flex flex-wrap items-center gap-2 font-semibold">
        Hi, <strong className="font-display text-xl">{p.nickname}</strong>!
        <button type="button" className="btn btn-white btn-sm" onClick={() => { setVal(p.nickname); setErr(""); setEdit(true); }}>✏️ Change nickname</button>
      </p>
    );
  }
  return (
    <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (setNickname(val)) setEdit(false); else setErr("Use 2 to 16 letters, numbers, spaces, _ or -"); }}>
      <label className="font-bold">Nickname (not your real name)
        <input className="field mt-1 w-56" maxLength={16} value={val} onChange={(e) => setVal(e.target.value)} autoFocus />
      </label>
      <button className="btn btn-mint btn-sm" type="submit">Save</button>
      <button className="btn btn-white btn-sm" type="button" onClick={() => setEdit(false)}>Cancel</button>
      {err && <span role="alert" className="w-full font-bold text-[#a14a14]">{err}</span>}
    </form>
  );
}
