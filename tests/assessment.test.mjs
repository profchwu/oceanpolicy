import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import vm from 'node:vm';
const out=path.resolve('.sites-runtime/test-build');fs.mkdirSync(out,{recursive:true});
for(const file of ['content','assessment','progress','i18n']){const source=fs.readFileSync(`lib/${file}.ts`,'utf8');fs.writeFileSync(path.join(out,file+'.mjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("'./content'","'./content.mjs'"));}
const {validateSubmission,scoreSubmission}=await import(pathToFileURL(path.join(out,'assessment.mjs')));
const {VERSION}=await import(pathToFileURL(path.join(out,'content.mjs')));
const expected={pre:['2','3','1','3','2','1'],post1:['2','3','1','3','2','1'],post2:['3','1','2','1','3','2']};
const record=(phase='pre')=>({sessionId:'eae16e3e-59c8-4a5e-88f9-528b04c776db',userId:'TEST001',phase,version:VERSION,startedAt:'2026-10-08T12:00:00.000Z',completedAt:'2026-10-08T12:03:00.000Z',isTest:true,reducedMotion:false,consentVersion:'notice-v2',events:[],answers:expected[phase].map((value,i)=>({itemId:`${phase}-k${i+1}`,value,responseMs:1200,order:['3','1','2','unknown'],shownAt:'2026-10-08T12:00:00.000Z',answeredAt:'2026-10-08T12:00:02.000Z'}))});
test('all three forms score correctly using stable option IDs',()=>{for(const phase of Object.keys(expected)){const s=scoreSubmission(validateSubmission(record(phase)));assert.equal(s.correct,6);assert.equal(s.percent,100);}});
test('unknown is zero and separately counted',()=>{const r=record();r.answers.forEach(a=>a.value='unknown');const s=scoreSubmission(validateSubmission(r));assert.equal(s.correct,0);assert.equal(s.unknown,6);});
test('missing, duplicate and invalid answers are rejected, not silently imputed',()=>{for(const mutate of [r=>r.answers.pop(),r=>r.answers[1].itemId=r.answers[0].itemId,r=>r.answers[0].value=null,r=>r.answers[0].value='4',r=>r.answers[0].order=['1','1','2','unknown'],r=>r.answers[0].responseMs=-1]){const r=record();mutate(r);assert.throws(()=>validateSubmission(r));}});
test('identity, version and data shape reject injection or incompatible records',()=>{for(const mutate of [r=>r.userId='=IMPORTXML(A1)',r=>r.userId='AB',r=>r.sessionId='bad',r=>r.phase='toString',r=>r.version='old',r=>r.events=[{type:'x',detail:'a'.repeat(201),at:'2026-10-08',elapsedMs:1}]]){const r=record();mutate(r);assert.throws(()=>validateSubmission(r));}});

const {scoreChange,formatChange}=await import(pathToFileURL(path.join(out,'progress.mjs')));
test('progress uses subtraction and distinguishes zero from missing',()=>{
 assert.equal(scoreChange(5,3),2);assert.equal(formatChange(scoreChange(5,3)),'+2');
 assert.equal(scoreChange(6,0),6);assert.equal(scoreChange(0,6),-6);assert.equal(formatChange(-6),'-6');
 assert.equal(scoreChange(0,0),0);assert.equal(formatChange(0),'0');
 assert.equal(scoreChange(undefined,3),null);assert.equal(scoreChange(3,undefined),null);assert.equal(formatChange(null),'—');
});
function receiver(){
 const state={locked:false,failSummaryOnce:false};const sheets={};
 function makeSheet(name){
  const rows=[];let maxRows=1000,maxColumns=26;
  function range(row,col,height=1,width=1){return {
   setNumberFormat(){return this;},setBackground(){return this;},setFontColor(){return this;},setFontWeight(){return this;},
   setValues(values){
    assert.ok(col+values[0].length-1<=maxColumns,'setup must expand the default 26-column sheet');
    if(name==='ocean_summary'&&row>1&&state.failSummaryOnce){state.failSummaryOnce=false;throw Error('simulated summary outage');}
    for(let i=0;i<values.length;i++){rows[row-1+i]??=[];for(let j=0;j<values[i].length;j++)rows[row-1+i][col-1+j]=values[i][j];}return this;
   },
   getValues(){return Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>rows[row-1+i]?.[col-1+j]??''));},
   getValue(){return rows[row-1]?.[col-1];},
   createTextFinder(needle){return{matchEntireCell(){return this;},useRegularExpression(){return this;},findNext(){const i=rows.findIndex((r,n)=>n>=row-1&&n<row-1+height&&r[col-1]===needle);return i<0?null:{getRow:()=>i+1};}};}
  };}
  return {rows,getLastRow:()=>rows.length,getMaxRows:()=>maxRows,getMaxColumns:()=>maxColumns,getRange:range,setFrozenRows(){},insertRowsAfter(_row,count){maxRows+=count;},insertColumnsAfter(_col,count){maxColumns+=count;}};
 }
 const book={getSheetByName:name=>sheets[name]??null,insertSheet:name=>(sheets[name]=makeSheet(name))};
 const context=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:k=>({SHARED_SECRET:'x'.repeat(40),SHEET_ID:'test-sheet'}[k])})},SpreadsheetApp:{openById:()=>book,flush(){}},LockService:{getScriptLock:()=>({tryLock(){assert.equal(state.locked,false);state.locked=true;return true;},releaseLock(){state.locked=false;}})},ContentService:{createTextOutput:s=>({setMimeType:()=>s}),MimeType:{JSON:'json'}}});
 vm.runInContext(fs.readFileSync('google-apps-script/Code.gs','utf8'),context);context.setup();
 const submit=(r,secret='x'.repeat(40))=>JSON.parse(context.doPost({postData:{contents:JSON.stringify({secret,record:r,score:{correct:999}})}}));
 return {submit,state,context,raw:sheets.ocean_records.rows,summary:sheets.ocean_summary.rows};
}
function scoredRecord(phase,score){const r=record(phase);r.answers.forEach((a,i)=>{if(i>=score)a.value='unknown';});return r;}
test('Sheets rejects unauthenticated requests without writing either table',()=>{const {submit,raw,summary}=receiver();assert.equal(submit(record(),'wrong').ok,false);assert.equal(raw.length,1);assert.equal(summary.length,1);});
test('one summary row updates from 3 to 5 to 4 with simple gains and no premature zeros',()=>{
 const {submit,raw,summary,state,context}=receiver();
 assert.equal(submit(record('post1')).error,'previous_phase_required');
 const pre=scoredRecord('pre',3);assert.equal(submit(pre).ok,true);
 assert.equal(raw.length,2);assert.equal(raw[1][10],3);
 assert.deepEqual(Array.from(summary[1].slice(2,9)),[3,'','','','',1,false]);
 assert.equal(submit(pre).duplicate,true);assert.equal(raw.length,2);assert.equal(summary.length,2);
 assert.equal(submit(scoredRecord('post1',5)).ok,true);
 assert.deepEqual(Array.from(summary[1].slice(2,9)),[3,5,'',2,'',2,false]);
 assert.equal(submit(scoredRecord('post2',4)).ok,true);
 assert.deepEqual(Array.from(summary[1].slice(2,9)),[3,5,4,2,1,3,true]);
 assert.equal(raw.length,4);assert.equal(summary.length,2);assert.equal(state.locked,false);
 context.setup();assert.equal(raw.length,4);assert.equal(summary.length,2);
});
test('zero, negative and repeated-session scores remain distinct',()=>{
 const {submit,summary}=receiver();
 for(const [phase,score]of [['pre',6],['post1',0],['post2',6]])assert.equal(submit(scoredRecord(phase,score)).ok,true);
 assert.deepEqual(Array.from(summary[1].slice(2,7)),[6,0,6,-6,0]);
 for(const [phase,score]of [['pre',0],['post1',6],['post2',0]]){const r=scoredRecord(phase,score);r.sessionId='aaa16e3e-59c8-4a5e-88f9-528b04c776db';assert.equal(submit(r).ok,true);}
 assert.deepEqual(Array.from(summary[2].slice(2,7)),[0,6,0,6,0]);assert.equal(summary.length,3);
});
test('lost summary write is repaired on retry without duplicate raw data',()=>{
 const {submit,raw,summary,state}=receiver();const r=record();state.failSummaryOnce=true;
 assert.equal(submit(r).ok,false);assert.equal(raw.length,2);assert.equal(summary.length,1);assert.equal(state.locked,false);
 const retry=submit(r);assert.equal(retry.ok,true);assert.equal(retry.duplicate,true);
 assert.equal(raw.length,2);assert.equal(summary.length,2);assert.equal(summary[1][2],6);
});
test('changed answer for an existing key cannot overwrite either table',()=>{
 const {submit,raw,summary}=receiver();assert.equal(submit(record()).ok,true);const r=record();r.answers[0].value='unknown';
 assert.equal(submit(r).error,'record_conflict');assert.equal(raw.length,2);assert.equal(summary.length,2);assert.equal(summary[1][2],6);
});
test('cell escaping blocks formula execution',()=>{const {context}=receiver();assert.equal(context.safeCell_('=1+1'),"'=1+1");assert.equal(context.safeCell_('-TEST'),"'-TEST");assert.equal(context.safeCell_('TEST001'),'TEST001');});

