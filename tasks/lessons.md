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

## Pattern: Two-Claude collaboration via GitHub issues

**Context:** Hackathon v2 — second Claude on a different laptop, same GitHub identity, no real-time channel. The other side wrote `COORDINATION.md` first declaring the protocol.

**What worked:**
- Title prefix `[Claude-A → Claude-B]` so the recipient is unambiguous in `gh issue list`
- Branch namespacing `claude-a/<feature>` / `claude-b/<feature>` so the directory tree never collides
- Per-side directories: A owned `/web/` (SvelteKit storefront), B owned `/src/` (React Crystarium), shared roots (`COORDINATION.md`, `.env.example`, `supabase/migrations/`) needed coordination comments before edits
- Both sides null-safe their cross-dependencies (Supabase client returns null if keys unset) so each side stays demoable independent of the other side's progress
- Single `automation_events` table as the bus + a shared `RemoteAutomationEvent` row shape committed to both branches before either implemented against it = no integration friction when both sides came online

**How to apply:** When pairing two Claude Code sessions on one repo:
1. Read existing `COORDINATION.md` if present BEFORE pushing anything — protocols are written by whoever got there first.
2. Comment your *intent* on the relevant issue before claiming shared files (`.env.example`, `package.json`, root configs).
3. Reuse the other side's verified shape contracts verbatim (struct definitions, env var names, route paths). Cheap reuse beats clever alignment.
4. Push every meaningful commit immediately; the other side can only see what's pushed.
5. Don't open many small PRs at every commit — open ONE consolidated PR per side and update its description as work lands. Less review fatigue.

## Pattern: Defense-in-depth makes hackathon demos resilient

**Context:** Crystarium v2 demo needed: storefront signups, live AI, cross-machine events. Any single piece (network, API key, Supabase, other laptop) could fail mid-demo.

**What worked — three layers of fallback for every "live" feature:**

| Feature | Layer 1 (live) | Layer 2 (local) | Layer 3 (offline) |
|---|---|---|---|
| Agent chat | Anthropic SSE through `/api/chat` | Falls back to mock on API error | Mocked keyword matcher (default off-flag) |
| Automation pulses | Supabase Realtime on storefront writes | DemoPanel hotkey fires the same pulse locally | Local timer fires every 15-22s seeded |
| Storefront signup | Real Resend email + DB row | DemoPanel "fake signup" scenario | DemoPanel hotkey 1 |

**How to apply:** For any hackathon "magic moment", build the fallback BEFORE the magic. The DemoPanel was task #13 (mid-flight); without it I would've been at the mercy of the live wire for the entire demo. Audience can't tell the difference between a real signup and a hotkey-triggered pulse — both render identically.

## Pattern: Edge labels narrating the pulse caught a real bug

**Context:** I added floating labels above pulsing edges thinking it was pure polish. The smoke test set `edgeLabelVisible` and it returned `false` even though the row was inserted and the log row appeared.

**What worked:** The diagnostic — "log row landed, edge didn't pulse" — pointed straight at `fireAutomation`. The seed has no direct `storefront ↔ email` edge (both connect via Manager). `fireAutomation` was only matching direct edges, silently dropping the pulse for everything that routed through Manager. Added 2-hop pathfinding (find an intermediate node, pulse both legs sequentially with the label on the first leg). The "polish" turned out to fix a real demo-killing bug.

**Lesson:** Visible polish often surfaces invisible bugs. The pulse looked right because there ARE timer-fired automations on direct edges (Manager → X). Adding a feature that USES the label exposed that storefront-driven events were silently dropped. Polish is a free diagnostic when you treat it as one.

## Pattern: Branch chains are cheap; consolidated PRs are kind

**Context:** I shipped 12+ feature branches in a chain. Opening a PR for each would have been ~12 reviews for the other Claude to do.

**What worked:** One consolidated PR against the latest branch tip, with a `What's in it` table mapping each commit cluster to a feature branch + summary. The other Claude can review at any granularity (whole PR, individual branches, individual commits) without me opening 12 PRs.

**How to apply:** When stacking feature branches on a single coherent thread of work, open ONE PR against the head and rebuild its description as you stack. Close + reopen against the new tip when the head moves — gh CLI doesn't support changing PR head, but close/reopen takes 5 seconds.
