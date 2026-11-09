# 海島新聞任務：完整開發 Prompt 與解析

依需求演進整理的可重現開發 Prompt，非原始對話逐字紀錄。文件更新：2026-11-09。請按步驟使用並帶入當前專案；以下驗收項目是工作要求，不代表本文件更新時重新執行了全部測試。

[回到遊戲說明](../README.md) · [HTML 複製工具](development-prompts.html)

**使用方式：** GitHub 的程式碼區塊可直接複製。HTML 請下載後以瀏覽器開啟，提供逐步及全部 Prompt 複製按鈕，不需要網路或登入。

**版本狀態：** 中文預設，English 按鈕暫時隱藏；「前後測設計」已顯示。重複 ID 檢查已於 2026-11-09 部署至 Cloudflare 與原版 Sites；移植到新主機時仍須依第 13 步驗證。公開文件不包含密鑰、私人接收網址或玩家紀錄。

## 1. 需求與研究範圍

### 可複製 Prompt

```text
建立一款單人、點選即可玩的海洋政策教育網頁遊戲。目標是讓一般玩家理解政策如何影響環境與氣候，在約十分鐘內完成三關。預設繁體中文，保留完整英文翻譯。先整理玩家、研究目的、限制、必要功能與驗收條件，再提出玩法；未確認玩法前不要大量實作。區分環境模擬結果與研究行為得分。
```

**解析：** 先限定遊玩時間和操作負擔，避免把研究問卷直接搬進遊戲。以可觀察的決策行為衡量表現，不能把娛樂性或環境數值當作學習效果。

**產出與驗收：** 需求表、操作流程、研究問題與驗收清單。

## 2. 新聞與政策證據

### 可複製 Prompt

```text
調查海洋政策教育遊戲的既有類型及官方新聞來源。為珊瑚、海草、離岸風電各選一則可查證新聞，記錄原文連結、發布日期、事件日期與摘要。核對科學因果及政策限制。真實新聞與另設的遊戲情境必須分開標示；不可杜撰報導、研究數字或引用。新聞配圖若為 AI 生成，標明情境示意圖。
```

**解析：** 新聞提供決策情境，官方來源支撐教育內容。發布時間不等於事件發生時間；遊戲中的暴雨或故障也不能假稱為原新聞事件。

**產出與驗收：** 三則可追溯來源、改寫新聞及模擬情境說明。

## 3. 好玩的決策循環

### 可複製 Prompt

```text
將關卡順序固定為珊瑚、海草、風電。每關兩次決策，每次三個選項：先處理原始環境問題，再面對一項外部事件選擇應變。選項須具有可理解的取捨，選錯可能使環境惡化。移除額外『成效證據』測驗及重複觀察步驟。玩家點選政策後立即知道執行方向，再以約五秒動畫展示環境變化，最後說明原因。
```

**解析：** 決策—回饋—應變讓玩家主動修正判斷。外部事件增加挑戰，但其自動造成的損失不可算成玩家的錯誤決策。

**產出與驗收：** 三關各六個選項、預算及環境影響表；新玩家不需額外教學即可完成。

## 4. 完整流程與狀態控制

### 可複製 Prompt

```text
用明確狀態管理：研究說明與同意→User ID→彩色新聞→政策選擇→關閉選擇視窗→完整播放變化→影響說明→外部事件→應變選擇→完整播放變化→本關成果→下一關。第三關完成後進入總結、送出研究紀錄及通關密碼。禁止動畫尚未完成就跳關；完成後讓玩家看清場景再主動下一步。任何視窗不能殘留遮住動畫；重新整理不能重複扣預算或計分。
```

**解析：** 流程的每一個狀態都要有唯一主要操作。用狀態機避免新聞、政策選單與結果視窗同時出現，也避免重複點擊造成不同資料。

**產出與驗收：** 狀態轉移圖、重載與連點測試；每個狀態都有清楚下一步。

## 5. 環境因果與數值

### 可複製 Prompt

