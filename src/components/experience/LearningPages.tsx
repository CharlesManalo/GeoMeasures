"use client";
import Link from "next/link";
import {Fragment,useEffect,useRef,useState} from "react";
import {LESSONS,DEFINITIONS,QUESTION_BANK,TERMS,type Question} from "./data";
import {Icon} from "./Icon";
import {Mascot,type MascotName} from "./Mascot";
import {useLearningProgress} from "./Progress";
import {useSound} from "./Sound";
import {VisualLab} from "./VisualLab";
import {SolidLibrary} from "./SolidLibrary";
import {ActivityProgress,Feedback,GAMES} from "./GameCenter";
import {shuffled} from "./math";
import {splitNarration} from "./narration-text";
export {GamesPage} from "./GameCenter";

function PageIntro({title,description,mascot="luna"}:{title:string;description:string;mascot?:MascotName}){return <header className="page-heading with-mascot"><div><h1>{title}</h1><p>{description}</p></div><Mascot name={mascot} decorative/></header>;}
export function DefinitionsPage(){const [query,setQuery]=useState("");const [category,setCategory]=useState("All");const results=DEFINITIONS.filter(d=>(category==="All"||d.category===category)&&`${d.term} ${d.definition}`.toLowerCase().includes(query.trim().toLowerCase()));return <main className="content learning-page refined-page"><PageIntro title="Let’s speak math." description="Clear definitions and formulas to keep beside your learning." mascot="nori"/><label className="search-field"><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a word, like area or bearing" aria-label="Search definitions"/>{query&&<button className="icon-button" aria-label="Clear search" onClick={()=>setQuery("")}><Icon name="close"/></button>}</label><div className="filter-row" aria-label="Filter definitions">{["All","Geometry","Measurement","Everyday math"].map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><p className="results-count" role="status">{results.length} {results.length===1?"word":"words"} to explore</p><div className="definition-grid">{results.map(d=><article className="definition-card" key={d.term}><span className="topic-tag">{d.category}</span><h2>{d.term}</h2><p>{d.definition}</p><div className="formula-strip">{d.formula}</div></article>)}</div>{!results.length&&<div className="empty-panel"><Icon name="search"/><h2>No matching words.</h2><p>Try “area”, “bearing”, or a different topic.</p><button className="button button-dark" onClick={()=>{setQuery("");setCategory("All");}}>Show all words</button></div>}</main>;}

export function LessonsPage(){const {progress}=useLearningProgress();const [term,setTerm]=useState(1);const [query,setQuery]=useState("");useEffect(()=>{if(new URLSearchParams(window.location.search).get("term")==="2")setTerm(2);},[]);const termLessons=LESSONS.filter(l=>l.term===term);const visible=termLessons.filter(l=>`${l.title} ${l.topic} ${l.concept}`.toLowerCase().includes(query.trim().toLowerCase()));const completed=termLessons.filter(l=>progress.lessons.includes(l.id)).length;return <main className="content learning-page refined-page"><PageIntro title="One idea. Then the next." description="Explore two terms of measurement and geometry through pictures, worked examples, and small discoveries."/><div className="curriculum-layout"><aside className="curriculum-guide"><h2>Your learning path</h2><p>{LESSONS.length} lessons across two terms. Start anywhere, or follow the order below.</p><div className="term-switch" aria-label="Choose curriculum term">{TERMS.map(t=><button key={t.id} aria-pressed={term===t.id} onClick={()=>{setTerm(t.id);setQuery("");}}><span>Term {t.id}</span><strong>{t.title}</strong><span>{LESSONS.filter(l=>l.term===t.id).length} lessons<Icon name="chevron"/></span></button>)}</div><Link href="/practice" className="text-link">Put it into practice<Icon name="arrow"/></Link></aside><section className="curriculum-content" aria-label={`Term ${term} lessons`}><div className="curriculum-title"><div><h2>Term {term}</h2><p>{TERMS[term-1].description}</p></div><span className="completion-count"><Icon name="check"/>{completed} / {termLessons.length} complete</span></div><label className="search-field"><Icon name="search"/><input aria-label="Find a lesson" placeholder="Find a topic in this term" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="lesson-list">{visible.map(lesson=><Link href={`/lessons/${lesson.id}`} key={lesson.id} className="curriculum-row"><span className={`curriculum-number ${progress.lessons.includes(lesson.id)?"done":""}`}>{progress.lessons.includes(lesson.id)?<Icon name="check"/>:String(termLessons.indexOf(lesson)+1).padStart(2,"0")}</span><div><span className="topic-tag">{lesson.topic}<span>{lesson.minutes} min</span></span><h3>{lesson.title}</h3><p>{lesson.intro}</p></div><Icon name="chevron"/></Link>)}</div>{!visible.length&&<div className="empty-panel"><h3>No lessons match that search.</h3><p>Try a shorter phrase or switch terms.</p><button className="button button-white" onClick={()=>setQuery("")}>Clear search</button></div>}</section></div><aside className="curriculum-note"><Icon name="book"/><p>Based on your two-term Measurement and Geometry outline. Each lesson includes an interactive visual, a worked example, and two checks. Examples use illustrative prices and exchange rates.</p></aside></main>;}

function HighlightedLessonText({text,firstSentenceIndex,activeSentence}:{text:string;firstSentenceIndex:number;activeSentence:number}){
 const sentences=splitNarration(text);
 let cursor=0;
 return <>{sentences.map((sentence,index)=>{
  const start=text.indexOf(sentence,cursor);
  const preceding=text.slice(cursor,start);
  cursor=start+sentence.length;
  return <Fragment key={`${firstSentenceIndex+index}-${sentence}`}>{preceding}<span className={`lesson-source-sentence${activeSentence===firstSentenceIndex+index?" active":""}`}>{sentence}</span></Fragment>;
 })}{text.slice(cursor)}</>;
}
function Listen({lessonId,sentences,onActiveSentenceChange}:{lessonId:number;sentences:string[];onActiveSentenceChange:(index:number)=>void}){
 const [state,setState]=useState<"idle"|"loading"|"playing"|"error">("idle");
 const [errorMessage,setErrorMessage]=useState("");
 const player=useRef<HTMLAudioElement|null>(null);
 const request=useRef<AbortController|null>(null);
 const url=useRef<string|null>(null);
 useEffect(()=>()=>{request.current?.abort();player.current?.pause();if(url.current)URL.revokeObjectURL(url.current);},[]);
 async function listen(){
  if(state==="playing"){player.current?.pause();setState("idle");onActiveSentenceChange(-1);return;}
  setState("loading");setErrorMessage("");onActiveSentenceChange(-1);request.current?.abort();request.current=new AbortController();
  const timeout=setTimeout(()=>request.current?.abort(),60000);
  try{
   const response=await fetch(`/audio/lessons/lesson-${lessonId}.json`,{signal:request.current.signal});
   if(!response.ok)throw new Error("The saved narration is unavailable. Please reload and try again.");
   const metadata=await response.json();
   const durations=metadata?.durations;
   const pause=metadata?.pause;
   if(JSON.stringify(metadata.sentences)!==JSON.stringify(sentences))throw new Error("The lesson was updated. Its narration needs to be regenerated.");
   if(!Array.isArray(durations)||durations.length!==sentences.length||durations.some((duration:number)=>!Number.isFinite(duration)||duration<=0)||!Number.isFinite(pause)||pause<0){
    throw new Error("Saved narration timing is unavailable. Please reload and try again.");
   }
   let cursor=0;
   const timings=durations.map((duration:number)=>{const timing={start:cursor,end:cursor+duration};cursor=timing.end+pause;return timing;});
   if(url.current)URL.revokeObjectURL(url.current);
   const clip=await fetch(metadata.audio,{signal:request.current.signal});
   if(!clip.ok)throw new Error("The saved audio could not be loaded. Please try again.");
   url.current=URL.createObjectURL(await clip.blob());
   const audio=new Audio(url.current);
   player.current=audio;
   const updateHighlight=()=>{if(player.current!==audio)return;const current=audio.currentTime;onActiveSentenceChange(audio.paused?-1:timings.findIndex(timing=>current>=timing.start&&current<timing.end));};
   audio.ontimeupdate=updateHighlight;
   audio.onseeked=updateHighlight;
   audio.onended=()=>{setState("idle");onActiveSentenceChange(-1);};
   audio.onerror=()=>{setState("error");setErrorMessage("Your browser could not play this audio. Please try again.");onActiveSentenceChange(-1);};
   await audio.play();
   setState("playing");
  }catch(error){
   setState("error");
   setErrorMessage(error instanceof Error?error.message:"Unexpected narration error.");
   onActiveSentenceChange(-1);
   console.error("Lesson narration failed:",error);
  }finally{clearTimeout(timeout);}
 }
 return <div className="listen-control">
  <button className="button button-white" data-sound="off" onClick={listen} disabled={state==="loading"}>
   <Icon name="sound"/>{state==="loading"?"Preparing narration…":state==="playing"?"Stop narration":state==="error"?"Retry narration":"Listen with Luna"}
  </button>
  {state==="error"&&<p role="status">{errorMessage}</p>}
 </div>;
}

export function LessonPage({id}:{id:number}){
 const lesson=LESSONS.find(l=>l.id===id)!;
 const {progress,saveLesson,loaded}=useLearningProgress();
 const [index,setIndex]=useState(0);
 const [finished,setFinished]=useState(false);
 const [earned,setEarned]=useState(0);
 const [activeNarrationSentence,setActiveNarrationSentence]=useState(-1);
 const next=LESSONS.find(l=>l.id===id+1);
 const narrationParts=[lesson.title,lesson.concept,"Let’s work it out",lesson.example,...lesson.steps.map(step=>step.detail)];
 let nextSentenceIndex=0;
 const narrationStarts=narrationParts.map(part=>{
  const start=nextSentenceIndex;
  nextSentenceIndex+=splitNarration(part).length;
  return start;
 });
 const narrationSentences=narrationParts.flatMap(splitNarration);
 function narratedText(text:string,partIndex:number){
  return <HighlightedLessonText text={text} firstSentenceIndex={narrationStarts[partIndex]} activeSentence={activeNarrationSentence}/>;
 }
 function advance(){if(index===lesson.checks.length-1){setEarned(saveLesson(id));setFinished(true);}else setIndex(i=>i+1);}
 return <main className="content lesson-detail refined-page">
  <Link href="/lessons" className="back-link"><Icon name="arrow"/>All lessons</Link>
  <header className="lesson-heading">
   <div className="lesson-meta"><span>Term {lesson.term}</span><span><Icon name="clock"/>{lesson.minutes} min</span>{progress.lessons.includes(id)&&<span><Icon name="check"/>Completed</span>}</div>
   <h1>{narratedText(lesson.title,0)}</h1>
   <p>{lesson.intro}</p>
   <div className="lesson-tools"><Listen key={id} lessonId={id} sentences={narrationSentences} onActiveSentenceChange={setActiveNarrationSentence}/><a href="#lesson-check" className="text-link">Jump to the checks<Icon name="arrow"/></a></div>
  </header>
  <div className="lesson-goals"><Icon name="target"/><div><h2>By the end, you can…</h2><ul>{lesson.goals.map(goal=><li key={goal}>{goal}</li>)}</ul></div></div>
  <VisualLab lessonId={id}/>{(id===3||id===4)&&<SolidLibrary volume={id===4}/>}
  <div className="lesson-reading-layout">
   <div className="lesson-reading">
    <section><h2>The idea behind it</h2><p>{narratedText(lesson.concept,1)}</p></section>
    <section className="worked-example">
     <h2>{narratedText("Let’s work it out",2)}</h2>
     <p className="example-problem">{narratedText(lesson.example,3)}</p>
     <ol>{lesson.steps.map((step,stepIndex)=><li key={step.title}><h3>{step.title}</h3><p>{narratedText(step.detail,4+stepIndex)}</p></li>)}</ol>
    </section>
    <aside className="misconception"><Icon name="bulb"/><div><h3>Watch for this</h3><p>{lesson.mistake}</p></div></aside>
   </div>
   <aside className="formula-reference"><h2>Keep these handy</h2><p>Your formula reference</p>{lesson.formulas.map((f,i)=><details key={f.label} open={i===0}><summary>{f.label}<Icon name="chevron"/></summary><div><p className="formula-value">{f.value}</p>{f.note&&<p>{f.note}</p>}</div></details>)}<Link href="/definitions" className="text-link">Open the glossary<Icon name="arrow"/></Link></aside>
  </div>
  <section id="lesson-check" className="lesson-check-section">
   <div className="check-intro"><Mascot name="luna" decorative/><div><h2>Make the idea yours.</h2><p>Two checks to put it into practice. Read the feedback and try again whenever you need to.</p><span><Icon name="star"/>{progress.lessons.includes(id)?"Your 3 stars are already saved":"Earn 3 stars when you finish"}</span></div></div>
   {finished?<div className="lesson-success" role="status"><Icon name="check"/><h3>Lesson complete.</h3><p>{earned?"Three stars earned. You worked through both checks.":"Both checks complete. Your previous stars are safe."}</p><div className="button-row"><Link className="button button-dark" href={next?`/lessons/${next.id}`:"/progress"}>{next?"Next lesson":"See your progress"}<Icon name="arrow"/></Link><Link href="/games" className="button button-white">Try a game</Link></div>{next&&<p className="next-lesson-name">Up next: {next.title}</p>}</div>:<div className="lesson-question"><ActivityProgress current={index} total={2} label="Knowledge checks"/><QuestionCard key={lesson.checks[index].id} question={lesson.checks[index]} allowRetry onNext={advance} nextLabel={index===1?"Complete lesson":"Next check"} ready={loaded}/></div>}
  </section>
  <p className="lesson-source">Curriculum: supplied Measurement and Geometry outline. <a href="https://www.nist.gov/pml/owm/si-units-volume" target="_blank" rel="noreferrer">SI reference</a> and <a href="https://openstax.org/books/precalculus-2e/pages/8-key-equations" target="_blank" rel="noreferrer">triangle formula reference</a>.</p>
 </main>;
}

function QuestionCard({question,allowRetry=false,onNext,onAnswer,nextLabel="Next question",ready=true}:{question:Question;allowRetry?:boolean;onNext:()=>void;onAnswer?:(correct:boolean)=>void;nextLabel?:string;ready?:boolean}){const [selected,setSelected]=useState<number|null>(null);const [checked,setChecked]=useState(false);const [hint,setHint]=useState(false);const {play}=useSound();const correct=selected===question.answer;const locked=checked&&(correct||!allowRetry);function check(){if(selected===null)return;setChecked(true);onAnswer?.(correct);play(correct?"correct":"retry");}return <div className="question-card"><h3>{question.prompt}</h3><div className="answer-options" role="group" aria-label="Answer choices">{question.options.map((option,i)=><button key={option} disabled={locked} aria-pressed={selected===i} className={`${selected===i?"selected":""} ${checked&&selected===i?(correct?"correct":"incorrect"):""} ${checked&&!allowRetry&&i===question.answer?"correct":""}`} onClick={()=>{setSelected(i);setChecked(false);}}><span className="answer-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>{checked&&i===question.answer&&(correct||!allowRetry)&&<Icon name="check"/>}</button>)}</div>{checked&&<Feedback correct={correct}><strong>{correct?"That’s right. ":"Let’s look at why. "}</strong>{question.explanation}{!correct&&allowRetry&&<p>Choose a different answer, then check again.</p>}</Feedback>}{hint&&!checked&&<p className="hint-panel"><Icon name="bulb"/>{question.hint}</p>}{locked?<button className="button button-dark" onClick={onNext} disabled={!ready}>{nextLabel}<Icon name="arrow"/></button>:<div className="button-row"><button className="button button-dark" data-sound="off" disabled={selected===null||!ready||checked} onClick={check}>Check answer<Icon name="check"/></button><button className="button button-white" aria-expanded={hint} onClick={()=>setHint(!hint)}><Icon name="bulb"/>{hint?"Hide hint":"Show hint"}</button></div>}</div>;}

type PracticeQuestion = typeof QUESTION_BANK[number];
export function PracticePage(){const [term,setTerm]=useState("all");const [questions,setQuestions]=useState<PracticeQuestion[]>([]);const [index,setIndex]=useState(0);const [answers,setAnswers]=useState<boolean[]>([]);const [finished,setFinished]=useState(false);const [reward,setReward]=useState(0);const {savePractice,progress,loaded}=useLearningProgress();const {play}=useSound();const score=answers.filter(Boolean).length;function start(){const pool=QUESTION_BANK.filter(q=>term==="all"||String(q.term)===term);setQuestions(shuffled(pool).slice(0,10));setIndex(0);setAnswers([]);setFinished(false);}function next(){if(index===questions.length-1){const gain=savePractice(score,questions.filter((_,i)=>!answers[i]).map(q=>q.id));setReward(gain);setFinished(true);if(!gain)play("complete");}else setIndex(i=>i+1);}return <main className="content learning-page refined-page practice-page"><PageIntro title="A little practice goes far." description="Connect the ideas, learn from each answer, and find your next step." mascot="nori"/>{!questions.length?<section className="practice-setup"><div className="practice-plan"><Icon name="practice"/><h2>Ten questions. Your own pace.</h2><p>Each round draws a fresh mix from the lesson checks. Hints are available, and every answer comes with an explanation.</p><ul className="plain-checks"><li><Icon name="check"/>No timer or lost lives</li><li><Icon name="check"/>Review the questions you missed</li><li><Icon name="star"/>Stars grow with your personal best</li></ul></div><div className="practice-controls"><h3>What would you like to practice?</h3><div className="filter-row" aria-label="Practice term">{[{id:"all",label:"Both terms"},{id:"1",label:"Term 1"},{id:"2",label:"Term 2"}].map(t=><button key={t.id} aria-pressed={term===t.id} onClick={()=>setTerm(t.id)}>{t.label}</button>)}</div><p className="best-score">Your best: <strong>{progress.practiceBest} / 10</strong></p><button className="button button-dark" onClick={start} disabled={!loaded}>Start practice<Icon name="arrow"/></button></div></section>:finished?<><section className="practice-results"><div className="completion-star"><Icon name="trophy"/></div><h2>{score} out of 10.</h2><p>{score===10?"Every idea connected. Beautiful work.":"Every answer gives you a clearer place to begin."}</p><span className="result-reward">{reward?`+${reward} stars for your new personal best`:`Personal best: ${progress.practiceBest} / 10`}</span><div className="button-row"><button className="button button-dark" onClick={start}><Icon name="retry"/>Try a fresh round</button><button className="button button-white" onClick={()=>setQuestions([])}>Change topics</button></div></section>{score<10&&<section className="practice-review"><h2>Your next discoveries</h2><p>Revisit these explanations and open the lesson for a visual walkthrough.</p>{questions.map((q,i)=>!answers[i]&&<article key={q.id}><h3>{q.prompt}</h3><p><strong>Answer: {q.options[q.answer]}</strong></p><p>{q.explanation}</p><Link className="text-link" href={`/lessons/${q.lessonId}`}>Review {LESSONS.find(l=>l.id===q.lessonId)?.title}<Icon name="arrow"/></Link></article>)}</section>}</>:<section className="practice-quiz"><ActivityProgress current={index} total={questions.length} label={`Question ${index+1} of ${questions.length}`}/><div className="quiz-context"><span>Term {questions[index].term} · {questions[index].topic}</span><span>{score} correct</span></div><QuestionCard key={questions[index].id} question={questions[index]} onAnswer={right=>setAnswers(previous=>{const next=[...previous];next[index]=right;return next;})} onNext={next} nextLabel={index===questions.length-1?"See my results":"Next question"}/></section>}</main>;}

export function ProgressPage(){const {progress,stars,activities,storageAvailable}=useLearningProgress();const percent=Math.round(progress.lessons.length/LESSONS.length*100);const badges=[{title:"First discovery",description:"Complete a lesson",earned:progress.lessons.length>0,icon:"book" as const},{title:"Playful thinker",description:"Finish a game",earned:progress.games.length>0,icon:"game" as const},{title:"Keep practicing",description:"Finish a practice round",earned:progress.practiceSessions>0,icon:"practice" as const},{title:"Both terms explored",description:`Complete all ${LESSONS.length} lessons`,earned:progress.lessons.length===LESSONS.length,icon:"trophy" as const}];const review=LESSONS.filter(l=>l.checks.some(q=>progress.review.includes(q.id)));return <main className="content learning-page refined-page"><PageIntro title="Look how far you’ve come." description="Your stars, your discoveries, and the next step in your learning story." mascot="mimi"/><div className="progress-summary tone-lavender"><div><Icon name="star"/><strong>{stars}</strong><span>stars earned</span></div><div><Icon name="check"/><strong>{activities}</strong><span>activities finished</span></div><div><Icon name="trophy"/><strong>{percent}%</strong><span>lessons complete</span></div></div><section className="milestones"><h2>Small wins worth keeping.</h2><div className="badge-grid">{badges.map(b=><article key={b.title} className={`achievement ${b.earned?"earned":""}`}><span><Icon name={b.icon}/></span><h3>{b.title}</h3><p>{b.description}</p><small>{b.earned?"Earned":"Still to discover"}</small></article>)}</div></section>{review.length>0&&<section className="review-suggestions"><h2>A good place to revisit</h2><p>From your latest practice round.</p>{review.map(l=><Link key={l.id} href={`/lessons/${l.id}`}>{l.title}<Icon name="arrow"/></Link>)}</section>}<div className="progress-paths">{TERMS.map(term=><section key={term.id} className="lesson-journey"><h2>Term {term.id}</h2><p>{term.title}</p>{LESSONS.filter(l=>l.term===term.id).map(l=><Link href={`/lessons/${l.id}`} key={l.id}><span className={progress.lessons.includes(l.id)?"path-done":""}>{progress.lessons.includes(l.id)?<Icon name="check"/>:String(l.id).padStart(2,"0")}</span><strong>{l.title}</strong><Icon name="chevron"/></Link>)}</section>)}</div><section className="game-progress"><h2>Your game collection</h2>{GAMES.map(g=><div key={g.id}><Icon name={g.icon}/><span>{g.title}</span><strong>{progress.games.includes(g.id)?"5 stars earned":"Ready to explore"}</strong></div>)}<Link href="/games" className="text-link">Choose a game<Icon name="arrow"/></Link></section><p className="device-note">{storageAvailable?"Progress and sound preferences are saved in this browser on this device.":"Browser storage is unavailable. Progress works for this visit, but may not be saved after you close it."}</p></main>;}
