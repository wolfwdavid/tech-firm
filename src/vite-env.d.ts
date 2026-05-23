/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_LIVE_AGENTS?: string
  readonly VITE_REMOTE_AUTOMATIONS?: string
  readonly VITE_AGENT_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
