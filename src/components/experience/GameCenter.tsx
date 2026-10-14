"use client";
import Link from "next/link";
import Image from "next/image";
import {useEffect,useState,type ReactNode} from "react";
import {Icon,type IconName} from "./Icon";
import {Mascot,type MascotName} from "./Mascot";
import {useLearningProgress} from "./Progress";
import {useSound} from "./Sound";
import {CompassDiagram,FloorDiagram} from "./VisualLab";
import {SolidSprite} from "./SolidLibrary";
import {angularDistance,format,roomPlan,shuffled} from "./math";

export const GAMES: {id:string;title:string;description:string;skill:string;icon:IconName;mascot:MascotName;tone:string;instructions:string}[]=[
 {id:"match",title:"Formula friends",description:"Bring six ideas and their formulas together.",skill:"Recall & connections",icon:"shapes",mascot:"mimi",tone:"pink",instructions:"Choose a math idea on the left, then its formula on the right. Match all six pairs. You can retry any pair."},
 {id:"units",title:"Unit explorer",description:"Convert measurements in five everyday situations.",skill:"Measurement",icon:"ruler",mascot:"nori",tone:"mint",instructions:"Enter the missing number for each conversion. Use a hint whenever you need it. Solve five to finish."},
 {id:"bearings",title:"Compass quest",description:"Point your compass toward each destination.",skill:"Angles & navigation",icon:"compass",mascot:"luna",tone:"lavender",instructions:"Move the bearing slider clockwise from north to aim at the marked destination. Land within 5° and complete four stops."},
 {id:"builder",title:"Room planner",description:"Measure a room, allow for waste, and price the flooring.",skill:"Area & estimation",icon:"home",mascot:"nori",tone:"blue",instructions:"Work through three planning decisions for one room: area, flooring packs, and cost. Use the measurements and material guide."},
 {id:"time-travel",title:"Time travel",description:"Find the elapsed time between start and finish times.",skill:"Time & elapsed change",icon:"clock",mascot:"luna",tone:"lavender",instructions:"Look at the start and end time, then choose the correct hour and minute values. Complete all ten problems to get your score."},
 {id:"tri-quest",title:"Tri-Quest",description:"Pick the right triangle formula for each problem.",skill:"Triangles & trigonometry",icon:"shapes",mascot:"mimi",tone:"pink",instructions:"Read the triangle prompt, select the matching formula, and check why it fits. Finish the set to earn a perfect score."}
];
function GameIllustration({id,decorative=false}:{id:string;decorative?:boolean}){
 const illustration=id==="time-travel"?{src:"/game-art/time-travel-clock.png",alt:"A purple analog clock with numbered hour marks."}:id==="tri-quest"?{src:"/game-art/tri-quest-cone.png",alt:"A glossy mint-green cone."}:null;
 if(!illustration)return null;
 const size=id==="time-travel"?{width:816,height:768}:{width:840,height:768};
 return <Image className="game-illustration" src={illustration.src} alt={decorative?"":illustration.alt} width={size.width} height={size.height} unoptimized aria-hidden={decorative||undefined}/>;
}
export function GamesPage(){const [game,setGame]=useState<string|null>(null);const [challenge,setChallenge]=useState(false);const {progress}=useLearningProgress();if(game)return <GameSession key={game} id={game} challenge={challenge} onExit={()=>setGame(null)}/>;return <main className="content learning-page refined-page"><header className="page-heading with-mascot"><div><h1>Make room for play.</h1><p>Six ways to put your math into motion. Try, rethink, and discover what clicks.</p></div><Mascot name="mimi" decorative/></header><div className="game-preferences"><div><Icon name="clock"/><div><strong>Your pace, your choice</strong><p>No timer by default. A first completion earns five stars per game.</p></div></div><label className="check-control"><input type="checkbox" checked={challenge} onChange={e=>setChallenge(e.target.checked)}/>Optional 2-minute challenge</label></div><div className="game-catalog">{GAMES.map((g,i)=><article key={g.id} className={`game-tile tone-${g.tone}`}><div className="game-art" aria-hidden="true">{g.id==="bearings"?<CompassDiagram angle={45}/>:g.id==="builder"?<FloorDiagram length={5} width={4}/>:g.id==="match"?<div className="solid-cluster"><SolidSprite index={0}/><SolidSprite index={4}/><SolidSprite index={3}/></div>:g.id==="time-travel"||g.id==="tri-quest"?<GameIllustration id={g.id} decorative/>:<div className="game-symbols">{["cm","m","km"].map(symbol=><span key={symbol}>{symbol}</span>)}</div>}</div><div className="game-tile-copy"><span className="topic-tag"><Icon name={g.icon}/>{g.skill}</span><h2>{g.title}</h2><p>{g.description}</p><button className="button button-dark" onClick={()=>setGame(g.id)}>Play {g.title.toLowerCase()}<Icon name="arrow"/></button>{progress.games.includes(g.id)?<span className="game-earned"><Icon name="check"/>5 stars already earned</span>:<span className="game-earned"><Icon name="star"/>5 stars to discover</span>}</div></article>)}</div></main>;}
function GameSession({id,challenge,onExit}:{id:string;challenge:boolean;onExit:()=>void}){
 const game=GAMES.find(g=>g.id===id)!;const [started,setStarted]=useState(false);const [complete,setComplete]=useState(false);const [seconds,setSeconds]=useState(120);const [timed,setTimed]=useState(challenge);const [paused,setPaused]=useState(false);const [reward,setReward]=useState(0);const [round,setRound]=useState(0);const {saveGame,progress}=useLearningProgress();const {play}=useSound();
 useEffect(()=>{if(!started||complete||!timed||paused||seconds===0)return;const timer=setInterval(()=>{if(!document.hidden)setSeconds(s=>Math.max(0,s-1));},1000);return()=>clearInterval(timer);},[started,complete,timed,paused,seconds===0]);
 const expired=timed&&seconds===0;const [score,setScore]=useState<number|null>(null);const finish=(finalScore?:number)=>{setComplete(true);setScore(finalScore??null);const earned=saveGame(id);setReward(earned);if(!earned)play("complete");};
 const restart=()=>{setComplete(false);setStarted(true);setSeconds(120);setTimed(challenge);setPaused(false);setRound(r=>r+1);};
 return <main className="content game-session refined-page"><button className="back-link" onClick={onExit}><Icon name="arrow"/>All games</button><header className="session-heading"><div><span className="topic-tag"><Icon name={game.icon}/>{game.skill}</span><h1>{game.title}</h1></div>{started&&!complete&&timed&&<div className="timer" aria-label={`${seconds} seconds remaining`}><Icon name="clock"/><span>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")}</span><button className="icon-button" onClick={()=>setPaused(p=>!p)} aria-label={paused?"Resume challenge":"Pause challenge"}><Icon name={paused?"arrow":"clock"}/></button></div>}</header>
 {!started?<section className={`game-instructions tone-${game.tone}`}>{id==="time-travel"||id==="tri-quest"?<GameIllustration id={id}/>:<Mascot name={game.mascot} decorative/>}<div><h2>Here’s how to play</h2><p>{game.instructions}</p><p>{challenge?"You have two minutes. The timer pauses while this tab is hidden. If time runs out, you can continue without it.":"There’s no timer and no penalty for trying again. Use every attempt to learn something."}</p><button className="button button-dark" onClick={()=>setStarted(true)}>Start game<Icon name="arrow"/></button></div></section>:complete?<section className="completion-panel game-completion"><div className="completion-star"><Icon name="star"/></div><h2>{id==="builder"?"A plan you can build on.":id==="bearings"?"You found your direction.":id==="time-travel"?"Time is on your side.":id==="tri-quest"?"You picked the right formula.":"Every connection counts."}</h2>{score!==null&&<p className="game-final-score">Final score: <strong>{score} / 10</strong></p>}<p>{reward?`You earned ${reward} stars. Your completed game is saved on this device.`:"Well played again. Your five stars for this game are already in your collection."}</p><div className="button-row"><button className="button button-dark" onClick={restart}><Icon name="retry"/>Play again</button><button className="button button-white" onClick={onExit}>Choose another game</button></div><Link className="text-link" href={id==="bearings"?"/lessons/13":id==="builder"?"/lessons/18":id==="time-travel"?"/lessons/6":id==="tri-quest"?"/lessons/13":"/lessons"}>Explore the lesson behind it<Icon name="arrow"/></Link></section>:<>
 {(paused||expired)&&<div className="feedback info" role="status"><Icon name="clock"/><div><strong>{expired?"Time is up. Your work is still here.":"Challenge paused."}</strong><p>{expired?"Keep going at your own pace and finish the activity.":"Resume whenever you’re ready."}</p><button className="button button-white" onClick={()=>{if(expired)setTimed(false);setPaused(false);}}>{expired?"Continue without timer":"Resume challenge"}</button></div></div>}
 <fieldset className="game-playfield" disabled={paused||expired} key={round}><legend className="sr-only">{game.title} activity</legend>{id==="match"?<MatchGame onComplete={finish}/>:id==="units"?<UnitsGame onComplete={finish}/>:id==="bearings"?<BearingsGame onComplete={finish}/>:id==="builder"?<BuilderGame onComplete={finish}/>:id==="time-travel"?<TimeTravelGame onComplete={finish}/>:<TriQuestGame onComplete={finish}/>}</fieldset>
 <p className="game-guidance"><Icon name="heart"/>{progress.games.includes(id)?"Replay for practice. Stars for this game are awarded once.":"Trying again is part of learning. Complete the game to earn five stars."}</p></>}
 </main>;
}
const PAIRS=[{term:"Area of a rectangle",formula:"l × w",why:"Area covers a flat surface: multiply length by width."},{term:"Volume of a box",formula:"l × w × h",why:"Volume uses all three dimensions: length, width, and height."},{term:"Perimeter of a square",formula:"4 × side",why:"A square’s boundary has four equal sides."},{term:"Area of a circle",formula:"π × r²",why:"Circle area uses radius squared. Circumference would use 2πr."},{term:"Right triangle",formula:"a² + b² = c²",why:"The two legs’ squares add to the hypotenuse’s square."},{term:"Celsius to Fahrenheit",formula:"(°C × 9/5) + 32",why:"Change the scale by 9/5, then add the 32-degree offset."}];
function MatchGame({onComplete}:{onComplete:()=>void}){const [selected,setSelected]=useState<number|null>(null);const [matched,setMatched]=useState<number[]>([]);const [order]=useState(()=>shuffled([0,1,2,3,4,5]));const [feedback,setFeedback]=useState("Choose an idea, then choose its formula.");const [correct,setCorrect]=useState<boolean|null>(null);const {play}=useSound();function match(id:number){if(selected===null){setCorrect(null);setFeedback("Choose an idea on the left first. Then find its formula.");return;}if(id===selected){const next=[...matched,id];setMatched(next);setSelected(null);setCorrect(true);setFeedback(PAIRS[id].why);play("correct");if(next.length===6)onComplete();}else{setCorrect(false);setFeedback(`Try again. ${PAIRS[selected].why}`);play("retry");}}return <section className="matching-card"><div className="activity-topline"><h2>Find the connection</h2><span>{matched.length} / 6 pairs</span></div><div className="match-columns"><div><h3>The idea</h3>{PAIRS.map((p,i)=><button key={p.term} disabled={matched.includes(i)} aria-pressed={selected===i} className={`${selected===i?"selected":""} ${matched.includes(i)?"matched":""}`} onClick={()=>{setSelected(i);setCorrect(null);setFeedback(`Now choose the formula for ${p.term.toLowerCase()}.`);}}>{p.term}{matched.includes(i)&&<Icon name="check"/>}</button>)}</div><div><h3>The formula</h3>{order.map(i=><button data-sound="off" key={i} disabled={matched.includes(i)} className={matched.includes(i)?"matched":""} onClick={()=>match(i)}>{PAIRS[i].formula}{matched.includes(i)&&<Icon name="check"/>}</button>)}</div></div><Feedback correct={correct}>{feedback}</Feedback></section>;}
const CONVERSIONS=[
 {prompt:"A ribbon is 2.5 m long. Express its length in centimeters.",unit:"cm",answer:250,hint:"Each meter contains 100 centimeters.",explanation:"2.5 × 100 = 250 cm. The length stays the same."},
 {prompt:"A bottle holds 750 mL. How many liters is that?",unit:"L",answer:.75,hint:"Divide milliliters by 1,000.",explanation:"750 ÷ 1,000 = 0.75 L."},
 {prompt:"A garden covers 0.3 hectares. Find its area in square meters.",unit:"m²",answer:3000,hint:"One hectare is 10,000 m².",explanation:"0.3 × 10,000 = 3,000 m²."},
 {prompt:"A bag has a mass of 1.8 kg. Express this in grams.",unit:"g",answer:1800,hint:"There are 1,000 grams in a kilogram.",explanation:"1.8 × 1,000 = 1,800 g."},
 {prompt:"A journey lasts 1.5 hours. How many minutes is that?",unit:"min",answer:90,hint:"Multiply hours by 60.",explanation:"1.5 × 60 = 90 minutes, or one hour and a half."},
 {prompt:"A tank has capacity 0.6 m³. How many liters can it hold?",unit:"L",answer:600,hint:"One cubic meter is 1,000 liters.",explanation:"0.6 × 1,000 = 600 L."},
 {prompt:"A tile has area 0.04 m². Express this in square centimeters.",unit:"cm²",answer:400,hint:"Square the length factor: 100² = 10,000.",explanation:"0.04 × 10,000 = 400 cm². Area needs a squared factor."},
 {prompt:"A runner travels 3.2 km. How many meters is that?",unit:"m",answer:3200,hint:"A kilometer contains 1,000 meters.",explanation:"3.2 × 1,000 = 3,200 m."},
 {prompt:"A board measures 2 feet. Convert its length to centimeters.",unit:"cm",answer:60.96,hint:"One foot is exactly 30.48 cm.",explanation:"2 × 30.48 = 60.96 cm."},
 {prompt:"A temperature is 20°C. What is its Fahrenheit value?",unit:"°F",answer:68,hint:"Multiply by 9/5, then add 32.",explanation:"20 × 9/5 + 32 = 36 + 32 = 68°F."}
];
export function NumericAnswer({prompt,unit,answer,hint,explanation,onNext,last=false}:{prompt:string;unit:string;answer:number;hint:string;explanation:string;onNext:()=>void;last?:boolean}){const [input,setInput]=useState("");const [status,setStatus]=useState<"idle"|"invalid"|"wrong"|"right">("idle");const [showHint,setShowHint]=useState(false);const {play}=useSound();function check(event:React.FormEvent){event.preventDefault();const text=input.trim().replace(/,/g,"");if(!/^-?\d+(\.\d+)?$/.test(text)||!Number.isFinite(Number(text))){setStatus("invalid");return;}const right=Math.abs(Number(text)-answer)<.005;setStatus(right?"right":"wrong");play(right?"correct":"retry");}return <div className="numeric-question"><h2>{prompt}</h2><form onSubmit={check}><label htmlFor="numeric-answer">Your answer in {unit}</label><div className="number-entry"><input id="numeric-answer" value={input} onChange={e=>{setInput(e.target.value);if(status!=="right")setStatus("idle");}} inputMode="decimal" autoComplete="off" maxLength={20} disabled={status==="right"} aria-invalid={status==="invalid"||status==="wrong"} aria-describedby={status!=="idle"?"numeric-feedback":undefined}/><span>{unit}</span></div>{status!=="right"&&<div className="button-row"><button type="submit" data-sound="off" className="button button-dark">Check answer<Icon name="check"/></button><button type="button" className="button button-white" onClick={()=>setShowHint(!showHint)} aria-expanded={showHint}><Icon name="bulb"/>{showHint?"Hide hint":"Show hint"}</button></div>}</form>{showHint&&<p className="hint-panel"><Icon name="bulb"/>{hint}</p>}{status!=="idle"&&<div id="numeric-feedback"><Feedback correct={status==="right"?true:status==="wrong"?false:null}>{status==="invalid"?"Enter a number, such as 250 or 0.75. The unit is already shown.":status==="wrong"?`Not yet. ${hint} Adjust your answer and try again.`:explanation}</Feedback></div>}{status==="right"&&<button className="button button-dark next-answer" onClick={onNext}>{last?"Finish activity":"Next challenge"}<Icon name="arrow"/></button>}</div>;}
function UnitsGame({onComplete}:{onComplete:()=>void}){const [questions]=useState(()=>shuffled(CONVERSIONS).slice(0,5));const [index,setIndex]=useState(0);return <section className="game-workspace"><ActivityProgress current={index} total={5} label="Conversions"/><NumericAnswer key={index} {...questions[index]} last={index===4} onNext={()=>index===4?onComplete():setIndex(i=>i+1)}/></section>;}
function BearingsGame({onComplete}:{onComplete:()=>void}){const [targets]=useState(()=>shuffled([30,60,120,150,210,240,300,330]).slice(0,4));const [index,setIndex]=useState(0);const [angle,setAngle]=useState(0);const [status,setStatus]=useState<null|boolean>(null);const {play}=useSound();const target=targets[index];const quadrant=target<90?"northeast":target<180?"southeast":target<270?"southwest":"northwest";return <section className="game-workspace"><ActivityProgress current={index} total={4} label="Destinations"/><h2>Aim for the marked destination.</h2><p>The destination is {quadrant}. Turn clockwise from north and get within 5°.</p><CompassDiagram angle={angle} target={target}/><div className="lab-slider"><label htmlFor="bearing-control">Your bearing<output>{String(angle).padStart(3,"0")}°</output></label><input id="bearing-control" type="range" min={0} max={355} step={5} value={angle} disabled={status===true} onChange={e=>{setAngle(Number(e.target.value));setStatus(null);}}/></div>{status===true?<><Feedback correct>You found it: {String(target).padStart(3,"0")}°, measured clockwise from north.</Feedback><button className="button button-dark" onClick={()=>{if(index===3)onComplete();else{setIndex(i=>i+1);setAngle(0);setStatus(null);}}}>{index===3?"Finish the journey":"Next destination"}<Icon name="arrow"/></button></>:<><button className="button button-dark" data-sound="off" onClick={()=>{const right=angularDistance(angle,target)<=5;setStatus(right);play(right?"correct":"retry");}}>Check direction<Icon name="compass"/></button>{status===false&&<Feedback correct={false}>Keep turning toward the pink marker. Your bearing is {format(angularDistance(angle,target),0)}° away. East is 090°, south is 180°, and west is 270°.</Feedback>}</>}</section>;}
function BuilderGame({onComplete}:{onComplete:()=>void}){const [size]=useState(()=>shuffled([{length:5,width:4},{length:6,width:3},{length:4,width:4}])[0]);const [step,setStep]=useState(0);const plan=roomPlan(size.length,size.width,10,2,650);const questions=[{prompt:"How much floor area needs covering?",unit:"m²",answer:plan.area,hint:"Area of a rectangle is length × width.",explanation:`${size.length} × ${size.width} = ${plan.area} m². Next, allow for cuts and waste.`},{prompt:"Include 10% extra. How many whole 2 m² packs should you buy?",unit:"packs",answer:plan.packs,hint:`Required area = ${plan.area} × 1.10. Divide by 2, then round up to a whole pack.`,explanation:`${format(plan.required)} m² ÷ 2 = ${format(plan.required/2)} packs. Round up to ${plan.packs} whole packs.`},{prompt:"Each pack costs 650 pesos. What is the total purchase cost?",unit:"pesos",answer:plan.cost,hint:`You need ${plan.packs} packs. Multiply by the price per pack.`,explanation:`${plan.packs} × 650 = ${format(plan.cost)} pesos. Your plan includes enough flooring and its cost.`}];return <section className="game-workspace"><ActivityProgress current={step} total={3} label="Planning steps"/><div className="builder-layout"><div><FloorDiagram {...size}/><dl className="material-guide"><div><dt>Extra allowance</dt><dd>10%</dd></div><div><dt>Coverage per pack</dt><dd>2 m²</dd></div><div><dt>Illustrative pack price</dt><dd>650 pesos</dd></div></dl></div><NumericAnswer key={step} {...questions[step]} last={step===2} onNext={()=>step===2?onComplete():setStep(i=>i+1)}/></div></section>;}
const TIME_PROBLEMS=[
 {start:"8:15 AM",end:"10:45 AM",answerHours:2,answerMinutes:30,explanation:"From 8:15 to 10:15 is 2 hours, then 30 more minutes to 10:45."},
 {start:"9:20 AM",end:"12:05 PM",answerHours:2,answerMinutes:45,explanation:"From 9:20 to 12:20 is 3 hours, so subtract 15 minutes to reach 12:05."},
 {start:"7:40 AM",end:"11:10 AM",answerHours:3,answerMinutes:30,explanation:"From 7:40 to 10:40 is 3 hours, then 30 minutes more to 11:10."},
 {start:"1:25 PM",end:"4:00 PM",answerHours:2,answerMinutes:35,explanation:"From 1:25 to 3:25 is 2 hours, then 35 minutes to 4:00."},
 {start:"10:50 AM",end:"2:20 PM",answerHours:3,answerMinutes:30,explanation:"From 10:50 to 1:50 is 3 hours, then 30 minutes to 2:20."},
 {start:"6:35 AM",end:"9:15 AM",answerHours:2,answerMinutes:40,explanation:"From 6:35 to 8:35 is 2 hours, then 40 minutes to 9:15."},
 {start:"11:45 AM",end:"1:30 PM",answerHours:1,answerMinutes:45,explanation:"From 11:45 to 12:45 is 1 hour, then 45 minutes to 1:30."},
 {start:"2:55 PM",end:"6:10 PM",answerHours:3,answerMinutes:15,explanation:"From 2:55 to 5:55 is 3 hours, then 15 minutes to 6:10."},
 {start:"8:50 PM",end:"12:20 AM",answerHours:3,answerMinutes:30,explanation:"From 8:50 PM to 11:50 PM is 3 hours, then 30 minutes to 12:20 AM the next day."},
 {start:"10:35 PM",end:"2:05 AM",answerHours:3,answerMinutes:30,explanation:"From 10:35 PM to 1:35 AM is 3 hours, then 30 minutes to 2:05 AM."}
];
function minuteOfDay(displayTime:string){
 const match=/^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(displayTime);
 if(!match)throw new Error(`Invalid lesson time: ${displayTime}`);
 const hour=Number(match[1])%12+(match[3]==="PM"?12:0);
 return hour*60+Number(match[2]);
}
function ClockFace({time,label}:{time:number;label:string}){
 const minute=((time%60)+60)%60;
 const hour=(Math.floor(time/60)%12+12)%12;
 const minuteRotation=minute*6;
 const hourRotation=(hour+minute/60)*30;
 return <div className="clock-visual"><svg viewBox="0 0 100 100" role="img" aria-label={`${label}: ${String(hour||12).padStart(2,"0")}:${String(minute).padStart(2,"0")}`}><circle cx="50" cy="50" r="44" className="clock-face"/>{Array.from({length:12},(_,i)=><line key={i} x1="50" y1="9" x2="50" y2={i%3===0?"16":"13"} transform={`rotate(${i*30} 50 50)`} className="clock-tick"/>)}<line x1="50" y1="52" x2="50" y2="27" transform={`rotate(${hourRotation} 50 50)`} className="clock-hand clock-hand-hour"/><line x1="50" y1="52" x2="50" y2="16" transform={`rotate(${minuteRotation} 50 50)`} className="clock-hand clock-hand-minute"/><circle cx="50" cy="50" r="3" className="clock-center"/></svg><span>{label}</span></div>;
}
function ElapsedTimeVisual({start,end,hours,minutes}:{start:string;end:string;hours:number;minutes:number}){
 const startAt=minuteOfDay(start);
 const finishAt=minuteOfDay(end)+(minuteOfDay(end)<startAt?1440:0);
 const targetDuration=finishAt-startAt;
 const guessDuration=hours*60+minutes;
 const guessAt=startAt+guessDuration;
 const guessPercent=Math.min(100,guessDuration/targetDuration*100);
 const nextDay=guessAt>=1440;
 return <div className="elapsed-visual">
  <div className="clock-row"><ClockFace time={startAt} label="Start"/><ClockFace time={guessAt} label={nextDay?"Your time · next day":"Your time"}/><ClockFace time={finishAt} label="Finish"/></div>
  <div className="elapsed-timeline" role="img" aria-label={`Elapsed time visual: your selected time is ${hours} hours and ${minutes} minutes after the start; target is ${targetDuration} minutes`}>
   <div className="elapsed-track"><span style={{width:`${guessPercent}%`}}/><i style={{left:`${guessPercent}%`}}/></div>
   <div className="elapsed-labels"><span>{start}</span><strong>Your elapsed-time estimate</strong><span>{end}{finishAt>=1440?" · next day":""}</span></div>
  </div>
 </div>;
}
function TimeTravelGame({onComplete}:{onComplete:(score?:number)=>void}){
 const [problemIndex,setProblemIndex]=useState(0);
 const [hours,setHours]=useState(0);
 const [minutes,setMinutes]=useState(0);
 const [score,setScore]=useState(0);
 const [status,setStatus]=useState<null|boolean>(null);
 const problem=TIME_PROBLEMS[problemIndex];
 const {play}=useSound();
 const nextProblem=()=>{
  if(problemIndex===TIME_PROBLEMS.length-1){onComplete(score);return;}
  setProblemIndex(i=>i+1);setStatus(null);setHours(0);setMinutes(0);
 };
 const checkAnswer=()=>{
  const correct=hours===problem.answerHours&&minutes===problem.answerMinutes;
  setStatus(correct);if(correct)setScore(s=>s+1);play(correct?"correct":"retry");
 };
 return <section className="game-workspace">
  <ActivityProgress current={problemIndex} total={TIME_PROBLEMS.length} label="Time problems"/>
  <h2>Find the elapsed time</h2><p>Adjust the elapsed-time sliders and watch the clock hands and timeline move. The last two problems cross midnight.</p>
  <div className="time-game-layout">
   <div className="time-readout"><div><span>Initial Time</span><strong>{problem.start}</strong></div><div><span>Final Time</span><strong>{problem.end}</strong></div></div>
   <ElapsedTimeVisual start={problem.start} end={problem.end} hours={hours} minutes={minutes}/>
   <div className="lab-slider"><label htmlFor="time-hours">Hours<output>{hours} {hours===1?"hour":"hours"}</output></label><input id="time-hours" type="range" min={0} max={12} step={1} value={hours} disabled={status===true} onChange={e=>{setHours(Number(e.target.value));setStatus(null);}}/></div>
   <div className="lab-slider"><label htmlFor="time-minutes">Minutes<output>{minutes} min</output></label><input id="time-minutes" type="range" min={0} max={59} step={1} value={minutes} disabled={status===true} onChange={e=>{setMinutes(Number(e.target.value));setStatus(null);}}/></div>
   <p className="time-answer-preview">Your answer: <strong>{hours}h {minutes}m</strong></p>
   {status!==null&&<Feedback correct={status}>{status?`Correct! ${problem.explanation}`:`Not quite. ${problem.explanation}`}</Feedback>}
   {status===true?<button className="button button-dark" onClick={nextProblem}>{problemIndex===TIME_PROBLEMS.length-1?"See your score":"Next problem"}<Icon name="arrow"/></button>:<div className="button-row"><button className="button button-dark" onClick={checkAnswer}>Check answer<Icon name="check"/></button>{status===false&&<button className="button button-white" onClick={nextProblem}>{problemIndex===TIME_PROBLEMS.length-1?"Finish for score":"Skip problem"}<Icon name="arrow"/></button>}</div>}
  </div>
 </section>;
}
const TRI_QUESTIONS=[
 {prompt:"A right triangle has an angle θ. You know the side opposite θ and the hypotenuse. Which ratio finds sin θ?",answer:"SOH — sin θ = opposite ÷ hypotenuse",options:["SOH — sin θ = opposite ÷ hypotenuse","CAH — cos θ = adjacent ÷ hypotenuse","TOA — tan θ = opposite ÷ adjacent","Law of Sines"],explanation:"SOH means sine equals opposite over hypotenuse."},
 {prompt:"A right triangle has an angle θ. You know the adjacent side and the hypotenuse. Which ratio finds cos θ?",answer:"CAH — cos θ = adjacent ÷ hypotenuse",options:["CAH — cos θ = adjacent ÷ hypotenuse","Law of Cosines","Heron’s Formula","Pythagorean Theorem"],explanation:"CAH means cosine equals adjacent over hypotenuse."},
 {prompt:"You know an angle and its opposite side, plus another angle. Which rule can find the other side?",answer:"Law of Sines",options:["Law of Sines","Law of Cosines","Area using Sine","Sum of Interior Angles"],explanation:"The Law of Sines relates each side to the sine of its opposite angle."},
 {prompt:"You know two sides and their included angle and need the third side. Which rule applies?",answer:"Law of Cosines",options:["Law of Cosines","Pythagorean Theorem","SOH","Area of a Triangle"],explanation:"The Law of Cosines handles two sides with their included angle to find the third side."},
 {prompt:"A triangle has sides 7 cm, 8 cm, and 9 cm. Which formula finds its area from all three sides?",answer:"Heron’s Formula",options:["Heron’s Formula","Area using Sine","TOA","Sum of Interior Angles"],explanation:"Heron’s Formula uses the three side lengths and their semiperimeter."},
 {prompt:"A right triangle has legs of 3 cm and 4 cm. Which formula finds the missing hypotenuse?",answer:"Pythagorean Theorem",options:["Pythagorean Theorem","Law of Sines","Area of a Triangle","CAH"],explanation:"The Pythagorean Theorem gives a² + b² = c² for right triangles."},
 {prompt:"What is the sum of the three interior angles in any triangle?",answer:"Interior angle sum = 180°",options:["Interior angle sum = 180°","Area = ½bh","Heron’s Formula","TOA"],explanation:"The interior angles of every triangle add to 180°."},
 {prompt:"A triangle has a base of 10 cm and a height of 6 cm. Which formula finds its area?",answer:"Area of a Triangle = ½bh",options:["Area of a Triangle = ½bh","Area using Sine","Law of Cosines","SOH"],explanation:"Use half the base multiplied by its perpendicular height."},
 {prompt:"You know two sides and their included angle and need the triangle’s area. Which formula fits?",answer:"Area using Sine",options:["Area using Sine","Pythagorean Theorem","CAH","Law of Sines"],explanation:"Area = ½ab sin C uses two sides and their included angle."},
 {prompt:"A triangle is not right-angled. You know two angles and a side opposite one of them. Which rule can find another side?",answer:"Law of Sines",options:["Law of Sines","TOA","Pythagorean Theorem","Area of a Triangle"],explanation:"The Law of Sines works for non-right triangles when an opposite side-angle pair is known."}
];
function TrianglePlayground({rightTriangle}:{rightTriangle:boolean}){
 const [angle,setAngle]=useState(45);
 const [scale,setScale]=useState(160);
 const radians=angle*Math.PI/180;
 const adjacent=scale*Math.cos(radians);
 const opposite=scale*Math.sin(radians);
 const ax=38,ay=192,bx=rightTriangle?ax+adjacent:262,by=192;
 const cx=rightTriangle?bx:ax+adjacent;
 const cy=ay-opposite;
 return <div className="triangle-playground">
  <div className="triangle-diagram">
   <svg viewBox="0 0 300 235" role="img" aria-label={rightTriangle?`Interactive right triangle. Angle theta ${angle} degrees, opposite side ${opposite.toFixed(0)}, adjacent side ${adjacent.toFixed(0)}, hypotenuse ${scale}.`:`Interactive triangle sketch with angle theta ${angle} degrees and adjustable side scale ${scale}.`}>
    <path d={`M ${ax} ${ay} L ${bx} ${by} L ${cx} ${cy} Z`} className="triangle-outline"/>
    {rightTriangle&&<path d={`M ${bx-14} ${by} L ${bx-14} ${by-14} L ${bx} ${by-14}`} className="triangle-right-angle"/>}
    <path d={`M ${ax+28} ${ay} A 28 28 0 0 0 ${ax+28*Math.cos(radians)} ${ay-28*Math.sin(radians)}`} className="triangle-angle-arc"/>
    <text x={ax+35} y={ay-18} className="triangle-angle-label">θ {angle}°</text>
    {rightTriangle?<><text x={(ax+bx)/2-16} y={ay+24} className="triangle-side-label">adjacent</text><text x={bx+7} y={(ay+cy)/2} className="triangle-side-label">opposite</text><text x={(ax+bx)/2-12} y={(ay+cy)/2-8} className="triangle-side-label">hypotenuse</text></>:<><text x={(ax+cx)/2-12} y={(ay+cy)/2-8} className="triangle-side-label">b</text><text x={(bx+cx)/2+4} y={(by+cy)/2} className="triangle-side-label">a</text><text x={(ax+bx)/2-6} y={ay+24} className="triangle-side-label">c</text></>}
   </svg>
  </div>
  <div className="triangle-controls">
   <div className="lab-slider"><label htmlFor="triangle-angle-control">Adjust angle θ<output>{angle}°</output></label><input id="triangle-angle-control" type="range" min={25} max={65} step={1} value={angle} onChange={event=>setAngle(Number(event.target.value))}/></div>
   <div className="lab-slider"><label htmlFor="triangle-scale-control">Adjust side scale<output>{scale}</output></label><input id="triangle-scale-control" type="range" min={120} max={190} step={1} value={scale} onChange={event=>setScale(Number(event.target.value))}/></div>
  </div>
  <p className="triangle-sketch-note">Move either slider to explore how the triangle changes. Sketch is illustrative, not to scale.</p>
 </div>;
}
function TriQuestGame({onComplete}:{onComplete:(score?:number)=>void}){
 const [questions]=useState(()=>shuffled(TRI_QUESTIONS));
 const [questionIndex,setQuestionIndex]=useState(0);
 const [selected,setSelected]=useState<number|null>(null);
 const [score,setScore]=useState(0);
 const [status,setStatus]=useState<null|boolean>(null);
 const question=questions[questionIndex];
 const rightTriangle=question.answer.startsWith("SOH")||question.answer.startsWith("CAH")||question.answer==="Pythagorean Theorem";
 const {play}=useSound();
 const nextQuestion=()=>{if(questionIndex===questions.length-1){onComplete(score);return;}setQuestionIndex(i=>i+1);setSelected(null);setStatus(null);};
 const checkAnswer=()=>{if(selected===null)return;const correct=question.options[selected]===question.answer;setStatus(correct);if(correct)setScore(s=>s+1);play(correct?"correct":"retry");};
 return <section className="game-workspace">
  <ActivityProgress current={questionIndex} total={questions.length} label="Triangle formulas"/>
  <h2>{question.prompt}</h2>
  <TrianglePlayground rightTriangle={rightTriangle}/>
  <div className="formula-option-grid">{question.options.map((option,index)=><button key={option} type="button" disabled={status===true} className={`formula-option ${selected===index?"selected":""}`} aria-pressed={selected===index} onClick={()=>{setSelected(index);setStatus(null);}}>{option}</button>)}</div>
  {status===true?<><Feedback correct>Correct! {question.explanation}</Feedback><button className="button button-dark" onClick={nextQuestion}>{questionIndex===questions.length-1?"See your score":"Next question"}<Icon name="arrow"/></button></>:status===false?<><Feedback correct={false}>Try another choice. {question.explanation}</Feedback><button className="button button-white" onClick={nextQuestion}>{questionIndex===questions.length-1?"Finish for score":"Skip question"}<Icon name="arrow"/></button></>:selected!==null&&<button className="button button-dark" onClick={checkAnswer}>Check answer<Icon name="check"/></button>}
 </section>;
}
export function Feedback({correct=null,children}:{correct?:boolean|null;children:ReactNode}){return <div className={`feedback ${correct===true?"success":correct===false?"retry":"info"}`} role="status"><Icon name={correct===true?"check":correct===false?"retry":"bulb"}/><div>{children}</div></div>;}
export function ActivityProgress({current,total,label}:{current:number;total:number;label:string}){return <div className="activity-progress"><div><span>{label}</span><strong>{current} / {total}</strong></div><div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}><span style={{width:`${current/total*100}%`}}/></div></div>;}
