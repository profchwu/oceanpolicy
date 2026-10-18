/** Google Sheets receiver. Configure SHEET_ID and SHARED_SECRET in Script Properties. */
var HEADERS = ['record_key','received_at_utc','user_id','session_id','phase','instrument_version','is_test','consent_version','started_at','completed_at','correct_count','total_items','accuracy_percent','unknown_count','reduced_motion','q1_answer','q1_correct','q1_response_ms','q2_answer','q2_correct','q2_response_ms','q3_answer','q3_correct','q3_response_ms','q4_answer','q4_correct','q4_response_ms','q5_answer','q5_correct','q5_response_ms','q6_answer','q6_correct','q6_response_ms','answers_json','events_json'];
var SERVER_KEYS = {pre:['2','3','1','3','2','1'],post1:['2','3','1','3','2','1'],post2:['3','1','2','1','3','2']};
// One cognition construct, measured at three times. Gains are derived, not extra scales.
var SUMMARY_HEADERS = ['session_id','user_id','pre_score','post1_score','post2_score','gain_post1','gain_post2','completed_phases','is_complete','is_test','instrument_version','started_at','updated_at_utc'];

function setup() {
  var props=PropertiesService.getScriptProperties();
  var id=props.getProperty('SHEET_ID');
  if(!id) throw new Error('Set SHEET_ID in Script Properties first.');
  if(!props.getProperty('SHARED_SECRET')) throw new Error('Set a long random SHARED_SECRET in Script Properties.');
  var book=SpreadsheetApp.openById(id);
  var sheet=book.getSheetByName('ocean_records');
  if(!sheet) sheet=book.insertSheet('ocean_records');
  if(sheet.getMaxColumns()<HEADERS.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),HEADERS.length-sheet.getMaxColumns());
  if(sheet.getLastRow()===0){
    sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,HEADERS.length).setBackground('#143642').setFontColor('#ffffff').setFontWeight('bold');
  }else if(JSON.stringify(sheet.getRange(1,1,1,HEADERS.length).getValues()[0])!==JSON.stringify(HEADERS)){
    throw new Error('Existing ocean_records header differs. No data was changed.');
  }
  // Store IDs as text, including identifiers beginning with zero.
  sheet.getRange('C:D').setNumberFormat('@');
  var summary=book.getSheetByName('ocean_summary');
  if(!summary)summary=book.insertSheet('ocean_summary');
  if(summary.getMaxColumns()<SUMMARY_HEADERS.length)summary.insertColumnsAfter(summary.getMaxColumns(),SUMMARY_HEADERS.length-summary.getMaxColumns());
  if(summary.getLastRow()===0){
    summary.getRange(1,1,1,SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]);
    summary.setFrozenRows(1);
    summary.getRange(1,1,1,SUMMARY_HEADERS.length).setBackground('#143642').setFontColor('#ffffff').setFontWeight('bold');
  }else if(JSON.stringify(summary.getRange(1,1,1,SUMMARY_HEADERS.length).getValues()[0])!==JSON.stringify(SUMMARY_HEADERS)){
    throw new Error('Existing ocean_summary header differs. Summary data was not changed.');
  }
  summary.getRange('A:B').setNumberFormat('@');
}

function doGet(){return json_({ok:true,service:'ocean-policy-sheet-receiver',version:'v2'});}
function doPost(e){
  try {
    if(!e||!e.postData||e.postData.contents.length>80000) return json_({ok:false,error:'invalid_request'});
    var body=JSON.parse(e.postData.contents);
    var props=PropertiesService.getScriptProperties();
    var secret=props.getProperty('SHARED_SECRET');
    if(!secret||secret.length<32||!equal_(secret,String(body.secret||''))) return json_({ok:false,error:'unauthorized'});
    var r=body.record;
    validate_(r);
    var key=r.sessionId+':'+r.phase;
    var score=r.answers.map(function(a,i){return a.value===SERVER_KEYS[r.phase][i]?1:0;});
    var correct=score.reduce(function(a,b){return a+b;},0);
    var row=[key,new Date().toISOString(),r.userId,r.sessionId,r.phase,r.version,r.isTest,r.consentVersion,r.startedAt,r.completedAt,correct,6,Math.round(correct/6*1000)/10,r.answers.filter(function(a){return a.value==='unknown';}).length,r.reducedMotion];
    r.answers.forEach(function(a,i){row.push(a.value,score[i],a.responseMs);});
    row.push(JSON.stringify(r.answers),JSON.stringify(r.events));
    var lock=LockService.getScriptLock();
    if(!lock.tryLock(15000))return json_({ok:false,error:'busy_retry'});
    try {
      var book=SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
      var sheet=book.getSheetByName('ocean_records');
      var summary=book.getSheetByName('ocean_summary');
      if(!sheet || sheet.getLastRow()<1 || !summary || summary.getLastRow()<1) return json_({ok:false,error:'setup_required'});
      var last=sheet.getLastRow();
      if(last>1){
        var existing=sheet.getRange(2,1,last-1,1).createTextFinder(key).matchEntireCell(true).useRegularExpression(false).findNext();
        if(existing){
          var previous=sheet.getRange(existing.getRow(),1,1,HEADERS.length).getValues()[0];
          var same=String(previous[2])===r.userId && String(previous[33])===JSON.stringify(r.answers) && String(previous[34])===JSON.stringify(r.events);
          if(!same)return json_({ok:false,error:'record_conflict'});
          // Repair the summary on retry if the raw write succeeded but its receipt was lost.
          updateSummary_(sheet,summary,r.sessionId);
          SpreadsheetApp.flush();
          return json_({ok:true,recordKey:key,duplicate:true});
        }
        var first=sheet.getRange(2,4,last-1,1).createTextFinder(r.sessionId).matchEntireCell(true).useRegularExpression(false).findNext();
        if(first && String(sheet.getRange(first.getRow(),3).getValue())!==r.userId) return json_({ok:false,error:'session_user_conflict'});
      }
      if(r.phase!=='pre'){
        var prior=r.sessionId+':'+(r.phase==='post1'?'pre':'post1');
        if(last===1 || !sheet.getRange(2,1,last-1,1).createTextFinder(prior).matchEntireCell(true).useRegularExpression(false).findNext()) return json_({ok:false,error:'previous_phase_required'});
      }
      // One range write per phase: retry uses record_key and cannot append a duplicate phase.
      if(last>=sheet.getMaxRows())sheet.insertRowsAfter(last,100);
      sheet.getRange(last+1,1,1,row.length).setValues([row.map(safeCell_)]);
      updateSummary_(sheet,summary,r.sessionId);
      SpreadsheetApp.flush();
      return json_({ok:true,recordKey:key,duplicate:false});
    }finally{lock.releaseLock();}
  }catch(error){return json_({ok:false,error:'invalid_or_unavailable'});}
}

