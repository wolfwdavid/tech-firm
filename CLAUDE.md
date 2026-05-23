<!-- GSD:project-start source:PROJECT.md -->
## Project

**Crystarium — One-Person AI Business**

Crystarium is a single-page demo dashboard that visualizes a one-person AI business as a Final Fantasy XIII-style node grid. Each glowing crystal node is a business capability (storefront, customer chat, email, content, payments, analytics, automations) staffed by a specialized AI agent. Clicking a node opens that agent in a side drawer; "Clone & Specialize" spawns a customized child agent; edges pulse when one agent triggers another. Built for the "One-Person AI Business" hackathon.

**Core Value:** A demo that makes a stranger feel "this single person is actually running a real business" — visually compelling enough that the Crystarium metaphor sells the idea before any feature is explained. Demo > spec.

### Constraints

- **Timeline**: Hard demo deadline 2026-05-23 14:30 local time — ~3 hours from project start at 11:25
- **Tech stack**: Vite + React 18 + TypeScript + React Flow + Tailwind CSS + shadcn/ui + Framer Motion + Zustand — chosen for ship-speed and visual polish
- **Runtime**: Browser-only, single-page, no backend, no external services
- **Agents**: Mocked responses keyed off node type (each node has 6-10 in-character canned messages + visible "thinking" animation)
- **Data**: Pre-seeded "Pour Decisions" coffee subscription business — no live data sources
- **Commits**: No mention of Claude, Gemini, or AI authorship in commit messages
- **Demo target**: A laptop running `npm run dev`, projected or screen-shared
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
