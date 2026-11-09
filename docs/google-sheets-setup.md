# Google Sheets 與 GAS 新專案設定

[回到開發 Prompt](development-prompts.md) · [直接下載 GAS](../google-apps-script/NewsReceiver.template.gs)

Google Sheets 儲存資料：新專案完整步驟

適用範圍
本範本供「新的空白試算表」使用，與本遊戲 /api/news-record 的資料格式相容。不要直接覆蓋目前已上線的 GAS 或既有研究表格。原有 NewsReceiver.gs 是既有欄位相容版；NewsReceiver.template.gs 是含建表程序的新專案範本，兩者擇一，不可貼進同一個 GAS 專案。本次只新增文件與範本，未替換線上接收器。

1. 建立私人試算表
建立新的 Google 試算表，不需要將試算表設為公開。從網址 /d/ 與 /edit 之間取得試算表 ID。此值不是 GAS 專案 ID，也不是部署作業 ID。不要把研究試算表的實際網址寫入公開 GitHub。

2. 建立 GAS 專案並貼上範本
可由試算表「擴充功能 → Apps Script」建立綁定專案，或建立獨立 Apps Script 專案。刪除新專案預設的 myFunction，完整貼上 NewsReceiver.template.gs，儲存。範本不依賴 getActiveSpreadsheet，而是讀取 SHEET_ID，兩種建立方式皆需下一步設定。

3. 設定指令碼屬性
在 GAS「專案設定 → 指令碼屬性」新增 SHEET_ID，填入自己的試算表 ID。NEWS_SHARED_SECRET 可先不填；初始化會產生隨機密鑰，之後在指令碼屬性中查看並安全保存。若自行設定，使用高強度隨機密鑰，勿使用範例字串。密鑰不要放在前端、Prompt、截圖、README 或 GitHub。

4. 初始化空白表格
在函式選單選 setupNewResearchWorkbook，按執行並由帳號擁有者完成 Google 授權。只對新空白研究工作表執行一次。若目標工作表已有內容，會回報 NONEMPTY_SHEET 並停止，不會清除資料。
範本建立五張工作表：
・前後測資料：放在第一張，輸入 User ID 時間在 user_id 前面，接著為政策、調整及整體前後測與差值。
・遊玩資料：接收器原始欄位。保留相容欄位位置，不可任意搬移。
・操作紀錄：每關兩次玩家決策及一次外部事件，共九筆事件。
・同步紀錄：run_id、revision、完整 record_json、接收時間，處理同一局重試。
・整體摘要：只統計「納入」紀錄的人數、前後測平均、平均差值及完成秒數。
預設 Asia/Taipei 時區。前後測資料的 A2 是自動展開公式，下方不要手動輸入資料，避免 #REF!。

5. 確認新範本欄位與公式
前後測資料 A=輸入 User ID 時間、B=user_id、C–E=政策前／後／差值、F–H=調整前／後／差值、I–K=整體前／後／差值、L=run_id、M=完成狀態、N=完成時間、O=總秒數、P=統計納入狀態、Q–V=三關六次決策的 0/1。
每關分數=(政策+調整)/2×100；前測=第1關；後測=第2、3關平均；差值=後測−前測（百分點）。總秒數=(completedAt−userIdEnteredAt)/1000，含閱讀及背景分頁時間。
原始表 AF、AG、AH 存 ID 確認時間、完成時間、總秒數；舊證據欄位只保留空白相容位置，不納入評分。新範本的主分析表不顯示證據欄位。此欄位配置不代表既有正式表格已被搬移。

6. 部署 GAS 網頁應用程式
選「部署 → 新增部署作業 → 網頁應用程式」。執行身分選自己，存取權選允許伺服器無須 Google 登入即可呼叫的「所有人」。這只公開密鑰保護的接收端，不代表公開試算表。若 Workspace 管理政策不允許此選項，需請管理員處理，不能改成把密鑰放到前端繞過。
複製正式部署的 /exec 網址；不是編輯器 /edit、測試 /dev 或試算表網址。瀏覽 /exec 只會看到服務健康 JSON，不會顯示研究資料。
日後修改程式，需在「管理部署作業 → 編輯 → 建立新版本 → 部署」更新原部署，才會讓 /exec 使用新程式；單純儲存不等於上線。
官方說明：https://developers.google.com/apps-script/guides/web

7. 設定網站伺服器的兩個 Secret
NEWS_SHEETS_URL = 自己的 GAS 正式 /exec 網址。
NEWS_SHEETS_SECRET = GAS 的 NEWS_SHARED_SECRET，兩者值必須完全相同。
Cloudflare 可在 Worker 的設定中新增 Secret，或使用專案的互動命令：
npx wrangler secret put NEWS_SHEETS_URL --name oceanpolicy-v2
npx wrangler secret put NEWS_SHEETS_SECRET --name oceanpolicy-v2
不要將密鑰值直接寫進命令列。移植後 Worker 名稱不同時，同步修改 --name。原版 Sites 請在該站獨立的私人環境設定相同兩個變數，GitHub 並不會自動幫兩站傳遞密鑰。
GAS 屬性官方說明：https://developers.google.com/apps-script/guides/properties

