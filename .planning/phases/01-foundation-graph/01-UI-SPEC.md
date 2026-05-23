# Phase 1: Foundation & Graph — UI-SPEC

**Phase:** 1 — Foundation & Graph
**Spec Author:** Claude (synthesizing ui-ux-pro-max + frontend-design)
**Date:** 2026-05-23
**Status:** Locked for planning

---

## 1. Visual Identity

**Aesthetic anchor:** Final Fantasy XIII's Crystarium — a constellation of branching crystal paths against the void. Not literal copying: borrow the *feel* (deep cosmic dark, jewel-tone glows, branching geometry) without specific FF iconography.

**Style category:** Neumorphic-glassmorphic hybrid with brutalist data density. Crystal nodes glow over a flat-deep-cosmic background. No skeuomorphism. No drop-shadow excess on chrome.

**Mood:** Calm but alive. The graph breathes — slow pulse, slow particle drift — so a static screenshot looks dead but a 3-second clip feels staffed.

---

## 2. Color System

### Base Palette (Dark Cosmic)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-void` | `#05060d` | Outermost background (page corners) |
| `bg-deep` | `#0a0b1a` | React Flow viewport canvas |
| `bg-nebula` | `#10112a` | Radial-gradient core (center of canvas) |
| `surface-1` | `#161830` | Header bar background (with 60% backdrop blur) |
| `surface-2` | `#1f2247` | Cards, future drawer base (Phase 2+) |
| `border-faint` | `rgba(255,255,255,0.06)` | Hairlines, edge separators |
| `border-glow` | `rgba(160,180,255,0.18)` | Surface borders inside the canvas |
| `text-primary` | `#e8e9ff` | Headings, brand wordmark |
| `text-secondary` | `#a8aacc` | Subtitles, status lines |
| `text-muted` | `#5b5d80` | Coordinates, faded labels |

### Role Crystal Colors

Each capability node uses a saturated jewel tone with a softer glow halo. Use HSL: hue locked, lightness varies across states (idle = 60%, hover = 70%, active = 78%, thinking = pulsing 55-72%).

| Role | Hue | Hex (idle) | Glow (rgba) |
|------|-----|-----------|------------|
| Manager (center) | 42 (warm gold) | `#f5c45e` | `rgba(245,196,94,0.55)` |
| Storefront | 22 (amber-orange) | `#f59a4f` | `rgba(245,154,79,0.50)` |
| Customer Chat | 188 (cyan) | `#4fd0e8` | `rgba(79,208,232,0.50)` |
| Email Marketing | 208 (sky-blue) | `#5fa3f0` | `rgba(95,163,240,0.50)` |
| Content Engine | 340 (rose) | `#f06aa3` | `rgba(240,106,163,0.50)` |
| Payments | 152 (mint-green) | `#5fdba0` | `rgba(95,219,160,0.50)` |
| Analytics | 220 (white-silver) | `#cfd6f0` | `rgba(207,214,240,0.45)` |
| Automations | 268 (violet) | `#a878f0` | `rgba(168,120,240,0.55)` |

Manager is intentionally warmer and brighter — center-of-gravity affordance.

---

## 3. Typography

| Use | Family | Weight | Size | Tracking |
|-----|--------|--------|------|----------|
| Brand wordmark ("POUR DECISIONS") | Inter | 700 | 18px | 0.18em (caps) |
| Header KPI numbers (`$2,340`) | Inter | 600 | 22px | -0.01em |
| Header KPI labels (`MRR`) | Inter | 500 | 10px | 0.20em (caps) |
| Node role name | Inter | 600 | 13px | 0.08em (caps) |
| Node status line | Inter | 500 | 11px | normal |
| Stage banner overlays (Phase 4) | Cinzel or Marcellus (display) | 600 | 28px | 0.32em (caps) |

