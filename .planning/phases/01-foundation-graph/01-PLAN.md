---
phase: 1
plan: 1
title: Foundation & Graph
wave: 1
depends_on: []
autonomous: true
requirements: [SCAF-01, SCAF-02, SCAF-03, SCAF-04, SCAF-05, GRPH-01, GRPH-02, GRPH-03, GRPH-04, GRPH-05, GRPH-06, SEED-01, SEED-02]
files_modified:
  - package.json
  - vite.config.ts
  - tsconfig.json
  - tailwind.config.ts
  - postcss.config.cjs
  - index.html
  - src/main.tsx
  - src/App.tsx
  - src/index.css
  - src/data/seed.ts
  - src/store/index.ts
  - src/store/types.ts
  - src/lib/utils.ts
  - src/components/Header.tsx
  - src/components/Crystarium.tsx
  - src/components/nodes/CrystalNode.tsx
  - src/components/edges/CrystalEdge.tsx
  - src/components/layout/StarField.tsx
  - components.json
  - .gitignore
---

# Phase 1 — Foundation & Graph

## Objective

Scaffold a Vite + React + TypeScript app that boots to a glowing Crystarium of 8 capability nodes branching from a central Manager, with the "Pour Decisions" business identity in a top header. State persists across refresh. No interaction beyond pan/zoom — the goal is the first-frame impression.

## Must-Haves (Goal-Backward)

1. `npm install && npm run dev` opens a localhost page with no errors
2. Page background is the dark cosmic stack (void corners, nebula radial core, animated particle layer)
3. Top header shows "POUR DECISIONS" + $2,340 MRR + 47 customers + "3 today"
4. 8 hexagonal crystal nodes render in the branching layout per UI-SPEC §4
5. Each node glows in its role color and breathes (offset pulses)
6. 11 edges connect the topology, low-opacity gradient strokes
7. React Flow pan/zoom works
8. Browser refresh shows the same Crystarium (Zustand persist works)
9. No console errors

## Tasks

### Task 1.1 — Scaffold Vite + React + TS

<read_first>
- (none — empty directory)
</read_first>

<action>
Run `npm create vite@latest . -- --template react-ts -y` in the current directory. Then run `npm install`. This produces package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx, src/index.css, .gitignore.
</action>

<acceptance_criteria>
- File exists: `package.json` with `"dev": "vite"` script
- File exists: `vite.config.ts` with `@vitejs/plugin-react` import
- File exists: `tsconfig.json`
- File exists: `src/main.tsx` importing React + App
- `node_modules/` exists
</acceptance_criteria>

### Task 1.2 — Install runtime dependencies

<read_first>
- package.json
</read_first>

<action>
Install: `npm install zustand reactflow framer-motion lucide-react clsx tailwind-merge`. These are the core runtime deps. (shadcn-style components will be hand-written rather than fetched via shadcn CLI to avoid network and CLI surprises in the time budget — see Task 1.4.)
</action>

<acceptance_criteria>
- package.json `dependencies` contains: zustand, reactflow, framer-motion, lucide-react, clsx, tailwind-merge
</acceptance_criteria>

### Task 1.3 — Install Tailwind v3 + PostCSS

<read_first>
- package.json
</read_first>

<action>
Install dev deps: `npm install -D tailwindcss@^3 postcss autoprefixer`. Then `npx tailwindcss init -p` to generate `tailwind.config.js` and `postcss.config.js`. Rename `tailwind.config.js` → `tailwind.config.ts` and convert to TS export. Configure `content: ["./index.html", "./src/**/*.{ts,tsx}"]` and extend the theme with the Crystarium color tokens from UI-SPEC §2.
</action>

<acceptance_criteria>
- package.json `devDependencies` contains: tailwindcss, postcss, autoprefixer
- File exists: `tailwind.config.ts`
- File exists: `postcss.config.cjs` (or .js) with `tailwindcss` and `autoprefixer` plugins
- `tailwind.config.ts` `content` array includes `./src/**/*.{ts,tsx}`
- `tailwind.config.ts` theme.extend.colors contains entries for `void`, `deep`, `nebula`, `surface-1`, `surface-2`, and 8 role colors
</acceptance_criteria>

### Task 1.4 — Configure src/index.css with Tailwind layers + global cosmic background

<read_first>
- src/index.css
- tailwind.config.ts
</read_first>

<action>
Replace `src/index.css` with: `@tailwind base; @tailwind components; @tailwind utilities;` followed by a `:root { color-scheme: dark; }` block, a `body` rule setting `background: #05060d`, font-family Inter fallback stack, antialiased rendering. Import Google Fonts `Inter` (weights 400, 500, 600, 700) via `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')` at the top.
</action>

