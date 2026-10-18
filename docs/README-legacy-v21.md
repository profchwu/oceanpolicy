# 海島新聞任務：海洋政策與氣候教育遊戲

Island News Missions: an ocean-policy and climate education game

本文件說明遊戲玩法、研究紀錄與新聞來源，並提供三個場景的中英文論文說明圖。圖件呈現遊戲元件與設計意涵，不代表已驗證的教育成效或真實氣候預測。

## 1. 版本與實際狀態

- 線上遊戲：https://ocean-policy-dispatch.nthuchwu.chatgpt.site
- 文件日期：2026-10-13。新聞任務模型：`news-pilot-1`；比較計分：`pilot-comparison-1`；新增上傳格式：`news-sheet-1`。
- 公開第 21 版已於 2026-10-13 部署，包含必填 User ID 與上傳程式。**Google Apps Script 已於 2026-10-14 完成授權、部署與正式網站實寫驗證**。不要把「程式已寫好」當成「研究資料已上雲」。
- 目前紀錄保留於瀏覽器，並自動同步至 Google Sheets；JSON 下載仍可使用。
- 研究目的地：[研究試算表網址已移除；由研究者私下保存]
- User ID 更新：網站已加入必填研究代碼與傳輸驗證；Google Sheet 已新增 `遊玩資料!AE` 與 `操作紀錄!L` 的 `user_id` 欄。Google Apps Script 已於 2026-10-14 完成實寫測試；合成測試局標為示範，不納入研究統計。

## 2. 遊戲玩法

遊戲採單人、點選操作，預設繁體中文，可切換為全英文。開始遊戲前必須輸入 User ID（研究代碼，非登入帳號）；1–32 字、英數開頭，可含底線與連字號。代碼區分大小寫，保留前導零，整局固定，重新整理後仍保留。固定視角海島搭配居民、工作人員、車輛、船隻、飛鳥與海面動態；動態可關閉。這些背景活動提供場域感，並非人口、交通或生態的校準模型。

1. **讀新聞**：每關先看 AI 新聞圖卡、事件摘要、日期、來源連結與目標，再按「接下任務」。第一關按下此鍵後開始計算總上限 10 分鐘。
2. **選政策**：點選三張政策卡之一。點選當下即鎖定並記錄選擇，隨即跳出影響預覽視窗，說明原因與指數變化。確定按鈕用於確認閱讀並啟動場景動畫；原選擇已鎖定，不能改選。
3. **觀察改變**：光圈標示政策作用區，儀表板同步變化，建設動畫最多 5 秒。動畫從按下確定開始，讓玩家在場景中完整觀看五秒變化。總遊戲計時仍持續。
4. **選監測證據**：從兩個監測選項中選一個。此步沒有 5 秒建設等待；選擇後出現新的模擬事件。
5. **應變**：依據新事件從三個回應選項中選一個，再觀察最多 5 秒的效果。
6. **讀結果報告**：查看環境指數前後變化、自己選了什麼、因果解釋與政策重點，點選下一關。第三關完成後查看三關總報告，可下載遊玩 JSON 或重新遊玩。

每關只有三次計分決策，完整一局共九次。打開研究說明或閱讀回饋時，總計時仍持續。逾時顯示已有紀錄；缺漏不補為零分。介面中的分數、預算與 5 秒動畫均為教學設定，不是真實碳排、水質標準、貨幣或生態恢復時間。

## 3. 三個場景與政策問題

| 場景 | 真實議題 | 模擬擾動 | 政策教育重點 | 環境目標 |
|---|---|---|---|---|
| 風電港灣 | 離岸風電選商、建設與併網 | 海纜故障使供電下降 | 區分裝置容量、實際供電與減碳證據 | 供電 ≥ 55、棲地 ≥ 50 |
| 海草潟湖 | 藍碳減量方法與復育監測 | 暴雨帶來泥沙並減少光照 | 區分種植投入、存活與淨碳匯 | 水質 ≥ 50、海草存活 ≥ 50 |
| 珊瑚海岸 | 全球珊瑚白化與地方治理 | 持續高溫造成白化 | 區分地方減污能力與全球熱壓力 | 水質 ≥ 50、珊瑚健康 ≥ 50 |