```text
建立每個政策的數值增減、影響位置、動畫類型、原因及限制。珊瑚關：減污可減輕地方壓力，不能直接消除海洋熱浪。海草關：先改善水質與底質，種植數不代表存活率或已驗證碳匯。風電關：風機數不等於供電，須考慮併網、海纜與棲地。採 0–100 教學指數，禁止標成實測溫度、排放或碳匯。外部事件與政策效應分開記帳。結果顯示原值→新值、帶正負號差值及上升下降文字；顏色依指標的好壞方向決定。
```

**解析：** 可見變化必須對應政策因果，不能用通用特效代替。改善地方環境與減緩全球暖化是不同作用，必須保留限制說明。

**產出與驗收：** 可核對的政策效果矩陣；畫面、報告與儲存值一致，且不混淆事件損失。

## 6. 前後期評分設計

### 可複製 Prompt

```text
只記錄政策判斷 P 與應變決策 A，依當關情境各給 0 或 1 分。逐一從政策設定列出三關所有選項及分數，不可自行猜測。每關=(P+A)/2×100；前測為第一關；後測為第二、三關平均；差值=後測−前測，以百分點呈現。個別 P、A 用相同前後期算法。未作答保留缺漏，不記零；外部事件不計分。用同一個視窗呈現公式圖、完整得分表與例子。註明不同關卡不是經驗證的等值測驗，差值只能代表早期／後期行為表現差異。
```

**解析：** 變數少、公式透明，研究者才能核對。第一關與後兩關內容及回饋不同，因此不能把差值直接解讀成遊戲造成的學習增益。

**產出與驗收：** 完整政策評分表、公式圖、缺漏處理；例：50、100、50→後測75、差值+25百分點。

## 7. 版面與可讀性

### 可複製 Prompt

```text
設計同一視窗內的遊戲版面，海島為最大區域，儀表板及操作列保持精簡。PC 不需整頁捲動；窄螢幕重排而非縮小所有字體，必要長篇內容使用分頁。標題、內文、數字、觸控按鈕有明確尺寸層級。新聞使用彩色照片、報頭、日期、標題、分欄及來源，像完整報紙。主要視窗固定置中，開啟時有焦點管理。保留中英文文字及研究設計功能，以設定控制按鈕顯示；目前中文預設，English 隱藏，『前後測設計』顯示。
```

**解析：** 沉浸感依賴場景有足夠空間，不是堆疊資訊。控制尺寸、分頁及焦點，可兼顧手機、桌機與鍵盤使用。

**產出與驗收：** 桌機與手機截圖；沒有數字溢出、遮住海島或看不清的得分列表。

## 8. 一致風格的圖片資產

### 可複製 Prompt

```text
使用 image 工具製作三關新聞圖及政策環境變化圖。採明亮、立體微縮海島風格；同一關固定鏡頭、地形、光源與主要物件位置。依實際政策效果表列出需要的受損、中間、改善及惡化狀態，先生成再串接，不要將同一張健康海島套用所有數值。珊瑚開局應呈現白化及污染，海草開局稀疏且混濁，風電開局呈現供電問題。人物、車輛、船隻與設施同風格，避免平面貼紙感。圖片不要生成文字；標題和數值由介面排版。
```

**解析：** 固定構圖讓玩家能比較同一位置的前後差異。圖片狀態應由環境值與政策共同決定，避免低健康指數卻顯示健康珊瑚。

**產出與驗收：** 資產清單、狀態對照表及授權／AI 來源標示；所有分支都有合適圖片或組合圖層。

## 9. 動畫與載入效能

### 可複製 Prompt

```text
為每個政策設定對應區域與約五秒漸變：施工分階段、污染擴散或消退、珊瑚逐步變色、海草疏密改變、風機與海纜運作改變。用同風格但高對比的光圈、指引及正負數字標出受影響位置；結束清除臨時特效，保留新的環境狀態。人物、車輛、船與海浪持續運動，避免擋住重點。預先生成圖片並轉 WebP；優先載入當關新聞與初始場景，背景預載下一步素材，不在每次遊玩即時生成圖片。載入失敗有可見替代內容。
```

