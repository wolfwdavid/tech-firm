import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { execSync } from 'child_process'

const issue = JSON.parse(readFileSync('scripts/issue1.json', 'utf8'))

function fmtTime(iso) {
  return iso.replace('T', ' ').replace('Z', ' UTC')
}

const fence = (s) => `\n\n${s}\n\n`

let out = ''
out += `# Crystarium v2 — Agent Transcript\n\n`
out += `Two Claude Code sessions (Laptop A: \`mkarurosun\`, Laptop B: \`Mkaru\`) collaborated on this repo, each owning a vertical slice of the One-Person AI Business stack.\n\n`
out += `- **AI Website** (SvelteKit storefront in \`/web\`) — Claude-A\n`
out += `- **AI Manager** (React Crystarium in \`/src\` + \`/api\`) — Claude-B\n`
out += `- **Automations bus** — shared Supabase Realtime on \`public.automation_events\`\n\n`
out += `The two sides had **no real-time channel** — every handoff went through git or the GitHub API. Conventions in [COORDINATION.md](./COORDINATION.md). This transcript is the issue #1 thread (the primary async channel), plus the git history.\n\n`
out += `---\n\n## Part 1 — Issue #1 thread (Claude-A ↔ Claude-B)\n\n`
out += `**Title:** ${issue.title}\n\n`
out += `**Opened:** ${fmtTime(issue.createdAt)} by ${issue.author.login}\n\n`
out += `---\n\n`
out += `### Opening post\n\n`
out += issue.body + `\n\n`

for (let i = 0; i < issue.comments.length; i++) {
  const c = issue.comments[i]
  out += `---\n\n`
  out += `### Comment ${i + 1} — ${fmtTime(c.createdAt)}\n\n`
  out += c.body + `\n\n`
}

out += `---\n\n## Part 2 — Git commit history on \`main\`\n\n`
out += `Commits landed on \`main\` (post-squash):\n\n`
const log = execSync('git log origin/main --oneline -50', { encoding: 'utf8' })
out += '```\n' + log + '```\n\n'

out += `## Part 3 — Feature branches stacked on Claude-B's side\n\n`
out += `Each was a discrete chunk of work; all squash-merged together in PR #9.\n\n`
const branches = [
  ['claude-b/crystarium-import', 'v1 Crystarium import — 8 hex crystal nodes, role-color glow, agent drawer, mocked chat, clone & specialize, automation log, boot intro'],
  ['claude-b/supabase-scaffold', 'Null-safe Supabase client + env contract + RemoteAutomationEvent shape'],
  ['claude-b/agent-driver', 'sendUserMessage async + AgentDriver pattern. Mock + live impls. VITE_LIVE_AGENTS flag. Live-fails-fallback-to-mock'],
  ['claude-b/onboarding', '3-step Crystarium-themed wizard. Personalizes recent actions per niche'],
  ['claude-b/chat-api', 'api/chat.ts Vercel function + Vite dev middleware sharing one handler. Claude Haiku with prompt caching'],
  ['claude-b/fake-customer', 'DemoPanel with 4 scenarios + hotkeys (⇧D, 1-4). Defense in depth'],
  ['claude-b/streaming-chat', 'onPartial(chunk) flows through the driver; agents type word-by-word with a blinking caret'],
  ['claude-b/hotkeys', 'Presenter ribbon + ? cheat-sheet card. Aligned .env.example with Claude-A\'s contract'],
  ['claude-b/realtime', 'useRealtimeAutomations subscribes to automation_events INSERTs. Local timer auto-pauses when remote is active. Verified live: REST insert → UI pulse + log row in <1.5s'],
  ['claude-b/polish', 'Header LIVE/LOCAL/OFFLINE pill. Cloned-agent specialization renders as a chip in drawer header'],
  ['claude-b/sse', 'Real server-side SSE via client.messages.stream(). First-token latency drops ~600ms → ~200ms'],
  ['claude-b/edge-labels', 'Floating label pill on the pulsing edge + 2-hop pulse pathfinding so storefront→email visually travels through Manager. Caught a real demo-killing bug.'],
]
out += '| # | Branch | What it shipped |\n'
out += '|---|---|---|\n'
for (let i = 0; i < branches.length; i++) {
  out += `| ${i + 1} | \`${branches[i][0]}\` | ${branches[i][1]} |\n`
}
out += '\n'

out += `## Part 4 — Claude-A's branch on the storefront side\n\n`
let aLog = ''
try {
  aLog = execSync('git log origin/claude-a/storefront --oneline -10', { encoding: 'utf8' })
} catch {}
out += '```\n' + (aLog || '(unavailable)\n') + '```\n\n'

out += `## Part 5 — Verification artifacts\n\n`
out += `- \`scripts/smoke.mjs\` — Playwright smoke against \`localhost:5173\` covering full mock path (onboarding → chat stream → demo panel → hotkeys)\n`
out += `- \`scripts/realtime-smoke.mjs\` — end-to-end against the live Supabase project: REST insert → UI pulse + edge label visible in <1.5s, 0 console errors\n`
out += `- Screenshots in \`scripts/\`:\n`
const screenshots = readdirSync('scripts').filter((f) => f.endsWith('.png'))
for (const s of screenshots) out += `  - \`scripts/${s}\`\n`
out += `\n`

out += `## Part 6 — Public artifacts\n\n`
out += `- **Live demo:** https://wolfwdavid.github.io/tech-firm/\n`
out += `- **Repo:** https://github.com/wolfwdavid/tech-firm\n`
out += `- **PR #9** (merged): https://github.com/wolfwdavid/tech-firm/pull/9\n`
out += `- **Issue #1** (this thread): https://github.com/wolfwdavid/tech-firm/issues/1\n`
out += `- **Issue #3** — v2 backlog: https://github.com/wolfwdavid/tech-firm/issues/3\n`
out += `- **Issue #4** — Claude-A's storefront task: https://github.com/wolfwdavid/tech-firm/issues/4\n\n`

out += `## Part 7 — Stack\n\n`
out += `- **AI Manager (React)**: Vite + React 18 + TypeScript + React Flow + Tailwind v3 + shadcn-tokens + Framer Motion + Zustand\n`
out += `- **AI Website (SvelteKit)**: SvelteKit + TypeScript + Tailwind v4\n`
out += `- **AI agents**: Anthropic Claude Haiku 4.5 via \`@anthropic-ai/sdk\` with prompt caching + real SSE streaming on \`/api/chat\` (Vercel function), with a keyword-matcher mock fallback that auto-engages if the live call errors\n`
out += `- **Data + Realtime bus**: Supabase Postgres + Realtime publication on \`public.automation_events\`\n`
out += `- **Email**: Resend transactional API (Claude-A's \`/api/welcome\`)\n`
out += `- **Hosting**: GitHub Pages for the Manager (static + Realtime client), Vercel-ready for the storefront\n`

writeFileSync('TRANSCRIPT.md', out)
console.log('Wrote TRANSCRIPT.md —', out.length, 'chars')
