# Policy-specific scenes and animation

18 final PNG assets generated with built-in imagegen: each mission's three initial choices and three response choices. Exact prompts are in policy-art-prompts.json. Original terrain and the numerical environment layer remain separate from policy interventions.

- Reef: treatment upgrade, visitor pier, protected-area buoys, continued treatment, treatment shutdown, continued bleaching while waiting.
- Seagrass: sediment interception, planting plots, dredging, maintained runoff filters, stressed expanded plots, untreated runoff.
- Wind: grid connection, nearshore construction, capacity publicity, cable repair, extra construction without cable repair, further publicity.

The game animates these raster assets with SVG masks driven by the existing five-second action clock: bottom-up construction, staggered planting, progressive flow and local crossfades. These are code animations of AI-generated still images, not AI-generated video. Temporary animation strokes disappear on completion. People, traffic and sea movement continue.

Only the relevant region is composited, with softened edges. Previous independent structures remain; later treatment/publicity changes replace the same facility. The existing bounded metrics, heat events, scoring and Google Sheets records are unchanged. No-action policies are not assigned environmental improvements. Source images are illustrative assets; the composited game retains the actual numerical environmental state outside intervention regions.

Validation: all 18 images and 54 intermediate/final render checkpoints; 27 current gameplay paths; numerical reconciliation suite; TypeScript; browser visual review of all mission groups and 50% progress. Revised pier mask to remove rectangular water patch and regenerated repair vessel to avoid overlapping the original turbines.
