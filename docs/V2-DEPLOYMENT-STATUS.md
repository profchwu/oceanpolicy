# Version 2 deployment status

## Published 2026-10-18
- Public game: https://oceanpolicy-v2.nthuchwu.workers.dev
- Independent Worker: oceanpolicy-v2
- Cloudflare deployment version: 531d759a-5db2-43de-8042-0802b9024f08
- Source baseline: sanitized commit cd78585.
- Production build passed; 55 static assets uploaded.
- Public consent page rendered and interactive; English switching verified.
- Gameplay/scoring, consent and mock receiver tests passed.
- Original ChatGPT Site remains unchanged.

## Research synchronization pending
The owner will enter NEWS_SHEETS_URL and NEWS_SHEETS_SECRET as Worker secrets. No secret values are stored here. The latter must match the existing Apps Script NEWS_SHARED_SECRET. Do not change the original secret.

A confirmed synthetic write is still required before using V2 for research collection. Mock tests and successful website publication do not establish live Sheets storage.

## Reproducibility
Local checks reused installed dependencies through an ignored junction; fresh lockfile installation is not independently verified. See README.md for build and deployment commands and PUBLICATION-PRIVACY-REVIEW.md for the publication audit.
