await import('./test-news-flow.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {makeRun,enter,choose,acknowledge,revealEvent,nextRound,stage,valuesAt,actionOutcome,outcomes}=await import('../.sites-runtime/news-tests/news-flow.mjs');
const {assessment}=await import('../.sites-runtime/news-tests/news-assessment.mjs');
// Independent scoring oracle: treatment/conditions/grid + appropriate response
// are option 0 in each question. Other choices are scored 0, not missing.
const rows=[];
for(const language of ['zh-Hant','en'])for(let route=0;route<729;route++){
 let code=route,choices=Array.from({length:6},()=>{const c=code%3;code=Math.floor(code/3);return c;}),now=1000;
 let r={...makeRun('branch-'+route),flow:'direct-effects-1',missionOrder:'reef-grass-wind'};
 const expected=choices.map(c=>Number(c===0));
 for(let level=0;level<3;level++){
  assert.equal(stage(r,now),'news');r=enter(r,now);
  for(const step of [0,2]){
   if(step===2){r=revealEvent(r,now,language);assert.equal(stage(r,now),'adapt');assert.equal(outcomes(r,level)[1],null);}
   const before=valuesAt(r,level,now);
   r=acknowledge(choose(r,choices[level*2+(step===2?1:0)],now,language),now);
   assert.equal(stage(r,now+4999),'building');assert.equal(nextRound(r,now),r);
   const result=actionOutcome(r,level,step,now);
   assert.deepEqual(result.before,before.map(Math.round));
   now+=5000;
   assert.deepEqual(valuesAt(r,level,now).map(Math.round),result.after);
   assert.deepEqual(result.delta,result.after.map((n,i)=>n-result.before[i]));
   assert.ok(result.after.every(n=>n>=0&&n<=100));
   assert.equal(stage(r,now),step===0?'monitor':'report');
   r=JSON.parse(JSON.stringify(r)); // resume preserves score and stage
  }
  assert.deepEqual(outcomes(r,level),[expected[level*2],null,expected[level*2+1]]);
  r=nextRound(r,now);
 }
 const a=assessment(r),levels=[0,1,2].map(i=>(expected[i*2]+expected[i*2+1])*50);
 assert.equal(stage(r,now),'results');assert.deepEqual(a.levelScores,levels);
 assert.equal(a.pre,levels[0]);assert.equal(a.post,(levels[1]+levels[2])/2);assert.equal(a.change,a.post-a.pre);
 assert.equal(a.variables.length,2);
 for(let i=0;i<2;i++){assert.equal(a.variables[i].pre,expected[i]*100);assert.equal(a.variables[i].post,(expected[i+2]+expected[i+4])*50);assert.equal(a.variables[i].change,a.variables[i].post-a.variables[i].pre);}
 const incomplete=structuredClone(r);incomplete.rounds[2].actions.pop();assert.equal(assessment(incomplete).post,null);assert.equal(assessment(incomplete).change,null);
 rows.push({language,choices,levelScores:levels,pre:a.pre,post:a.post,change:a.change});
}
fs.writeFileSync('.sites-runtime/news-tests/all-branches.json',JSON.stringify({combinations:729,languages:2,replays:rows.length,rows},null,2));
console.log('PASS: 729 complete routes x 2 languages = 1458 replays; 8748 decisions, five-second gates, reload, missing answers, individual/overall pre/post scores and signed gains.');
