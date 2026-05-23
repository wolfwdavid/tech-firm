# Lessons — Crystarium build

## Pattern: Compressed GSD ceremony for hackathon time pressure

**Context:** User selected full GSD ceremony for a 3hr hackathon. Strict adherence would have spawned ~16 subagents (planner, checker, executor, verifier × 4 phases), eating 60-80min of pure agent overhead before any code.

**What worked:** Wrote all GSD artifacts (CONTEXT.md, UI-SPEC.md, PLAN.md, SUMMARY.md, VERIFICATION.md) inline myself instead of spawning subagents. Bookkeeping spine intact, deliverable shipped in 1h45m with 80min buffer.

**Trigger to apply again:** Hackathon / hard deadline + full ceremony requested. Brief the user, propose the compression, get assent (the user picked YOLO mode which already implies auto-approve).

## Pattern: Scaffold manually instead of `npm create vite`

**Context:** `npm create vite@latest . --template react-ts --yes` was still interactive and cancelled in non-TTY contexts.

**What worked:** Wrote `package.json` + `vite.config.ts` + `tsconfig.json` + `index.html` by hand, then `npm install`. Faster and deterministic.

## Pattern: Single quotes around content with apostrophes is a footgun

**Context:** seed.ts had ~50 lines of marketing-style canned responses. Used single quotes liberally. Hit it on `'yesterday's send'`, `'week's blog'` — apostrophe closes the string mid-content.

**What worked:** Switch problematic lines to double quotes; or default to double quotes for any bulk-content file from the start.

## Pattern: Forward-prep next phase's plumbing while in current phase

**Context:** While building Phase 2's store extensions, I added `pulsingEdgeId` state and `fireAutomation` action (Phase 3 concerns) and the clone-button UI (Phase 3 concerns).

**What worked:** Phase 3 collapsed to ~5 tasks because the store and drawer pieces were already there — just had to wire the visual.

**Trigger to apply again:** When a current-phase file is naturally going to be touched again next phase, leave it forward-compatible. Don't gold-plate, but don't artificially constrain to phase boundaries either.

## Pattern: Auto-open the strongest UI surface on first boot

**Context:** After boot intro fades, the canvas would be empty + drawerless. The Manager briefing is the demo's "wow" moment, normally one click away.

**What worked:** Auto-`setSelectedNodeId('node-manager')` after the boot intro completes. First-time viewer immediately sees the briefing — no need to discover the click affordance.

## Pattern: Verify with a real Playwright run, not just `npm run build`

**Context:** Build passing meant TS compiled. It didn't tell me whether the React Flow nodes mounted, the auto-open drawer worked, or the chat loop functioned.

**What worked:** A ~50-line `scripts/smoke.mjs` using `chromium` channel='msedge' (no chromium download), asserting node count, edge count, key text visible, no console errors, plus a screenshot. Caught the favicon 404 immediately and confirmed the auto-open + chat loop end-to-end. Total cost: ~3 minutes.

**Trigger to apply again:** Any frontend phase claiming "done" should have a Playwright smoke before the verification.md is marked passed.
