---
phase: 2
plan: 1
title: Agents Talk Back
wave: 1
depends_on: [1]
autonomous: true
requirements: [AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05, AGNT-06, SEED-03, SEED-04]
files_modified:
  - src/store/index.ts
  - src/lib/responseMatcher.ts
  - src/components/AgentDrawer.tsx
  - src/components/drawer/RecentActions.tsx
  - src/components/drawer/ChatThread.tsx
  - src/components/drawer/ChatInput.tsx
  - src/components/drawer/ManagerBriefing.tsx
  - src/App.tsx
---

# Phase 2 — Agents Talk Back

## Must-Haves

1. Clicking any node opens the right drawer with that agent's role, persona, recent actions, chat thread, and input
2. Manager drawer also shows an "AI CEO Morning Briefing" card built from other agents' recent actions
3. Sending a message → node status flips to "thinking…" → after 700-1100ms → smart canned response appears in the thread → status back to "idle"
4. Each agent has ≥6 distinct canned responses (verified in Phase 1)
5. Closing the drawer (× / pane click / ESC) preserves chat history per node
6. Pre-seeded recent actions render in the drawer's RECENT feed for every node

## Tasks

### Task 2.1 — Smart response matcher

<read_first>
- src/store/types.ts
- src/data/seed.ts
</read_first>

<action>
Create `src/lib/responseMatcher.ts` exporting `pickResponse(userText: string, candidates: string[], recentlyUsed: string[]): string`.

Algorithm:
1. Tokenize userText: lowercase, split on /\W+/, filter length > 2, drop English stop-words (the, and, for, you, are, with, that, this, what, when, why, how, can, will, would, could, should, have, has, was, were, but, all, any, some).
2. For each candidate, count tokens that appear in candidate's lowercased text. Score = matchCount + (1 / candidate.length) tie-breaker.
3. Filter out candidates from `recentlyUsed` (last 3 used). If filtering leaves nothing, fall back to all candidates.
4. Sort by score desc. If top score is 0 (no keyword matches), pick a candidate not in recentlyUsed by round-robin (use hash of userText).
5. Return the chosen string.

Also export `STOP_WORDS` as a Set for testability.
</action>

<acceptance_criteria>
- File exists: `src/lib/responseMatcher.ts`
- Exports `pickResponse` and `STOP_WORDS`
- Function signature matches `(userText: string, candidates: string[], recentlyUsed: string[]) => string`
- File has no TS errors
</acceptance_criteria>

### Task 2.2 — Extend store with chat-send action + recentActions append

<read_first>
- src/store/index.ts
- src/store/types.ts
- src/lib/responseMatcher.ts
</read_first>

<action>
Add to the Zustand store:

1. Action `sendUserMessage(nodeId: string, text: string)`:
   - appendChat({ nodeId, from: 'user', text })
   - setNodeStatus(nodeId, 'thinking')
   - Schedule via `setTimeout`, 700 + Math.random()*400 ms:
     - Lookup agent.cannedResponses
     - Compute recentlyUsed: last 3 agent messages on this node from state.chat
     - reply = pickResponse(text, candidates, recentlyUsed)
     - appendChat({ nodeId, from: 'agent', text: reply })
     - Append a synthetic recentAction `Replied: "${text.slice(0,40)}…"` to that agent (keep last 5)
     - setNodeStatus(nodeId, 'idle')
2. Action `appendRecentAction(nodeId: string, text: string)`:
   - Updates agents[nodeId].recentActions, prepending {ts, text}, keeping last 5
3. Keep `appendChat` as-is (low-level).

Wire `sendUserMessage` so the setTimeout reads the latest store via `get()`.
</action>

<acceptance_criteria>
- `src/store/index.ts` exports `sendUserMessage` action via the store
- `sendUserMessage` calls `appendChat` twice (user then agent) and `setNodeStatus` twice
- `appendRecentAction` exists and trims to 5 items
- TS clean: `npx tsc --noEmit` exits 0
</acceptance_criteria>

