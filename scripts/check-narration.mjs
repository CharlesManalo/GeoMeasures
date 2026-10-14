import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {LESSONS} from '../src/components/experience/data.ts';
import {splitNarration,speechText} from '../src/components/experience/narration-text.ts';
for(const lesson of LESSONS){
 const metadata=JSON.parse(readFileSync(`public/audio/lessons/lesson-${lesson.id}.json`,'utf8'));
 const sentences=[lesson.title,lesson.concept,'Let’s work it out',lesson.example,...lesson.steps.map(step=>step.detail)].flatMap(splitNarration);
 assert.deepEqual(metadata.sentences,sentences,`Lesson ${lesson.id}: regenerate outdated narration`);
 assert.deepEqual(metadata.spoken,sentences.map(speechText).map(text=>/[.!?]$/u.test(text)?text:`${text}.`));
 assert.equal(metadata.voice,'Luna');
 assert.equal(metadata.durations.length,sentences.length);
 assert(metadata.durations.every(duration=>Number.isFinite(duration)&&duration>0));
 const wav=readFileSync(`public${metadata.audio}`);
 assert.equal(wav.toString('ascii',0,4),'RIFF');
 assert.equal(wav.toString('ascii',8,12),'WAVE');
 assert.equal(wav.readUInt32LE(24),24000);
 let offset=12,dataBytes;
 while(offset+8<=wav.length){const size=wav.readUInt32LE(offset+4);if(wav.toString('ascii',offset,offset+4)==='data'){dataBytes=size;break;}offset+=8+size+(size%2);}
 const expected=metadata.durations.reduce((a,b)=>a+b,0)+metadata.pause*(sentences.length-1);
 assert(Math.abs(dataBytes/48000-expected)<0.002,`Lesson ${lesson.id}: timing mismatch`);
}
console.log(`Verified all ${LESSONS.length} saved lesson WAV files, source text, and sentence timings.`);
