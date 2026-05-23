# Crystarium — One-Person AI Business

## What This Is

Crystarium is a single-page demo dashboard that visualizes a one-person AI business as a Final Fantasy XIII-style node grid. Each glowing crystal node is a business capability (storefront, customer chat, email, content, payments, analytics, automations) staffed by a specialized AI agent. Clicking a node opens that agent in a side drawer; "Clone & Specialize" spawns a customized child agent; edges pulse when one agent triggers another. Built for the "One-Person AI Business" hackathon.

## Core Value

A demo that makes a stranger feel "this single person is actually running a real business" — visually compelling enough that the Crystarium metaphor sells the idea before any feature is explained. Demo > spec.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Single-page React app loads and renders a Crystarium-style node graph as the centerpiece
- [ ] Eight capability nodes are visible in an FF13-inspired branching layout (Manager at center; Storefront, Customer Chat, Email Marketing, Content Engine, Payments, Analytics, Automations radiating outward)
- [ ] Each node visually conveys its role through color, icon, and crystal-glow pulse animation
- [ ] Clicking any node opens a side drawer showing that agent's role, recent actions feed, and a chat input
- [ ] Each agent returns smart, in-character canned responses keyed to its node type (no real LLM call)
- [ ] "Clone & Specialize" button on each node spawns a child node positioned visually as a sub-crystal off the parent, named by user's specialization input
- [ ] Cloned child nodes inherit the parent's role with the user's specialization applied to its agent persona and responses
- [ ] Automation edges visibly pulse along their path when one agent triggers another (e.g., Storefront → Email on signup)
- [ ] Seed data: "Pour Decisions" coffee-subscription business with 47 customers, $2,340 MRR, 3 overnight signups, recent agent actions visible across the Manager node
- [ ] Manager node shows an "AI CEO morning briefing" card summarizing what the other agents did overnight
- [ ] Top header displays business name, MRR, customer count, and "today's activity" counter
- [ ] State persists across browser refresh (clones, chat history, automation log) via localStorage
- [ ] App is presentable as a 2-3 minute walkthrough demo (golden path works end-to-end)

### Out of Scope

- Real LLM/Claude API calls — mocked responses only (avoids network/key risk during demo; time budget)
- Real customer data, payments, or transactional integrations — pure mock data
- Multi-user / accounts / auth — single-user local demo
- Backend server — entirely in-browser, no API
- Mobile responsive design beyond "doesn't break on a laptop" — demo runs on presenter's machine
- Real n8n/Zapier integration — automations are visual-only metaphor in v1
- Testing harness beyond manual demo walkthrough — hackathon scope
- Production deployment / hosting — local dev server is the demo target

## Context

- Hackathon: "One-Person AI Business" — stack is AI website + AI manager + automations; demo > spec; mock data fine
- The Crystarium metaphor comes from Final Fantasy XIII's character progression grid: a constellation of crystal nodes connected by branching paths that the player unlocks one by one. The user has prior precedent for FF-inspired knowledge-graph visualizations (email_node project, FF13-inspired solar system) — visual identity is already in their head.
- Visual ambition is the differentiator. Most one-person-AI-business demos are dashboards with cards. The Crystarium framing instantly communicates "specialized agents, growing organically" without text.
- "Clone & Specialize" is the conceptual hook: the user grows their business by spawning specialized sub-agents off generalist nodes, mirroring how a real founder hires sub-specialists.
- Workflow rules: "Master Programmer" mode, plan-first, verify-before-done, clean commits with no AI attribution, tasks tracked in `tasks/todo.md` and lessons in `tasks/lessons.md`.

## Constraints

- **Timeline**: Hard demo deadline 2026-05-23 14:30 local time — ~3 hours from project start at 11:25
- **Tech stack**: Vite + React 18 + TypeScript + React Flow + Tailwind CSS + shadcn/ui + Framer Motion + Zustand — chosen for ship-speed and visual polish
- **Runtime**: Browser-only, single-page, no backend, no external services
- **Agents**: Mocked responses keyed off node type (each node has 6-10 in-character canned messages + visible "thinking" animation)
- **Data**: Pre-seeded "Pour Decisions" coffee subscription business — no live data sources
- **Commits**: No mention of Claude, Gemini, or AI authorship in commit messages
- **Demo target**: A laptop running `npm run dev`, projected or screen-shared

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Flow over custom Three.js canvas | ~2h saved; React Flow handles dragging, edges, viewport pan/zoom out of the box; Crystarium aesthetic achieved via custom node renderers + Framer Motion glow | — Pending |
| Mocked agents (no live API) | Eliminates network/key risk during demo; canned responses can be more reliably "in-character" than live LLM in 3hr budget | — Pending |
| Zustand for state | Single source of truth for nodes/clones/chat/automation log; persisted to localStorage; lighter than Redux for hackathon scope | — Pending |
| Coarse GSD granularity (3-4 phases) | Fits the time budget; lets autonomous mode actually finish before 2:30 | — Pending |
| Skip GSD research phase | Stack is already chosen; domain (one-person AI business demos) is already understood; saves ~10min and tokens | — Pending |
| Seed business = "Pour Decisions" coffee subscription | Concrete-enough niche to feel real; small enough that 47 customers + $2,340 MRR is plausibly a real one-person business | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-23 after initialization*