**解析：** 政策動畫與日常動態分開；前者解釋因果，後者維持沉浸感。五秒是時間壓縮而非真實生態恢復時間；大量原始 PNG 會拖慢新聞載入。

**產出與驗收：** 每個政策動畫逐一對照影響表；慢網路測試、圖片網址檢查與特效清除檢查。

## 10. 程式架構與可移植性

### 可複製 Prompt

```text
以 TypeScript、React 及資料驅動的關卡設定實作。分離政策資料、評分、狀態流程、場景呈現與儲存同步。沿用專案目前的建置與 Cloudflare Workers 設定，不任意更換框架。架構為瀏覽器→同網域 API→Google Apps Script→Google Sheets。所有密鑰只在伺服器與 GAS 私人設定；前端不能取得密鑰。提供本機啟動、測試、建置、部署及移機說明，圖片使用專案內可攜路徑。
```

**解析：** 把教育規則從畫面程式分離，才容易驗證分數及新增政策。包含 API 的系統不能直接當成純靜態 GitHub Pages 網站部署。

**產出與驗收：** 模組圖、設定範本、可重現安裝與建置指令，沒有寫死私人主機路徑。

## 11. 同意書與識別碼

### 可複製 Prompt

```text
遊戲開頭提供簡短分頁說明、資料用途及自願參與條款，勾選後才能開始。不要顯示研究者的姓名或學校於玩家介面。說明研究參與者需完整遊玩後填寫後續問卷。User ID 限 4–32 位 ASCII 英數字，至少一個英文字母；前後端都驗證，1234 不可通過。不要要求姓名或信箱。僅在完成三關後上傳研究紀錄；中途退出清除本機未完成進度，不送出研究紀錄。將代碼資料稱為編碼化資料，不宣稱完全無法連結身分。
```

**解析：** 識別碼可用來連結問卷，因此『完全匿名』可能不精確。告知內容必須符合實際上傳時機，不能只修改文字而保留途中上傳。

**產出與驗收：** 未勾選不可開始、1234拒絕、英數代碼可用；中途退出無研究資料寫入。

## 12. Google Sheets 紀錄與時間

### 可複製 Prompt

```text
以 run_id 作為重試與更新的穩定識別，送出 User ID、確認 ID 的時間、完成時間、總秒數、政策選擇、兩項行為分數、環境前後值與版本。總秒數=(completedAt−userIdEnteredAt)/1000，包含閱讀與背景分頁時間；不是純操作時間。主要分析表第一欄為輸入 ID 時間，其後為 user_id，再列前後期分數與差值。未完成及缺資料保持空白；測試紀錄標示不納入。GAS 驗證密鑰、欄位與完成狀態，寫入後回覆成功；失敗可重試且不產生重複紀錄。公開文件只列 NEWS_SHEETS_URL、NEWS_SHEETS_SECRET 等設定名稱及占位符。
```

**解析：** 同一筆完成紀錄可能因網路重試送出多次，因此不能無條件新增列。時間由瀏覽器回報，需要揭露其限制。

**產出與驗收：** 試算表公式與遊戲分數一致；完成一局只產生一筆分析紀錄，重試不改完成時間。

## 13. 重複 ID 檢查與部署

### 可複製 Prompt

```text
此功能已於 2026-11-09 在本專案上線。移植或重新開發時，仍須完成以下整合與驗證，不能只憑既有文件宣稱新環境已完成。開始前向同網域 API 檢查 ID 是否已存在，大小寫視為相同；檢查失敗時提示重試。檢查只讀取，不提前建立研究紀錄。GAS 最終寫入須在鎖定區段再次檢查，避免兩人同時使用同一 ID；相同 run_id 的重試仍允許。發生衝突時保存已完成結果，讓玩家換新 ID 再送出。先確認並更新實際 GAS 接收器，再部署前端與 API，最後用兩個瀏覽器驗證。不要覆蓋線上既有的客製公式。
```