<acceptance_criteria>
- src/index.css contains `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
- src/index.css contains `Inter` font import
- src/index.css contains `background: #05060d` or `bg-void` reference for body
</acceptance_criteria>

### Task 1.5 — Define Zustand store with persist middleware

<read_first>
- (none — new files)
</read_first>

<action>
Create `src/store/types.ts` defining TypeScript types: `NodeRole` union of all 8 roles, `CapabilityNode { id, role, name, position: {x,y}, parentId?, specialization?, status: 'idle'|'thinking'|'active' }`, `Agent { nodeId, persona, recentActions: string[], cannedResponses: string[] }`, `ChatMessage { id, nodeId, from: 'user'|'agent', text, ts }`, `AutomationEvent { id, fromNodeId, toNodeId, label, ts }`, `BusinessSeed { name, mrr, customerCount, todayActivity }`.

Create `src/store/index.ts` exporting a Zustand store with `persist` middleware (key `crystarium-v1`):
- State: `business: BusinessSeed`, `nodes: CapabilityNode[]`, `agents: Record<string, Agent>`, `chat: ChatMessage[]`, `automationLog: AutomationEvent[]`
- Actions (stubs OK in Phase 1, will be filled in later phases): `addClone`, `appendChat`, `logAutomation`, `setNodeStatus`
- Selectors: `useBusiness()`, `useNodes()` exported as hooks

Initialize with seed data imported from `src/data/seed.ts`.
</action>

<acceptance_criteria>
- File exists: `src/store/types.ts` exporting `CapabilityNode`, `Agent`, `ChatMessage`, `AutomationEvent`, `BusinessSeed`, `NodeRole`
- File exists: `src/store/index.ts` calling `create(persist(...))` with a `name: 'crystarium-v1'` config
- Store exports at least `useBusiness` and `useNodes` hooks
- `src/store/index.ts` references seed data import
</acceptance_criteria>

### Task 1.6 — Create src/data/seed.ts with "Pour Decisions" data

<read_first>
- src/store/types.ts
</read_first>

<action>
Create `src/data/seed.ts` exporting:
- `seedBusiness: BusinessSeed = { name: 'POUR DECISIONS', mrr: 2340, customerCount: 47, todayActivity: 3 }`
- `seedNodes: CapabilityNode[]` — array of 8 nodes with these exact ids/roles/positions:
  - `node-manager` role=manager, name="Manager", x=600, y=360
  - `node-storefront` role=storefront, name="Storefront", x=380, y=360
  - `node-customer` role=customer, name="Customer Chat", x=820, y=360
  - `node-email` role=email, name="Email Marketing", x=600, y=540
  - `node-content` role=content, name="Content Engine", x=220, y=200
  - `node-payments` role=payments, name="Payments", x=220, y=520
  - `node-analytics` role=analytics, name="Analytics", x=980, y=540
  - `node-automations` role=automations, name="Automations", x=980, y=200
  - all status='idle', no parentId
- `seedEdges` (React Flow edge shape): 11 edges per UI-SPEC §4 — Manager↔{Storefront,Customer,Email,Automations} (4) + Storefront↔{Content,Payments} (2) + Customer↔{Analytics,Automations} (2 — Automations already counted, so just Analytics) + Email connects to Manager already. Final count: manager-storefront, manager-customer, manager-email, manager-automations, storefront-content, storefront-payments, customer-analytics, customer-automations, email-payments (cross-link to give bottom symmetry), email-content (cross-link), content-payments (peripheral). Aim for 11 total. Use ids like `e-manager-storefront`.
- `seedAgents: Record<string, Agent>` — for each of the 8 nodeIds, define a persona + 6+ canned responses + 3 pre-seeded recent actions. (Personas + responses kept terse in Phase 1; Phase 2 will polish.)
</action>

<acceptance_criteria>
- File exists: `src/data/seed.ts`
- Exports `seedBusiness` with mrr=2340, customerCount=47, todayActivity=3
- Exports `seedNodes` array of length exactly 8
- Exports `seedEdges` array of length 11
- Exports `seedAgents` with exactly 8 keys matching the 8 nodeIds
- Each agent has `cannedResponses.length >= 6`
- File has no TypeScript errors when `tsc --noEmit` is run
</acceptance_criteria>

### Task 1.7 — Build src/lib/utils.ts (cn helper)

<read_first>
- (none — new file)
</read_first>

<action>
Create `src/lib/utils.ts` exporting `cn(...args: ClassValue[])` using `clsx` + `twMerge`. Standard shadcn-style helper.
</action>

<acceptance_criteria>
- File exists: `src/lib/utils.ts`
- Exports a function named `cn`
- Imports both `clsx` and `tailwind-merge`
</acceptance_criteria>

