// NEW spreadsheet template only. Do not overwrite an existing research receiver.
// Copy this whole file into one Apps Script project; do not also paste NewsReceiver.gs.
function setupNewResearchWorkbook(){
 const book=SpreadsheetApp.openById(researchSheetId());
 const names=['前後測資料','遊玩資料','操作紀錄','同步紀錄','整體摘要'];
 book.setSpreadsheetTimeZone('Asia/Taipei');
 const rawHeaders=['sample_type','run_id','player_id','version','language','status','started_at','ended_at','pre_policy','reserved_pre','pre_adaptation','post1_policy','reserved_post1','post1_adaptation','post2_policy','reserved_post2','post2_adaptation','policy_pre','policy_post','policy_gain','reserved_1','reserved_2','reserved_3','adaptation_pre','adaptation_post','adaptation_gain','overall_pre','overall_post','overall_gain','inclusion','user_id','user_id_entered_at','completed_at','total_seconds'];
 const headers=['輸入User ID時間','user_id','政策前測','政策後測','政策差值','調整前測','調整後測','調整差值','整體前測','整體後測','整體差值','run_id','完成狀態','遊戲完成時間','完成總時間（秒）','統計納入狀態','珊瑚政策0/1','珊瑚調整0/1','海草政策0/1','海草調整0/1','風電政策0/1','風電調整0/1'];
 const specifications=[['前後測資料',headers],['遊玩資料',rawHeaders],['操作紀錄',EVENT_HEADERS],['同步紀錄',['run_id','revision','record_json','received_at']],['整體摘要',['項目','數值']]];
 // Also accept the downloadable XLSX after conversion to Google Sheets: exact headers only.
 // Validate every sheet before any content is changed. Never overwrite populated research sheets.
 for(const [name,head] of specifications){
  const s=book.getSheetByName(name);if(!s||s.getLastRow()===0)continue;
  if(s.getLastRow()>1||s.getLastColumn()!==head.length||JSON.stringify(s.getRange(1,1,1,head.length).getValues()[0])!==JSON.stringify(head))throw Error('NONEMPTY_SHEET: '+name+'；僅接受空白表或未填資料的標準下載範本，不會清除既有資料。');
 }
 for(const [name,head] of specifications){
  const s=book.getSheetByName(name)||book.insertSheet(name);
  if(s.getMaxColumns()<head.length)s.insertColumnsAfter(s.getMaxColumns(),head.length-s.getMaxColumns());
  s.getRange(1,1,1,head.length).setValues([head]).setBackground('#173D54').setFontColor('white');s.setFrozenRows(1);
 }
 const view=book.getSheetByName('前後測資料');
 const cols=['AF','AE','R','S','T','X','Y','Z','AA','AB','AC','B','F','AG','AH','AD','I','K','L','N','O','Q'];
 view.getRange('A2').setFormula('=ARRAYFORMULA(IF(\'遊玩資料\'!B2:B="","",{'+cols.map(c=>"'遊玩資料'!"+c+'2:'+c).join(',')+'}))');
 view.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');view.getRange('N2:N').setNumberFormat('yyyy-mm-dd hh:mm:ss');
 view.getRange('C2:K').setNumberFormat('0.0');view.getRange('O2:O').setNumberFormat('0.000');view.getRange('B2:B').setNumberFormat('@');
 const summary=book.getSheetByName('整體摘要');
 summary.getRange(2,1,5,1).setValues([['完成且納入人數'],['整體前測平均'],['整體後測平均'],['平均差值（百分點）'],['平均完成秒數']]);
 summary.getRange(2,2).setFormula('=COUNTIF(\'前後測資料\'!P2:P,"納入")');
 for(const [row,col] of [[3,'I'],[4,'J'],[5,'K'],[6,'O']])summary.getRange(row,2).setFormula('=IFERROR(AVERAGEIF(\'前後測資料\'!P2:P,"納入",\'前後測資料\'!'+col+'2:'+col+'),"")');
 summary.getRange('B3:B6').setNumberFormat('0.000');
 setupNewsReceiver();book.setActiveSheet(view);book.moveActiveSheet(1);
 console.log('新表格初始化完成；密鑰請在指令碼屬性查看，勿貼到公開文件。');
}


