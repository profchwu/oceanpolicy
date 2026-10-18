# Public repository privacy review

Reviewed 2026-10-18. Scope: tracked repository files and both initial commits; generated PNG metadata; configuration and research receiver handling. This is a source-publication review, not a penetration test or dependency vulnerability assessment.

## Findings and corrections

- Research spreadsheet URL / identifier: removed from historical documentation and receiver source. New receiver deployments use private Script Properties `SHEET_ID` and `NEWS_SHARED_SECRET`.
- Workstation absolute path: replaced with a repository-relative asset path.
- Historical synthetic test run identifiers and row location: removed from documentation.
- No real API credential, private key, personal email or participant dataset was detected by the content review. Test-only values and `.test` email examples are intentionally retained.
- 34 PNG assets inspected: no extra textual, EXIF or location metadata detected.
- Environment values, build output, logs and local caches are excluded. Additional ignore rules protect research exports and credential files.
- `scripts/check-public-repository.mjs` is a repeatable publication check. Pattern matching cannot guarantee detection of every possible secret.

## History and limits

The new repository's main history is replaced with a sanitized root commit. This removes the two original commits from ordinary branch history. GitHub may retain unreachable objects or cached URLs, and previously downloaded copies cannot be recalled. The removed spreadsheet identifier is not an access credential, but the spreadsheet must remain restricted to authorized researchers. Its sharing permissions were not inspected or changed in this review.

No deployed ChatGPT Site, Apps Script service or Google Sheet was modified. Do not deploy the revised receiver until the required private properties are configured. Public policy scores and answer keys are part of the teaching implementation; they are not secret examination material.

Verification: gameplay/scoring tests and mock receiver tests passed after sanitization. Live Cloudflare and Google Sheets setup remain separate, pending work.
