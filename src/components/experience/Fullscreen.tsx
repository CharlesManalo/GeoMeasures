"use client";
import {useEffect,useRef,useState} from "react";
import {Icon} from "./Icon";

export function FullscreenControl(){
 const [active,setActive]=useState(false);
 const [installed,setInstalled]=useState(false);
 const [help,setHelp]=useState(false);
 const [busy,setBusy]=useState(false);
 const button=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const standalone=window.matchMedia("(display-mode: standalone)");
  const fullscreen=window.matchMedia("(display-mode: fullscreen)");
  const sync=()=>{setActive(Boolean(document.fullscreenElement));setInstalled(standalone.matches||fullscreen.matches||Boolean((navigator as Navigator & {standalone?:boolean}).standalone));};
  sync();document.addEventListener("fullscreenchange",sync);standalone.addEventListener("change",sync);fullscreen.addEventListener("change",sync);
  return()=>{document.removeEventListener("fullscreenchange",sync);standalone.removeEventListener("change",sync);fullscreen.removeEventListener("change",sync);};
 },[]);
 useEffect(()=>{if(!help)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape"){setHelp(false);button.current?.focus();}};document.addEventListener("keydown",close);return()=>document.removeEventListener("keydown",close);},[help]);
 async function toggle(){
  if(busy)return;
  if(installed&&!document.fullscreenElement){setHelp(value=>!value);return;}
  if(!document.fullscreenElement&&(!document.fullscreenEnabled||!document.documentElement.requestFullscreen)){setHelp(value=>!value);return;}
  setBusy(true);setHelp(false);
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen({navigationUI:"hide"});}
  catch{setHelp(true);}finally{setBusy(false);}
 }
 return <><button ref={button} className="icon-button fullscreen-toggle" aria-label={active?"Exit fullscreen":installed?"App display information":"Enter fullscreen"} aria-pressed={active||installed} aria-expanded={help} aria-controls="screen-help" disabled={busy} onClick={toggle}><Icon name={active?"contract":"expand"}/></button>{help&&<aside className="screen-help" id="screen-help" aria-label="Fullscreen help"><div><strong>{installed?"You’re in the app view.":"Give learning the whole screen."}</strong><p>{installed?"Your device controls its status and navigation bars. Use the system controls whenever you want to leave.":"If fullscreen is unavailable here, open your browser menu and choose Add to Home Screen or Install app. On iPhone, use Share, then Add to Home Screen. Open the saved icon for the app view."}</p></div><button className="icon-button" aria-label="Close fullscreen help" onClick={()=>{setHelp(false);button.current?.focus();}}><Icon name="close"/></button></aside>}</>;
}