三場景的儀表板皆保留供電、水質與第三項生態指數。海草與珊瑚場景的供電在目前選項中維持 65，作為背景指標；不能把此恆定值解讀為政策沒有能源成本。所有指數限制於 0–100。

### 模型中的示範數值

以下只示範各步均符合本情境規準的決策路徑，不是玩家實驗結果。

| 場景（指數順序） | 起始 | 首次政策完成 | 新事件後 | 應變完成 |
|---|---|---|---|---|
| 風電（供電／水質／棲地） | 25 / 70 / 70 | 70 / 70 / 70 | 30 / 70 / 70 | 75 / 70 / 70 |
| 海草（供電／水質／海草） | 65 / 30 / 40 | 65 / 45 / 55 | 65 / 25 / 40 | 65 / 60 / 65 |
| 珊瑚（供電／水質／珊瑚） | 65 / 30 / 65 | 65 / 65 / 73 | 65 / 65 / 48 | 65 / 75 / 56 |

各關初始預算為 60；上述首次政策成本為 30、應變為 20。其他選擇可能造成污染或棲地損失；評分依各關情境規準，不表示所有真實政策只有唯一答案。環境是否達標與三項認知行為分數分開判定。

## 4. 遊戲元件與政策教育意涵

<table><tr><td>
<strong>政策教育意涵：設計如何支持學習</strong><br><br>
真實新聞圖卡把抽象政策放入具體議題；政策卡與預算呈現不同選擇及其取捨。影響視窗、光圈、漸進動畫與儀表板把「決策 → 作用機制 → 環境結果」連結起來。監測選項要求玩家區分投入與成效證據，新事件要求玩家根據原因調整政策，結果報告則協助回顧並解釋決策。居民與交通等動態提供場域感，但沉浸感與學習成效仍須另行驗證。<br><br>
<strong>Policy-education rationale</strong><br><br>
News cards contextualize policy problems. Policy cards and budgets expose choices and trade-offs. Impact explanations, spatial halos, progressive animation and dashboards connect decisions to mechanisms and environmental outcomes. Evidence choices distinguish inputs from outcomes; new events elicit adaptive responses; outcome reports support reflection. Ambient activity supplies context, but immersion and learning benefits remain empirical questions.
</td></tr></table>

| 元件 | 玩家可做／看到什麼 | 預期支持的學習歷程 |
|---|---|---|
| 新聞圖卡、日期與來源 | 先觀察議題、可回查原始報導 | 情境化理解與來源辨識 |
| 政策卡與預算 | 選擇具體措施、比較成本與副作用 | 政策判斷與取捨思考 |
| 影響視窗、空間光圈 | 立即讀取原因、定位作用區域 | 因果解釋與空間關聯 |
| 進度與環境儀表板 | 觀察逐步改變與多項結果 | 追蹤政策過程與成效，避免只看單一指標 |
| 監測選項 | 選成效資料或僅投入數量 | 證據判讀 |
| 新事件與應變卡 | 面對新的限制再次決策 | 調適性治理與修正策略 |
| 結果新聞報告 | 回看決策、結果與政策重點 | 反思與整合 |
| 中英切換、動態開關 | 使用偏好語言與減少動態 | 介面可及性；尚未驗證語言版本等值性 |

## 5. 三個研究行為變數

| 變數 | 操作性定義 | 每關觀察點 | 原始值 |
|---|---|---|---|
| 政策判斷 `policy_judgment` | 首次政策是否處理本情境的關鍵問題 | 第一次政策點選 | 1 符合／0 未符合／空值未作答 |
| 證據選擇 `evidence_selection` | 是否選擇可檢驗環境成效的證據 | 監測點選 | 1／0／空值 |
| 適應性調整 `adaptive_response` | 新事件後是否針對原因調整政策 | 應變點選 | 1／0／空值 |

三者是基於選擇行為的認知表現指標，不是態度、政策支持度或實際公民行為。時間戳、語言、預算與環境指數是歷程或模型資料，未另列為第四個研究變數。整體分數只是三變數的衍生摘要。

### 前後測與摘要公式

令 xₗᵥ 為第 l 關、變數 v 的 0／1 作答：

