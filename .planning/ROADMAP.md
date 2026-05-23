# Roadmap: Crystarium

**Created:** 2026-05-23
**Granularity:** coarse (4 phases)
**Deadline:** 2026-05-23 14:30 local (~3h from start)
**Core Value:** A demo that makes a stranger feel "this single person is actually running a real business" — the Crystarium metaphor sells it before any feature is explained.

## Golden Path (the demo must land)

Open app → see Manager briefing → click a capability node → chat with its agent → trigger an automation visually → clone & specialize a node → close drawer → see automation log.

Every phase exists to make some slice of this golden path real and durable.

## Phases

- [ ] **Phase 1: Foundation & Graph** — App boots to a glowing 8-node Crystarium with the "Pour Decisions" header
- [ ] **Phase 2: Agents Talk Back** — Clicking any node opens a working chat drawer and the Manager briefs the user
- [ ] **Phase 3: Living System** — Clones spawn, automations pulse along edges, log records the activity
- [ ] **Phase 4: Demo-Ready Polish** — Boot intro, hover/selection states, persistence proven, README + 2-3 min walkthrough land

## Phase Details

### Phase 1: Foundation & Graph
**Goal:** A stranger opens the app and immediately sees a living Crystarium — 8 glowing capability nodes branching from a central Manager — with the "Pour Decisions" business identity in the header.
**Depends on:** Nothing (first phase)
**Requirements:** SCAF-01, SCAF-02, SCAF-03, SCAF-04, SCAF-05, GRPH-01, GRPH-02, GRPH-03, GRPH-04, GRPH-05, GRPH-06, SEED-01, SEED-02
**Success Criteria** (what must be TRUE for a user):
  1. `npm run dev` opens a single-page app with a dark cosmic background and pan/zoom canvas filling the viewport.
  2. Eight crystal-shaped capability nodes (Manager at center; Storefront, Customer Chat, Email Marketing, Content Engine, Payments, Analytics, Automations radiating outward) are visible in an FF13-style branching layout.
  3. Every node pulses with a slow crystal glow at rest and shows its role name, icon, and a status line — the graph looks alive even when untouched.
  4. The top header shows "Pour Decisions", $2,340 MRR, 47 customers, and a today's activity counter sourced from seeded state in Zustand.
  5. A browser refresh preserves the graph and seed data (Zustand → localStorage hydration works).
**Plans:** TBD

### Phase 2: Agents Talk Back
**Goal:** Clicking any node opens a working chat drawer with in-character agent responses, and the Manager node greets the user with an AI CEO morning briefing — the system feels staffed.
**Depends on:** Phase 1
**Requirements:** AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05, AGNT-06, SEED-03, SEED-04
**Success Criteria** (what must be TRUE for a user):
  1. Clicking any of the 8 nodes opens a right-side drawer showing that agent's role, persona, and a scrollable "recent actions" feed pre-seeded with plausible overnight activity.
  2. Sending a message in the drawer shows a "thinking" indicator, then returns a smart in-character canned response keyed to the node type and message content — and every agent has at least 6 distinct responses plus a fallback.
  3. The Manager node prominently displays an "AI CEO morning briefing" card summarizing what the other agents did overnight ("Email sent 3 win-back drips; Storefront added 3 signups; Analytics flagged a decaf trend").
  4. Closing the drawer returns focus to the graph with chat history persisted — reopening the same node restores the conversation.
**Plans:** TBD

### Phase 3: Living System
**Goal:** The Crystarium evolves in front of the user — agents clone into specialized children, automation edges pulse with traveling light when one agent triggers another, and an automation log records the activity.
**Depends on:** Phase 2
**Requirements:** CLON-01, CLON-02, CLON-03, CLON-04, CLON-05, CLON-06, AUTO-01, AUTO-02, AUTO-03, AUTO-04
**Success Criteria** (what must be TRUE for a user):
  1. Clicking "Clone & Specialize" in any drawer opens an inline form, and submitting a specialization (e.g., "decaf-only buyers") spawns a smaller child crystal adjacent to the parent with a lineage edge connecting them.
  2. The cloned child has its own agent that inherits the parent's role and visibly applies the specialization to its persona and responses (parent says "I sent the welcome email"; child says "I sent the decaf-buyer welcome email with the Swiss-water origin story").
  3. Seeded automations fire on a slow timer (~15s) and user chat actions also trigger automations — in both cases, the relevant edge pulses with a traveling glow from source to target node.
  4. A toggleable automation-log overlay shows the last 5 automation events in plain English with timestamps ("11:42  Storefront → Email: new signup").
  5. Clones and automation log entries survive a browser refresh.
**Plans:** TBD

### Phase 4: Demo-Ready Polish
**Goal:** The demo is presentable end-to-end — boot intro, polished interactive feedback, durable persistence, and a 2-3 minute walkthrough that lands the golden path without rehearsal scars.
**Depends on:** Phase 3
**Requirements:** POLI-01, POLI-02, POLI-03, POLI-04
**Success Criteria** (what must be TRUE for a user):
  1. First-load shows a brief "ENTERING THE CRYSTARIUM" fade-in intro that auto-skips on subsequent loads (state flag persisted).
  2. Every hover, click, and selection produces clear visual feedback — node glow intensifies, edges highlight, drawer-open and chat-send have crisp transitions with no jank.
  3. The golden-path walkthrough (open → briefing → click Customer Chat → ask question → trigger automation → clone & specialize → show specialized response → close → show automation log) executes cleanly in 2-3 minutes with no broken state.
  4. README.md captures the elevator pitch, 2-3 minute demo script, and "how to run" so the demo is reproducible by anyone (including the user post-hackathon).
**Plans:** TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Graph | 0/0 | Not started | - |
| 2. Agents Talk Back | 0/0 | Not started | - |
| 3. Living System | 0/0 | Not started | - |
| 4. Demo-Ready Polish | 0/0 | Not started | - |

## Coverage

- v1 requirements: 35
- Mapped: 35
- Orphaned: 0
- Duplicated: 0

Coverage by phase:
- Phase 1: 13 requirements (SCAF-01..05, GRPH-01..06, SEED-01, SEED-02)
- Phase 2: 8 requirements (AGNT-01..06, SEED-03, SEED-04)
- Phase 3: 10 requirements (CLON-01..06, AUTO-01..04)
- Phase 4: 4 requirements (POLI-01..04)

## Notes

- **Granularity = coarse:** 4 phases is the cap. Each phase clusters multiple requirement categories so that completing a phase delivers a visibly different demo, not just internal scaffolding.
- **Phase 1 ends with a visual milestone** (graph + header rendered) rather than a logical one (state shape defined) — this is intentional to keep momentum and risk-front-load the React Flow custom node renderer.
- **SEED-03 and SEED-04 moved to Phase 2** (originally Phase 4 in the tentative mapping). They require the drawer and Manager-card UI surfaces that Phase 2 builds, so they belong with their delivery vehicle.
- **Phase 4 is short by design.** Polish work has the worst time-overrun behavior; the small surface area protects the deadline. If time is running tight at Phase 3 boundary, POLI-01 (intro) is the first thing to drop.

---
*Roadmap created: 2026-05-23*
