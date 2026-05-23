import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase client. Null until Claude-A provisions the project and the keys land in .env.local.
 * Consumers MUST check `if (supabase)` before calling — the app stays demo-able with mocked
 * agents and the timer-driven automation driver if Supabase is absent.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        realtime: { params: { eventsPerSecond: 8 } },
      })
    : null

export const hasSupabase = (): boolean => supabase !== null

/** Throws if called before the keys are configured. Use after a `hasSupabase()` guard. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
    )
  }
  return supabase
}

/**
 * Shape of a row in the shared `automation_events` table. Storefront (SvelteKit, Claude-A)
 * writes; Crystarium (this app) subscribes via Realtime.
 *
 * Channel: `automation_events`. Event: `INSERT`. Filter by `business_id` once auth is wired;
 * for the sunset demo we subscribe to all inserts.
 */
export interface RemoteAutomationEvent {
  id: string
  business_id: string | null
  from_node: string
  to_node: string
  label: string
  created_at: string
}

/**
 * Feature flags read at module load. Vite inlines these at build, so flipping them
 * requires a rebuild — fine for the hackathon.
 */
export const flags = {
  liveAgents: import.meta.env.VITE_LIVE_AGENTS === 'true',
  remoteAutomations: hasSupabase() && import.meta.env.VITE_REMOTE_AUTOMATIONS !== 'false',
}