```text
每變數前測 = 第 1 關得分 × 100
每變數後測 =（第 2 關得分 + 第 3 關得分）÷ 2 × 100
每變數差值 = 後測 − 前測（百分點）

整體前測 = 第 1 關三項得分總和 ÷ 3 × 100
整體後測 = 第 2、3 關六項得分總和 ÷ 6 × 100
整體差值 = 整體後測 − 整體前測

群體平均差值 = 納入紀錄的個別差值總和 ÷ 配對紀錄數
進步比例 = 差值 > 0 的配對紀錄數 ÷ 配對紀錄數
```

必要作答缺漏時，該比較留空，不當作零分。0、1、1 的某變數：前測 0、後測 100、差值 +100 百分點。這是差分，不是除以前測的百分比成長率。

目前 Excel 範本摘要納入「正式、complete、九項分數有效且 run_id 無重複」的紀錄；三變數使用相同完整配對樣本。試算表計數單位是**遊玩局次**，不是獨立參與者。正式研究應預先規定同一 player_id 重玩時如何納入，並在統計分析中處理重複觀察。

## 6. 紀錄、儲存與 Google Sheets

### 目前公開版：本機紀錄

`localStorage` 的 `ocean-news-pilot-1` 保留當前局次。開始產生隨機 run ID，記錄每關開啟時間、決策步驟、選項、點選時間、按確定時間與作答語言。重玩會嘗試封存上一局；總報告可下載 JSON。清除瀏覽器資料、私密瀏覽到期或儲存空間不足可能造成資料遺失，下載不是雲端備份。

### 已啟用：背景同步

```text
玩家點選
  → 本機狀態 + 待送佇列（保留每局最新完整快照）
  → 同源 /api/news-record（格式驗證、伺服器重新計分）
  → Google Apps Script（共享祕密、鎖定、冪等更新）
  → 遊玩資料 + 操作紀錄 + 同步紀錄
  → 整體摘要中的試算表公式
  → 回傳對應 run ID 與 revision 的成功確認
```

- `playerId` 為瀏覽器自動建立的隨機識別碼，不要求姓名、Email 或登入；它是裝置／瀏覽器假名識別，不能保證對應唯一真人。清除儲存資料或換裝置會產生不同識別碼。
- `run.id` 每次重玩重新產生。開始、選擇、確認、換關與逾時狀態會更新快照。不是記錄滑鼠軌跡，也不是每 100 ms 寫入試算表。
- 點選紀錄保留在累積快照內；背景傳送可能合併相鄰更新，接收端仍以穩定 event_id 更新各決策列。
- 傳送失敗保留佇列；開頁恢復、網路回復或約每 15 秒重試；介面提供重試按鈕。關閉分頁後不保證繼續上傳，需重新開啟同一瀏覽器。首次連線設定檢查失敗可能需要重新載入。
- 成功回條的 run ID 與 revision 必須相符，才移除對應待送快照。接收端使用鎖定及 revision 防止重複與較舊資料回寫。
- 瀏覽器時間是玩家端時間，可能有時鐘偏差；`received_at` 是接收端時間。complete 需玩家完成第三關報告並進入總報告，不只是選完第九個答案。
- 現行 `ended_at` 對 complete 取完成狀態快照的 observedAt，對 timeout 取開始後 10 分鐘；不是精密的實際退出時間。直接關閉頁面不一定被即時辨識為 timeout。
- 程式具備同源檢查、簽章 cookie、資料驗證與伺服器共享祕密；這不等於已具正式招募所需的機器人防護、參與者驗證或研究倫理流程。
- 2026-10-14 合成測試確認正式 API 寫入、User ID 配對、九項作答、計分公式與重送去重。這是技術驗證，不是實際參與者資料或教育成效驗證。

### 四張工作表

| 工作表 | 一列的單位 | 內容 |
|---|---|---|
| 遊玩資料 | 一局 run_id | 原始九題、狀態與三變數前後測計分公式 |
| 操作紀錄 | 一個 event_id | 每關政策、證據、應變的首次選擇與確認時間 |
| 同步紀錄 | 一局 run_id 的最新快照 | revision、record_json、接收時間，供重送一致性檢查 |
| 整體摘要 | 彙總結果 | 配對局數、前後平均、差值與進步比例 |