### Task 1.8 — Build StarField background layer

<read_first>
- src/index.css
</read_first>

<action>
Create `src/components/layout/StarField.tsx` — renders ~50 absolutely-positioned `<div>`s with 1-2px size, random `top`/`left` in viewport %, opacity 0.12-0.28, and a CSS keyframe drift animation (8-15s, alternate). Use `useMemo` to generate positions once. Wrap in a `pointer-events-none absolute inset-0 z-0`. Animation defined inline via `<style>` or in the file's own CSS-in-TS.
</action>

<acceptance_criteria>
- File exists: `src/components/layout/StarField.tsx`
- Component renders >= 40 particle divs
- Uses `position: absolute`, `pointer-events-none`
- Has CSS animation or Framer Motion drift
</acceptance_criteria>

### Task 1.9 — Build CrystalNode custom React Flow node

<read_first>
- src/store/types.ts
- src/data/seed.ts
- .planning/phases/01-foundation-graph/01-UI-SPEC.md
</read_first>

<action>
Create `src/components/nodes/CrystalNode.tsx` — a React Flow custom node component. Receives `data: { role, name, status, specialization? }` props from React Flow.

Render:
- Outer wrapper 120×120px
- Inner hexagon via `clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)`
- Inner background: `radial-gradient(circle at 50% 40%, var(--role-bright), var(--role-base))` — CSS custom props set inline based on role
- Border 1px `rgba(255,255,255,0.10)`
- Outer glow via box-shadow: `0 0 32px 4px {role-glow}, 0 0 80px 12px {role-glow * 0.4}` — exact rgba per role from UI-SPEC §2
- Lucide icon (28px) centered, color white at 88% opacity (use the icon listed in UI-SPEC §5.2 per role)
- Label below crystal: role name in caps 13px 0.08em tracking
- Status line below label: 11px secondary color, "idle" / "thinking..." / "active"

Wrap the hexagon in a `<motion.div>` with breathing pulse variants — scale 1.0↔1.04, glow opacity 0.85↔1.0, 3.5s ease-in-out infinite, with `transition: { delay: hashOfNodeId * 0.7 }` so each node offsets.

Add React Flow `<Handle type="source" position={Position.Top} />` and target on opposite side, both styled invisible (`style={{ opacity: 0 }}`) — required by React Flow for edges to attach but we don't show them.

Export the role→{color, glow, icon} mapping so it's reused by CrystalEdge.
</action>

<acceptance_criteria>
- File exists: `src/components/nodes/CrystalNode.tsx`
- Default export is a React component
- Contains `clip-path: polygon` for hexagon
- Contains `box-shadow` with two layers
- Imports from `lucide-react`
- Imports `motion` from `framer-motion`
- Imports `Handle, Position` from `reactflow`
- Has a `roleVisuals` (or similar) export mapping all 8 roles
</acceptance_criteria>

### Task 1.10 — Build CrystalEdge custom React Flow edge

<read_first>
- src/components/nodes/CrystalNode.tsx (for role color mapping)
</read_first>