### Task 2.3 — RecentActions component

<read_first>
- src/store/types.ts
- src/lib/utils.ts (formatRelativeTime)
- src/components/nodes/CrystalNode.tsx (roleVisuals)
</read_first>

<action>
Create `src/components/drawer/RecentActions.tsx`:
- Props: `actions: Agent['recentActions']`, `role: NodeRole`
- Renders header "RECENT" (caps tracked 0.20em, 10px, muted color)
- Then a list of up to 5 actions, each row:
  - 6px role-color dot (left, with glow box-shadow `0 0 6px <role-glow>`)
  - Action text (12.5px, text-primary)
  - Relative timestamp (11px, text-muted, right-aligned)
- Empty state: "No recent activity"
- Scroll if overflow: maxHeight 160px, custom-scrollbar (use `scrollbar-mystic` class)
</action>

<acceptance_criteria>
- File exists: `src/components/drawer/RecentActions.tsx`
- Imports `formatRelativeTime` from `../../lib/utils`
- Imports `roleVisuals` from `../nodes/CrystalNode`
- Renders the literal string "RECENT"
- Renders up to 5 list items
</acceptance_criteria>

### Task 2.4 — ChatThread component

<read_first>
- src/store/types.ts
- src/lib/utils.ts (formatTime)
- src/components/nodes/CrystalNode.tsx (roleVisuals)
</read_first>

<action>
Create `src/components/drawer/ChatThread.tsx`:
- Props: `messages: ChatMessage[]`, `role: NodeRole`, `agentName: string`, `isThinking: boolean`, `emptyHint: string`
- Renders message bubbles:
  - User: right-aligned, surface-1 bg, max-width 80%, padded, rounded, text-primary
  - Agent: left-aligned, surface-1 bg with left border 2px role-color, padded, rounded; agentName label above in role-color caps 10px
- Each message has muted 10px timestamp underneath (via formatTime)
- If `isThinking`, append an agent "bubble" with 3 pulsing dots (CSS keyframe `pulse-dot` defined in index.css OR inline animate via Framer Motion)
- Auto-scroll to bottom on new message: use `useRef + useEffect` watching `messages.length` + `isThinking`
- Empty state: show `emptyHint` centered in a muted style
</action>

<acceptance_criteria>
- File exists: `src/components/drawer/ChatThread.tsx`
- Renders both `from='user'` and `from='agent'` bubbles
- Includes a "thinking" indicator path that activates when `isThinking` is true
- Uses `useRef` + `useEffect` for auto-scroll
</acceptance_criteria>

### Task 2.5 — ChatInput component

<read_first>
- src/components/nodes/CrystalNode.tsx (roleVisuals)
</read_first>

<action>
Create `src/components/drawer/ChatInput.tsx`:
- Props: `onSend: (text: string) => void`, `role: NodeRole`, `disabled: boolean`, `placeholder: string`
- Sticky bottom of drawer
- Textarea (auto-grow to max 3 lines) + send button (paper-plane Lucide icon)
- Enter sends; Shift+Enter for newline
- Send button disabled when empty or `disabled` true
- Send button glows in role color when enabled
</action>

<acceptance_criteria>
- File exists: `src/components/drawer/ChatInput.tsx`
- Has a `<textarea>` and a button containing a Lucide `Send` or `SendHorizonal` icon
- Calls `onSend(trimmed)` and clears input on submit
- Enter key (without shift) triggers send
</acceptance_criteria>

### Task 2.6 — Manager Briefing card

<read_first>
- src/store/index.ts
- src/store/types.ts
- src/components/nodes/CrystalNode.tsx (roleVisuals)
</read_first>

