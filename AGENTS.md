# Required project workflow

The user requires development Prompt documentation and GitHub to be updated with every project change.

1. Update `docs/development-prompts.md` and `docs/development-prompts.html` for the changed behavior, setup or deployment status, including the complete combined Prompt. Keep copy buttons and embedded GAS examples consistent with the source template.
   Keep the complete Prompt and GAS source in separate sections with independent copy buttons. Do not concatenate GAS source into the Prompt. Format individual prompts and explanations as readable multiline text/paragraphs.
2. Update README, installation instructions, HTML manual and related diagrams when affected. Do not invent documentation changes for unrelated sections.
3. Run checks appropriate to the change, including `node scripts/test-prompt-docs.mjs` for Prompt updates and `node scripts/test-gas-template.mjs` when the template changes.
4. Review the intended diff and run `node scripts/check-public-repository.mjs` after staging new public files. Never commit secrets, real research destinations, participant records or private backups.
5. Commit and push the scoped, verified changes to the existing GitHub repository. Preserve unrelated user work. A GitHub update does not itself authorize unrelated production deployments.
6. Report what changed, verification limits and the GitHub update. If authentication, network or safety review prevents pushing, state the actual blocker; never claim GitHub is updated until the push succeeds.

Standing instruction recorded: 2026-11-09.