<action>
Create `src/components/edges/CrystalEdge.tsx` — React Flow custom edge component. Uses `getBezierPath` from reactflow to build the path. Renders an SVG `<linearGradient>` with `id={`grad-${id}`}` interpolating the two endpoint role colors, then a `<path>` with `stroke={`url(#grad-${id})`}`, strokeWidth 1.5, fill none, base opacity 0.32. Add a `data-pulse` attribute support that Phase 3 will animate — for Phase 1 just plumb the prop through, no animation yet.

The edge needs to know the source/target role colors. Pass these through edge `data` prop, populated in seed.ts.
</action>

<acceptance_criteria>
- File exists: `src/components/edges/CrystalEdge.tsx`
- Default export is a React component
- Imports `getBezierPath` from `reactflow`
- Renders an SVG `<linearGradient>` with stop elements
- Path uses `url(#grad-...)` for stroke
</acceptance_criteria>

### Task 1.11 — Build Header component

<read_first>
- src/store/index.ts
- .planning/phases/01-foundation-graph/01-UI-SPEC.md
</read_first>

<action>
Create `src/components/Header.tsx` — sticky top header, 64px tall, full-bleed, `surface-1` background with backdrop-blur 16px and 92% opacity, 1px bottom border `border-glow`.

Layout: `flex justify-between items-center px-8 h-16 fixed top-0 inset-x-0 z-50`.

Left: brand cluster — small Lucide `Sparkles` or `Crown` icon (color: text-primary) + "POUR DECISIONS" wordmark (Inter 700 18px, tracking 0.18em, caps).

Right: 3 KPI blocks separated by 1px `border-faint` verticals.
- Block 1: label "MRR" (10px caps tracked), value "$2,340" (22px 600)
- Block 2: label "CUSTOMERS", value "47"
- Block 3: label "TODAY", value "3"

Pull values from `useBusiness()` selector.
</action>

<acceptance_criteria>
- File exists: `src/components/Header.tsx`
- Component is `position: fixed` or `sticky`
- Renders the string "POUR DECISIONS"
- Renders the string "MRR"
- Renders the string "CUSTOMERS"
- Renders the string "TODAY"
- Calls `useBusiness()` hook
</acceptance_criteria>

### Task 1.12 — Build Crystarium component (React Flow canvas)

<read_first>
- src/store/index.ts
- src/components/nodes/CrystalNode.tsx
- src/components/edges/CrystalEdge.tsx
- src/components/layout/StarField.tsx
</read_first>

<action>
Create `src/components/Crystarium.tsx` — full-bleed `<ReactFlow>` instance.

Structure:
```
<div className="relative h-screen w-screen overflow-hidden bg-deep">
  <div className="absolute inset-0 bg-radial-nebula" /> {/* nebula radial */}
  <StarField />
  <ReactFlow
    nodes={...}
    edges={...}
    nodeTypes={{ crystal: CrystalNode }}
    edgeTypes={{ crystal: CrystalEdge }}
    defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
    proOptions={{ hideAttribution: true }}
    fitView
    fitViewOptions={{ padding: 0.2 }}
  >
    <Background variant="none" />
    <Controls className="!bg-surface-1 !border-border-glow" position="bottom-right" />
  </ReactFlow>
</div>
```

Map `useNodes()` store data into React Flow's `nodes` array using `type: 'crystal'`. Same for edges with `type: 'crystal'`. Add a `bg-radial-nebula` utility in Tailwind config (`backgroundImage: { 'radial-nebula': 'radial-gradient(circle at 50% 50%, #10112a 0%, #0a0b1a 60%, #05060d 100%)' }`).
</action>

<acceptance_criteria>
- File exists: `src/components/Crystarium.tsx`
- Imports `ReactFlow` from `reactflow`
- Imports `'reactflow/dist/style.css'`
- Passes `nodeTypes={{ crystal: ... }}` and `edgeTypes={{ crystal: ... }}`
- Renders the `StarField` component
- `tailwind.config.ts` has `radial-nebula` in `backgroundImage`
</acceptance_criteria>

### Task 1.13 — Wire App.tsx

<read_first>
- src/App.tsx
- src/components/Header.tsx
- src/components/Crystarium.tsx
</read_first>

<action>
Replace `src/App.tsx` with:
```tsx
import { Header } from './components/Header'
import { Crystarium } from './components/Crystarium'

export default function App() {
  return (
    <>
      <Header />
      <Crystarium />
    </>
  )
}
```

Remove the default Vite CSS imports / boilerplate from `src/App.css` (delete the file or empty it).
</action>

<acceptance_criteria>
- src/App.tsx imports `Header` and `Crystarium`
- src/App.tsx default export renders both
- `src/App.css` is either deleted or has no rules that affect the layout
</acceptance_criteria>

### Task 1.14 — Update index.html title and meta

<read_first>
- index.html
</read_first>

<action>
Update `<title>` to "Crystarium — Pour Decisions" and add a `<meta name="description" content="A one-person AI business runs itself in the Crystarium." />`. Keep the default favicon for now.
</action>

<acceptance_criteria>
- index.html `<title>` contains "Crystarium"
</acceptance_criteria>

### Task 1.15 — Smoke test build + dev server

<read_first>
- package.json
</read_first>

<action>
Run `npx tsc --noEmit` to verify TypeScript compiles. Then run `npm run build` to verify Vite builds. (Do NOT start `npm run dev` in foreground — it blocks.)

If either fails, fix the errors before declaring Phase 1 done.
</action>

<acceptance_criteria>
- `npx tsc --noEmit` exits 0
- `npm run build` exits 0
- `dist/` directory created
</acceptance_criteria>

## Verification (post-execution)

After all tasks complete, verify against UI-SPEC §10 Acceptance Visual Checklist. Cannot screenshot in headless env — verification is by:
- File existence + content grep (covered by per-task acceptance criteria)
- `tsc --noEmit` and `npm run build` both clean
- Manual playwright/visual check deferred to verifier or user

## Notes for Phase 2 Hand-off

- Zustand actions (`appendChat`, `setNodeStatus`) are stubbed — Phase 2 fills bodies
- CrystalNode has `onClick` not yet wired — Phase 2 wires drawer-open
- `agents` map in seed has minimal personas — Phase 2 expands canned responses to ≥6 per agent with in-character flavor
