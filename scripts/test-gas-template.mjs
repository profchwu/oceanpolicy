import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const sheets={},props={SHEET_ID:'test-sheet',NEWS_SHARED_SECRET:'test-secret'};
const col=s=>[...s].reduce((a,c)=>a*26+c.charCodeAt(0)-64,0);
class Sheet {
 constructor(name){this.name=name;this.rows=[];this.formulas={};this.columns=26;}
 getLastRow(){return this.rows.length;}
 getLastColumn(){return Math.max(0,...this.rows.map(r=>r.length));}
 getMaxRows(){return 1000;}
 getMaxColumns(){return this.columns;}
 insertColumnsAfter(start,count){this.columns+=count;}
 insertRowsAfter(){}
 setFrozenRows(){}
 getRange(r,c,n=1,m=1){if(typeof r==='string'){const a=r.match(/^([A-Z]+)(\d+)/);c=col(a[1]);r=+a[2];}const s=this;return {
 getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>s.rows[r+i-1]?.[c+j-1]??'')),getValue:()=>s.rows[r-1]?.[c-1]??'',
 setValues(values){values.forEach((row,i)=>{s.rows[r+i-1]??=[];row.forEach((v,j)=>s.rows[r+i-1][c+j-1]=v);});return this;},
 setValue(v){return this.setValues([[v]]);},setFormulas(v){return this.setValues(v);},setFormula(v){s.formulas[r+':'+c]=v;return this;},setBackground(){return this;},setFontColor(){return this;},setNumberFormat(){return this;},
 createTextFinder(key){return {matchEntireCell(){return this;},useRegularExpression(){return this;},findNext(){const i=s.rows.findIndex((row,i)=>i>=r-1&&row[c-1]===key);return i<0?null:{getRow:()=>i+1};}};}
 };}
}
let locks=0,active;
const book={getSheetByName:n=>sheets[n],insertSheet:n=>(sheets[n]=new Sheet(n)),setSpreadsheetTimeZone(){},setActiveSheet:s=>{active=s.name;},moveActiveSheet:n=>assert.equal(n,1)};
const context={console,SpreadsheetApp:{openById:id=>{assert.equal(id,'test-sheet');return book;},flush(){}},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k],setProperty:(k,v)=>{props[k]=v;}})},Utilities:{getUuid:()=> 'test-generated'},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},LockService:{getScriptLock:()=>({tryLock:()=>{locks++;return true;},hasLock:()=>true,releaseLock(){locks--;}})}};
vm.createContext(context);vm.runInContext(fs.readFileSync('google-apps-script/NewsReceiver.template.gs','utf8'),context);
context.setupNewResearchWorkbook();assert.equal(active,'前後測資料');assert.equal(Object.keys(sheets).length,5);assert.equal(sheets['遊玩資料'].rows[0].length,34);assert.equal(sheets['前後測資料'].rows[0][0],'輸入User ID時間');assert.equal(sheets['前後測資料'].rows[0][1],'user_id');assert(sheets['前後測資料'].formulas['2:1'].includes("'遊玩資料'!AF2:AF"));assert.throws(()=>context.setupNewResearchWorkbook(),/NONEMPTY_SHEET/);
// Simulate a freshly imported XLSX: all sheets contain exact header rows only.
for(const s of Object.values(sheets)){s.rows=s.rows.slice(0,1);s.formulas={};}
const beforeHeaders=JSON.stringify(sheets['遊玩資料'].rows);
sheets['操作紀錄'].rows[0][0]='wrong_header';
assert.throws(()=>context.setupNewResearchWorkbook(),/NONEMPTY_SHEET/);
assert.equal(JSON.stringify(sheets['遊玩資料'].rows),beforeHeaders);
sheets['操作紀錄'].rows[0][0]='event_id';context.setupNewResearchWorkbook();
assert(sheets['前後測資料'].formulas['2:1'].startsWith('=ARRAYFORMULA'));
const run={id:'11111111-1111-4111-8111-111111111111',userId:'Ab1234',current:3,startedAt:2000,userIdEnteredAt:1000,completedAt:61000,consent:{accepted:true,version:'research-2026-10-24-completion-only'},rounds:[{actions:[]},{actions:[]},{actions:[]}]};
const body={secret:'test-secret',record:{schema:'news-sheet-1',playerId:'22222222-2222-4222-8222-222222222222',language:'zh-Hant',observedAt:70000,run},revision:20,status:'complete',scores:[1,null,0,1,null,1,0,null,1],events:[]};
const send=b=>context.doPost({postData:{contents:JSON.stringify(b)}});
const count=()=>Object.values(sheets).map(s=>s.getLastRow());
const empty=count();assert.equal(send({...body,secret:'bad'}).error,'unauthorized');assert.equal(send({...body,status:'incomplete'}).error,'completion_required');assert.deepEqual(count(),empty);
assert.equal(send({secret:'test-secret',action:'checkUserId',userId:'Ab1234'}).available,true);assert.deepEqual(count(),empty);
assert.equal(send(body).ok,true);assert.equal(locks,0);const row=sheets['遊玩資料'].rows[1];assert.equal(row[30],'Ab1234');assert.equal(row[33],60);assert.equal(row[31].getTime(),1000);assert.equal(row[32].getTime(),61000);assert.deepEqual(row.slice(20,23),['','','']);assert.equal(row[26],'=IF(COUNT(R2,X2)=2,AVERAGE(R2,X2),"")');assert.equal(row[27],'=IF(COUNT(S2,Y2)=2,AVERAGE(S2,Y2),"")');
const stored=count();assert.equal(send(body).duplicate,true);assert.deepEqual(count(),stored);assert.equal(send({secret:'test-secret',action:'checkUserId',userId:'ab1234'}).available,false);
const clash=structuredClone(body);clash.record.run.id='33333333-3333-4333-8333-333333333333';clash.record.run.userId='ab1234';assert.equal(send(clash).error,'user_id_taken');assert.deepEqual(count(),stored);
console.log('PASS: new-workbook setup, no overwrite, headers, two-variable formulas, completion-only receipt, timestamps, secret checks, duplicate IDs, idempotent retries. Google Sheets formula execution still requires deployment acceptance testing.');