**解析：** 先查詢不能防止並行競爭；最終寫入仍須原子檢查。因未完成不能留下研究紀錄，此方案不提前保留 ID，需處理最後一刻衝突。

**產出與驗收：** GAS、API、前端三者版本一致；並行、大小寫、同局重試與斷線都有測試證據。

## 14. 完整驗證與研究測試

### 可複製 Prompt

```text
重玩全部政策分支並檢查評分、環境變化及動畫順序。三關共六次三選一決策，共 3^6=729 條路徑；保留英文時測兩語系。驗證每局六次玩家決策與三次外部事件，事件不計分。另以兩個合成玩家完整操作，確認開始時間、完成時間、差值及只在完成後寫入；測試紀錄排除於研究分析。測試連點、重新整理、慢網路、圖片失敗、倒數到期及退出。分開報告實際執行的測試與尚未驗證項目，不可只憑單元測試宣稱線上儲存成功。
```

**解析：** 數學分支測試驗證規則，真實瀏覽器與試算表核對驗證整合；兩者不能互相取代。研究測試資料不得混入正式樣本。

**產出與驗收：** 有日期、版本、預期值與實際值的測試報告；沒有未說明的失敗項目。

## 15. GitHub、Cloudflare 與保存

### 可複製 Prompt

```text
維持原 ChatGPT Sites 與 Version 2 為獨立部署。GitHub 保存可公開程式、圖片與文件；Cloudflare 執行 Version 2 與伺服器 API。發佈前檢查追蹤檔案及差異，排除密鑰、真實試算表接收網址、玩家資料、私有備份與測試匯出。透過 Cloudflare 私人環境設定連接 GAS。原站不得因新版部署被修改。備份版本、套件鎖定檔、GAS 程式、素材及安裝手冊；私人設定另行安全保存。部署後驗證資產、遊玩及資料接收，記錄可回復的版本。
```

**解析：** 公開原始碼與私人研究設定必須分離。保留兩個站點有助對照與回復，但每站都需獨立確認後端相容性。

**產出與驗收：** 乾淨的 GitHub 差異、安全檢查結果、部署網址及移機手冊；不把密鑰寫進 README。

## 16. 論文圖件與開發 Prompt 文件

### 可複製 Prompt

```text
製作兩張繁體中文及兩張英文說明圖：流程與評分、三關場景與政策。採 A4、300 dpi（直式2480×3508像素）或可縮放向量，文字用排版工具呈現，避免生成圖片中文字模糊。每個圖件標註版本，與實際評分規則核對。README 首頁放遊戲說明及輕量流程圖，安裝放 INSTALL。製作可離線閱讀的 HTML 開發手冊，每步包含可複製 Prompt、解析、預期產出與驗收。註明這是依需求整理的重建指南，非原始對話逐字稿；保留研究限制與待部署事項。
```

**解析：** 論文圖件要能辨認文字並準確反映研究版本。GitHub 不執行 HTML 按鈕腳本，因此同時提供 Markdown 原生複製區塊與可下載 HTML。

**產出與驗收：** 四張清晰圖件、GitHub 可讀文件、離線 HTML 複製按鈕與完整開發流程。



## Google Sheets 儲存步驟與 GAS 範本

[獨立安裝步驟與完整程式](google-sheets-setup.md) · [下載 GAS 範本](../google-apps-script/NewsReceiver.template.gs)

以下步驟及完整 GAS 也已收錄於最後的整合 Prompt；可一次複製。

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

## 完整整合 Prompt

以下將全部 16 步需求與驗收合併為一份，可直接複製整個區塊貼到 Gemini 或其他開發工具。

