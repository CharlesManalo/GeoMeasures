"use client";
import {useEffect,useId,useRef,useState,type ReactNode} from "react";
import {Icon} from "./Icon";
import {SolidSprite} from "./SolidLibrary";
import type {GeometryConfig,SolidKind,createGeometryRenderer} from "./geometry-renderer";

type Props=Omit<GeometryConfig,"yaw"|"pitch"|"wireframe"|"paused"|"interacting">&{label:string;fallback:ReactNode;compact?:boolean};
export function GeometryScene({label,fallback,compact=false,...model}:Props){
 const [yaw,setYaw]=useState(-.48),[pitch,setPitch]=useState(.12),[wireframe,setWireframe]=useState(false);
 const [paused,setPaused]=useState(false),[interacting,setInteracting]=useState(false),[reduced,setReduced]=useState(false);
 const [status,setStatus]=useState<"waiting"|"ready"|"fallback">("waiting");
 const canvas=useRef<HTMLCanvasElement>(null);const view=useRef<HTMLDivElement>(null);
 const engine=useRef<ReturnType<typeof createGeometryRenderer>|null>(null);
 const current=useRef<GeometryConfig>({...model,yaw,pitch,wireframe,paused,interacting});current.current={...model,yaw,pitch,wireframe,paused:paused||reduced,interacting};
 const drag=useRef<{id:number;x:number;y:number}|null>(null);const hint=useId();
 useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");const sync=()=>setReduced(media.matches);sync();media.addEventListener("change",sync);return()=>media.removeEventListener("change",sync);},[]);
 useEffect(()=>{
  let disposed=false,started=false;
  const observer=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting)||started)return;started=true;observer.disconnect();
   void import("./geometry-renderer").then(module=>{if(disposed||!canvas.current)return;try{engine.current=module.createGeometryRenderer(canvas.current,current.current);setStatus("ready");}catch{setStatus("fallback");}}).catch(()=>{if(!disposed)setStatus("fallback");});
  },{rootMargin:"180px"});
  if(view.current)observer.observe(view.current);
  const lost=(event:Event)=>{event.preventDefault();if(!disposed)setStatus("fallback");};
  const element=canvas.current;element?.addEventListener("webglcontextlost",lost);
  return()=>{disposed=true;observer.disconnect();element?.removeEventListener("webglcontextlost",lost);engine.current?.dispose();engine.current=null;};
 },[]);
 useEffect(()=>{engine.current?.update(current.current);},[model.kind,model.size,model.height,model.radius,model.unfold,model.fill,yaw,pitch,wireframe,paused,interacting,reduced]);
 return <div className={`geometry-scene ${compact?"geometry-scene-compact":""}`} data-render-state={status}>
  <div className="geometry-viewport" ref={view}>
   <canvas ref={canvas} className={status==="ready"?"geometry-canvas is-ready":"geometry-canvas"} role="img" aria-label={label} aria-describedby={hint} aria-hidden={status!=="ready"} tabIndex={status==="ready"?0:-1} data-yaw={yaw.toFixed(3)} data-model={model.kind}
    onKeyDown={event=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;event.preventDefault();if(event.key==="ArrowLeft"||event.key==="ArrowRight")setYaw(angle=>angle+(event.key==="ArrowLeft"?-.2:.2));else setPitch(angle=>Math.max(-.8,Math.min(.8,angle+(event.key==="ArrowUp"?-.15:.15))));}}
    onPointerDown={event=>{if(status!=="ready"||event.button!==0)return;setInteracting(true);drag.current={id:event.pointerId,x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}}
    onPointerMove={event=>{const previous=drag.current;if(!previous||previous.id!==event.pointerId)return;setYaw(angle=>angle+(event.clientX-previous.x)*.014);if(event.pointerType!=="touch")setPitch(angle=>Math.max(-.8,Math.min(.8,angle+(event.clientY-previous.y)*.008)));drag.current={id:event.pointerId,x:event.clientX,y:event.clientY};}}
    onPointerUp={()=>{drag.current=null;setInteracting(false);}} onPointerCancel={()=>{drag.current=null;setInteracting(false);}} onLostPointerCapture={()=>{drag.current=null;setInteracting(false);}}/>
   {status!=="ready"&&<div className="geometry-fallback">{fallback}</div>}
  </div>
  <p id={hint} className="geometry-hint">{status==="ready"?"Drag to explore, or focus the model and use arrow keys.":status==="waiting"?"Preparing the 3D view…":"2D view on this device. Measurement controls still work."}</p>
  {status==="ready"&&<div className="geometry-toolbar" aria-label="3D view controls">
   <button className="geometry-wireframe" disabled={reduced} aria-pressed={paused||reduced} onClick={()=>setPaused(value=>!value)}><Icon name={paused||reduced?"play":"pause"}/>{reduced?"Motion reduced":paused?"Resume motion":"Pause motion"}</button>
   <button className="geometry-wireframe" aria-pressed={wireframe} onClick={()=>setWireframe(value=>!value)}><Icon name="shapes"/>Edges</button>
  </div>}
 </div>;
}

const CHOICES:{kind:SolidKind;name:string;fact:string;index:number}[]=[
 {kind:"cube",name:"Cube",fact:"6 square faces. 12 edges. 8 vertices.",index:0},
 {kind:"cylinder",name:"Cylinder",fact:"2 circular bases and 1 curved surface.",index:2},
 {kind:"pyramid",name:"Pyramid",fact:"A square base and 4 triangular faces.",index:5}
];
export function DashboardGeometry(){const [selected,setSelected]=useState(0);const shape=CHOICES[selected];return <section className="dashboard-geometry" aria-label="Explore geometry in 3D"><GeometryScene compact kind={shape.kind} label={`Rotatable ${shape.name.toLowerCase()} model`} fallback={<SolidSprite index={shape.index}/>}/><div className="geometry-choices" role="group" aria-label="Choose a 3D solid">{CHOICES.map((choice,index)=><button key={choice.kind} aria-pressed={selected===index} onClick={()=>setSelected(index)}>{choice.name}</button>)}</div><p className="geometry-fact" aria-live="polite">{shape.fact}</p></section>;}
