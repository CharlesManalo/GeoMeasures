import {writeFileSync, mkdirSync} from 'node:fs';
import {LESSONS} from '../src/components/experience/data.ts';
import {splitNarration, speechText} from '../src/components/experience/narration-text.ts';
mkdirSync('output', {recursive:true});
const lessons=LESSONS.map(lesson=>{
 const sentences=[lesson.title,lesson.concept,'Let’s work it out',lesson.example,...lesson.steps.map(step=>step.detail)].flatMap(splitNarration);
 return {id:lesson.id,title:lesson.title,sentences,spoken:sentences.map(speechText).map(text=>/[.!?]$/u.test(text)?text:`${text}.`)};
});
writeFileSync('output/lesson-narration.json',JSON.stringify(lessons,null,2));
console.log(`Exported ${lessons.length} Luna narration scripts.`);