function updateSummary_(sheet,summary,sessionId){
  var records=['pre','post1','post2'].map(function(phase){
    var cell=sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(sessionId+':'+phase).matchEntireCell(true).useRegularExpression(false).findNext();
    return cell?sheet.getRange(cell.getRow(),1,1,HEADERS.length).getValues()[0]:null;
  });
  var pre=records[0];
  if(!pre)throw Error('previous_phase_required');
  var scores=records.map(function(r){return r?Number(r[10]):'';});
  var complete=records.filter(function(r){return r!==null;}).length;
  // Empty means unfinished, while 0 is a valid score and must participate in subtraction.
  var gain1=records[1]?scores[1]-scores[0]:'';
  var gain2=records[2]?scores[2]-scores[0]:'';
  var row=[sessionId,pre[2],scores[0],scores[1],scores[2],gain1,gain2,complete,complete===3,pre[6],pre[5],pre[8],new Date().toISOString()];
  var last=summary.getLastRow();
  var existing=last>1?summary.getRange(2,1,last-1,1).createTextFinder(sessionId).matchEntireCell(true).useRegularExpression(false).findNext():null;
  var target=existing?existing.getRow():last+1;
  if(target>summary.getMaxRows())summary.insertRowsAfter(summary.getMaxRows(),100);
  summary.getRange(target,1,1,row.length).setValues([row.map(safeCell_)]);
}

function validate_(r){
  if(!r||!Object.prototype.hasOwnProperty.call(SERVER_KEYS,r.phase)||r.version!=='ocean-click-v2.0.0')throw Error('version');
  if(!/^[A-Za-z0-9_-]{3,32}$/.test(r.userId)||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.sessionId))throw Error('id');
  if(typeof r.isTest!=='boolean'||typeof r.reducedMotion!=='boolean'||r.consentVersion!=='notice-v2')throw Error('metadata');
  if(!Array.isArray(r.answers)||r.answers.length!==6||!Array.isArray(r.events)||r.events.length>300)throw Error('length');
  if(!Number.isFinite(Date.parse(r.startedAt))||!Number.isFinite(Date.parse(r.completedAt)))throw Error('dates');
  r.answers.forEach(function(a,i){
    if(a.itemId!==r.phase+'-k'+(i+1)||['1','2','3','unknown'].indexOf(a.value)<0||!Number.isFinite(a.responseMs)||a.responseMs<0||a.responseMs>86400000)throw Error('answer');
    if(!Array.isArray(a.order)||a.order.length!==4||a.order.slice().sort().join(',')!=='1,2,3,unknown')throw Error('order');
    if(!Number.isFinite(Date.parse(a.shownAt))||!Number.isFinite(Date.parse(a.answeredAt)))throw Error('answer_date');
    if(a.language!==undefined&&['zh-Hant','en'].indexOf(a.language)<0)throw Error('answer_language');
    if(a.languagesSeen!==undefined&&(!Array.isArray(a.languagesSeen)||a.languagesSeen.length<1||a.languagesSeen.length>2||a.languagesSeen.some(function(l){return l!=='zh-Hant'&&l!=='en';})||a.languagesSeen.indexOf(a.language)<0))throw Error('answer_languages_seen');
  });
}
function equal_(a,b){if(a.length!==b.length)return false;var n=0;for(var i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function safeCell_(v){return typeof v==='string'&&/^[=+\-@\t\r]/.test(v)?"'"+v:v;}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
