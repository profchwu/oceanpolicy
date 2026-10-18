import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const dir=path.resolve('.sites-runtime/news-tests');fs.mkdirSync(dir,{recursive:true});
for(const name of ['news-missions','news-flow','news-assessment']){const src=fs.readFileSync(`lib/${name}.ts`,'utf8');const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace("'./news-flow'","'./news-flow.mjs'").replace("'./news-missions'","'./news-missions.mjs'");fs.writeFileSync(path.join(dir,name+'.mjs'),js);}
const f=await import(pathToFileURL(path.join(dir,'news-flow.mjs')));const {MISSIONS}=await import(pathToFileURL(path.join(dir,'news-missions.mjs')));
let time=1000,r=f.makeRun('test');assert.equal(f.stage(r,time),'news');assert.equal(f.choose(r,0,time,'en'),r);assert.deepEqual(f.outcomes(r,0),[null,null,null]);
for(let level=0;level<3;level++){
 assert.equal(f.stage(r,time),'news');r=f.enter(r,time);assert.equal(f.stage(r,time),'policy');assert.equal(f.nextRound(r,time),r);
 r=f.choose(r,0,time,'en');assert.equal(f.stage(r,time),'impact');assert.equal(f.choose(r,1,time,'en'),r);
 assert.deepEqual(f.valuesAt(r,level,time),MISSIONS[level].initial);assert.equal(f.actionProgress(r.rounds[level].actions[0],time+2500),0);
 r=JSON.parse(JSON.stringify(r));assert.equal(f.stage(r,time+6000),'impact');r=f.acknowledge(r,time+100);assert.equal(f.actionProgress(r.rounds[level].actions[0],time+2600),.5);assert.equal(f.stage(r,time+4999),'building');assert.equal(f.stage(r,time+5100),'monitor');
 time+=5100;r=f.choose(r,0,time,'en');r=f.acknowledge(r,time);assert.equal(f.stage(r,time),'adapt');assert.equal(f.acknowledge(r,time),r);
 r=f.choose(r,0,time,'en');r=f.acknowledge(r,time);time+=5000;assert.equal(f.stage(r,time),'report');assert.ok(f.achieved(f.valuesAt(r,level,time),level));assert.deepEqual(f.outcomes(r,level),[1,1,1]);
 r=f.nextRound(r,time);if(level<2)assert.equal(r.rounds[level+1].openedAt,null);
}
assert.equal(f.stage(r,time),'results');assert.equal(time-1000,30300);
// All deliberate harmful/ineffective routes miss environmental targets.
for(let level=0;level<3;level++){let x=f.makeRun('wrong');x.current=level;x=f.enter(x,1000);for(const [step,choice] of [[0,1],[1,1],[2,1]]){x=f.choose(x,choice,1000+step*5000,'zh-Hant');x=f.acknowledge(x,1000+step*5000);}assert.ok(!f.achieved(f.valuesAt(x,level,20000),level));assert.deepEqual(f.outcomes(x,level),[0,0,0]);}
let x=f.enter(f.makeRun('timeout'),1000);x=f.choose(x,0,600000,'en');assert.equal(f.stage(x,601000),'results');assert.deepEqual(f.valuesAt(x,0,601000),f.valuesAt(x,0,999999));assert.equal(f.choose(x,1,601000,'en'),x);assert.deepEqual(f.outcomes(x,0),[1,null,null]);
console.log('PASS: all three news gates, five-second transitions, acknowledgement/reload, no idle timers, correct/harmful outcomes, missing data and deadline freeze.');

