# Requirements: Crystarium

**Defined:** 2026-05-23
**Core Value:** A demo that makes a stranger feel "this single person is actually running a real business" — visually compelling enough that the Crystarium metaphor sells the idea before any feature is explained.

## v1 Requirements

Requirements for the hackathon demo. Each maps to roadmap phases.

### Scaffold

- [ ] **SCAF-01**: Vite + React 18 + TypeScript app scaffolds and runs via `npm run dev` on localhost
- [ ] **SCAF-02**: Tailwind CSS is configured and a global dark cosmic background is in place
- [ ] **SCAF-03**: shadcn/ui base components are installed and theme tokens reflect the Crystarium palette
- [ ] **SCAF-04**: Zustand store is created with typed slices for nodes, agents, chat history, automation log, and seed data
- [ ] **SCAF-05**: localStorage persistence middleware on the Zustand store survives a browser refresh

### Crystarium Graph

- [ ] **GRPH-01**: React Flow canvas fills the viewport with pan/zoom and a star-field/particle background
- [ ] **GRPH-02**: Eight capability nodes render in an FF13-style branching layout with Manager at center
- [ ] **GRPH-03**: Each node uses a custom crystal renderer (hex/diamond shape, glow halo, role color) instead of the React Flow default
- [ ] **GRPH-04**: Edges between Manager and each capability node render as glowing branching paths in the Crystarium style
- [ ] **GRPH-05**: Each node displays its role name, icon, and a short status line ("idle" / "thinking" / "active")
- [ ] **GRPH-06**: Framer Motion animates a slow pulse-glow on every node so the graph feels alive at rest

### Agent Drawer

- [ ] **AGNT-01**: Clicking a node opens a right-side drawer pinned to the viewport with that agent's role and persona
- [ ] **AGNT-02**: Drawer shows a "recent actions" feed for that agent (last 5 actions, scrollable)
- [ ] **AGNT-03**: Drawer shows a chat thread between user and that agent, with message bubbles styled per role
- [ ] **AGNT-04**: Chat input accepts user message; on send, agent shows a "thinking" indicator then returns a smart canned response keyed to the node type and the message content
- [ ] **AGNT-05**: Each of the 8 agents has at least 6 distinct in-character canned responses + a fallback so the demo never feels repetitive
- [ ] **AGNT-06**: Closing the drawer returns focus to the graph without losing chat history (persisted)

### Clone & Specialize

- [ ] **CLON-01**: Each agent drawer has a "Clone & Specialize" button
- [ ] **CLON-02**: Clicking it opens a small inline form asking for the specialization (e.g., "decaf-only buyers")
- [ ] **CLON-03**: On submit, a child node spawns visually adjacent to the parent with its own crystal shape (smaller, same color family)
- [ ] **CLON-04**: An edge connects the parent node to the child to show the lineage
- [ ] **CLON-05**: The child node has its own agent that inherits the parent's role but applies the specialization to its persona and responses (e.g., parent says "I sent the welcome email"; specialized child says "I sent the decaf-buyer welcome email with the Swiss-water origin story")
- [ ] **CLON-06**: Clones persist to localStorage and rehydrate on refresh

### Automations

- [ ] **AUTO-01**: When one agent "triggers" another (e.g., new signup at Storefront → Email Marketing), the edge between them pulses with a traveling glow animation
- [ ] **AUTO-02**: A small automation-log overlay (toggle) shows the last 5 automation events in plain English ("11:42  Storefront → Email: new signup")
- [ ] **AUTO-03**: Seeded automations fire on a slow timer (every ~15s) so a passive demo viewer sees the graph come alive on its own
- [ ] **AUTO-04**: User-triggered chat actions can also fire automations (e.g., chatting with Storefront about a new product fires Storefront → Content Engine)

### Seed Data & Manager

- [ ] **SEED-01**: App boots with "Pour Decisions" coffee subscription business: 47 customers, $2,340 MRR, 3 overnight signups
- [ ] **SEED-02**: Top header bar shows business name, MRR, customer count, and "today's activity" counter
- [ ] **SEED-03**: Manager node displays an "AI CEO morning briefing" card summarizing what the other agents did overnight
- [ ] **SEED-04**: Each capability node has a pre-seeded recent actions feed so the demo has plausible history at t=0