```text
你是一位教育遊戲設計師、海洋政策內容編輯與全端工程師。請依下列完整需求，協助開發、驗證及保存「海島新聞任務」網頁政策教育遊戲。

每次修改專案，都必須同步更新逐步 Prompt 說明、完整整合 Prompt 與受影響的文件；完成適當測試及敏感資料檢查後，將本次變更提交並推送到既有 GitHub 儲存庫。不得上傳密鑰、私人研究網址或玩家資料；若推送受阻，明確回報原因，不可宣稱已更新。

這份需求是整理後的開發規格，不是原始對話逐字稿。若已有專案，先閱讀現有程式及文件，保留已完成的功能，核對目前部署狀態，再補齊需求；若從零開始，先建立需求、玩法與架構，再逐步實作。不可聲稱尚未測試或部署的項目已完成。

執行方式：依下面 16 步處理，每步都核對產出與驗收；先提出玩法與流程供確認，再進行大量實作。私人密鑰及研究資料只能透過私人設定提供，不可寫入公開程式或文件。本文第 13 步在原專案已上線；移植時請重新核實 GAS 與網站版本並驗證。

1. 需求與研究範圍
建立一款單人、點選即可玩的海洋政策教育網頁遊戲。目標是讓一般玩家理解政策如何影響環境與氣候，在約十分鐘內完成三關。預設繁體中文，保留完整英文翻譯。先整理玩家、研究目的、限制、必要功能與驗收條件，再提出玩法；未確認玩法前不要大量實作。區分環境模擬結果與研究行為得分。
產出與驗收：需求表、操作流程、研究問題與驗收清單。

2. 新聞與政策證據
調查海洋政策教育遊戲的既有類型及官方新聞來源。為珊瑚、海草、離岸風電各選一則可查證新聞，記錄原文連結、發布日期、事件日期與摘要。核對科學因果及政策限制。真實新聞與另設的遊戲情境必須分開標示；不可杜撰報導、研究數字或引用。新聞配圖若為 AI 生成，標明情境示意圖。
產出與驗收：三則可追溯來源、改寫新聞及模擬情境說明。

3. 好玩的決策循環
將關卡順序固定為珊瑚、海草、風電。每關兩次決策，每次三個選項：先處理原始環境問題，再面對一項外部事件選擇應變。選項須具有可理解的取捨，選錯可能使環境惡化。移除額外『成效證據』測驗及重複觀察步驟。玩家點選政策後立即知道執行方向，再以約五秒動畫展示環境變化，最後說明原因。
產出與驗收：三關各六個選項、預算及環境影響表；新玩家不需額外教學即可完成。

4. 完整流程與狀態控制
用明確狀態管理：研究說明與同意→User ID→彩色新聞→政策選擇→關閉選擇視窗→完整播放變化→影響說明→外部事件→應變選擇→完整播放變化→本關成果→下一關。第三關完成後進入總結、送出研究紀錄及通關密碼。禁止動畫尚未完成就跳關；完成後讓玩家看清場景再主動下一步。任何視窗不能殘留遮住動畫；重新整理不能重複扣預算或計分。
產出與驗收：狀態轉移圖、重載與連點測試；每個狀態都有清楚下一步。

5. 環境因果與數值
建立每個政策的數值增減、影響位置、動畫類型、原因及限制。珊瑚關：減污可減輕地方壓力，不能直接消除海洋熱浪。海草關：先改善水質與底質，種植數不代表存活率或已驗證碳匯。風電關：風機數不等於供電，須考慮併網、海纜與棲地。採 0–100 教學指數，禁止標成實測溫度、排放或碳匯。外部事件與政策效應分開記帳。結果顯示原值→新值、帶正負號差值及上升下降文字；顏色依指標的好壞方向決定。
產出與驗收：可核對的政策效果矩陣；畫面、報告與儲存值一致，且不混淆事件損失。

6. 前後期評分設計
只記錄政策判斷 P 與應變決策 A，依當關情境各給 0 或 1 分。逐一從政策設定列出三關所有選項及分數，不可自行猜測。每關=(P+A)/2×100；前測為第一關；後測為第二、三關平均；差值=後測−前測，以百分點呈現。個別 P、A 用相同前後期算法。未作答保留缺漏，不記零；外部事件不計分。用同一個視窗呈現公式圖、完整得分表與例子。註明不同關卡不是經驗證的等值測驗，差值只能代表早期／後期行為表現差異。
產出與驗收：完整政策評分表、公式圖、缺漏處理；例：50、100、50→後測75、差值+25百分點。

7. 版面與可讀性
設計同一視窗內的遊戲版面，海島為最大區域，儀表板及操作列保持精簡。PC 不需整頁捲動；窄螢幕重排而非縮小所有字體，必要長篇內容使用分頁。標題、內文、數字、觸控按鈕有明確尺寸層級。新聞使用彩色照片、報頭、日期、標題、分欄及來源，像完整報紙。主要視窗固定置中，開啟時有焦點管理。保留中英文文字及研究設計功能，以設定控制按鈕顯示；目前中文預設，English 隱藏，『前後測設計』顯示。
產出與驗收：桌機與手機截圖；沒有數字溢出、遮住海島或看不清的得分列表。

8. 一致風格的圖片資產
使用 image 工具製作三關新聞圖及政策環境變化圖。採明亮、立體微縮海島風格；同一關固定鏡頭、地形、光源與主要物件位置。依實際政策效果表列出需要的受損、中間、改善及惡化狀態，先生成再串接，不要將同一張健康海島套用所有數值。珊瑚開局應呈現白化及污染，海草開局稀疏且混濁，風電開局呈現供電問題。人物、車輛、船隻與設施同風格，避免平面貼紙感。圖片不要生成文字；標題和數值由介面排版。
產出與驗收：資產清單、狀態對照表及授權／AI 來源標示；所有分支都有合適圖片或組合圖層。

9. 動畫與載入效能
為每個政策設定對應區域與約五秒漸變：施工分階段、污染擴散或消退、珊瑚逐步變色、海草疏密改變、風機與海纜運作改變。用同風格但高對比的光圈、指引及正負數字標出受影響位置；結束清除臨時特效，保留新的環境狀態。人物、車輛、船與海浪持續運動，避免擋住重點。預先生成圖片並轉 WebP；優先載入當關新聞與初始場景，背景預載下一步素材，不在每次遊玩即時生成圖片。載入失敗有可見替代內容。
產出與驗收：每個政策動畫逐一對照影響表；慢網路測試、圖片網址檢查與特效清除檢查。

10. 程式架構與可移植性
以 TypeScript、React 及資料驅動的關卡設定實作。分離政策資料、評分、狀態流程、場景呈現與儲存同步。沿用專案目前的建置與 Cloudflare Workers 設定，不任意更換框架。架構為瀏覽器→同網域 API→Google Apps Script→Google Sheets。所有密鑰只在伺服器與 GAS 私人設定；前端不能取得密鑰。提供本機啟動、測試、建置、部署及移機說明，圖片使用專案內可攜路徑。
產出與驗收：模組圖、設定範本、可重現安裝與建置指令，沒有寫死私人主機路徑。

11. 同意書與識別碼
遊戲開頭提供簡短分頁說明、資料用途及自願參與條款，勾選後才能開始。不要顯示研究者的姓名或學校於玩家介面。說明研究參與者需完整遊玩後填寫後續問卷。User ID 限 4–32 位 ASCII 英數字，至少一個英文字母；前後端都驗證，1234 不可通過。不要要求姓名或信箱。僅在完成三關後上傳研究紀錄；中途退出清除本機未完成進度，不送出研究紀錄。將代碼資料稱為編碼化資料，不宣稱完全無法連結身分。
產出與驗收：未勾選不可開始、1234拒絕、英數代碼可用；中途退出無研究資料寫入。

12. Google Sheets 紀錄與時間
以 run_id 作為重試與更新的穩定識別，送出 User ID、確認 ID 的時間、完成時間、總秒數、政策選擇、兩項行為分數、環境前後值與版本。總秒數=(completedAt−userIdEnteredAt)/1000，包含閱讀與背景分頁時間；不是純操作時間。主要分析表第一欄為輸入 ID 時間，其後為 user_id，再列前後期分數與差值。未完成及缺資料保持空白；測試紀錄標示不納入。GAS 驗證密鑰、欄位與完成狀態，寫入後回覆成功；失敗可重試且不產生重複紀錄。公開文件只列 NEWS_SHEETS_URL、NEWS_SHEETS_SECRET 等設定名稱及占位符。
產出與驗收：試算表公式與遊戲分數一致；完成一局只產生一筆分析紀錄，重試不改完成時間。

13. 重複 ID 檢查與部署
此功能已於 2026-11-09 在本專案上線。移植或重新開發時，仍須完成以下整合與驗證，不能只憑既有文件宣稱新環境已完成。開始前向同網域 API 檢查 ID 是否已存在，大小寫視為相同；檢查失敗時提示重試。檢查只讀取，不提前建立研究紀錄。GAS 最終寫入須在鎖定區段再次檢查，避免兩人同時使用同一 ID；相同 run_id 的重試仍允許。發生衝突時保存已完成結果，讓玩家換新 ID 再送出。先確認並更新實際 GAS 接收器，再部署前端與 API，最後用兩個瀏覽器驗證。不要覆蓋線上既有的客製公式。
產出與驗收：GAS、API、前端三者版本一致；並行、大小寫、同局重試與斷線都有測試證據。

14. 完整驗證與研究測試
重玩全部政策分支並檢查評分、環境變化及動畫順序。三關共六次三選一決策，共 3^6=729 條路徑；保留英文時測兩語系。驗證每局六次玩家決策與三次外部事件，事件不計分。另以兩個合成玩家完整操作，確認開始時間、完成時間、差值及只在完成後寫入；測試紀錄排除於研究分析。測試連點、重新整理、慢網路、圖片失敗、倒數到期及退出。分開報告實際執行的測試與尚未驗證項目，不可只憑單元測試宣稱線上儲存成功。
產出與驗收：有日期、版本、預期值與實際值的測試報告；沒有未說明的失敗項目。

15. GitHub、Cloudflare 與保存
維持原 ChatGPT Sites 與 Version 2 為獨立部署。GitHub 保存可公開程式、圖片與文件；Cloudflare 執行 Version 2 與伺服器 API。發佈前檢查追蹤檔案及差異，排除密鑰、真實試算表接收網址、玩家資料、私有備份與測試匯出。透過 Cloudflare 私人環境設定連接 GAS。原站不得因新版部署被修改。備份版本、套件鎖定檔、GAS 程式、素材及安裝手冊；私人設定另行安全保存。部署後驗證資產、遊玩及資料接收，記錄可回復的版本。
產出與驗收：乾淨的 GitHub 差異、安全檢查結果、部署網址及移機手冊；不把密鑰寫進 README。

16. 論文圖件與開發 Prompt 文件
製作兩張繁體中文及兩張英文說明圖：流程與評分、三關場景與政策。採 A4、300 dpi（直式2480×3508像素）或可縮放向量，文字用排版工具呈現，避免生成圖片中文字模糊。每個圖件標註版本，與實際評分規則核對。README 首頁放遊戲說明及輕量流程圖，安裝放 INSTALL。製作可離線閱讀的 HTML 開發手冊，每步包含可複製 Prompt、解析、預期產出與驗收。註明這是依需求整理的重建指南，非原始對話逐字稿；保留研究限制與待部署事項。
產出與驗收：四張清晰圖件、GitHub 可讀文件、離線 HTML 複製按鈕與完整開發流程。

最終交付：可操作的遊戲、政策與評分設定、圖片動畫資產、測試報告、資料接收與試算表公式說明、安全的部署設定範本、INSTALL 安裝移機文件、README 遊戲說明、中英文論文圖件，以及具有複製按鈕的開發 Prompt HTML。最後列出已完成、已驗證、未驗證及需要外部授權的項目，並提供實際版本與可用連結。

附錄：Google Sheets 與 GAS 完整實作要求
請依以下步驟建立新環境，保留既有站點；本範本不可直接覆蓋現行研究資料。

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

完整 GAS 新專案範本（複製到單一 .gs 檔案）
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
