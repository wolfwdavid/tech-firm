import type {
  Agent,
  BusinessSeed,
  CapabilityNode,
  EdgeData,
} from '../store/types'

export const seedBusiness: BusinessSeed = {
  name: 'POUR DECISIONS',
  mrr: 2340,
  customerCount: 47,
  todayActivity: 3,
}

export const seedNodes: CapabilityNode[] = [
  { id: 'node-manager', role: 'manager', name: 'Manager', position: { x: 600, y: 360 }, status: 'idle' },
  { id: 'node-storefront', role: 'storefront', name: 'Storefront', position: { x: 380, y: 360 }, status: 'idle' },
  { id: 'node-customer', role: 'customer', name: 'Customer Chat', position: { x: 820, y: 360 }, status: 'idle' },
  { id: 'node-email', role: 'email', name: 'Email Marketing', position: { x: 600, y: 540 }, status: 'idle' },
  { id: 'node-content', role: 'content', name: 'Content Engine', position: { x: 220, y: 200 }, status: 'idle' },
  { id: 'node-payments', role: 'payments', name: 'Payments', position: { x: 220, y: 520 }, status: 'idle' },
  { id: 'node-analytics', role: 'analytics', name: 'Analytics', position: { x: 980, y: 540 }, status: 'idle' },
  { id: 'node-automations', role: 'automations', name: 'Automations', position: { x: 980, y: 200 }, status: 'idle' },
]

// 11 edges for the branching Crystarium topology
export const seedEdges: EdgeData[] = [
  { id: 'e-mgr-storefront', source: 'node-manager', target: 'node-storefront' },
  { id: 'e-mgr-customer', source: 'node-manager', target: 'node-customer' },
  { id: 'e-mgr-email', source: 'node-manager', target: 'node-email' },
  { id: 'e-mgr-automations', source: 'node-manager', target: 'node-automations' },
  { id: 'e-storefront-content', source: 'node-storefront', target: 'node-content' },
  { id: 'e-storefront-payments', source: 'node-storefront', target: 'node-payments' },
  { id: 'e-customer-analytics', source: 'node-customer', target: 'node-analytics' },
  { id: 'e-customer-automations', source: 'node-customer', target: 'node-automations' },
  { id: 'e-email-payments', source: 'node-email', target: 'node-payments' },
  { id: 'e-email-content', source: 'node-email', target: 'node-content' },
  { id: 'e-content-analytics', source: 'node-content', target: 'node-analytics' },
]

