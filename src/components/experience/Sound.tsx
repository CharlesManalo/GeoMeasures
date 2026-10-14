"use client";
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {Icon} from "./Icon";
type Cue = "tap" | "correct" | "retry" | "reward" | "complete";
const NOTES: Record<Cue,number[]> = {tap:[660],correct:[523.25,659.25,783.99],retry:[330,293.66],reward:[659.25,783.99,1046.5,1318.5],complete:[523.25,659.25,783.99,1046.5]};
const SoundContext = createContext<{enabled:boolean;supported:boolean;toggle:()=>void;play:(cue:Cue)=>void}>({enabled:true,supported:true,toggle:()=>{},play:()=>{}});
export function SoundProvider({children}:{children:ReactNode}) {
  const [enabled,setEnabled]=useState(true); const [supported,setSupported]=useState(true);
  const preference=useRef(true); const context=useRef<AudioContext|null>(null); const lastTap=useRef(0);
  useEffect(()=>{try{const on=localStorage.getItem("geo-measure-sound")!=="off";preference.current=on;setEnabled(on);}catch{}setSupported("AudioContext" in window || "webkitAudioContext" in window);return()=>{void context.current?.close();};},[]);
  const play=useCallback((cue:Cue)=>{
    if(!preference.current || document.hidden) return;
    if(cue==="tap" && performance.now()-lastTap.current<80)return;
    if(cue==="tap")lastTap.current=performance.now();
    try {
      const Audio = window.AudioContext || (window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;
      if(!Audio)return;
      if(!context.current || context.current.state==="closed")context.current=new Audio();
      const audio=context.current;
      const schedule=()=>{const start=audio.currentTime;NOTES[cue].forEach((frequency,i)=>{
        const oscillator=audio.createOscillator();const gain=audio.createGain();const time=start+i*(cue==="tap"?0:.09);const duration=cue==="tap"?.055:.2;
        oscillator.type="sine";oscillator.frequency.setValueAtTime(frequency,time);
        gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(cue==="tap"?.025:.045,time+.008);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
        oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(time);oscillator.stop(time+duration+.015);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
      });};
      if(audio.state==="suspended")void audio.resume().then(schedule).catch(()=>{});else schedule();
    }catch{/* A browser may block audio; visual feedback remains available. */}
  },[]);
  useEffect(()=>{const click=(event:MouseEvent)=>{const target=event.target as Element;if(target.closest("[data-sound='off']"))return;const control=target.closest("button,a,summary,input[type='checkbox']");if(control && !control.hasAttribute("disabled"))play("tap");};const change=(event:Event)=>{const target=event.target as Element;if(target.matches("select,input[type='range']"))play("tap");};document.addEventListener("click",click,true);document.addEventListener("change",change,true);return()=>{document.removeEventListener("click",click,true);document.removeEventListener("change",change,true);};},[play]);
  const toggle=()=>{const next=!preference.current;preference.current=next;setEnabled(next);try{localStorage.setItem("geo-measure-sound",next?"on":"off");}catch{}if(next)play("correct");};
  return <SoundContext.Provider value={{enabled,supported,toggle,play}}>{children}</SoundContext.Provider>;
}
export const useSound=()=>useContext(SoundContext);
export function SoundToggle(){const {enabled,supported,toggle}=useSound();return <button className="icon-button sound-toggle" data-sound="off" onClick={toggle} disabled={!supported} aria-pressed={enabled} aria-label={!supported?"Sound unavailable in this browser":enabled?"Mute sound effects":"Enable sound effects"} title={enabled?"Sound on":"Sound off"}><Icon name={enabled?"sound":"mute"}/></button>;}