### Polish & Demo

- [ ] **POLI-01**: Boot intro screen ("ENTERING THE CRYSTARIUM" with a fade-in) plays once on first load and skips on subsequent loads
- [ ] **POLI-02**: All hover, click, and selection states have clear visual feedback (glow intensifies, edge highlights, etc.)
- [ ] **POLI-03**: 2-3 minute demo walkthrough lands the golden path: open app → see briefing → click Customer Chat → ask a question → trigger automation → clone & specialize → show specialized response → close → show automation log
- [ ] **POLI-04**: README.md captures the elevator pitch, demo script, and "how to run" so anyone (including the user post-hackathon) can re-run the demo

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Live Integration

- **LIVE-01**: Real Claude API wired in per node with role-specific system prompts
- **LIVE-02**: Real n8n / Zapier webhook hooks behind the automations
- **LIVE-03**: Stripe sandbox wired to the Payments node

### Multi-business

- **MULT-01**: Save / load different business configurations (e.g., switch between "Pour Decisions" and another niche)
- **MULT-02**: Export a business as JSON to share / fork

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real LLM/Claude API calls | Network and key risk during demo; mock responses ship more reliably in 3hr budget |
| Real payments / Stripe / transactional integrations | Mock data is sufficient; real money out of hackathon scope |
| Multi-user accounts / auth | Single-user local demo |
| Backend server / API | Entirely in-browser; no API surface |
| Mobile responsive design | Demo runs on presenter's laptop; mobile not part of pitch |
| Real n8n / Zapier integration | Automations are visual-only metaphor in v1 |
| Test suite | Hackathon scope; manual walkthrough verifies golden path |
| Production deployment / hosting | Local dev server is the demo target |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCAF-01 | Phase 1 | Pending |
| SCAF-02 | Phase 1 | Pending |
| SCAF-03 | Phase 1 | Pending |
| SCAF-04 | Phase 1 | Pending |
| SCAF-05 | Phase 1 | Pending |
| GRPH-01 | Phase 1 | Pending |
| GRPH-02 | Phase 1 | Pending |
| GRPH-03 | Phase 1 | Pending |
| GRPH-04 | Phase 1 | Pending |
| GRPH-05 | Phase 1 | Pending |
| GRPH-06 | Phase 1 | Pending |
| SEED-01 | Phase 1 | Pending |
| SEED-02 | Phase 1 | Pending |
| AGNT-01 | Phase 2 | Pending |
| AGNT-02 | Phase 2 | Pending |
| AGNT-03 | Phase 2 | Pending |
| AGNT-04 | Phase 2 | Pending |
| AGNT-05 | Phase 2 | Pending |
| AGNT-06 | Phase 2 | Pending |
| SEED-03 | Phase 2 | Pending |
| SEED-04 | Phase 2 | Pending |
| CLON-01 | Phase 3 | Pending |
| CLON-02 | Phase 3 | Pending |
| CLON-03 | Phase 3 | Pending |
| CLON-04 | Phase 3 | Pending |
| CLON-05 | Phase 3 | Pending |
| CLON-06 | Phase 3 | Pending |
| AUTO-01 | Phase 3 | Pending |
| AUTO-02 | Phase 3 | Pending |
| AUTO-03 | Phase 3 | Pending |
| AUTO-04 | Phase 3 | Pending |
| POLI-01 | Phase 4 | Pending |
| POLI-02 | Phase 4 | Pending |
| POLI-03 | Phase 4 | Pending |
| POLI-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0 ✓

**Phase distribution:**
- Phase 1 (Foundation & Graph): 13 reqs
- Phase 2 (Agents Talk Back): 8 reqs
- Phase 3 (Living System): 10 reqs
- Phase 4 (Demo-Ready Polish): 4 reqs

---
*Requirements defined: 2026-05-23*
*Last updated: 2026-05-23 — traceability synced with ROADMAP.md (SEED-03/04 moved Phase 4→2)*
