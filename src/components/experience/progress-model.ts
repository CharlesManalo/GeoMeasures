export type Progress = {lessons:number[];practiceBest:number;practiceSessions:number;games:string[];review:string[]};
export const GAME_IDS = ["match","units","bearings","builder"] as const;
export const EMPTY_PROGRESS: Progress = {lessons:[],practiceBest:0,practiceSessions:0,games:[],review:[]};
const integer = (value: unknown, max: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(0,Math.min(max,Math.floor(value))) : 0;
export function readProgress(value: unknown, lessonCount: number): Progress {
  if (!value || typeof value !== "object") return {...EMPTY_PROGRESS};
  const p = value as Record<string,unknown>;
  return {
    lessons: Array.isArray(p.lessons) ? [...new Set(p.lessons.filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id>0 && id<=lessonCount))] : [],
    practiceBest:integer(p.practiceBest,10),practiceSessions:integer(p.practiceSessions,1000000),
    games:[...new Set([...(Array.isArray(p.games)?p.games.filter((id): id is string => typeof id === "string" && GAME_IDS.includes(id as typeof GAME_IDS[number])):[]),...(p.gameDone===true?["match"]:[])])],
    review:Array.isArray(p.review)?p.review.filter((id): id is string => typeof id==="string" && /^\d+[ab]$/.test(id)).slice(0,36):[]
  };
}
export const totalStars = (p: Progress) => p.lessons.length*3+p.games.length*5+p.practiceBest;
export function completeLesson(p: Progress, id: number): Progress {return p.lessons.includes(id)?p:{...p,lessons:[...p.lessons,id]};}
export function completeGame(p: Progress, id: string): Progress {return p.games.includes(id)?p:{...p,games:[...p.games,id]};}
export function completePractice(p: Progress, score: number, review: string[]): Progress {return {...p,practiceBest:Math.max(p.practiceBest,integer(score,10)),practiceSessions:p.practiceSessions+1,review};}
