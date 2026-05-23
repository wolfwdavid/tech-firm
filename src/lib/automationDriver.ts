import { useEffect } from 'react'
import { useCrystariumStore } from '../store'
import { isRemoteAutomationsActive } from './realtimeAutomations'

type Pair = [from: string, to: string, label: string]

const SEEDED_PAIRS: Pair[] = [
  ['node-storefront', 'node-email', 'New signup → welcome sequence'],
  ['node-storefront', 'node-payments', 'Order placed → checkout receipt'],
  ['node-storefront', 'node-content', 'Visitor signal → topic queued'],
  ['node-customer', 'node-email', 'Cold customer → nurture campaign'],
  ['node-customer', 'node-analytics', 'Sentiment logged → cohort updated'],
  ['node-email', 'node-payments', 'Receipt sent → ledger updated'],
  ['node-email', 'node-content', 'Campaign open → blog topic suggested'],
  ['node-payments', 'node-analytics', 'MRR change → dashboard recalc'],
  ['node-payments', 'node-manager', 'Failed card → flagged for review'],
  ['node-analytics', 'node-manager', 'Cohort drift → CEO briefing'],
  ['node-analytics', 'node-email', 'Pattern detected → campaign drafted'],
  ['node-content', 'node-email', 'Post ready → newsletter slotted'],
  ['node-automations', 'node-manager', 'Wire health check → all green'],
  ['node-content', 'node-analytics', 'Post indexed → traffic tracked'],
]

let intervalHandle: ReturnType<typeof setTimeout> | null = null
let mountedCount = 0

function pickNext(prevFrom: string | null): Pair {
  // avoid immediate repeat of source
  const candidates = SEEDED_PAIRS.filter((p) => p[0] !== prevFrom)
  const pool = candidates.length ? candidates : SEEDED_PAIRS
  return pool[Math.floor(Math.random() * pool.length)]
}

function schedule(prevFrom: string | null) {
  const fire = useCrystariumStore.getState().fireAutomation
  const nodes = useCrystariumStore.getState().nodes
  const nodeIds = new Set(nodes.map((n) => n.id))

  // jittered interval: 15-22s
  const wait = 15000 + Math.random() * 7000
  intervalHandle = setTimeout(() => {
    const pair = pickNext(prevFrom)
    if (nodeIds.has(pair[0]) && nodeIds.has(pair[1])) {
      fire(pair[0], pair[1], pair[2])
    }
    schedule(pair[0])
  }, wait)
}

export function useAutomationDriver() {
  useEffect(() => {
    // When the remote Realtime listener is active, real storefront events drive the pulses
    // — local timer would just add noise. Skip cleanly.
    if (isRemoteAutomationsActive()) {
      console.info('[crystarium] local automation driver paused — remote bus is the source')
      return
    }

    mountedCount++
    if (mountedCount > 1) {
      // strict-mode double-mount in dev — only one driver
      return () => {
        mountedCount--
      }
    }

    // First fire 2.5-3.5s after mount so demo viewer sees motion quickly
    const firstFire = setTimeout(() => {
      const fire = useCrystariumStore.getState().fireAutomation
      const first = SEEDED_PAIRS[Math.floor(Math.random() * 4)] // bias to storefront-driven
      fire(first[0], first[1], first[2])
      schedule(first[0])
    }, 2500 + Math.random() * 1000)

    return () => {
      clearTimeout(firstFire)
      if (intervalHandle) {
        clearTimeout(intervalHandle)
        intervalHandle = null
      }
      mountedCount--
    }
  }, [])
}
