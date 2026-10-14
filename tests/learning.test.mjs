import test from 'node:test';
import assert from 'node:assert/strict';
import {LESSONS,QUESTION_BANK} from '../src/components/experience/data.ts';
import {bearing,angularDistance,roomPlan,shuffled} from '../src/components/experience/math.ts';
import {readProgress,totalStars,completeLesson,completeGame,completePractice} from '../src/components/experience/progress-model.ts';

test('both supplied terms have complete, distinct learning activities',()=>{
 assert.equal(LESSONS.length,18);
 assert.equal(LESSONS.filter(l=>l.term===1).length,8);
 assert.equal(LESSONS.filter(l=>l.term===2).length,10);
 assert.equal(QUESTION_BANK.length,36);
 assert.equal(new Set(QUESTION_BANK.map(q=>q.id)).size,36);
 for(const lesson of LESSONS){
  assert.ok(lesson.formulas.length && lesson.steps.length===3 && lesson.goals.length>=2,lesson.title);
  for(const q of lesson.checks){assert.ok(q.answer>=0&&q.answer<q.options.length);assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.hint&&q.explanation);}
 }
 assert.match(LESSONS[12].formulas[1].value,/atan2/);
 assert.match(LESSONS[17].steps[2].detail,/2,700/);
});
test('bearings handle all quadrants, cardinal directions, and zero displacement',()=>{
 for(const [east,north,expected] of [[0,1,0],[1,0,90],[0,-1,180],[-1,0,270],[1,1,45],[-1,1,315],[-1,-1,225],[1,-1,135]]) assert.equal(bearing(east,north),expected);
 assert.equal(bearing(0,0),null);
 assert.equal(angularDistance(355,0),5);
 assert.equal(angularDistance(5,355),10);
});
test('flooring allowances round up packs before pricing',()=>{
 assert.deepEqual(roomPlan(5,4,10,2,650),{area:20,required:22,packs:11,cost:7150});
 const plan=roomPlan(6,3,10,2,650);assert.equal(plan.packs,10);assert.equal(plan.cost,6500);
 assert.equal(roomPlan(4,4,10,2,650).packs,9);
});
test('legacy progress is retained and malformed saved values are bounded',()=>{
 const migrated=readProgress({lessons:[1,9,10,10,99,'2'],practiceBest:8,practiceSessions:3,gameDone:true},18);
 assert.deepEqual(migrated.lessons,[1,9,10]);assert.deepEqual(migrated.games,['match']);assert.equal(totalStars(migrated),22);
 const invalid=readProgress({lessons:[],practiceBest:Infinity,practiceSessions:-4,games:['match','match','unknown'],review:[null,3,'1a']},18);
 assert.equal(invalid.practiceBest,0);assert.equal(invalid.practiceSessions,0);assert.deepEqual(invalid.games,['match']);assert.deepEqual(invalid.review,['1a']);
});
test('replaying lessons and games cannot farm stars; practice awards only an improved best',()=>{
 let p=readProgress(null,18);p=completeLesson(p,18);p=completeLesson(p,18);assert.equal(totalStars(p),3);
 p=completeGame(p,'units');p=completeGame(p,'units');assert.equal(totalStars(p),8);
 p=completePractice(p,8,['1a']);p=completePractice(p,4,['2b']);assert.equal(totalStars(p),16);assert.equal(p.practiceSessions,2);assert.deepEqual(p.review,['2b']);
 p=completePractice(p,10,[]);assert.equal(totalStars(p),18);
});
test('practice shuffle leaves the source bank untouched and keeps every item once',()=>{
 const input=[1,2,3,4,5];const result=shuffled(input,()=>.2);assert.deepEqual(input,[1,2,3,4,5]);assert.deepEqual([...result].sort(),input);assert.notDeepEqual(result,input);
});
