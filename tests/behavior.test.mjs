import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';
const out=path.resolve('.sites-runtime/behavior-tests');fs.mkdirSync(out,{recursive:true});
for(const name of ['island-simulation','behavior-model','behavior-score','behavior-copy','behavior-content']){
 const source=ts.transpileModule(fs.readFileSync(`lib/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");
 fs.writeFileSync(path.join(out,name+'.mjs'),source);
}
const M=await import(pathToFileURL(path.join(out,'behavior-model.mjs'))),S=await import(pathToFileURL(path.join(out,'behavior-score.mjs'))),C=await import(pathToFileURL(path.join(out,'behavior-content.mjs'))),I=await import(pathToFileURL(path.join(out,'behavior-copy.mjs')));
const start=Date.parse('2026-10-12T00:00:00.000Z');
const Island=await import(pathToFileURL(path.join(out,'island-simulation.mjs')));
test('rescue goals depend on actual infrastructure and budget choices',()=>{
 const built=Island.islandState('wind',['survey','turbine']);assert.equal(built.power,false);assert.equal(built.event,true);
 const connected=Island.islandState('wind',['survey','turbine','cable']);assert.equal(connected.power,true);assert.equal(connected.won,false);
 const won=Island.islandState('wind',['survey','turbine','cable','battery']);assert.equal(won.won,true);assert.equal(won.budget,0);
 const lost=Island.islandState('wind',['report','survey','turbine','cable']);assert.equal(lost.over,true);assert.equal(lost.won,false);assert.equal(lost.budget,1);
 assert.throws(()=>Island.islandState('wind',['survey','survey']));assert.throws(()=>Island.islandState('wind',['survey','turbine','cable','battery','report']));
});
test('water quality and site evidence determine meadow growth; heat persists at a protected reef',()=>{
 const wrong=Island.islandState('grass',['plant','expand']);assert.equal(wrong.grass,1);assert.equal(wrong.pollution,4);
 const restored=Island.islandState('grass',['survey','filter','plant','sample']);assert.equal(restored.won,true);assert.ok(restored.grass>=3);assert.ok(restored.pollution<2);
 const reef=Island.islandState('reef',['treat','sensor','patrol']);assert.equal(reef.won,true);assert.equal(reef.event,true);assert.equal(reef.coral,2);assert.equal(reef.pollution,0);
});
test('every reachable rescue state either offers a legal move or an exit',()=>{
 for(const kind of ['wind','grass','reef']){const walk=moves=>{const s=Island.islandState(kind,moves),available=Island.TOOLS[kind].filter(a=>Island.canPlay(s,a));assert.ok(s.budget>=0);assert.equal(s.over, s.won||available.length===0);for(const a of available)walk([...moves,a]);};walk([]);}
});
const KEYS=['a','b','b','b','c','a','c','a','b'];
const create=()=>M.newSession('TEST_V3','eae16e3e-59c8-4a5e-88f9-528b04c776db',start,true,false);
const clone=v=>JSON.parse(JSON.stringify(v));
function advance(s,choice){
 const n=start+s.revision*2000;
 if(s.stage==='learn'){
  if(s.learning.length===3)return M.finishLearning(s,n);
  return M.commitLearning(s,{id:`learn-${s.learning.length}`,choice:['operate','restore','protect'][s.learning.length],at:new Date(n).toISOString(),elapsedMs:n-start,language:'en'});
 }
 const id=M.currentId(s),index=Number(id.split('-')[1]);
 return M.commitAction(s,{id,choice:choice||KEYS[index],order:['c','a','b'],at:new Date(n).toISOString(),shownAt:new Date(n-1000).toISOString(),elapsedMs:n-start,language:'en',languagesSeen:['zh-Hant','en']});
}
function complete(){let s=create();while(s.status==='active')s=advance(s);return s;}
test('complete lifecycle records exactly 27 decisions; three separate scores and gains',()=>{
 let s=create();S.validateSession(s);while(s.status==='active'){s=advance(s);S.validateSession(s);}
 assert.equal(s.answers.length,27);assert.equal(s.learning.length,3);assert.equal(s.revision,32);
 const result=S.scoreBehavior(s);assert.equal(result.completedPhases,3);
 for(const p of M.PHASES)assert.deepEqual(result.scores[p],{policy:3,monitor:3,adapt:3});
 assert.deepEqual(result.gains.post1,{policy:0,monitor:0,adapt:0});
});
test('negative and positive paired changes are simple subtraction, independently per variable',()=>{
 const r=complete();r.answers.slice(0,9).forEach((a,i)=>a.choice=i%3===0?(a.choice==='a'?'c':'a'):a.choice);r.answers.slice(9,18).forEach((a,i)=>a.choice=i%3===1?(a.choice==='a'?'c':'a'):a.choice);
 const score=S.scoreBehavior(S.validateSession(r));assert.deepEqual(score.gains.post1,{policy:3,monitor:-3,adapt:0});
});
test('timeout at exactly 600 seconds freezes decisions, reload preserves deadline, partial measures remain null',()=>{
 let s=create();for(let i=0;i<7;i++)s=advance(s);const before=s.answers.length;
 assert.equal(M.remainingMs(s,start+599999),1);
 s=M.timeoutSession(clone(s),start+600000);S.validateSession(s);
 assert.equal(s.status,'timed_out');assert.equal(s.endedAt,s.deadlineAt);assert.equal(s.answers.length,before);
 const score=S.scoreBehavior(s);assert.deepEqual(score.scores.pre,{policy:3,monitor:null,adapt:null});assert.deepEqual(score.gains.post1,{policy:null,monitor:null,adapt:null});
 assert.equal(M.commitAction(s,s.answers[0]),s);assert.equal(M.timeoutSession(s,start+700000),s);
});
test('timeout covers zero actions, all learning states and transition boundaries',()=>{
 let s=create();while(s.status==='active'){const expired=M.timeoutSession(s,start+600500);S.validateSession(expired);assert.equal(expired.status,'timed_out');s=advance(s);}
 assert.equal(M.timeoutSession(s,start+800000),s);
});
test('timeout never marks unfinished stages complete in the journey',()=>{
 let s=create();for(let i=0;i<7;i++)s=advance(s);assert.deepEqual(M.completedSteps(M.timeoutSession(s,start+600000)),[false,false,false,false]);
 s=advance(advance(s));assert.deepEqual(M.completedSteps(s),[true,false,false,false]);assert.deepEqual(M.completedSteps(complete()),[true,true,true,true]);
});
test('duplicate clicks and post-deadline learning actions cannot add records',()=>{
 const s=create(),next=advance(s);assert.equal(M.commitAction(next,next.answers[0]),next);
 let l=s;while(l.stage!=='learn')l=advance(l);
 const expired=M.commitLearning(l,{id:'learn-0',choice:'operate',language:'en',at:new Date(start+600000).toISOString(),elapsedMs:600000});assert.equal(expired.status,'timed_out');assert.equal(expired.learning.length,0);
});
test('server rejects forged order, skipped learning, changed dates, invalid version and identities',()=>{
 for(const mutate of [r=>r.answers[1].id=r.answers[0].id,r=>r.answers[0].choice='unknown',r=>r.answers[0].order=['a','a','c'],r=>r.answers[0].languagesSeen=['en','en'],r=>r.answers[0].at=r.deadlineAt,r=>r.answers[0].elapsedMs=-1,r=>r.learning=[],r=>r.userId='=IMPORTXML(A1)',r=>r.sessionId='bad',r=>r.version='v2',r=>r.revision=999,r=>r.deadlineAt=new Date(start+700000).toISOString()]){const r=complete();mutate(r);assert.throws(()=>S.validateSession(r));}
});
test('stable randomized order preserves all choices and first snapshots cannot be rewritten',()=>{
 assert.deepEqual(M.shuffle(['a','b','c'],'x'),M.shuffle(['a','b','c'],'x'));assert.deepEqual(M.shuffle(['a','b','c'],'x').sort(),['a','b','c']);
 const a=advance(create()),b=advance(a);assert.ok(S.compatibleSnapshot(a,b));const bad=clone(b);bad.answers[0].choice='c';assert.equal(S.compatibleSnapshot(a,bad),false);assert.equal(S.compatibleSnapshot(complete(),b),false);
});
test('all new copy and nine missions contain complete English and matched behavior opportunities',()=>{
 function check(value){if(Array.isArray(value)&&value.length===2&&value.every(x=>typeof x==='string')&&/\p{Script=Han}/u.test(value[0])){assert.ok(value[1].trim());assert.equal(/\p{Script=Han}/u.test(value[1]),false,value[1]);}else if(value&&typeof value==='object')Object.values(value).forEach(check);}
 check(I.UI);check(C.TASKS);check(C.LESSONS);check(C.TAKEAWAYS);
 for(const p of M.PHASES){assert.equal(C.TASKS[p].length,9);for(const v of M.VARIABLES)assert.equal(C.TASKS[p].filter(x=>x.variable===v).length,3);for(const task of C.TASKS[p])assert.equal(task.options.length,3);}
});
function receiver(){
 const state={locked:false,failSummaryOnce:false},sheets={};
 function makeSheet(name){const rows=[];let maxColumns=26,maxRows=1000;function range(row,col,height=1,width=1){return {setNumberFormat(){return this;},setBackground(){return this;},setFontColor(){return this;},setFontWeight(){return this;},setValues(values){assert.ok(col+values[0].length-1<=maxColumns);if(name==='ocean_behavior_summary'&&row>1&&state.failSummaryOnce){state.failSummaryOnce=false;throw Error('summary down');}values.forEach((r,i)=>{rows[row-1+i]??=[];r.forEach((v,j)=>rows[row-1+i][col-1+j]=v);});return this;},getValues(){return Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>rows[row-1+i]?.[col-1+j]??''));},createTextFinder(needle){return{matchEntireCell(){return this;},useRegularExpression(){return this;},findNext(){const i=rows.findIndex((r,n)=>n>=row-1&&n<row-1+height&&r[col-1]===needle);return i<0?null:{getRow:()=>i+1};}};}};}return {rows,getRange:range,getLastRow:()=>rows.length,getMaxColumns:()=>maxColumns,getMaxRows:()=>maxRows,insertColumnsAfter(_n,c){maxColumns+=c;},insertRowsAfter(_n,c){maxRows+=c;},setFrozenRows(){}};}
 const book={getSheetByName:name=>sheets[name]||null,insertSheet:name=>(sheets[name]=makeSheet(name))};
 const ctx=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:k=>({SHARED_SECRET:'x'.repeat(40),SHEET_ID:'fixture'}[k])})},SpreadsheetApp:{openById:()=>book,flush(){}},LockService:{getScriptLock:()=>({tryLock(){assert.equal(state.locked,false);state.locked=true;return true;},releaseLock(){state.locked=false;}})},ContentService:{createTextOutput:s=>({setMimeType:()=>s}),MimeType:{JSON:'json'}}});
 vm.runInContext(fs.readFileSync('google-apps-script/Code-v4.gs','utf8'),ctx);ctx.setup();
 return {state,ctx,raw:sheets.ocean_behavior_events.rows,summary:sheets.ocean_behavior_summary.rows,submit:(record,secret='x'.repeat(40))=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({secret,record,score:{policy:999}})}}))};
}
test('Sheets v4 writes all revisions, computes scores independently, preserves zeros and one summary',()=>{
 const r=receiver();let s=create();assert.equal(r.submit(s,'wrong').ok,false);assert.equal(r.raw.length,1);
 assert.equal(r.submit(s).ok,true);while(s.status==='active'){s=advance(s);assert.equal(r.submit(s).ok,true);}
 assert.equal(r.raw.length,33);assert.equal(r.summary.length,2);assert.equal(r.submit(s).duplicate,true);assert.equal(r.raw.length,33);
 const row=Object.fromEntries(r.summary[0].map((h,i)=>[h,r.summary[1][i]]));assert.equal(row.pre_policy,3);assert.equal(row.post2_adapt,3);assert.equal(row.gain_post1_policy,0);assert.equal(row.completed_phases,3);assert.equal(row.status,'completed');assert.equal(row.is_test,true);assert.equal(row.languages,'zh-Hant,en');
 r.ctx.setup();assert.equal(r.raw.length,33);assert.equal(r.state.locked,false);
});
test('Sheets permits coalesced offline snapshots and repairs lost summary writes without duplicating data',()=>{
 const r=receiver(),s=complete();r.state.failSummaryOnce=true;assert.equal(r.submit(s).ok,false);assert.equal(r.raw.length,2);assert.equal(r.summary.length,1);assert.equal(r.submit(s).duplicate,true);assert.equal(r.raw.length,2);assert.equal(r.summary.length,2);assert.equal(r.state.locked,false);
});
test('Sheets protects immutable choices; retrying an older snapshot cannot roll back summary',()=>{
 const r=receiver(),first=advance(create());assert.equal(r.submit(first).ok,true);const final=complete();assert.equal(r.submit(final).ok,true);assert.equal(r.submit(first).duplicate,true);assert.equal(r.summary[1][4],'completed');
 const bad=clone(final);bad.answers[0].choice='c';assert.equal(r.submit(bad).error,'record_conflict');assert.equal(r.summary[1][10],3);
});
test('Sheets timeout leaves missing values and paired gains blank; formula text is escaped',()=>{
 const r=receiver();let s=create();for(let i=0;i<7;i++)s=advance(s);s=M.timeoutSession(s,start+600000);assert.equal(r.submit(s).ok,true);
 const row=Object.fromEntries(r.summary[0].map((h,i)=>[h,r.summary[1][i]]));assert.equal(row.pre_policy,3);assert.equal(row.pre_monitor,'');assert.equal(row.gain_post1_policy,'');assert.equal(row.elapsed_ms,600000);assert.equal(r.ctx.safeCell_('=1+1'),"'=1+1");
});
test('training clicks persist in Sheets, reject rewrites, and do not add a fourth outcome',()=>{
 let s=create();for(let i=0;i<9;i++)s=advance(s);
 for(const action of ['survey','turbine','cable','battery']){const n=start+s.revision*2000;s=M.commitTraining(s,{lesson:0,action,at:new Date(n).toISOString(),elapsedMs:n-start});S.validateSession(s);}
 const previous=clone(s);while(s.status==='active')s=advance(s);S.validateSession(s);assert.ok(S.compatibleSnapshot(previous,s));
 const r=receiver();assert.equal(r.submit(previous).ok,true);assert.equal(r.submit(s).ok,true);assert.equal(JSON.parse(r.raw.at(-1)[7]).training.length,4);
 assert.deepEqual(Object.keys(S.scoreBehavior(s).scores.pre),['policy','monitor','adapt']);
 const bad=clone(s);bad.training[0].action='report';assert.equal(S.compatibleSnapshot(previous,bad),false);
 const invalid=clone(s);invalid.training[1].action='survey';assert.throws(()=>S.validateSession(invalid));
 const timed=M.timeoutSession(previous,start+600000);S.validateSession(timed);assert.equal(M.commitTraining(timed,{lesson:0,action:'report',at:timed.deadlineAt,elapsedMs:600000}),timed);
});
