"use client";
import {createContext,useContext,useEffect,useRef,useState,type CSSProperties,type ReactNode} from "react";
import {LESSONS} from "./data";
import {completeGame,completeLesson,completePractice,EMPTY_PROGRESS,readProgress,totalStars,type Progress} from "./progress-model";
import {useSound} from "./Sound";
import {Icon} from "./Icon";
type Reward={id:number;amount:number;title:string};
type Context={progress:Progress;loaded:boolean;storageAvailable:boolean;saveLesson:(id:number)=>number;savePractice:(score:number,review?:string[])=>number;saveGame:(id?:string)=>number;stars:number;activities:number;reward:Reward|null};
const ProgressContext=createContext<Context>({progress:EMPTY_PROGRESS,loaded:false,storageAvailable:true,saveLesson:()=>0,savePractice:()=>0,saveGame:()=>0,stars:0,activities:0,reward:null});
export function ProgressProvider({children}:{children:ReactNode}){
 const [progress,setProgress]=useState(EMPTY_PROGRESS);const [loaded,setLoaded]=useState(false);const [storageAvailable,setStorageAvailable]=useState(true);const [reward,setReward]=useState<Reward|null>(null);const current=useRef(EMPTY_PROGRESS);const ready=useRef(false);const counter=useRef(0);const {play}=useSound();
 useEffect(()=>{try{const raw=localStorage.getItem("geo-measure-progress-v3")??localStorage.getItem("geo-measure-progress-v2");current.current=readProgress(JSON.parse(raw||"null"),LESSONS.length);setProgress(current.current);}catch{setStorageAvailable(false);}ready.current=true;setLoaded(true);},[]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem("geo-measure-progress-v3",JSON.stringify(progress));}catch{setStorageAvailable(false);}},[progress,loaded]);
 useEffect(()=>{if(!reward)return;const timer=setTimeout(()=>setReward(null),4500);return()=>clearTimeout(timer);},[reward]);
 function commit(next:Progress,title:string){if(!ready.current)return 0;const amount=totalStars(next)-totalStars(current.current);current.current=next;setProgress(next);if(amount>0){setReward({id:++counter.current,amount,title});play("reward");}return amount;}
 const saveLesson=(id:number)=>LESSONS.some(l=>l.id===id)?commit(completeLesson(current.current,id),"Lesson complete"):0;
 const saveGame=(id="match")=>commit(completeGame(current.current,id),"Adventure complete");
 const savePractice=(score:number,review:string[]=[])=>commit(completePractice(current.current,score,review),"A new practice best");
 return <ProgressContext.Provider value={{progress,loaded,storageAvailable,saveLesson,savePractice,saveGame,stars:totalStars(progress),activities:progress.lessons.length+progress.practiceSessions+progress.games.length,reward}}>{children}<div className="reward-live" role="status" aria-live="polite" aria-atomic="true">{reward&&<div className="reward-toast" key={reward.id}><span className="reward-medal"><Icon name="star"/>{Array.from({length:8},(_,i)=><Icon key={i} name="star" className="reward-particle" style={{"--angle":`${i*45}deg`,"--distance":`${32+i%3*9}px`} as CSSProperties}/>)}</span><div><strong>+{reward.amount} {reward.amount===1?"star":"stars"} earned</strong><span>{reward.title}</span></div><button className="icon-button" aria-label="Dismiss reward" onClick={()=>setReward(null)}><Icon name="close"/></button></div>}</div></ProgressContext.Provider>;
}
export const useLearningProgress=()=>useContext(ProgressContext);
