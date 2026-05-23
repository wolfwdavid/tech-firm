import { useEffect } from 'react'
import {
  flags,
  supabase,
  type RemoteAutomationEvent,
} from './supabase'
import { useCrystariumStore } from '../store'
import type { NodeRole } from '../store/types'

/**
 * Subscribes to INSERTs on the shared `automation_events` table and turns each one into a
 * local edge pulse + automation log row. When this hook is active, the local timer-driven
 * driver (useAutomationDriver) should be paused so we don't compete.
 *
 * No-ops gracefully if Supabase isn't configured. Designed to coexist with `useAutomationDriver`
 * — call both from App; only one will actually fire events depending on env config.
 */
export function useRealtimeAutomations() {
  useEffect(() => {
    const setStatus = useCrystariumStore.getState().setRealtimeStatus
    if (!flags.remoteAutomations || !supabase) {
      setStatus('idle')
      return
    }

    setStatus('connecting')

    const channel = supabase
      .channel('crystarium-automation-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'automation_events',
        },
        (payload) => {
          const row = payload.new as RemoteAutomationEvent
          // Defensive: only fire if both endpoints exist as nodes in the current Crystarium.
          // If the storefront wrote for a clone we don't know about, skip it.
          const state = useCrystariumStore.getState()
          const nodeIds = new Set(state.nodes.map((n) => n.id))
          if (!nodeIds.has(row.from_node) || !nodeIds.has(row.to_node)) {
            // Still log it so we know an event arrived
            state.logAutomation({
              fromNodeId: row.from_node,
              toNodeId: row.to_node,
              label: `${row.label} (remote)`,
            })
            return
          }
          state.fireAutomation(row.from_node, row.to_node, row.label)
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[crystarium] subscribed to remote automation_events')
          setStatus('live')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[crystarium] realtime channel error; local driver still running')
          setStatus('error')
        } else if (status === 'CLOSED') {
          setStatus('idle')
        }
      })

    return () => {
      void supabase!.removeChannel(channel)
      setStatus('idle')
    }
  }, [])
}

/** Convenience: returns true if remote subscription is the source of automation events. */
export function isRemoteAutomationsActive(): boolean {
  return flags.remoteAutomations && supabase !== null
}

// Re-export for symmetry — the role union type isn't used here but keeps the module tidy.
export type _RemoteAutomationRole = NodeRole