遊玩資料 A–Q：`資料類型`, `run_id`, `player_id`, `game_version`, `language`, `completion_status`, `started_at`, `ended_at`, `pre_policy`, `pre_evidence`, `pre_adaptation`, `post1_policy`, `post1_evidence`, `post1_adaptation`, `post2_policy`, `post2_evidence`, `post2_adaptation`。

遊玩資料 R–AD：政策前測、政策後測、政策差值、證據前測、證據後測、證據差值、調整前測、調整後測、調整差值、整體前測、整體後測、整體差值、統計納入狀態。

操作紀錄：`event_id`, `run_id`, `level`, `mission_id`, `variable`, `choice_id`, `score`, `selected_at`, `confirmed_at`, `language`, `received_at`。event_id = run_id:場景索引:步驟索引；choice_id = mission_id:步驟索引:原始選項索引。內部索引從 0 起算，level 顯示 1–3。選項顯示位置可能調整，分析請使用 choice_id，不使用卡片畫面位置。

欄位命名對應：API／圖中「政策、證據、調整」在操作紀錄使用 `policy / evidence / adaptation`；研究比較物件使用 `policy_judgment / evidence_selection / adaptive_response`。意義相同，不能當成六個變數。

### 研究使用界線

第一關已包含回饋，第二、三關題材與難度不同，每變數在前測只有一次作答。這是嵌入遊戲的探索性表現比較，尚不是等值、獨立且已驗證的前後測工具。差值不能單獨支持因果學習效果，也沒有測量長期保留、政策態度改變或真實行為改變。正式研究需另訂招募、知情同意、保存期限、存取權限、內容效度、語言等值與適當的研究比較設計。

## 7. 新聞資料來源與改編邊界

查閱日期：2026-10-13。以下均為官方來源；遊戲不是由這些機關背書。新聞摘要採轉述，圖卡與海島為 AI 生成，不是新聞現場照片。

### S1. 風電

經濟部產業技術司綠能科技產業推動中心（2026-03-27）。〈【風電】離岸風電區塊開發（3-3期）選商機制正式啟動〉。

https://service.moea.gov.tw/EE514/tw/geipc/155-7446.html

來源支持選商機制啟動與 2030–2031 完工併網規劃；遊戲中的特定村莊、海纜故障、成本與指數變化均為設計情境，並非該新聞記載的事故。

### S2. 藍碳

環境部氣候變遷署（2025-07-24）。〈自然碳匯向海擴展：環境部審查通過「海草復育」與「紅樹林植林」減量方法〉。

https://enews.moenv.gov.tw/moenv-news/zh-tw/News/2278

報導描述審議會決議「修正後通過」，並重視環境影響、監測與保守量化。文件描述當日事件，不把審議通過等同於所有專案已取得核發額度。暴雨、海灣、修復選項與數值均為教學改編。

### S3. 珊瑚

NOAA NESDIS (2026-06-02). *World’s Fourth Mass Coral Bleaching Event Likely Ended in 2025*.

https://www.nesdis.noaa.gov/news/worlds-fourth-mass-coral-bleaching-event-likely-ended-2025

來源提出第四次全球白化事件可能在 2025 年中結束；「全球事件可能結束」不等於每個珊瑚礁都恢復或不再受熱。遊戲的污水來源、地方政策與熱浪衝擊值為模擬設定。

## 8. 中英文 Infographics 與論文圖說

每個場景各有繁體中文、全英文兩版，共六張。所有圖使用相同元件編號：1 新聞、2 儀表板、3 場景／光圈、4 政策／影響／進度、5 監測／事件／應變、6 報告／行為紀錄。方框區呈現政策教育意涵。

圖件為**元件重組示意圖**：把不同時間出現的新聞、決策與結果放在同一圖中，方便讀者理解設計，不是聲稱所有元件同時出現在實際畫面，也不是實際玩家測試的截圖。底圖直接使用本遊戲三張現有 AI 海島素材，未以官方新聞照片冒充遊戲場景。

