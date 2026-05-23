# Crystarium

**A one-person AI business, rendered as a Final Fantasy XIII-style node grid.**

Each crystal is a business capability — Storefront, Customer Chat, Email, Content, Payments, Analytics, Automations — staffed by a specialized AI agent. The Manager at the center is the AI CEO. Click any crystal to talk to its agent. Hit "Clone & Specialize" to spawn a sub-specialist. Watch the edges pulse as agents trigger each other.

Built for the **One-Person AI Business** hackathon.

---

## What you're looking at

The Crystarium is a single-page demo dashboard for **Pour Decisions**, a fictional one-person coffee subscription business with 47 customers and $2,340 MRR. The eight capability nodes radiate from a central Manager in a branching layout (homage to FF13's progression grid). Each node:

- Glows in its own role color (Manager is gold, Customer Chat is cyan, Automations is violet, etc.)
- Has a specialized AI agent with persona + in-character canned responses
- Shows a recent-activity feed
- Can be cloned into a child specialist with a different focus ("decaf-only buyers", "subscribers in NYC", whatever)

Automations are the wires. When Storefront detects a new signup, it tells Email to send the welcome sequence — and the edge between them pulses with traveling light. A driver fires plausible automations every 15-22 seconds so the system feels alive even when you're not touching it.

---

## Demo script (2-3 min)

1. **Open the app.** The "Entering the Crystarium" intro fades in, then the Crystarium reveals. The Manager drawer auto-opens with the morning briefing — 5 bullets summarizing what the other agents did overnight. *(Header: Pour Decisions, $2,340 MRR, 47 customers.)*

2. **Read the briefing.** "Storefront drove 3 signups overnight. Email has the decaf launch queued. Customer Chat resolved 4 tickets…" Each bullet has a role-colored dot. The bullets are aggregated live from each agent's recent-actions feed.

3. **Talk to the AI CEO.** Type "What should I prioritize this morning?" → the Manager node pulses "thinking…", then replies in-character. The reply matches your message via keyword overlap, so it feels less random than a default canned response.

4. **Click "Clone & Specialize" (the wand icon)** on the Manager. Type "VIP retention" and hit Spawn. A smaller gold crystal appears next to the Manager with a lineage edge. The drawer switches to the clone. Ask it anything — its responses are prefixed `[VIP retention]` to show it inherited the parent's role but with a narrower focus.

5. **Click the Customer Chat node** (cyan). The drawer swaps. Ask: "Any churn risk this morning?" Customer Chat replies in-character. Notice the edge from Customer Chat to one of its neighbors lights up briefly — chat triggered a downstream automation (Customer → Email: nurture queued).

6. **Bottom-left: open the Automation Log.** Click the "Automations" pill. The expanded panel shows the last ~20 events with timestamps. Every 15-22 seconds another seeded automation fires — Storefront → Email, Payments → Analytics, etc. The pill glows briefly on each new event.

7. **(Optional) Wait 15 seconds without touching anything.** A seeded automation fires on its own. An edge pulses with traveling light. Log gets a new row.

8. **(Optional) Hit Reset (↺) in the header** to clear and replay the intro for the next viewer.

---

## How to run

Requires Node 18+.

```sh
npm install
npm run dev
```

Open http://localhost:5173. The Crystarium loads to localStorage on first visit; refreshing preserves clones, chat history, and the automation log. To start fresh, hit the small reset icon in the header (or clear `localStorage.crystarium-v1`).

```sh
npm run build       # production bundle (type-checks then bundles)
npm run preview     # serve the built dist/ locally
```

---

## Stack

| Concern | Pick | Why |
|---------|------|-----|
| Build | Vite | Fastest start, zero config drama |
| Framework | React 18 + TS | Standard, typed, fast |
| Graph | React Flow 11 | Custom node/edge renderers, viewport panning, ~2hr saved vs Three.js |
| State | Zustand + persist | Light, typed, localStorage-backed without ceremony |
| Animation | Framer Motion | AnimatePresence for the drawer, breathing pulses, boot fade |
| Styling | Tailwind v3 | Theme tokens for role colors, fast iteration |
| Icons | Lucide | Consistent, lightweight, cross-platform |
| AI | Mocked agents (smart canned) | No network risk during demo; canned responses are in-character |

---

## Architecture

```
src/
├── App.tsx                # mounts BootIntro, Header, Crystarium, AgentDrawer, AutomationLog
├── components/
│   ├── BootIntro.tsx      # one-time "Entering the Crystarium" fade-in
│   ├── Header.tsx         # POUR DECISIONS wordmark + MRR/Customers/Today KPIs + reset
│   ├── Crystarium.tsx     # full-bleed React Flow canvas + nebula bg + star field
│   ├── AgentDrawer.tsx    # right-side drawer: persona, recent, briefing (Mgr), chat, input
│   ├── AutomationLog.tsx  # bottom-left collapsible event log
│   ├── nodes/CrystalNode.tsx     # hex clip-path + role-tinted radial fill + glow + Lucide icon
│   ├── edges/CrystalEdge.tsx     # bezier path + role-color gradient + pulse animation
│   ├── layout/StarField.tsx      # 60 drifting particles
│   └── drawer/                   # RecentActions, ChatThread, ChatInput, ManagerBriefing
├── store/
│   ├── index.ts           # Zustand store + persist + selectors + sendUserMessage / fireAutomation
│   └── types.ts           # CapabilityNode, Agent, ChatMessage, AutomationEvent, BusinessSeed
├── lib/
│   ├── responseMatcher.ts # keyword-overlap scoring for picking canned responses
│   ├── automationDriver.ts# 15-22s interval driver firing seeded automations
│   └── utils.ts           # cn(), formatRelativeTime(), formatTime()
└── data/seed.ts           # "Pour Decisions" business + 8 nodes + 11 edges + 8 agent personas
```

---

## What's mocked, what's real

- **Real**: the graph, state, persistence, animations, the response-matching algorithm, the timer-driven automations, the cloning lineage. These are first-class production code.
- **Mocked by default** (v1 behavior): the agents' "intelligence". Each agent has 6-7 hand-written canned responses; a keyword scorer picks the best match for the user message. No LLM call. Trades fidelity for demo reliability.
- **Live mode** (v2 opt-in): set `VITE_LIVE_AGENTS=true` and provide `ANTHROPIC_API_KEY` in `.env.local`. Agent chat will hit `POST /api/chat` (Vercel function — works locally via Vite dev middleware), which runs Claude Haiku with prompt caching on the system prompt. If the live call fails for any reason, the composite driver automatically falls back to the canned response path so the demo never stalls.

### Wiring live agents

1. Copy `.env.example` → `.env.local`
2. Set `VITE_LIVE_AGENTS=true` and `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart `npm run dev`
4. The chat now streams through Claude Haiku via `/api/chat` instead of the keyword matcher.

---

## What's not here

- Real payments / Stripe / transactional money
- Multi-user accounts / auth
- Backend server / API surface
- Mobile responsive design (demo is laptop-only)
- Real n8n / Zapier webhooks (automations are visual metaphor)
- Test suite (manual walkthrough verifies the golden path)

These are documented as out of scope in `.planning/REQUIREMENTS.md`.

---

## Project planning

This project was built with the GSD (Get Shit Done) workflow. All planning artifacts live in `.planning/`:

- `PROJECT.md` — vision, core value, constraints
- `REQUIREMENTS.md` — 35 v1 requirements with REQ-IDs and traceability
- `ROADMAP.md` — 4-phase decomposition
- `phases/01-foundation-graph/` — Foundation & Graph (scaffold, store, crystal nodes, header)
- `phases/02-agents-talk-back/` — Agent drawer, chat, manager briefing
- `phases/03-living-system/` — Clone & specialize, automation pulses, log
- `phases/04-demo-polish/` — Boot intro, reset, demo script