const {translate,EN,DEFAULT_LANGUAGE}=await import(pathToFileURL(path.join(out,'i18n.mjs')));
test('all UI, scene, question, news, result and server-error copy has complete English',()=>{
 const missing=new Set();
 for(const file of ['app/OceanGame.tsx','app/OceanScene.tsx','lib/content.ts','lib/assessment.ts','app/api/record/route.ts','app/layout.tsx']){
  const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  function visit(n){
   if((ts.isStringLiteral(n)||ts.isJsxText(n)||ts.isNoSubstitutionTemplateLiteral(n))&&/\p{Script=Han}/u.test(n.text)){
    const key=n.text.trim();if(!EN[key])missing.add(key);
    else assert.equal(/\p{Script=Han}/u.test(translate('en',key)),false,key);
   }
   ts.forEachChild(n,visit);
  }visit(source);
 }
 assert.deepEqual([...missing],[]);
});
test('Chinese is the default; parameterized results and retry states translate both ways',()=>{
 assert.equal(DEFAULT_LANGUAGE,'zh-Hant');assert.equal(translate(DEFAULT_LANGUAGE,'我還不確定'),'我還不確定');
 assert.equal(translate('en','多答對 {count} 題',{count:2}),'2 more correct');
 assert.equal(translate('zh-Hant','多答對 {count} 題',{count:2}),'多答對 2 題');
 assert.match(translate('en','retry_1'),/1\/2/);assert.match(translate('zh-Hant','retry_2'),/自動重試/);
 assert.equal(/\p{Script=Han}/u.test(translate('en','未預期的伺服器錯誤')),false);
});
test('answer language survives validation and Sheets writes without changing scoring',()=>{
 const r=record();r.answers.forEach(a=>{a.language='en';a.languagesSeen=['zh-Hant','en'];});
 const validated=validateSubmission(r);assert.equal(scoreSubmission(validated).correct,6);assert.deepEqual(validated.answers[0].languagesSeen,['zh-Hant','en']);
 const {submit,raw,summary}=receiver();assert.equal(submit(validated).ok,true);assert.equal(summary[1][2],6);
 const saved=JSON.parse(raw[1][33]);assert.equal(saved[0].language,'en');assert.deepEqual(saved[0].languagesSeen,['zh-Hant','en']);
 for(const patch of [{language:'fr'},{languagesSeen:['en','en']},{language:'en',languagesSeen:['zh-Hant']},{languagesSeen:[]}]){const bad=record();Object.assign(bad.answers[0],patch);assert.throws(()=>validateSubmission(bad));}
});