8. 串接方式與資料契約
瀏覽器 → 同網域 /api/news-record → GAS doPost → Google Sheets。
瀏覽器只送遊玩紀錄或 {action:"checkUserId",userId:"TestA123"}，不要送 secret。伺服器讀取 Secret，驗證 Origin、ID、同意版本、完成狀態、時間及決策，依正式政策設定計算 scores/events，再呼叫 GAS。
GAS 查詢回覆 {ok:true,available:true/false}；寫入回覆 {ok:true,runId,revision}；網站核對 runId/revision 才視為已儲存。GAS 的業務錯誤可能仍是 HTTP 200，必須讀取 JSON 的 ok/error，不能只看 HTTP 狀態。
沿用 app/api/news-record/route.ts、app/useNewsSync.ts、lib/news-record.ts 的完整資料契約，不要用單純 appendRow 取代。API 保存前會取得安全 Cookie；不要省略既有驗證流程。

9. 完成後才寫入與重複 ID
未同意、未完成或中途退出都不寫入研究紀錄；開始前查詢 ID 是只讀。ID 限4–32位 ASCII 英數字且至少一個英文字母，不分大小寫檢查重複。
最終寫入在 GAS ScriptLock 內再次查重；同一 run_id 重試可重複確認但不新增紀錄。兩人同時使用尚未登記的 ID 時，開始查詢可能都通過；最後衝突者保留成果、換新 ID 再儲存。網路錯誤不得假裝儲存成功；保留完成紀錄重試。

10. 驗收與故障排查
先在新的測試試算表完成兩次合成測試，不用真實參與者資料。完成前表格無新增；完成後核對一筆遊玩資料、一筆同步紀錄、九筆操作紀錄，以及主分析表的 ID、時間、分數及差值。第一局完成後用相同 ID 與大小寫變體再開始，應被拒絕；1234 應拒絕，新英數 ID 應通過。同一 run_id 重試不能增加列。
範例：珊瑚50分、海草100分、風電50分→前測50、後測75、差值+25百分點。若總耗時60秒，主分析表 O 應為60。將測試列的遊玩資料 A 欄改為「測試」，主分析表會顯示「示範不納入」，摘要排除。
setup_required：尚未初始化或工作表名稱錯誤；unauthorized：兩端密鑰不一致；invalid_record：格式不符；completion_required：未完成或時間／同意欄位缺漏；user_id_taken：ID已登記；ID_CHECK_UNAVAILABLE：檢查部署版本、權限與網路後重試；SAVE_NOT_CONFIRMED：保留結果，不重建 run_id，檢查接收器再重試。
不要直接在 GAS 編輯器執行 doPost（它需要 HTTP 事件參數）；初始化才執行 setupNewResearchWorkbook。新範本已做本機模擬測試，尚未在你的新試算表執行；移植時必須完成上述線上驗收。

## 完整 GAS 範本

```javascript
// NEW spreadsheet template only. Do not overwrite an existing research receiver.
// Copy this whole file into one Apps Script project; do not also paste NewsReceiver.gs.
function setupNewResearchWorkbook(){
 const book=SpreadsheetApp.openById(researchSheetId());
 const names=['前後測資料','遊玩資料','操作紀錄','同步紀錄','整體摘要'];
 for(const name of names){const s=book.getSheetByName(name);if(s&&s.getLastRow()>0)throw Error('NONEMPTY_SHEET: '+name+'；請改用新的空白試算表，不會清除既有資料。');}
 book.setSpreadsheetTimeZone('Asia/Taipei');
 const rawHeaders=['sample_type','run_id','player_id','version','language','status','started_at','ended_at','pre_policy','reserved_pre','pre_adaptation','post1_policy','reserved_post1','post1_adaptation','post2_policy','reserved_post2','post2_adaptation','policy_pre','policy_post','policy_gain','reserved_1','reserved_2','reserved_3','adaptation_pre','adaptation_post','adaptation_gain','overall_pre','overall_post','overall_gain','inclusion','user_id','user_id_entered_at','completed_at','total_seconds'];
 const headers=['輸入User ID時間','user_id','政策前測','政策後測','政策差值','調整前測','調整後測','調整差值','整體前測','整體後測','整體差值','run_id','完成狀態','遊戲完成時間','完成總時間（秒）','統計納入狀態','珊瑚政策0/1','珊瑚調整0/1','海草政策0/1','海草調整0/1','風電政策0/1','風電調整0/1'];
 for(const [name,head] of [['前後測資料',headers],['遊玩資料',rawHeaders],['操作紀錄',EVENT_HEADERS],['同步紀錄',['run_id','revision','record_json','received_at']],['整體摘要',['項目','數值']]]){
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
```
