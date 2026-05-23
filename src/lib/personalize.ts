import type { Agent, NodeRole } from '../store/types'

/**
 * After onboarding, replace the seed's coffee-specific recentActions with niche-generic ones
 * so the demo doesn't feel like it's about coffee even when David's running, say, a consulting firm.
 *
 * Strings stay deliberately short and observational — these surface in the RecentActions feed
 * and the Manager's morning briefing, so they should read like log entries, not marketing copy.
 *
 * Returns 3 actions per role with descending timestamps (most recent first → ~8h ago).
 */
export function personalizedActionsFor(
  role: NodeRole,
  niche: string,
): Agent['recentActions'] {
  const now = Date.now()
  const hAgo = (h: number): number => now - h * 60 * 60 * 1000

  // Trim & default the niche to a graceful fallback if blank
  const n = niche.trim() || 'one-person business'

  const templates: Record<NodeRole, string[]> = {
    manager: [
      `Reviewed overnight signals across the ${n} stack — 0 blockers, 1 decision queued for you.`,
      `Drafted today's priority list. Top of it: re-engage the cohort that went quiet last week.`,
      `Approved one agent action; held two for your review. Will surface them when you open the drawer.`,
    ],
    storefront: [
      `Updated hero copy for ${n}. Variant B trending +9% on early traffic.`,
      `Three new visitors converted overnight. Source: organic search.`,
      `Caught a 404 on a legacy product slug; redirect deployed.`,
    ],
    customer: [
      `Resolved 4 tickets overnight. Median first reply: 38 seconds.`,
      `Flagged one cold customer for re-engagement. Cohort: month-3, ${n}.`,
      `Drafted a check-in for last week's new signups — waiting on your tone pass.`,
    ],
    email: [
      `Queued tomorrow's newsletter. Subject line A/B underway.`,
      `Sent welcome sequence to 3 new ${n} signups (open rate 51% on first send).`,
      `List health pristine: 0% bounce, 0.1% spam complaints.`,
    ],
    content: [
      `Drafted long-form post on a topic adjacent to ${n}. 1,200 words, ready for your read.`,
      `Repurposed last week's post into a 4-part thread + 3 IG captions.`,
      `Spotted an SEO opening: low difficulty, high intent. Brief in your inbox.`,
    ],
    payments: [
      `Processed 3 new subscriptions. Net today: positive.`,
      `One card retry failed; nudged customer via Customer Chat.`,
      `MRR breakdown updated. Highest-LTV tier confirmed.`,
    ],
    analytics: [
      `Cohort retention holding at 88% at 60 days for ${n}.`,
      `Caught a small drift on the conversion funnel — surfaced to Manager.`,
      `Variant B on the CTA test reached significance overnight.`,
    ],
    automations: [
      `7 wires currently active. Health: all green.`,
      `Storefront → Email firing reliably (3 events last 24h).`,
      `Suggested 1 new wire for your ${n} workflow — see Automations log.`,
    ],
  }

  const lines = templates[role] || []
  return lines.map((text, i) => ({ ts: hAgo(2 + i * 3), text }))
}
