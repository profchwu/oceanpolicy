// Bound to the research spreadsheet. No record-reading endpoint is exposed.
function researchSheetId(){
 const id=PropertiesService.getScriptProperties().getProperty('SHEET_ID');
 if(!id)throw Error('SHEET_ID_NOT_CONFIGURED');
 return id;
}
const EVENT_HEADERS=['event_id','run_id','level','mission_id','variable','choice_id','score','selected_at','confirmed_at','language','received_at','user_id'];
function setupNewsReceiver(){
 const book=SpreadsheetApp.openById(researchSheetId()),data=book.getSheetByName('遊玩資料');
 if(!data||data.getRange('B1').getValue()!=='run_id'||data.getRange('I1').getValue()!=='pre_policy')throw Error('遊玩資料欄位與範本不符，未修改資料。');
 if(data.getMaxColumns()<31)data.insertColumnsAfter(data.getMaxColumns(),31-data.getMaxColumns());
 data.getRange(1,31).setValue('user_id');data.getRange(2,31,data.getMaxRows()-1,1).setNumberFormat('@');
 const existingEvents=book.getSheetByName('操作紀錄');if(existingEvents&&!existingEvents.getRange(1,12).getValue())existingEvents.getRange(1,12).setValue('user_id');
 for(const spec of [['操作紀錄',EVENT_HEADERS],['同步紀錄',['run_id','revision','record_json','received_at']]]){
  let s=book.getSheetByName(spec[0]);if(!s)s=book.insertSheet(spec[0]);
  if(s.getLastRow()===0){s.getRange(1,1,1,spec[1].length).setValues([spec[1]]).setBackground('#173D54').setFontColor('white');s.setFrozenRows(1);}
  else if(JSON.stringify(s.getRange(1,1,1,spec[1].length).getValues()[0])!==JSON.stringify(spec[1]))throw Error('欄位不符：'+spec[0]);
 }
 const props=PropertiesService.getScriptProperties();if(!props.getProperty('NEWS_SHARED_SECRET'))props.setProperty('NEWS_SHARED_SECRET',Utilities.getUuid()+Utilities.getUuid());
 console.log('設定完成。請將指令碼屬性 NEWS_SHARED_SECRET 設為網站的 NEWS_SHEETS_SECRET，部署網頁應用程式後設定 NEWS_SHEETS_URL。');
}
function doGet(){return json({ok:true,service:'ocean-news-receiver',schema:'news-sheet-1'});}
function json(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function doPost(e){
 let lock;
 try{
  if(!e||!e.postData||e.postData.contents.length>24000)throw Error('invalid_request');
  const body=JSON.parse(e.postData.contents),secret=PropertiesService.getScriptProperties().getProperty('NEWS_SHARED_SECRET');
  if(!secret||body.secret!==secret)throw Error('unauthorized');
  const p=body.record,r=p&&p.run;
  if(!p||p.schema!=='news-sheet-1'||!r||!Number.isInteger(body.revision)||!Array.isArray(body.scores)||body.scores.length!==9||!body.scores.every(x=>x===null||x===0||x===1)||!Array.isArray(body.events)||body.events.length>9)throw Error('invalid_record');
  if(typeof r.userId!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(r.userId)||!/^[0-9a-f-]{36}$/i.test(r.id)||!/^[0-9a-f-]{36}$/i.test(p.playerId)||!['complete','incomplete','timeout'].includes(body.status))throw Error('invalid_record');
  lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw Error('busy_retry');
  const book=SpreadsheetApp.openById(researchSheetId()),data=book.getSheetByName('遊玩資料'),events=book.getSheetByName('操作紀錄'),ledger=book.getSheetByName('同步紀錄');
  if(!data||!events||!ledger)throw Error('setup_required');
  const match=findRow(ledger,1,r.id),old=match?ledger.getRange(match,1,1,4).getValues()[0]:null;
  if(old){
   const before=JSON.parse(old[2]);
   if(before.run.userId!==r.userId||before.playerId!==p.playerId||before.run.startedAt!==r.startedAt)throw Error('record_conflict');
   if(Number(old[1])>=body.revision)return json({ok:true,runId:r.id,revision:body.revision,duplicate:true});
   for(let i=0;i<3;i++)for(let j=0;j<before.run.rounds[i].actions.length;j++){
    const a=before.run.rounds[i].actions[j],b=r.rounds[i].actions[j];
    if(!b||a.choice!==b.choice||a.at!==b.at||a.language!==b.language||(a.ackAt!==undefined&&a.ackAt!==b.ackAt))throw Error('record_conflict');
   }
  }
  const received=new Date().toISOString();
  for(const event of body.events){
   const row=findRow(events,1,event.event_id)||events.getLastRow()+1;ensureRows(events,row);
   const first=events.getRange(row,11).getValue()||received;
   events.getRange(row,12).setNumberFormat('@');
   events.getRange(row,1,1,12).setValues([[...EVENT_HEADERS.slice(0,10).map(k=>safe(event[k])),first,r.userId]]);
  }
  let target=findRow(data,2,r.id);
  if(!target){const ids=data.getRange(2,2,Math.max(1,data.getLastRow()-1),1).getValues();const gap=ids.findIndex(v=>!v[0]);target=gap>=0?gap+2:data.getLastRow()+1;}
  ensureRows(data,target);
  const ended=body.status==='timeout'?new Date(r.startedAt+600000):body.status==='complete'?new Date(p.observedAt):'';
  data.getRange(target,1,1,17).setValues([['正式',r.id,p.playerId,'news-pilot-1/sheet-1',p.language,body.status,new Date(r.startedAt),ended,...body.scores.map(x=>x===null?'':x)]]);
  data.getRange(target,7,1,2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  data.getRange(target,18,1,13).setFormulas([scoreFormulas(target)]).setNumberFormat('0.0');
  data.getRange(target,30).setNumberFormat('@');
  data.getRange(target,31).setNumberFormat('@').setValues([[r.userId]]);
  const row=match||ledger.getLastRow()+1;ensureRows(ledger,row);
  ledger.getRange(row,1,1,4).setValues([[r.id,body.revision,JSON.stringify(p),received]]);
  // Extend existing summary bounds only when new records exceed its current capacity.
  if(target>504){const summary=book.getSheetByName('整體摘要');if(summary){const range=summary.getDataRange(),f=range.getFormulas();for(let i=0;i<f.length;i++)for(let j=0;j<f[i].length;j++)if(f[i][j]&&f[i][j].includes('遊玩資料')){const updated=f[i][j].replace(/\$([A-Z]+)\$(\d+)/g,(m,c,n)=>Number(n)>=504&&Number(n)<target?'$'+c+'$'+target:m);if(updated!==f[i][j])summary.getRange(i+1,j+1).setFormula(updated);}}}
  SpreadsheetApp.flush();return json({ok:true,runId:r.id,revision:body.revision});
 }catch(err){return json({ok:false,error:String(err.message||'save_failed')});}finally{if(lock&&lock.hasLock())lock.releaseLock();}
}
function findRow(sheet,col,key){if(sheet.getLastRow()<2)return 0;const found=sheet.getRange(2,col,sheet.getLastRow()-1,1).createTextFinder(key).matchEntireCell(true).useRegularExpression(false).findNext();return found?found.getRow():0;}
function ensureRows(s,n){if(n>s.getMaxRows())s.insertRowsAfter(s.getMaxRows(),Math.max(100,n-s.getMaxRows()));}
function safe(x){return typeof x==='string'&&/^[=+@\-]/.test(x)?"'"+x:x;}
function scoreFormulas(r){
 const f=[],valid=c=>'AND(ISNUMBER('+c+'),OR('+c+'=0,'+c+'=1))';
 for(const cols of [['I','L','O','R','S'],['J','M','P','U','V'],['K','N','Q','X','Y']]){
  const [a,b,c,pre,post]=cols.map(x=>x+r);
  f.push('=IF('+valid(a)+','+a+'*100,"")','=IF(AND('+valid(b)+','+valid(c)+'),('+b+'+'+c+')/2*100,"")','=IF(COUNT('+pre+':'+post+')=2,'+post+'-'+pre+',"")');
 }
 f.push('=IF(COUNT(R'+r+',U'+r+',X'+r+')=3,AVERAGE(R'+r+',U'+r+',X'+r+'),"")','=IF(COUNT(S'+r+',V'+r+',Y'+r+')=3,AVERAGE(S'+r+',V'+r+',Y'+r+'),"")','=IF(COUNT(AA'+r+':AB'+r+')=2,AB'+r+'-AA'+r+',"")','=IF(B'+r+'="","",IF(A'+r+'<>"正式","示範不納入",IF(COUNTIF(B:B,B'+r+')>1,"重複 run_id",IF(F'+r+'<>"complete","未完成",IF(COUNT(AA'+r+':AB'+r+')<2,"缺漏或非 0/1","納入")))))');return f;
}