<action>
Create `src/components/drawer/ManagerBriefing.tsx`:
- Reads `useCrystariumStore` to get `agents`
- Builds an array of 4-6 briefing bullets by picking the most recent recentAction from each of the other 7 nodes (excluding the manager) — sort by ts desc, take top 5
- Renders a card:
  - Top accent strip 3px in role-manager color
  - Title "Morning Briefing" + small refresh button (rotates `agents.recentActions` not necessary — refresh just re-picks; for hackathon, refresh = "Reroll" that shuffles selection)
  - Subtitle: today's date in muted ("Saturday, May 23")
  - Bullet list: each bullet has a role-color dot, the action text, and "via {AgentName}" suffix
- Card sits at the top of the chat thread area for the Manager drawer
</action>

<acceptance_criteria>
- File exists: `src/components/drawer/ManagerBriefing.tsx`
- Renders the string "Morning Briefing"
- Renders the date string for today
- Pulls from `useCrystariumStore` for agents data
- Aggregates recentActions across non-manager nodes
</acceptance_criteria>

### Task 2.7 — AgentDrawer (main drawer container)

<read_first>
- src/store/index.ts
- src/components/nodes/CrystalNode.tsx (roleVisuals)
- src/components/drawer/RecentActions.tsx
- src/components/drawer/ChatThread.tsx
- src/components/drawer/ChatInput.tsx
- src/components/drawer/ManagerBriefing.tsx
</read_first>

<action>
Create `src/components/AgentDrawer.tsx`:

- Uses Framer Motion `AnimatePresence` to slide in/out when `selectedNodeId` toggles
- Layout (`position: fixed right-0 top-16 bottom-0 w-[420px] z-40`):
  - Role header strip: 56px tall, role-color gradient bg with glow, contains the role icon + agentName + close × button (top-right)
  - Persona block: padded section with persona text in a quoted style (italic, text-secondary, ~13px, max 4 lines, line-clamp)
  - RecentActions component
  - Divider (1px border-faint)
  - If selected node is Manager: ManagerBriefing card
  - ChatThread (flex-1, scrollable)
  - ChatInput sticky bottom
- ESC key closes drawer (window keydown listener with cleanup)
- Reads: `selectedNodeId`, agent (via useAgent), node (find from nodes), chat (via useChat), status (from node)
- isThinking = node?.status === 'thinking'
- onSend wired to `sendUserMessage(selectedNodeId, text)`
- Close handler clears selectedNodeId
</action>

<acceptance_criteria>
- File exists: `src/components/AgentDrawer.tsx`
- Uses `AnimatePresence` from framer-motion
- Wires ESC key listener with cleanup
- Composes RecentActions + ChatThread + ChatInput + (conditionally) ManagerBriefing
- Calls `useAgent`, `useChat`, `useSelectedNodeId`, `useNodes`
- Calls `sendUserMessage` action on send
</acceptance_criteria>

### Task 2.8 — Wire drawer into App + add thinking dots CSS

<read_first>
- src/App.tsx
- src/index.css
</read_first>

<action>
Update `src/App.tsx` to render `<AgentDrawer />` after `<Crystarium />`.

Add to `src/index.css` a `@keyframes pulse-dot` and a `.thinking-dot` class for the typing indicator:
```css
@keyframes pulse-dot {
  0%, 80%, 100% { opacity: 0.25; transform: scale(1); }
  40% { opacity: 1; transform: scale(1.4); }
}
.thinking-dot {
  animation: pulse-dot 1.2s ease-in-out infinite;
}
```
</action>

<acceptance_criteria>
- src/App.tsx imports and renders `<AgentDrawer />`
- src/index.css contains `@keyframes pulse-dot`
- src/index.css contains `.thinking-dot` selector
</acceptance_criteria>

### Task 2.9 — Smoke test

<read_first>
- (none)
</read_first>

<action>
Run `npx tsc --noEmit` and `npm run build`. Fix any errors.
</action>

<acceptance_criteria>
- `npx tsc --noEmit` exits 0
- `npm run build` exits 0
</acceptance_criteria>

## Verification

After all tasks: every Phase 2 must-have observable in the running app. Build clean = strong proxy for "drawer renders, chat works, manager briefing assembles."