System fallback stack: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`. Display font loaded via Google Fonts in `index.html`; if it bloats build, ship without — Inter ALLCAPS with wide tracking carries the mystic feel.

---

## 4. Layout — Full Canvas

```
┌─────────────────────────────────────────────────────────────┐  ← 64px header
│  POUR DECISIONS    $2,340 MRR   47 customers   3 today      │     surface-1 + blur
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              ◆ Content                                       │
│                 Engine                                       │
│                                                              │
│    ◆ Payments    ◇ Storefront ──── ◆ Manager ──── ◇ Customer │
│                                       │                Chat  │
│                                       │                      │
│                                  ◆ Automations               │
│                                       │                      │
│    ◇ Email Marketing ────────────────                        │
│                                                              │
│              ◆ Analytics                                     │
│                                                              │
│                              ★ ✦ ★  (low-opacity stars)      │
└─────────────────────────────────────────────────────────────┘
```

**Node positioning (React Flow coords, viewport ~1200×720):**

| Node | x | y | Tier |
|------|---|---|------|
| Manager | 600 | 360 | center |
| Storefront | 380 | 360 | 1 |
| Customer Chat | 820 | 360 | 1 |
| Email Marketing | 600 | 540 | 1 (bottom) |
| Content Engine | 220 | 200 | 2 |
| Payments | 220 | 520 | 2 |
| Analytics | 980 | 540 | 2 |
| Automations | 980 | 200 | 2 |

Connect tier-1 nodes directly to Manager. Tier-2 nodes connect to their nearest tier-1 sibling (Content→Storefront, Payments→Storefront, Analytics→Customer Chat, Automations→Customer Chat). Email also connects directly to Manager (it's a bottom-tier-1 hub).

This produces 11 edges total. Branching, not a hub-spoke.

---

## 5. Component Specs

### 5.1 Header Bar

- Height: 64px, full-bleed
- Background: `surface-1` with `backdrop-blur(16px)` + 92% opacity
- Bottom border: 1px `border-glow`
- Layout: `flex justify-between items-center px-8`
- Left: brand wordmark + business name
- Right: KPI cluster — three stat blocks separated by `border-faint` verticals
- KPI block: label above, number below; right-aligned in cluster

### 5.2 Crystal Node (custom React Flow node)

- Outer wrapper: 120×120px, centered crystal
- Crystal shape: regular hexagon (CSS `clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)`) — NOT a perfect circle, NOT a square
- Inner fill: radial gradient from `role-color (idle lightness)` at center to 65% lightness at edge
- Border: 1px `rgba(255,255,255,0.10)` inside crystal
- Outer glow: `box-shadow: 0 0 32px 4px {role-glow-rgba}, 0 0 80px 12px {role-glow-rgba×0.4}`
- Icon: 28px Lucide icon, centered, color `text-primary` at 88% opacity (icons listed below)
- Role label: positioned 4px below crystal, 13px caps, color `text-primary` 90% opacity
- Status line: 4px below role label, 11px, color `text-secondary`
- Hover state: glow intensifies (×1.4 multiplier), border opacity → 0.20, cursor pointer

**Icons (Lucide):**
- Manager: `Crown` (or `Brain`)
- Storefront: `Store`
- Customer Chat: `MessageCircle`
- Email Marketing: `Mail`
- Content Engine: `PenTool`
- Payments: `CreditCard`
- Analytics: `BarChart3`
- Automations: `Zap`

### 5.3 Crystal Edge (custom React Flow edge)

- Path: smooth bezier between node centers
- Base stroke: 1.5px, `stroke: url(#edge-gradient-{from}-{to})` where the gradient interpolates the two endpoint role colors
- Base opacity: 0.32
- No arrowheads (Crystarium edges are conduits, not arrows)
- Hover: opacity → 0.55, stroke-width → 2px
- Future-ready: support `data-pulse` attribute that Phase 3 will animate

### 5.4 Background Layer (behind React Flow grid)

- Layer 1 (page bg): `bg-void` solid
- Layer 2 (canvas bg): radial gradient — `bg-nebula` at center 40%, `bg-deep` at edges
- Layer 3 (particle field): 40-60 absolutely-positioned `<div>`s, 1-2px squares, opacity 0.12-0.28, slow CSS keyframe drift (8-15s loops, transform translate ±20px). React Flow grid pattern disabled (`background: 'none'`).

---

## 6. Animation & Motion

| Element | Motion | Timing |
|---------|--------|--------|
| Node breathing pulse (idle) | Glow box-shadow blur scales 1.0 ↔ 1.15, opacity 0.85 ↔ 1.0 | 3.5s ease-in-out, infinite, each node offset by phase 0-2s so they don't sync |
| Node hover | Glow scale 1.0 → 1.3, lightness +12% | 220ms ease-out |
| Particle drift | translate ±15-25px in random direction | 8-15s linear, infinite, alternate |
| First-paint entry (this phase) | Manager fades in at 0.4s, then capability nodes stagger fade-in + scale 0.85→1 over 0.25s each (220-340ms total stagger from 0.6s) | 0.6s+ from app mount |
| Edges first paint | stroke-dashoffset draws from manager outward, opacity 0→0.32 | 0.5s ease-out starting at 0.8s |

Use Framer Motion's `motion.div` for nodes (variants: `idle`, `hover`) and `<motion.svg>` paths for edge stroke-dashoffset.

---

## 7. States Matrix

| Component | Idle | Hover | Active (selected) | Disabled |
|-----------|------|-------|-------------------|----------|
| Crystal node | Breathing pulse | Glow ×1.3, border 0.20 | Glow ×1.5, ring `border-glow` 2px | N/A this phase |
| Edge | 0.32 opacity | 0.55 opacity, +0.5px width | 0.65 opacity | N/A |
| Header KPI | Static | N/A | N/A | N/A |

Active (selected) state is wired but unused until Phase 2 (drawer-open triggers it).

---

## 8. Responsive Behavior

- Demo target: 1366×768 minimum, 1920×1080 typical
- React Flow viewport handles pan/zoom — user can fit-view at any size
- Header collapses gracefully below 1024px (hide "today" KPI) — not a v1 priority but cheap to include
- No mobile breakpoint — out of scope (see PROJECT.md constraints)

---

## 9. Accessibility (Light Pass)

- All node labels are real text, not images — screen readable
- Color is not the sole differentiator — every node has icon + label + position
- Minimum contrast: text-primary on bg-deep = 14.2:1 ✓ (AAA)
- Keyboard: React Flow's default Tab navigation works on nodes — leave defaults in
- Reduced-motion: respect `prefers-reduced-motion` — kill breathing pulse and particle drift, keep static appearance

---

## 10. Acceptance Visual Checklist

This is the spec the executor verifies against. Each is grep-able or screenshot-able:

- [ ] Page loads with `bg-void` corners and radial `bg-nebula` core visible
- [ ] Particle field is animating (visible motion within 3 seconds of load)
- [ ] Header bar shows "POUR DECISIONS" wordmark + 3 KPI blocks ($2,340 MRR / 47 customers / 3 today)
- [ ] Exactly 8 nodes render with the 8 role names and 8 Lucide icons listed in §5.2
- [ ] Each node has a hexagonal clip-path (not a circle, not a square)
- [ ] Each node glows in its role color (visually distinguishable side by side)
- [ ] Each node has a breathing pulse animation that is visibly active
- [ ] Manager node is centered in the canvas at first paint
- [ ] 11 edges connect the topology per §4 (count visually or in DOM)
- [ ] Hover on any node intensifies its glow
- [ ] Browser refresh restores the same node layout from localStorage (Zustand persist works)
- [ ] No console errors on load

---

## 11. Anti-patterns to Avoid

- ❌ Circular hub-and-spoke layout (looks generic, not Crystarium)
- ❌ Default React Flow node styling (boxes with handles) — must replace with custom
- ❌ Glow done with pure `filter: blur()` on the whole node (blurs the label too) — use `box-shadow` layers instead
- ❌ Solid emoji icons (inconsistent across OSes) — use Lucide
- ❌ Sync-pulsing all nodes at the same phase (synthetic, dead) — offset each node's animation start
- ❌ Heavy 3D / Three.js for the graph (overkill, eats budget)

---

## 12. Out of Spec (This Phase)

- Drawer + chat UI — Phase 2
- Manager briefing card — Phase 2
- Recent actions feed on nodes — Phase 2
- Clone & Specialize affordance — Phase 3
- Edge pulse animation on automations — Phase 3
- Automation log overlay — Phase 3
- Boot intro screen — Phase 4
- Selection state visual treatment — Phase 4 polish (basic ring wired here, full treatment later)