// Each agent has ≥6 canned responses keyed off node role
export const seedAgents: Record<string, Agent> = {
  'node-manager': {
    nodeId: 'node-manager',
    persona:
      "I'm your AI CEO. I read the room across all agents, prioritize what matters this morning, and tell you only what needs your call.",
    recentActions: [
      { ts: Date.now() - 1000 * 60 * 60 * 8, text: 'Reviewed overnight signups — 3 new subscribers, all from the IG ad.' },
      { ts: Date.now() - 1000 * 60 * 60 * 7, text: 'Approved Email draft for the new decaf line, queued for 9am send.' },
      { ts: Date.now() - 1000 * 60 * 60 * 6, text: 'Flagged churn risk on customer #042 — last login 18 days ago.' },
    ],
    cannedResponses: [
      "Good morning. Overnight: 3 new subscribers (all IG ad), $87 in receipts, 0 support tickets. Welcome emails went out. Want me to draft the social post for today?",
      "Top priority: customer #042 hasn't logged in 18 days — that's MRR risk. I can have Customer Chat reach out with a re-engagement offer. Approve?",
      "Cash position: $2,340 MRR, runway looks healthy. Storefront's converting at 4.1%, above your benchmark. Push more ad spend or hold?",
      "Decaf line launch is ready to go: Content drafted the announcement, Email queued the campaign, Storefront listing is live. Just need your green light.",
      "Spotted a pattern: 4 of the last 6 signups came from the 'Swiss water decaf' search term. Want me to ask Content to spin up a long-form post on the origin?",
      "Everything's nominal. Storefront idle, Email idle, Content drafting tomorrow's post. I'll wake you if a customer needs you.",
      "I delegate by default. Tell me what to prioritize and I'll fan it out to the right agent.",
    ],
  },
  'node-storefront': {
    nodeId: 'node-storefront',
    persona:
      "I'm the Storefront. I keep the landing page sharp, listings current, and the checkout friction-free.",
    recentActions: [
      { ts: Date.now() - 1000 * 60 * 60 * 9, text: 'Updated hero copy for the decaf launch.' },
      { ts: Date.now() - 1000 * 60 * 60 * 5, text: 'Converted 3 visitors → subscribers (IG ad traffic).' },
      { ts: Date.now() - 1000 * 60 * 60 * 4, text: 'A/B test on CTA color started — variant B leading +14%.' },
    ],
    cannedResponses: [
      "Storefront is converting at 4.1% today, up from 3.6% last week. Hero copy change is doing work.",
      "Three signups overnight. All landed on the decaf page from the IG ad. I'll tell Email to send the decaf welcome sequence instead of generic.",
      "I can A/B test the headline. Want me to try 'Coffee, but make it intentional' against your current 'Pour with purpose'?",
      "Inventory check: light roast subscription is at 12 units, you'll want a restock or wait-list flow in the next 4 days.",
      "Landing page Lighthouse scores: Performance 94, Accessibility 100, SEO 92. The 6 points on perf are the hero image — should I lazy-load it?",
      "If you want a new product live, give me a name, blurb, price, and an image. I'll have a listing live in 30 seconds.",
    ],
  },
  'node-customer': {
    nodeId: 'node-customer',
    persona:
      "I'm Customer Chat. I answer questions, handle returns and address changes, and only escalate when a human ear actually matters.",
    recentActions: [
      { ts: Date.now() - 1000 * 60 * 60 * 6, text: 'Resolved 4 tickets overnight (3 shipping ETAs, 1 grind preference change).' },
      { ts: Date.now() - 1000 * 60 * 60 * 3, text: 'Sent a hand-written-feel apology to customer #019 (delayed shipment).' },
      { ts: Date.now() - 1000 * 60 * 60 * 2, text: 'Flagged customer #042 as cold to Manager.' },
    ],
    cannedResponses: [
      "Tonight's queue: 0 open tickets, 4 resolved. Median response time 38 seconds. Want me to draft a 'how was your delivery' check-in for the recent batch?",
      "I keep my tone close to yours — warm, terse, no exclamation marks. You can change my voice anytime; just say the word.",
      "Customer #042 looks cold. I can send a single-question email asking what would make them come back. Higher-ROI than a discount.",
      "Most common question this week: 'When does my next shipment go out?' I could put a tracker on the customer page and cut that volume in half.",
      "I never push upsells in support tickets unless the customer opens the door. That's your rule, and it earns trust.",
      "If you want me to escalate to you, tell me the trigger — refund > $50? Word 'cancel'? Repeated frustration? Up to you.",
    ],
  },
  'node-email': {
    nodeId: 'node-email',
    persona:
      "I'm Email Marketing. I write campaigns in your voice, sequence onboarding, and protect your sender reputation like it's mine.",
    recentActions: [
      { ts: Date.now() - 1000 * 60 * 60 * 10, text: 'Drafted decaf launch campaign — 3 emails over 5 days.' },
      { ts: Date.now() - 1000 * 60 * 60 * 8, text: 'Sent welcome email to 3 new subscribers.' },
      { ts: Date.now() - 1000 * 60 * 60 * 4, text: "Open rate on yesterday's send: 42% (above your 38% baseline)." },
    ],
    cannedResponses: [
      "Decaf launch campaign is ready: 3 emails, 5 days, segmented by 'has bought decaf before' vs 'curious'. Want to see the first one before it goes?",
      "Yesterday's send opened at 42%, clicked at 8.1%. Subject line 'I lied about coffee' did the heavy lifting.",
      "List health: 47 subscribers, 0% bounce, 0.2% spam complaints (well under 0.5% threshold). We're a good citizen.",
      "I can sequence a re-engagement series for the 4 customers who haven't opened anything in 30 days. Two emails, 6 days apart. Want me to draft?",
      "Don't let me send more than 2 emails a week unless you say so. Anything more starts costing trust.",
      "Need a quick campaign? Give me the angle and a call-to-action. I'll have a draft in 90 seconds.",
    ],
  },
  'node-content': {
    nodeId: 'node-content',
    persona:
      "I'm the Content Engine. Blog posts, social, long-form — I keep your voice consistent and your calendar full.",
    recentActions: [
      { ts: Date.now() - 1000 * 60 * 60 * 11, text: "Drafted next week's blog post: \"Swiss Water Decaf — Why This Process Matters\"." },
      { ts: Date.now() - 1000 * 60 * 60 * 6, text: 'Generated 7 IG captions for the decaf launch.' },
      { ts: Date.now() - 1000 * 60 * 60 * 3, text: "Repurposed last week's blog into a 4-part Twitter thread." },
    ],
    cannedResponses: [
      "Next blog post is queued: 'Swiss Water Decaf — Why This Process Matters'. 1,200 words. Want me to read you the opening?",
      "Your voice is observational, slightly self-deprecating, doesn't use jargon. I'll keep it there unless you tell me to shift.",
      "I can spin up a 4-post IG carousel from any blog post in about 90 seconds. Pick one and I'll show you.",
      "Content calendar for the week: Mon — blog (decaf), Tue — IG carousel, Wed — Twitter thread, Thu — newsletter, Fri — short-form video script. Approve?",
      "Long-form SEO play: 'pour-over for beginners' has 8,100 monthly searches, low difficulty. I can have a 2,000-word post done by tomorrow morning.",
      "I write headlines that earn the click without lying. Tell me when one feels off and I'll learn the line.",
    ],
  },
  'node-payments': {
    nodeId: 'node-payments',
    persona:
      "I'm Payments. Receipts go out, refunds get processed, subscriptions renew, and I tell you about anything weird.",
    recentActions: [
      { ts: Date.now() - 1000 * 60 * 60 * 10, text: 'Processed 3 new subscription signups ($29/mo each, $87 total).' },
      { ts: Date.now() - 1000 * 60 * 60 * 6, text: 'Renewed 11 active subscriptions overnight.' },
      { ts: Date.now() - 1000 * 60 * 60 * 4, text: 'Flagged 1 failed card retry for customer #033 — sent reminder.' },
    ],
    cannedResponses: [
      "Today's receipts: $87 new MRR + $319 renewals. Net positive day. Card failure on #033 is in retry; I'll let you know if it doesn't clear.",
      "MRR breakdown: 32 active subs at $29 (light), 11 at $39 (dark roast), 4 at $49 (decaf). Decaf tier has the highest LTV by 38%.",
      "Refund queue: 0. Chargebacks: 0 this month. Sender reputation pristine.",
      "If a card fails: I retry at 24h, 72h, and 7 days. After 3 fails, I notify you and Customer Chat sends a gentle nudge.",
      "Stripe fee load: 2.9% + 30¢ per txn. On $2,340 MRR, you're paying about $82/month in fees. That's the table stakes price of frictionless checkout.",
      "I don't ever process anything without your business rules confirmed. Tell me what to do; I'll execute.",
    ],
  },
  'node-analytics': {
    nodeId: 'node-analytics',
    persona:
      "I'm Analytics. I watch the numbers, surface signals, and never bury you in dashboards you didn't ask for.",
    recentActions: [
      { ts: Date.now() - 1000 * 60 * 60 * 7, text: 'Cohort report: April subs have 91% 60-day retention.' },
      { ts: Date.now() - 1000 * 60 * 60 * 4, text: 'Detected a 14% lift on the storefront variant B test.' },
      { ts: Date.now() - 1000 * 60 * 60 * 2, text: 'Surfaced a churn cohort: month-3 subs with light roast only.' },
    ],
    cannedResponses: [
      "Headline numbers: $2,340 MRR, 47 customers, 4.1% conversion. Last 30 days: +9% MRR, +12% customers, retention 88%.",
      "I caught a pattern: light-roast-only subscribers churn 2.3× more at month 3 than mixed-roast. Want me to ask Email to seed a roast-exploration campaign for them?",
      "Variant B on the CTA test has hit statistical significance (+14% conversion). Want me to call it and ask Storefront to ship?",
      "Highest-LTV customer cohort: subscribers from your IG ad spend, decaf tier. Spend more there if you want to repeat.",
      "I only ping you when a number actually changed direction. No 'numbers are fine' check-ins.",
      "Pick a metric to obsess about and I'll watch it. Default is MRR growth rate. You could change to NRR, LTV/CAC, or anything else.",
    ],
  },
  'node-automations': {
    nodeId: 'node-automations',
    persona:
      "I'm the Automations bridge. When two agents need to talk to each other, I route the signal. Think n8n with vibes.",
    recentActions: [
      { ts: Date.now() - 1000 * 60 * 60 * 8, text: 'Storefront → Email: triggered welcome sequence for 3 signups.' },
      { ts: Date.now() - 1000 * 60 * 60 * 5, text: 'Customer Chat → Analytics: flagged #042 as cold cohort.' },
      { ts: Date.now() - 1000 * 60 * 60 * 2, text: 'Payments → Email: receipt fired for $87 in new MRR.' },
    ],
    cannedResponses: [
      "I'm the wires. Tell me 'when X happens at agent A, do Y at agent B' and I'll keep that running until you say stop.",
      "Currently routing: signup → welcome email, refund → apology + retention offer, churn flag → re-engagement attempt, sale → receipt.",
      "Want a new wire? Tell me the trigger and the action. I'll show it to you before I let it live.",
      "I never fire silently. Every automation writes to the log so you can read what's been happening.",
      "If something looks wrong, I'll pause the automation and ping the Manager before continuing. Conservative by default.",
      "I can mirror anything to a real Zapier or n8n endpoint later. For now, I run in-memory and keep things calm.",
    ],
  },
}
