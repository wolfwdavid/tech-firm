# Phase 2: Agents Talk Back - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the Crystarium feel staffed. Clicking any node opens a right-side drawer showing the agent's persona, recent actions, and a chat thread. Sending a message shows a "thinking…" status on the node, then a smart canned response appears. Manager node additionally shows a prominent "AI CEO morning briefing" card. State (chat history, recent actions) persists across refresh.

Out of phase: cloning, automation edge pulses, automation log overlay, polish/intro.
</domain>

<decisions>
## Implementation Decisions

### Drawer
- Right-side drawer, 420px wide on desktop, fixed `position: fixed right-0 top-16 bottom-0`
- Background: `surface-2` (#1f2247) with 92% opacity + backdrop blur 16px
- Border-left: 1px `border-glow`
- Slide-in animation: Framer Motion `x: 100% → 0` over 280ms ease-out
- Close: × button top-right; clicking outside (pane click) also closes; ESC also closes
- Internal layout (top→bottom): role header strip → persona block → recent actions feed (scroll) → chat thread (scroll) → chat input (sticky bottom)
- Role header strip uses the same role color + glow as the node — drawer feels like a continuation of the crystal

### Chat & Canned Responses
- User message bubble: right-aligned, surface-1 background, white text
- Agent message bubble: left-aligned, surface with a thin role-color left border, role-color text accent on the role name above the bubble
- "Thinking…" indicator: 3 pulsing dots in the role color while node.status = 'thinking'; appears as a placeholder agent bubble during the 700-1100ms response delay
- Smart response selection: simple keyword scoring against the user message — for each canned response, count how many words in the message also appear in the response (case-insensitive, drop stop-words). Pick the highest scorer. Ties broken by recency-of-use (avoid repeats). Fallback: round-robin through all responses.
- On message send: setNodeStatus(node, 'thinking') → setTimeout(700-1100ms randomized) → appendChat(agent reply) → setNodeStatus(node, 'idle')

### Manager Briefing Card
- Renders inside the Manager's drawer above the chat thread, ONLY for the manager node
- Title: "Morning Briefing" with a small "↻" refresh button
- 4-5 short bullet lines summarizing overnight activity, generated from the seeded recentActions of the other agents (Storefront: "3 IG signups", Email: "Decaf launch queued", Payments: "$87 new MRR", etc.)
- Each bullet has a small role-color dot to its left
- Style: card with surface-1 bg, role-color top accent strip, slightly elevated shadow

### Recent Actions Feed
- Top of the drawer below persona
- Header: "RECENT" caps tracked
- List of `Agent.recentActions` items, max 5, with relative timestamp ("3h ago") via `formatRelativeTime`
- Each item: small role-color dot + text + timestamp right-aligned

### Persistence
- chat slice in Zustand already persists via existing partialize config
- recentActions on agents persist (already in seedAgents and store)
- When a user message is sent and an agent replies, ALSO append a synthetic "Replied to user about X" line to that agent's recentActions (keep last 5)

### Claude's Discretion
- Exact bubble spacing / radius
- Whether to show timestamps on chat messages (lean: yes, small, muted)
- Whether to show a "live since" pseudo-timestamp on the agent header (lean: skip, save for polish)
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useCrystariumStore`, `useAgent`, `useChat`, `useSelectedNodeId` already exported
- `formatRelativeTime`, `formatTime` already in `src/lib/utils.ts`
- `roleVisuals` map already in CrystalNode — import for color tokens in drawer
- Lucide icons already a dep

### Established Patterns
- All UI uses inline styles for role-color tokens (since roles are dynamic) + Tailwind for layout
- Framer Motion for any animation
- Zustand selectors as hooks (`useFoo()`)

### Integration Points
- `App.tsx` mounts `<Crystarium />` — drawer mounts as sibling so it overlays
- `selectedNodeId` already wired to node clicks
- `setSelectedNodeId(null)` already wired to pane click

</code_context>

<specifics>
## Specific Ideas

- The Manager briefing card is the demo opener. It must feel substantive — like a real product. Use the seeded recentActions of the other 7 nodes to build it dynamically so it stays in sync if seed data changes.
- Chat should feel terse and in-voice. Canned responses are already written in-character; selection just needs to not feel random.
</specifics>

<deferred>
## Deferred Ideas

- Clone & Specialize button (Phase 3, CLON-01)
- Automation pulses when chat triggers a downstream agent (Phase 3, AUTO-04)
- Boot intro fade-in (Phase 4)
</deferred>
