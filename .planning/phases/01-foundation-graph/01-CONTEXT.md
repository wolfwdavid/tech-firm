# Phase 1: Foundation & Graph - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the visual centerpiece: a Vite/React/TS app that boots to a glowing Crystarium of 8 capability nodes branching from a central Manager, with the "Pour Decisions" business identity displayed in the header. No interaction beyond pan/zoom yet — the goal is the *first-frame impression*. State persists across refresh so the demo always opens to the same Crystarium.

Out of phase: agent drawers, chat, cloning, automation pulses, manager briefing card, recent-actions feeds, polish/intro. Those belong to Phases 2-4.

</domain>

<decisions>
## Implementation Decisions

### Visual Aesthetic
- Background: deep cosmic gradient (near-black at edges → very dark indigo/violet at center) + animated star/particle field at low opacity for subtle parallax
- Node shape: hexagonal crystal with inner gradient and outer glow halo (matches FF13 Crystarium feel without literal copying)
- Role colors: Manager = warm gold/amber, Storefront = amber-orange, Customer Chat = cyan, Email = sky-blue, Content Engine = rose, Payments = mint-green, Analytics = white-silver, Automations = violet-purple
- Glow style: drop-shadow + filter blur layers tinted to each role color; Framer Motion drives a 3-4s breathing pulse
- Edge style: stroke gradient matching the two endpoint role colors, with low base opacity (~0.3) and animatable opacity for the automation pulse coming in Phase 3
- Typography: a clean modern sans for UI (Inter or system); a slightly mystic display font for stage banners (use Tailwind defaults plus a Google Font import for the display face if it doesn't bloat scaffold time)

### Layout Topology
- Manager at center of the canvas (anchored to viewport center on first paint)
- 7 capability nodes positioned in an outward branching layout — NOT a flat circle. Use a two-tier radial:
  - Tier 1 (closer to Manager, ~180-240px): Storefront, Customer Chat, Email Marketing — the customer-facing trio
  - Tier 2 (farther, ~360-420px): Content Engine, Payments, Analytics, Automations — the back-office quartet
- Edges: each Tier 1 node connects to Manager; each Tier 2 node connects to its nearest Tier 1 node (with Automations connecting to Manager directly to imply it's the bridge). This creates the branching Crystarium feel instead of a flat hub-and-spoke
- React Flow `defaultViewport` centered to show the whole layout on first paint at ~0.8-1.0 zoom

### Tech Setup
- Scaffold via `npm create vite@latest . -- --template react-ts` in the empty current directory
- Tailwind CSS via the official Vite + Tailwind v3 path (postcss + autoprefixer + tailwind init) — NOT v4 alpha to avoid setup surprises
- shadcn/ui via `npx shadcn@latest init` with a dark base theme; primary color = a deep violet accent
- React Flow v11+ — use custom node and edge types from day one (no migration risk later)
- Framer Motion for node glow + viewport entry animation
- Zustand for global store with `persist` middleware to localStorage (single store, slice pattern)
- File layout: `src/components/` (nodes/, edges/, layout/), `src/store/` (Zustand slices), `src/data/` (seed.ts), `src/lib/` (utilities)

### Persistence Approach
- Single Zustand store with `persist` middleware → localStorage key `crystarium-v1`
- Persisted slices: nodes, edges, clones, chatHistory (Phase 2), automationLog (Phase 3), seedData
- NOT persisted: transient UI state (drawer open/closed, hover state)
- On first boot (no localStorage key), seed from `src/data/seed.ts`
- Header consumes derived selectors (mrr, customerCount, todayActivity) from the store

### Claude's Discretion
- Exact hex values for role colors (pick palette that reads well on the dark background)
- Star-field particle implementation (CSS gradient + animated divs OR a tiny canvas — pick whatever ships faster)
- Specific component file split within `src/components/`
- Whether to use CSS variables vs Tailwind theme tokens for role colors — pick whichever integrates cleaner with shadcn
- React Flow node IDs and naming conventions (e.g., `node-manager`, `node-storefront`)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets

None — this is a greenfield scaffold. The directory is empty.

### Established Patterns

None yet — this phase establishes the patterns (Zustand slice shape, custom node renderer signature, Tailwind theme tokens, file layout) that Phases 2-4 will follow.

### Integration Points

- `App.tsx` will host the full-bleed React Flow canvas and the top header
- The Zustand store (`src/store/index.ts`) is the integration spine — every later phase reads/writes through it
- `src/data/seed.ts` is the single source of truth for the "Pour Decisions" business — Phase 2 adds agent personas and recent actions to it; Phase 3 adds seeded automations

</code_context>

<specifics>
## Specific Ideas

- "Crystarium" specifically refers to FF13's progression grid — branching crystal paths, not a flat web. Capture that with the two-tier radial layout, not a circle.
- The user has prior FF-inspired knowledge-graph work (email_node solar-system project). Visual ambition is the differentiator vs. dashboard-of-cards competitors.
- Glow is the magic. A flat node grid would be unremarkable; the pulsing crystal halos are what sells "alive system" before any text is read.
- The header must say "POUR DECISIONS" prominently — it's the business identity and grounds the abstract graph in a concrete product.

</specifics>

<deferred>
## Deferred Ideas

- Boot intro screen ("ENTERING THE CRYSTARIUM" fade-in) → POLI-01, Phase 4
- Selection/hover affordances beyond passive glow → POLI-02, Phase 4
- Agent drawers and chat → AGNT-*, Phase 2
- Manager briefing card → SEED-03, Phase 2
- Automation edge pulses → AUTO-01, Phase 3
- Clone & Specialize → CLON-*, Phase 3
- Multiple business presets → v2 (MULT-01)

</deferred>