- 合訂 PDF：`game-infographics-bilingual.pdf`，順序為風電中／英、海草中／英、珊瑚中／英。
- `figures/figure-01-wind-zh.*`、`figure-01-wind-en.*`
- `figures/figure-02-grass-zh.*`、`figure-02-grass-en.*`
- `figures/figure-03-reef-zh.*`、`figure-03-reef-en.*`
- 個別格式：PDF（文字與線框保留向量，場景為點陣圖）及 PNG（300 dpi，2125 × 2771 px，約 180 × 235 mm）。
- 圖說可直接編修使用；圖號與排版需配合投稿期刊。SSCI 是索引範圍，沒有統一圖片規格；請依目標期刊確認圖幅、字體、色彩及 AI 圖像政策。本套件不保證期刊接受。

### 圖 1／Figure 1: 風電港灣：讓政策轉化為實際供電

![圖 1 中文版](../outputs/policy-game-research-kit/figures/figure-01-wind-zh.png)

**中文圖說。** 風電港灣：讓政策轉化為實際供電的遊戲元件與政策教育設計。編號 1–6 依序連結真實新聞、環境儀表板、場景定位、政策回饋、證據與應變、以及結果報告與行為紀錄。框內文字呈現預期的學習歷程。數值為預設規準路徑的教學示範，並非實驗樣本結果；此圖為元件示意，非介面截圖。新聞來源：[S1]。

![Figure 1, English](../outputs/policy-game-research-kit/figures/figure-01-wind-en.png)

**English caption.** Components and intended policy-learning mechanisms in the wind mission. Labels 1–6 connect a real-news prompt, environmental dashboard, spatial scene, policy feedback, evidence selection and adaptation, and outcome reporting with behavioral records. The framed panel explains the educational rationale. Numerical indices illustrate the scenario-criterion pathway and are not participant data. This component schematic combines successive interface states rather than reproducing a screenshot. News source: [S1].

### 圖 2／Figure 2: 海草潟湖：從復育投入走向成效證據

![圖 2 中文版](../outputs/policy-game-research-kit/figures/figure-02-grass-zh.png)

**中文圖說。** 海草潟湖：從復育投入走向成效證據的遊戲元件與政策教育設計。編號 1–6 依序連結真實新聞、環境儀表板、場景定位、政策回饋、證據與應變、以及結果報告與行為紀錄。框內文字呈現預期的學習歷程。數值為預設規準路徑的教學示範，並非實驗樣本結果；此圖為元件示意，非介面截圖。新聞來源：[S2]。

![Figure 2, English](../outputs/policy-game-research-kit/figures/figure-02-grass-en.png)

**English caption.** Components and intended policy-learning mechanisms in the grass mission. Labels 1–6 connect a real-news prompt, environmental dashboard, spatial scene, policy feedback, evidence selection and adaptation, and outcome reporting with behavioral records. The framed panel explains the educational rationale. Numerical indices illustrate the scenario-criterion pathway and are not participant data. This component schematic combines successive interface states rather than reproducing a screenshot. News source: [S2].

### 圖 3／Figure 3: 珊瑚海岸：分辨地方治理與全球熱壓力

![圖 3 中文版](../outputs/policy-game-research-kit/figures/figure-03-reef-zh.png)

**中文圖說。** 珊瑚海岸：分辨地方治理與全球熱壓力的遊戲元件與政策教育設計。編號 1–6 依序連結真實新聞、環境儀表板、場景定位、政策回饋、證據與應變、以及結果報告與行為紀錄。框內文字呈現預期的學習歷程。數值為預設規準路徑的教學示範，並非實驗樣本結果；此圖為元件示意，非介面截圖。新聞來源：[S3]。

![Figure 3, English](../outputs/policy-game-research-kit/figures/figure-03-reef-en.png)

**English caption.** Components and intended policy-learning mechanisms in the reef mission. Labels 1–6 connect a real-news prompt, environmental dashboard, spatial scene, policy feedback, evidence selection and adaptation, and outcome reporting with behavioral records. The framed panel explains the educational rationale. Numerical indices illustrate the scenario-criterion pathway and are not participant data. This component schematic combines successive interface states rather than reproducing a screenshot. News source: [S3].

## 9. English methods description

