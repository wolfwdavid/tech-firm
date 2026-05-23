// Null-safe Supabase client for the storefront.
//
// Stays null until PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set.
// Code that calls into the client must handle the null case gracefully so
// the storefront still renders without a live Supabase project.
//
// Mirrors the shape of src/lib/supabase.ts in the React Crystarium so the
// RemoteAutomationEvent contract stays consistent across both apps.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

export interface RemoteAutomationEvent {
	id: string;
	business_id: string | null;
	from_node: string;
	to_node: string;
	label: string;
	created_at: string;
}

const url = env.PUBLIC_SUPABASE_URL?.trim();
const key = env.PUBLIC_SUPABASE_ANON_KEY?.trim();

const isPlaceholder = (v: string | undefined) =>
	!v || v.startsWith('<') || v === 'https://<project-ref>.supabase.co';

export const supabase: SupabaseClient | null =
	isPlaceholder(url) || isPlaceholder(key) ? null : createClient(url!, key!);

export const supabaseReady = supabase !== null;
