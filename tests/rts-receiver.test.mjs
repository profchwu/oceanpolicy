import './rts.test.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
function receiver(){
 const state={locked:false,failSummaryOnce:false},sheets={};
 function makeSheet(name){const rows=[];let maxColumns=26,maxRows=1000;function range(row,col,height=1,width=1){return {setNumberFormat(){return this;},setBackground(){return this;},setFontColor(){return this;},setFontWeight(){return this;},setValues(values){assert.ok(col+values[0].length-1<=maxColumns);if(name==='ocean_behavior_summary'&&row>1&&state.failSummaryOnce){state.failSummaryOnce=false;throw Error('summary down');}values.forEach((r,i)=>{rows[row-1+i]??=[];r.forEach((v,j)=>rows[row-1+i][col-1+j]=v);});return this;},getValues(){return Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>rows[row-1+i]?.[col-1+j]??''));},createTextFinder(needle){return{matchEntireCell(){return this;},useRegularExpression(){return this;},findNext(){const i=rows.findIndex((r,n)=>n>=row-1&&n<row-1+height&&r[col-1]===needle);return i<0?null:{getRow:()=>i+1};}};}};}return {rows,getRange:range,getLastRow:()=>rows.length,getMaxColumns:()=>maxColumns,getMaxRows:()=>maxRows,insertColumnsAfter(_n,c){maxColumns+=c;},insertRowsAfter(_n,c){maxRows+=c;},setFrozenRows(){}};}
 const book={getSheetByName:name=>sheets[name]||null,insertSheet:name=>(sheets[name]=makeSheet(name))};
 const ctx=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:k=>({SHARED_SECRET:'x'.repeat(40),SHEET_ID:'fixture'}[k])})},SpreadsheetApp:{openById:()=>book,flush(){}},LockService:{getScriptLock:()=>({tryLock(){assert.equal(state.locked,false);state.locked=true;return true;},releaseLock(){state.locked=false;}})},ContentService:{createTextOutput:s=>({setMimeType:()=>s}),MimeType:{JSON:'json'}}});
 vm.runInContext(fs.readFileSync('google-apps-script/Code-v5.gs','utf8'),ctx);ctx.setup();
 return {state,ctx,raw:sheets.ocean_behavior_events.rows,summary:sheets.ocean_behavior_summary.rows,submit:(record,secret='x'.repeat(40))=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({secret,record,score:{policy:999}})}}))};
}
test('RTS Sheets receiver computes three outcomes and retries without duplicates',()=>{
 const r=receiver(),s=JSON.parse(fs.readFileSync('.sites-runtime/rts-tests/fixture.json','utf8'));
 assert.equal(r.submit(s,'wrong').ok,false);assert.equal(r.submit(s).ok,true);assert.equal(r.submit(s).duplicate,true);
 assert.equal(r.raw.length,2);assert.equal(r.summary.length,2);
 const row=Object.fromEntries(r.summary[0].map((h,i)=>[h,r.summary[1][i]]));
 assert.equal(row.pre_policy,3);assert.equal(row.post2_adapt,3);assert.equal(row.gain_post1_policy,0);assert.equal(row.completed_phases,3);
 const bad=structuredClone(s);bad.answers[0].choice='b';assert.equal(r.submit(bad).error,'record_conflict');
});
test('RTS Sheets repairs a failed summary without duplicating raw snapshots',()=>{
 const r=receiver(),s=JSON.parse(fs.readFileSync('.sites-runtime/rts-tests/fixture.json','utf8'));r.state.failSummaryOnce=true;
 assert.equal(r.submit(s).ok,false);assert.equal(r.submit(s).duplicate,true);assert.equal(r.raw.length,2);assert.equal(r.summary.length,2);
});

