// Receiver glue. Generate the standalone Code-v3.gs with scripts/build-behavior-receiver.mjs.
var RAW_HEADERS=['record_key','received_at_utc','session_id','user_id','revision','status','instrument_version','record_json'];
var SUMMARY_HEADERS=['session_id','user_id','is_test','instrument_version','status','started_at_utc','ended_at_utc','decision_count','completed_phases','elapsed_ms'];
PHASES.forEach(function(p){VARIABLES.forEach(function(v){SUMMARY_HEADERS.push(p+'_'+v);});});
['post1','post2'].forEach(function(p){VARIABLES.forEach(function(v){SUMMARY_HEADERS.push('gain_'+p+'_'+v);});});
SUMMARY_HEADERS.push('languages','updated_at_utc');
function setup(){
 var props=PropertiesService.getScriptProperties();
 if(!props.getProperty('SHEET_ID')||String(props.getProperty('SHARED_SECRET')||'').length<32)throw Error('Set SHEET_ID and a SHARED_SECRET of at least 32 characters in Script Properties.');
 var book=SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
 [['ocean_behavior_events',RAW_HEADERS],['ocean_behavior_summary',SUMMARY_HEADERS]].forEach(function(spec){
  var sheet=book.getSheetByName(spec[0])||book.insertSheet(spec[0]),headers=spec[1];
  if(sheet.getMaxColumns()<headers.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),headers.length-sheet.getMaxColumns());
  if(sheet.getLastRow()===0){sheet.getRange(1,1,1,headers.length).setValues([headers]).setBackground('#102b3b').setFontColor('#ffffff').setFontWeight('bold');sheet.setFrozenRows(1);}
  else if(JSON.stringify(sheet.getRange(1,1,1,headers.length).getValues()[0])!==JSON.stringify(headers))throw Error('Header mismatch: '+spec[0]+'. Existing data was not overwritten.');
  sheet.getRange(spec[0]==='ocean_behavior_events'?'C:D':'A:B').setNumberFormat('@');
 });
}
function doGet(){return json_({ok:true,service:'ocean-behavior-receiver',version:BEHAVIOR_VERSION});}
function doPost(e){
 try{
  if(!e||!e.postData||e.postData.contents.length>50000)return json_({ok:false,error:'invalid_request'});
  var body=JSON.parse(e.postData.contents),props=PropertiesService.getScriptProperties(),secret=String(props.getProperty('SHARED_SECRET')||'');
  if(secret.length<32||!equal_(secret,String(body.secret||'')))return json_({ok:false,error:'unauthorized'});
  var r=validateSession(body.record),key=r.sessionId+':'+r.revision,recordJson=JSON.stringify(r);
  var lock=LockService.getScriptLock();if(!lock.tryLock(10000))return json_({ok:false,error:'busy_retry'});
  try{
   var book=SpreadsheetApp.openById(props.getProperty('SHEET_ID')),raw=book.getSheetByName('ocean_behavior_events'),summary=book.getSheetByName('ocean_behavior_summary');
   if(!raw||!summary||raw.getLastRow()<1||summary.getLastRow()<1)return json_({ok:false,error:'setup_required'});
   var rows=raw.getLastRow()>1?raw.getRange(2,1,raw.getLastRow()-1,RAW_HEADERS.length).getValues():[];
   var matching=rows.filter(function(row){return String(row[2])===r.sessionId;});
   var duplicate=matching.find(function(row){return String(row[0])===key;});
   var latest=matching.sort(function(a,b){return Number(b[4])-Number(a[4]);})[0];
   if(duplicate){
    if(String(duplicate[7])!==recordJson)return json_({ok:false,error:'record_conflict'});
    updateSummary_(summary,validateSession(JSON.parse(String(latest[7]))));
    SpreadsheetApp.flush();return json_({ok:true,duplicate:true,recordKey:key,version:BEHAVIOR_VERSION});
   }
   if(latest&&!compatibleSnapshot(validateSession(JSON.parse(String(latest[7]))),r))return json_({ok:false,error:'record_conflict'});
   var row=[key,new Date().toISOString(),r.sessionId,r.userId,r.revision,r.status,r.version,recordJson];
   var target=raw.getLastRow()+1;if(target>raw.getMaxRows())raw.insertRowsAfter(raw.getMaxRows(),100);
   raw.getRange(target,1,1,row.length).setValues([row.map(safeCell_)]);
   updateSummary_(summary,r);SpreadsheetApp.flush();
   return json_({ok:true,duplicate:false,recordKey:key,version:BEHAVIOR_VERSION});
  }finally{lock.releaseLock();}
 }catch(error){return json_({ok:false,error:'invalid_or_unavailable'});}
}
function updateSummary_(sheet,r){
 var scores=scoreBehavior(r),lastAt=r.endedAt||(r.answers.length?r.answers[r.answers.length-1].at:r.startedAt);
 if(!r.endedAt&&r.learning.length&&Date.parse(r.learning[r.learning.length-1].at)>Date.parse(lastAt))lastAt=r.learning[r.learning.length-1].at;
 var row=[r.sessionId,r.userId,r.isTest,r.version,r.status,r.startedAt,r.endedAt||'',r.answers.length,scores.completedPhases,Date.parse(lastAt)-Date.parse(r.startedAt)];
 PHASES.forEach(function(p){VARIABLES.forEach(function(v){row.push(scores.scores[p][v]===null?'':scores.scores[p][v]);});});
 ['post1','post2'].forEach(function(p){VARIABLES.forEach(function(v){row.push(scores.gains[p][v]===null?'':scores.gains[p][v]);});});
 var languages=[];r.answers.forEach(function(a){a.languagesSeen.forEach(function(l){if(languages.indexOf(l)<0)languages.push(l);});});r.learning.forEach(function(a){if(languages.indexOf(a.language)<0)languages.push(a.language);});
 row.push(languages.join(','),new Date().toISOString());
 var last=sheet.getLastRow(),existing=last>1?sheet.getRange(2,1,last-1,1).createTextFinder(r.sessionId).matchEntireCell(true).useRegularExpression(false).findNext():null;
 var target=existing?existing.getRow():last+1;if(target>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),100);
 sheet.getRange(target,1,1,row.length).setValues([row.map(safeCell_)]);
}
function equal_(a,b){if(a.length!==b.length)return false;var n=0;for(var i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function safeCell_(v){return typeof v==='string'&&/^[=+\-@\t\r]/.test(v)?"'"+v:v;}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
