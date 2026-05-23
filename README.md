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

## Demo script (~3 min, full golden path)

> Press **`?`** at any time during the demo to bring up an on-screen cheat sheet of every shortcut. Press **`Esc`** or click anywhere to dismiss.

1. **First load → onboarding wizard.** The Crystarium asks for the business name + niche, current numbers, then previews all 8 agents personalized for the niche. Tap "Enter the Crystarium" → a brief "Entering the Crystarium" fade reveals the dashboard. Manager drawer auto-opens with the morning briefing.

2. **Read the briefing.** 5 bullets summarizing what the other agents did overnight, aggregated live from their recent-actions feeds. Each bullet has a role-colored dot.

3. **Talk to your AI CEO.** Type *"What should I prioritize this morning?"* and hit Enter. The Manager pulses "thinking…" then **types its reply word-by-word**, with a blinking gold caret. The response is in your CEO's voice and addresses the question.

4. **Press `Shift+D` → press `1`.** The demo control panel slides up, scenario #1 ("New customer signup") fires. **The Storefront→Email edge pulses with traveling light**, the automation log adds a row, the Storefront agent's recent-actions feed shows the signup. Audience sees a fake customer kick the system into motion.

5. **Click the Storefront crystal.** Drawer switches to Storefront's agent (amber/orange). Ask *"any conversion ideas this week?"* — agent streams a reply about hero copy, A/B testing, signup flow. Notice the Storefront→Content edge briefly pulses — chat triggered a downstream automation.

6. **Hit the Wand (✨) icon → type "decaf-only buyers" → Spawn.** A smaller amber crystal spawns next to Storefront with a lineage edge. Drawer switches to the clone. Ask it anything — replies are prefixed `[decaf-only buyers]` showing it inherited the parent's role but narrowed.

7. **Bottom-left: click the "Automations" pill.** The log expands. ~5-15 events visible: the seeded fires (every 15-22s on a timer), the demo-panel fire, the chat-triggered fires from steps 5-6. Each has a timestamp + source/target role dots + plain-English label.

8. **(Closing beat) Wait 5-10 seconds without touching anything.** A seeded automation fires on its own — an edge pulses, the log gets a new row. Punctuates "this thing runs whether you're at the keyboard or not."

9. **Reset for the next viewer.** Click the ↺ icon in the header → confirm. localStorage clears, page reloads, onboarding wizard is back for the next demo.

### Defense in depth

- The whole demo above works **without an internet connection** — agents reply via the keyword matcher, automations fire on a timer, the demo panel pulses edges locally.
- Add `VITE_LIVE_AGENTS=true` + `ANTHROPIC_API_KEY` to `.env.local` for live Claude Haiku replies. If the live call fails for any reason, the canned-response path takes over automatically for that one turn — the audience never sees a broken state.
- If Claude-A's storefront / Supabase isn't ready, the demo panel guarantees the magic pulse moment.

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
