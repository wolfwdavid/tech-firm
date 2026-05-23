---
phase: 3
plan: 1
title: Living System
wave: 1
depends_on: [1, 2]
autonomous: true
requirements: [CLON-01, CLON-02, CLON-03, CLON-04, CLON-05, CLON-06, AUTO-01, AUTO-02, AUTO-03, AUTO-04]
files_modified:
  - src/components/Crystarium.tsx
  - src/components/AutomationLog.tsx
  - src/lib/automationDriver.ts
  - src/App.tsx
---

# Phase 3 — Living System

## Context

Most of Phase 3 plumbing landed during Phase 2 forward-prep:
- `addClone` action — DONE (creates child node + edge + cloned agent with [specialization] prefixed responses)
- "Clone & Specialize" button in AgentDrawer (Wand2 icon) — DONE
- Child node renders smaller via `isClone` prop — DONE
- `pulsingEdgeId` state + `fireAutomation` action — DONE
- `sendUserMessage` already fires chat-triggered automations — DONE

What remains:
1. Wire `pulsingEdgeId` into Crystarium edge data so CrystalEdge actually pulses visually
2. Build AutomationLog overlay (toggleable)
3. Drive seeded automations on a timer (every ~15s, picks a random plausible event)

## Must-Haves

1. Cloning works end-to-end: button → input → spawn child + edge + agent → drawer switches to clone showing [spec]-prefixed responses
2. Clone persists across refresh
3. Edge pulses visibly when an automation fires (chat-triggered or timer-triggered)
4. Automation log overlay shows last 5+ events in plain English with timestamps
5. Seeded automations fire on a slow timer so passive viewers see motion

## Tasks

### Task 3.1 — Wire pulsingEdgeId into Crystarium edge data

<read_first>
- src/components/Crystarium.tsx
- src/store/index.ts
- src/components/edges/CrystalEdge.tsx
</read_first>

<action>
Update `src/components/Crystarium.tsx`:
- Import `usePulsingEdgeId` from `../store`
- In the `rfEdges` useMemo, accept `pulsingEdgeId` as a dep, and set each edge's `data.pulse = (e.id === pulsingEdgeId)`
- Add `pulsingEdgeId` to the dep array
</action>

<acceptance_criteria>
- `Crystarium.tsx` calls `usePulsingEdgeId()`
- Edge data carries `pulse: boolean`
- `pulsingEdgeId` is in the useMemo deps array
</acceptance_criteria>

### Task 3.2 — Build AutomationLog overlay

<read_first>
- src/store/index.ts
- src/store/types.ts
- src/components/nodes/CrystalNode.tsx (roleVisuals)
- src/lib/utils.ts (formatTime)
</read_first>

<action>
Create `src/components/AutomationLog.tsx`:
- Fixed bottom-left, 20px from edges, z-30
- Two visual modes: collapsed (small pill) and expanded (card)
- Collapsed: small pill with Zap icon + count badge ("12") + label "Automations"
- Expanded: card 360px wide, max-height 320px, header with title "Automation Log" + close, then scrollable list of automation events (most recent at top)
- Each event row: timestamp (formatTime) + role-color dot for source + arrow → + role-color dot for target + label text
- New events flash a brief background glow (background color → fade)
- Reads `useAutomationLog()` from store

State: local boolean `expanded`. Default collapsed.
</action>

<acceptance_criteria>
- File exists: `src/components/AutomationLog.tsx`
- Reads `useAutomationLog()` from store
- Has collapsed and expanded visual states
- Renders timestamps via `formatTime`
- Default exports a component
</acceptance_criteria>

### Task 3.3 — Build automation driver (timer)

<read_first>
- src/store/index.ts
- src/data/seed.ts
</read_first>

<action>
Create `src/lib/automationDriver.ts`:
- Export a `useAutomationDriver()` hook
- On mount, sets an interval at 15-22s (jittered each cycle) that picks a random plausible automation pair from this list and calls `useCrystariumStore.getState().fireAutomation(from, to, label)`:
  - (storefront, email, "New signup → welcome sequence")
  - (storefront, payments, "Order placed → checkout receipt")
  - (storefront, content, "Visitor signal → topic queued")
  - (customer, email, "Cold customer → nurture campaign")
  - (customer, analytics, "Sentiment logged → cohort updated")
  - (email, payments, "Receipt sent → ledger updated")
  - (email, content, "Campaign open → blog topic suggested")
  - (payments, analytics, "MRR change → dashboard recalc")
  - (payments, manager, "Failed card → flagged for review")
  - (analytics, manager, "Cohort drift → CEO briefing")
  - (analytics, email, "Pattern detected → campaign drafted")
  - (content, email, "Post ready → newsletter slotted")
  - (automations, manager, "Wire health check → all green")
- Skips automations whose endpoints don't exist (e.g., if user has cloned, the manager is still there but base ids might shift — base ids are stable)
- Clears interval on unmount
- Also fire the FIRST automation 2-3 seconds after mount so demo viewer doesn't wait 15s
</action>

<acceptance_criteria>
- File exists: `src/lib/automationDriver.ts`
- Exports `useAutomationDriver`
- Uses `setInterval` + `useEffect` cleanup
- Pulls `fireAutomation` from `useCrystariumStore.getState()`
</acceptance_criteria>

### Task 3.4 — Wire AutomationLog + driver into App

<read_first>
- src/App.tsx
- src/components/AutomationLog.tsx
- src/lib/automationDriver.ts
</read_first>

<action>
Update `src/App.tsx`:
- Import `AutomationLog` and render it after `<AgentDrawer />`
- Import `useAutomationDriver` and invoke it inside the App component
</action>

<acceptance_criteria>
- src/App.tsx renders `<AutomationLog />`
- src/App.tsx calls `useAutomationDriver()`
</acceptance_criteria>

### Task 3.5 — Smoke test

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
