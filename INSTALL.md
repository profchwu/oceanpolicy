# INSTALL — 安裝、部署與移機指南

**作者｜Author**  
國立清華大學 數理教育研究所 吳智鴻教授  
Professor Chih-Hung Wu, Graduate Institute of Mathematics and Science Education, National Tsing Hua University

**版本｜Version：2.0.0** · **更新日期｜Updated：2026-10-18**

海島新聞任務 Version 2 的技術安裝文件。遊戲玩法與說明圖請見 [README.md](README.md)。

## Identity and preservation
- Repository: https://github.com/profchwu/oceanpolicy
- Cloudflare Worker: oceanpolicy-v2
- Original Site, unchanged: https://ocean-policy-dispatch.nthuchwu.chatgpt.site
- Source snapshot (v55): 0a99312c0f618b12b6bc5cd8f8c43aac13c6aa89
- Version 2 is a hosting edition, not a new research instrument.

This repository preserves source code, scene images, policy rules, scoring, tests and the Google Apps Script receiver. Original Site source and deployment are separate. Historical documents remain under docs; this README describes the current flow.

## Gameplay and research
Single player; click to play; Chinese default with English switch. Consent precedes User ID. Levels: coral, seagrass, offshore wind. Total game limit: 10 minutes.

Each level: news → policy choice → five-second scene transition and impact explanation → unscored external event → adaptive response → five-second transition → view effects/report → advance manually.

Two scored decisions per level: policy judgment (P) and adaptive response (A), each 0 or 1. Level score = (P+A)/2*100. Early = coral score; later = mean of seagrass and wind; change = later minus early (percentage points). Missing decisions stay missing. This is exploratory early/later comparison, not validated equivalent pre/post measurement or proof of causal learning. Environmental values (0–100) are teaching indices; animation compresses time.

News citations: lib/news-articles.ts and lib/news-missions.ts. Artwork is pre-generated. Gameplay does not call an AI model or require a ChatGPT account.

## Development
Use Node.js >=22.13 and npm:
```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## Cloudflare deployment
```sh
npx wrangler login
npm run build
npm run deploy
```
Deploy uses generated dist/server/wrangler.json. Worker and static assets share one origin, preserving API and secure HttpOnly cookie behavior. No ChatGPT Sites deployment plugin is used.

For Cloudflare Workers Builds, connect this repository to oceanpolicy-v2; root /; build command npm run build; deploy command npm run deploy. No automatic deploy workflow is enabled by default.

## Google Sheets setup
Set secrets interactively; never commit values:
```sh
npx wrangler secret put NEWS_SHEETS_URL --name oceanpolicy-v2
npx wrangler secret put NEWS_SHEETS_SECRET --name oceanpolicy-v2
```
NEWS_SHEETS_URL must be the existing deployed Apps Script /exec URL, not the spreadsheet URL. NEWS_SHEETS_SECRET must match the receiver Script Properties. Existing ChatGPT Site secrets are NOT automatically copied. Do not change the original receiver secret or original Site to configure V2.

Local configuration uses ignored .dev.vars (see .dev.vars.example). Receiver source: google-apps-script/NewsReceiver.gs. Records include User ID, consent, choices, scores and timestamps. Server validation, revision checks and retries remain. Browser queues do not prove server storage. Until a synthetic write is confirmed, V2 must not be treated as verified research collection.

## Backup
Git stores source/assets, not dependencies, generated builds, credentials or player data. Back up Google Sheets and secrets separately in restricted storage. Restore with git clone, npm ci, npm run build, secret configuration and npm run deploy. Existing ChatGPT Site remains independent.

## Verification
Gameplay/scoring, consent and receiver tests are available through npm test. Run npm run test:all-policies for exhaustive policy-route and artwork checks. Each new hosting environment still needs an actual synthetic write verified in its destination spreadsheet. Legacy documentation is preserved as docs/README-legacy-v21.md.

### Private receiver destination
For a new deployment of NewsReceiver.gs, set Script Properties SHEET_ID and NEWS_SHARED_SECRET privately. The repository contains neither the research spreadsheet ID nor the receiver URL/secret. Existing deployed receivers are unchanged; do not redeploy them just to publish this repository.

## Portable HTML manual
Open [readme.html](readme.html) locally for installation, migration, private configuration locations, image architecture and four embedded bilingual A4 figures. Original figure PNGs are in `docs/figures/`. The public manual contains no live research destination or secret.