// Bound to the research spreadsheet. Only ID availability is exposed, never records.
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
  if(body.action==='checkUserId'){
   if(!validParticipantId(body.userId))throw Error('invalid_user_id');
   const data=SpreadsheetApp.openById(researchSheetId()).getSheetByName('遊玩資料');
   if(!data)throw Error('setup_required');
   return json({ok:true,available:!userIdUsed(data,body.userId)});
  }
  const p=body.record,r=p&&p.run;
  if(!p||p.schema!=='news-sheet-1'||!r||!Number.isInteger(body.revision)||!Array.isArray(body.scores)||body.scores.length!==9||!body.scores.every(x=>x===null||x===0||x===1)||!Array.isArray(body.events)||body.events.length>9)throw Error('invalid_record');
  if(!validParticipantId(r.userId)||!/^[0-9a-f-]{36}$/i.test(r.id)||!/^[0-9a-f-]{36}$/i.test(p.playerId)||!['complete','incomplete','timeout'].includes(body.status))throw Error('invalid_record');
  if(body.status!=='complete'||r.current!==3||!r.consent||r.consent.accepted!==true||r.consent.version!=='research-2026-10-24-completion-only'||!Number.isSafeInteger(r.userIdEnteredAt)||!Number.isSafeInteger(r.completedAt)||r.completedAt<r.userIdEnteredAt)throw Error('completion_required');
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
  if(userIdUsed(data,r.userId,r.id))throw Error('user_id_taken');
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
  const ended=new Date(r.completedAt);
  data.getRange(target,1,1,17).setValues([['正式',r.id,p.playerId,'news-pilot-1/sheet-1',p.language,body.status,new Date(r.startedAt),ended,...body.scores.map(x=>x===null?'':x)]]);
  data.getRange(target,7,1,2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  data.getRange(target,18,1,13).setFormulas([scoreFormulas(target)]).setNumberFormat('0.0');
  data.getRange(target,30).setNumberFormat('@');
  data.getRange(target,31).setNumberFormat('@').setValues([[r.userId]]);
  data.getRange(target,32,1,3).setValues([[new Date(r.userIdEnteredAt),new Date(r.completedAt),(r.completedAt-r.userIdEnteredAt)/1000]]);
  data.getRange(target,32,1,2).setNumberFormat('yyyy-mm-dd hh:mm:ss');data.getRange(target,34).setNumberFormat('0.000');
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
 for(const cols of [['I','L','O','R','S'],null,['K','N','Q','X','Y']]){
  if(!cols){f.push('','','');continue;}
  const [a,b,c,pre,post]=cols.map(x=>x+r);
  f.push('=IF('+valid(a)+','+a+'*100,"")','=IF(AND('+valid(b)+','+valid(c)+'),('+b+'+'+c+')/2*100,"")','=IF(COUNT('+pre+':'+post+')=2,'+post+'-'+pre+',"")');
 }
 f.push('=IF(COUNT(R'+r+',X'+r+')=2,AVERAGE(R'+r+',X'+r+'),"")','=IF(COUNT(S'+r+',Y'+r+')=2,AVERAGE(S'+r+',Y'+r+'),"")','=IF(COUNT(AA'+r+':AB'+r+')=2,AB'+r+'-AA'+r+',"")','=IF(B'+r+'="","",IF(A'+r+'<>"正式","示範不納入",IF(COUNTIF(B:B,B'+r+')>1,"重複 run_id",IF(F'+r+'<>"complete","未完成",IF(COUNT(AA'+r+':AB'+r+')<2,"缺漏或非 0/1","納入")))))');return f;
}

function validParticipantId(id){return typeof id==='string'&&/^(?=.*[A-Za-z])[A-Za-z0-9]{4,32}$/.test(id);}
function userIdUsed(data,id,ownRun){
 if(data.getLastRow()<2)return false;
 const rows=data.getRange(2,2,data.getLastRow()-1,30).getValues(),key=id.toLowerCase();
 return rows.some(row=>row[29]!==''&&row[29]!=null&&String(row[29]).toLowerCase()===key&&(!ownRun||row[0]!==ownRun));
}