Island News Missions is a single-player, click-based browser game with three news-informed ocean-policy scenarios: offshore wind, seagrass restoration and coral conservation. Players read a news prompt, choose an initial policy, inspect an immediate explanation and up-to-five-second visual transition, select monitoring evidence, respond to a simulated disturbance, and review an environmental report. A shared 10-minute limit begins when the first mission is accepted. The default interface is Traditional Chinese, with an English toggle and optional reduced motion.

The game records three scenario-scored choices per level: policy judgment, evidence selection and adaptive response. Choices are scored 0 or 1; missing choices remain missing. For each construct, the exploratory pre score is the level-1 response multiplied by 100, while the post score is the mean of the level-2 and level-3 responses multiplied by 100. Change is expressed in percentage points. Overall scores aggregate the three constructs and are not an additional construct. Different topics, task difficulties and feedback exposure limit comparability; these scores should not be presented as a validated or causal measure of learning gain.

The public version retains run records in browser storage, supports JSON export, and automatically synchronizes records to Google Sheets. The deployed website includes a required User ID, a persistent pseudonymous browser identifier, a local upload queue and a server-mediated Google Sheets receiver. The cloud pipeline was activated and verified with synthetic data on 2026-10-14; this is not evidence of participant learning. The infographics describe intended instructional mechanisms, not demonstrated treatment effects.

## 10. 技術對照與可重製性

- `lib/news-missions.ts`：新聞、選項、政策原因、成本、指數與情境規準。
- `lib/news-flow.ts`：點選、確認、換關、5 秒進度、10 分鐘上限與達標判定。
- `lib/news-assessment.ts`：三變數與整體探索性計分。
- `app/NewsGame.tsx`、`app/ResearchInfo.tsx`：主遊戲與研究說明。
- `app/NewsCoast.tsx`、`app/MissionPopulation.tsx`：海島、影響視覺與環境動態。
- `app/useNewsSync.ts`、`lib/news-record.ts`、`app/api/news-record/route.ts`：已啟用的背景同步與驗證。
- `google-apps-script/NewsReceiver.gs`：指定試算表的接收端；共享祕密僅存伺服器／指令碼屬性，不列入本文或研究圖件。
- `scripts/test-news-flow.mjs`、`scripts/test-news-sync.mjs`：流程／計分與接收端模擬測試；後者不等於真實 Google Sheets 連線測試。
- 本套件所依據的程式提交：`746fc33c12ffa172e0bd83dc6901f065a56c2ef0`（已保存第 20 版，未部署）。研究施測時應另記實際版本及啟用日期。
- `/research` 為舊版流程，不是本文圖示的三關新聞任務；請勿混用其題數、欄位與分數。

請將正式研究的題目、版本、來源日期、分析規則與核准程序一起封存，並避免在公開研究套件放入參與者原始資料或存取密鑰。

原始框架與開發環境說明見 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)。

## User ID 與研究資料配對

`run.userId` 為玩家輸入代碼，寫入 Google Sheets 的 `user_id`（遊玩資料 AE、操作紀錄 L）；兩欄均使用文字格式，`00123` 不會變成 `123`。`run_id` 區分每次遊玩，`player_id` 保留原本裝置識別功能。相同 User ID 可重玩，因此研究分析應事先決定重複參與的納入規則，不能把 User ID 當作身分驗證。伺服器拒絕缺漏或不合格式的代碼，接收器拒絕同一 run_id 改換代碼。

舊版沒有 User ID 的本機紀錄保留在瀏覽器封存區，不會把先前答案歸到新輸入的代碼。新紀錄開始前輸入 User ID；上傳失敗時保留重試。只有網站顯示「遊玩紀錄已存入 Google Sheets」才代表收到伺服器儲存回覆。

User ID is a participant-supplied study code, not authentication. It is stored as text in `user_id` in both the run and event sheets. Run IDs distinguish repeat plays. Older records without an ID are archived locally and are not reassigned to a new participant. Cloud collection was activated and verified with a synthetic run on 2026-10-14.

### 2026-10-14 連線驗證

歷史驗證曾使用合成資料測試寫入、去重與公式；公開文件不保留測試識別碼或資料列位置。這不代表 V2 已完成正式連線。

### 2026-10-14 政策動畫更新