const {assessment}=await import(pathToFileURL(path.join(dir,'news-assessment.mjs')));
assert.equal(assessment(null).change,null);
assert.equal(assessment(r).pre,100);assert.equal(assessment(r).post,100);assert.equal(assessment(r).change,0);
const mixed=structuredClone(r);mixed.rounds[0].actions.forEach(a=>a.choice=1);
assert.equal(assessment(mixed).pre,0);assert.equal(assessment(mixed).post,100);assert.equal(assessment(mixed).change,100);
mixed.rounds[2].actions=[];assert.equal(assessment(mixed).post,null);assert.equal(assessment(mixed).change,null);
const decline=structuredClone(r);decline.rounds[1].actions.forEach(a=>a.choice=1);decline.rounds[2].actions.forEach(a=>a.choice=1);
assert.equal(assessment(decline).change,-100);assert.equal(assessment(decline).validatedPrePost,false);
console.log('PASS: pilot score formulas, complete/missing pairs, zero baseline and negative change.');
// Direct-effects flow: only two player decisions; the event is automatic and unscored.
let direct={...f.makeRun('direct'),flow:'direct-effects-1'};let dt=1000;
for(let level=0;level<3;level++){
 direct=f.enter(direct,dt);direct=f.acknowledge(f.choose(direct,0,dt,'en'),dt);dt+=5000;
 assert.equal(f.choose(direct,0,dt,'en'),direct,'Removed evidence question cannot be answered');
 const prior=f.valuesAt(direct,level,dt);
 direct=f.revealEvent(direct,dt,'en');assert.equal(f.stage(direct,dt),'adapt');
 assert.equal(direct.rounds[level].actions[1].automatic,true);
 assert.deepEqual(f.outcomes(direct,level),[1,null,null]);
 assert.equal(f.revealEvent(direct,dt,'en'),direct,'Event occurs once');
 const event=f.actionOutcome(direct,level,1,dt);assert.deepEqual(event.before,prior.map(Math.round));
 direct=f.acknowledge(f.choose(direct,0,dt,'en'),dt);dt+=5000;
 assert.equal(f.stage(direct,dt),'report');assert.deepEqual(f.outcomes(direct,level),[1,null,1]);
 direct=f.nextRound(direct,dt);
}
assert.equal(assessment(direct).variables.length,2);assert.equal(assessment(direct).pre,100);assert.equal(assessment(direct).post,100);
const directMixed=structuredClone(direct);directMixed.rounds[0].actions[2].choice=1;
assert.equal(assessment(directMixed).pre,50);assert.equal(assessment(directMixed).change,50);
console.log('PASS: direct-effects flow has six scored decisions, three unscored events, no evidence choice, and two-variable summaries.');
const {missionsFor}=await import(pathToFileURL(path.join(dir,'news-missions.mjs')));
let coral={...f.makeRun('coral'),flow:'direct-effects-1',missionOrder:'reef-grass-wind'};let ct=1000;
assert.deepEqual(missionsFor(coral).map(m=>m.id),['reef','grass','wind']);
assert.deepEqual(missionsFor(direct).map(m=>m.id),['wind','grass','reef']);
for(let level=0;level<3;level++){
 const m=missionsFor(coral)[level];assert.deepEqual(f.valuesAt(coral,level,ct),m.initial);
 coral=f.enter(coral,ct);coral=f.acknowledge(f.choose(coral,0,ct,'en'),ct);ct+=5000;
 assert.deepEqual(f.actionOutcome(coral,level,0,ct).delta,m.options[0][0].delta);
 coral=f.revealEvent(coral,ct,'en');coral=f.acknowledge(f.choose(coral,0,ct,'en'),ct);ct+=5000;
 assert.ok(f.achieved(f.valuesAt(coral,level,ct),level,coral));coral=f.nextRound(coral,ct);
}
assert.equal(assessment(coral).pre,100);assert.equal(assessment(coral).post,100);
console.log('PASS: coral-first identity, initial values, policy deltas, success targets, scoring, and historical order.');

assert.deepEqual(missionsFor({missionOrder:'reef-wind-grass'}).map(m=>m.id),['reef','wind','grass']);
assert.deepEqual(missionsFor(null).map(m=>m.id),['reef','grass','wind']);
