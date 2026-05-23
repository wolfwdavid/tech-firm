import Anthropic from '@anthropic-ai/sdk'

export interface ChatRequest {
  nodeId: string
  role:
    | 'manager'
    | 'storefront'
    | 'customer'
    | 'email'
    | 'content'
    | 'payments'
    | 'analytics'
    | 'automations'
  agentName: string
  persona: string
  specialization?: string
  history: { from: 'user' | 'agent'; text: string }[]
  userText: string
  voiceSamples?: string[]
  /** Business context — passed from the client so agents are aware of the niche. */
  business?: {
    name?: string
    niche?: string
    mrr?: number
    customerCount?: number
  }
}

export interface ChatResponse {
  text?: string
  error?: string
  /** Server-measured latency for the SDK call (ms). Useful for diagnostics during the demo. */
  latencyMs?: number
}

const ROLE_LABELS: Record<ChatRequest['role'], string> = {
  manager: 'AI CEO — the orchestrator',
  storefront: 'Storefront — the public landing page and conversion surface',
  customer: 'Customer Chat — frontline support agent',
  email: 'Email Marketing — campaign writer and list steward',
  content: 'Content Engine — blog, social, long-form writer',
  payments: 'Payments — receipts, refunds, subscription health',
  analytics: 'Analytics — signal surfacing without dashboard noise',
  automations: 'Automations — the wires between every other agent',
}

function buildSystemPrompt(req: ChatRequest): string {
  const lines: string[] = []
  const businessLine = (() => {
    const parts: string[] = []
    if (req.business?.name) parts.push(req.business.name)
    if (req.business?.niche) parts.push(`(${req.business.niche})`)
    return parts.length ? parts.join(' ') : 'a one-person AI-run business'
  })()

  lines.push(
    `You are "${req.agentName}", the ${ROLE_LABELS[req.role]} for ${businessLine}.`,
  )
  lines.push('')
  lines.push('Your persona:')
  lines.push(req.persona)

  if (req.specialization) {
    lines.push('')
    lines.push(
      `You are the **${req.specialization}** specialist — same role, narrower lens. Apply your focus to every reply.`,
    )
  }

  if (req.voiceSamples && req.voiceSamples.length) {
    lines.push('')
    lines.push('Voice samples — match this tone exactly:')
    for (const s of req.voiceSamples.slice(0, 4)) lines.push(`- ${s}`)
  }

  if (req.business?.mrr !== undefined || req.business?.customerCount !== undefined) {
    lines.push('')
    lines.push('Current business numbers (use sparingly — only mention if relevant):')
    if (req.business?.mrr !== undefined) lines.push(`- MRR: $${req.business.mrr}`)
    if (req.business?.customerCount !== undefined)
      lines.push(`- Customers: ${req.business.customerCount}`)
  }

  lines.push('')
  lines.push('Response rules:')
  lines.push('- Reply in 1-3 sentences. Terse, observational, in voice.')
  lines.push('- Never use exclamation marks.')
  lines.push('- Never break character or mention you are an AI / language model.')
  lines.push('- If the user asks something outside your role, redirect to which agent should handle it.')
  lines.push('- Never apologize unprompted.')

  return lines.join('\n')
}

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

function buildMessages(req: ChatRequest): ClaudeMessage[] {
  const msgs: ClaudeMessage[] = req.history.map((m) => ({
    role: m.from === 'user' ? 'user' : 'assistant',
    content: m.text,
  }))
  // De-duplicate trailing identical user message in case the client included userText in history
  const last = msgs[msgs.length - 1]
  if (!last || last.role !== 'user' || last.content !== req.userText) {
    msgs.push({ role: 'user', content: req.userText })
  }
  // Anthropic requires alternating user/assistant, starting with user. Drop leading assistant turns.
  while (msgs.length && msgs[0].role !== 'user') msgs.shift()
  return msgs
}

export async function handleChat(body: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      error:
        'ANTHROPIC_API_KEY is not set on the server. Add it to .env.local (dev) or your Vercel project env (prod).',
    }
  }

  const systemPrompt = buildSystemPrompt(body)
  const messages = buildMessages(body)
  if (messages.length === 0) {
    return { error: 'No user message to respond to.' }
  }

  const start = Date.now()
  try {
    const client = new Anthropic({ apiKey })
    const result = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    })

    const firstBlock = result.content[0]
    const text =
      firstBlock && firstBlock.type === 'text' ? firstBlock.text.trim() : ''
    if (!text) {
      return {
        error: 'Anthropic returned an empty response.',
        latencyMs: Date.now() - start,
      }
    }
    return { text, latencyMs: Date.now() - start }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Anthropic API error'
    return { error: msg, latencyMs: Date.now() - start }
  }
}