動畫改由 ackAt 起算五秒，選擇仍在 at 鎖定並記錄。放大的教學視覺依實際模型指數驅動：送電與居民亮燈、水質與泥沙、海草生長／萎縮、珊瑚色彩／白化、棲地植被。固定鏡頭與三階段進度搭配原值→現值比較。視覺物件數量為示意，不是人口或物種數量的測量。減少動態設定停用裝飾循環，保留數值與進度。


### 2026-10-14 教育因果與動畫稽核

逐項檢查 18 個政策／應變選項、6 個監測選項與 54 條完整路徑。政策位置、施工物件、環境指數和解說分開核對。風電故障依修復行動而非供電門檻判定；兩批增建風機採不同位置。減污不會解除本情境的熱浪淡色提示；白化不等於死亡。水色僅為連續的污染／泥沙示意，移除水質氣泡與魚群成效連動；海草的源頭截流、沉砂及過濾採設施示意，並非浮動攔油索。數值預覽以本局實際顯示差計算，避免 0–100 邊界造成說明與結果不一致。環境仍沿用累積加減後截限的原教學模型，沒有改動政策係數或行為評分。

監測選項的影響視窗不再先觸發事件：確認後才施加相同的外生事件，不因證據答對或答錯而改變衝擊。研究說明新增「模型與動畫」頁，區別指數、真實測量、政策產出與環境成效。預設尊重裝置減少動態偏好，玩家可以明確開啟或關閉動態；關閉時 SVG 路徑移動也會停止。

驗證腳本：`scripts/test-education-visuals.mjs`；流程與 Google Sheets 接收端的既有測試亦需通過。這是程式與內容一致性稽核，不是教育成效或量表效度證明。

中英文詳細稽核表見研究文件套件的 [education-audit.html](education-audit.html)，包含逐項政策對照、修正紀錄與官方來源。

### 2026-10-14 即時後果說明

所有 18 項政策與應變均顯示作用位置、原值→預計完成值、正負變化與仍未解決的問題。預覽、儀表板、完成摘要和報告共用 `actionOutcome` 計算；數值取同一個 0–100 截限模型並依顯示值取整。動畫中持續更新，完成後保留數值摘要。監測本身不改變環境，新事件另列，不因證據選擇正確與否改變。

結局明確區分開局→結局（含外部事件），並逐列顯示政策、事件與應變的貢獻。測試涵蓋 54 種完整路徑、162 次預覽與完成值一致，以及所有結局帳目加總一致；中英文介面與 390×667 手機版完成重點試玩。這些檢查確認本教學模型的呈現一致性，不能證明真實環境效應量或學習成效。政策係數、三項行為評分與 Google Sheets 記錄格式未改。

### 2026-10-14 觀測數值與詳細成果表

監測視窗顯示上一項政策的已完成成果（前值、後值、增減），並另列確認後的新事件預覽；不把選擇監測本身当作環境改善措施。儀表板顯示實際進行中的差額。每關與三關總報表均逐項列出決策／外部事件、三項指數的前後值及差額；上升為粗體綠字與向上箭頭，下降為粗體紅字與向下箭頭，不變為灰字 0。總報表以三個關卡按鈕切換明細，避免手機長頁捲動。未完成決策只列目前數值，不使用預計完成值充當成果。

### 2026-10-14 置中視窗與閱讀字級

政策、監測、應變選擇與每關報表固定置中；影響確認視窗使用相同中心。主要說明 16px、選項桌面 20px／手機 18px，標題桌面 28px／手機 24px。內容較多時只在閱讀區內捲動，不再縮小字體以塞入畫面；影響視窗確認按鈕維持可見。逐步切換時重設閱讀區捲動位置。390×667 中英文實測：選擇與說明中心一致，沒有頁面橫向溢出。政策數值、研究評分與儲存流程未改。

### 2026-10-14 海島觀察流程

讀完新聞先顯示海島，再由玩家開啟政策選項。確認政策後關閉所有決策視窗，五秒動畫與完成後的場景保持可見；進度、原因與下一步位於地圖之外的固定高度操作列。監測確認後先觀察外部事件，玩家自行開啟應變選單；應變完成後也由玩家開啟報表。各選單提供返回海島按鈕，返回不新增作答。十分快速任務上限仍持續計時。此次 UI 調整不改政策係數或研究記錄格式。
