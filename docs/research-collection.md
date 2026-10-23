# Research collection release — 2026-10-23

The game retains its scoring, research explanation and English translation. During data collection, `SHOW_RESEARCH_INFO` and `SHOW_LANGUAGE_SWITCH` in `lib/research-mode.ts` are false. Set either flag to true, rebuild and redeploy to restore that button.

## Timing

- `run.userIdEnteredAt`: browser timestamp in milliseconds when a valid User ID is confirmed, before the first newspaper. This is captured once and persisted locally; normal gameplay synchronization sends it to the receiver.
- `run.startedAt`: existing first-mission start timestamp; the 10-minute gameplay countdown remains unchanged.
- `run.completedAt`: timestamp when the player leaves the final level report for the three-level summary. It is assigned only on successful completion, after the final policy animation. Retries and reloading do not change it.
- Total completion seconds = `(completedAt - userIdEnteredAt) / 1000`. This is elapsed wall-clock time, including news reading, animations, interruptions and background-tab time; it is not active interaction time.
- Historical records missing timestamps remain blank. Incomplete and timeout runs have no completion duration or completion-code popup.

The timestamps are browser-reported, not independently verified server measurements. The receiver also retains its existing server receipt time.

## Google Sheets layout

The first worksheet `前後測資料` has `輸入User ID時間` in column A, immediately before `user_id` in B. Existing score columns move one position to the right. `遊戲完成時間` and `完成總時間（秒）` are T and U. Displayed timestamps use Taiwan time (UTC+8).

The receiver's fixed raw-data columns are unchanged. `同步紀錄.record_json` preserves both timestamps; the analysis view looks them up by `run_id` (P), rather than assuming raw and summary row numbers match. Existing summary formulas adjust automatically when column A is inserted.

For an equivalent worksheet with this layout, use the following formulas, preserving the other score formulas:

```text
A2:
=ARRAYFORMULA(IF(P2:P1000="","",IFERROR(VALUE(REGEXEXTRACT(VLOOKUP(P2:P1000,'同步紀錄'!A2:C1000,3,FALSE),"""userIdEnteredAt"":([0-9]+)"))/86400000+DATE(1970,1,1)+8/24,"")))

T2:
=ARRAYFORMULA(IF(P2:P1000="","",IFERROR(VALUE(REGEXEXTRACT(VLOOKUP(P2:P1000,'同步紀錄'!A2:C1000,3,FALSE),"""completedAt"":([0-9]+)"))/86400000+DATE(1970,1,1)+8/24,"")))

U2:
=ARRAYFORMULA(IF((R2:R1000="complete")*ISNUMBER(A2:A1000)*ISNUMBER(T2:T1000),ROUND((T2:T1000-A2:A1000)*86400,3),""))
```

Format A and T as `yyyy-mm-dd hh:mm:ss`. These formulas match the current 1,000-row analysis source range; expand all related score, lookup and duration ranges together before exceeding that capacity. Real sheet URLs and credentials are not included in the repository.

## Completion screen

The successful completion dialog displays **2026**, with large responsive typography, keyboard focus and a button to return to the results. The results page also provides a button to reopen it. This is a shared questionnaire completion code, not a unique participant identity or a secure proof of participation.

## Checks

`node scripts/test-news-sync.mjs` verifies timestamp validation, fixed duration on retries/reload, legacy compatibility, timeout behavior and receiver storage. `node scripts/test-all-policy-branches.mjs` replays all 729 policy routes in both languages.
