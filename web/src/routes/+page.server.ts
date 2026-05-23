// Subscribe form action.
//
// Does two things on submit:
//   1. INSERT into Supabase `automation_events` — the wire that makes
//      Claude-B's Crystarium edge pulse live in the demo.
//   2. Send a transactional welcome email via Resend.
//
// Both steps are best-effort with structured error reporting. The demo
// still completes (with a soft error) even if Supabase or Resend env
// vars aren't configured.

import { fail, type Actions } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import { env } from '$env/dynamic/private';

const TIER_LABEL: Record<string, string> = {
	'single-origin': 'Single Origin',
	'house-blend': 'House Blend',
	'roasters-choice': "Roaster's Choice"
};

function isEmail(v: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export const actions: Actions = {
	subscribe: async ({ request }) => {
		const data = await request.formData();
		const email = (data.get('email') ?? '').toString().trim();
		const tierId = (data.get('tier') ?? '').toString().trim();
		const name = (data.get('name') ?? '').toString().trim();

		if (!isEmail(email)) {
			return fail(400, { email, tierId, error: 'That email looks off — try again.' });
		}
		if (!TIER_LABEL[tierId]) {
			return fail(400, { email, tierId, error: 'Unknown tier.' });
		}

		const tierLabel = TIER_LABEL[tierId];
		const displayName = name || email.split('@')[0];

		// --- 1. Write the automation event (the demo's magic moment) ----------
		let eventWritten = false;
		let eventError: string | null = null;
		if (supabase) {
			const { error } = await supabase.from('automation_events').insert({
				from_node: 'node-storefront',
				to_node: 'node-email',
				label: `New signup → welcome sequence (${displayName} · ${tierLabel})`
			});
			if (error) {
				eventError = error.message;
			} else {
				eventWritten = true;
			}
		} else {
			eventError = 'Supabase not configured — automation event skipped.';
		}

		// --- 2. Send the welcome email ----------------------------------------
		let emailSent = false;
		let emailError: string | null = null;
		if (env.RESEND_API_KEY) {
			const from = env.RESEND_FROM_EMAIL || 'Decisions <onboarding@resend.dev>';
			try {
				const res = await fetch('https://api.resend.com/emails', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${env.RESEND_API_KEY}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						from,
						to: email,
						subject: `Welcome to Decisions — ${tierLabel}`,
						html: welcomeHtml({ displayName, tierLabel })
					})
				});
				if (!res.ok) {
					const body = await res.text();
					emailError = `Resend ${res.status}: ${body.slice(0, 200)}`;
				} else {
					emailSent = true;
				}
			} catch (err) {
				emailError = err instanceof Error ? err.message : 'Resend call failed.';
			}
		} else {
			emailError = 'RESEND_API_KEY not configured — welcome email skipped.';
		}

		return {
			success: true,
			email,
			tierLabel,
			eventWritten,
			eventError,
			emailSent,
			emailError
		};
	}
};

function welcomeHtml({ displayName, tierLabel }: { displayName: string; tierLabel: string }) {
	return `<!doctype html>
<html>
  <body style="margin:0;padding:40px 20px;background:#05060d;color:#e8e9ff;font-family:Inter,system-ui,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:560px;width:100%;">
      <tr><td style="padding:32px;background:#10112a;border:1px solid rgba(160,180,255,0.18);border-radius:16px;">
        <h1 style="margin:0 0 8px;font-family:'Cinzel',serif;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#f5c45e;font-size:22px;">Decisions</h1>
        <p style="margin:0 0 24px;color:#a8aacc;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Welcome to ${tierLabel}</p>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${displayName},</p>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#a8aacc;">
          Your subscription is alive. A specialized AI agent is being configured for your focus area
          right now, and you'll get your first decision brief within 24 hours.
        </p>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#a8aacc;">
          Operated end-to-end by one founder and a constellation of agents. Reply to this email if
          anything looks off — a human will read it.
        </p>
        <p style="margin:32px 0 0;font-size:11px;color:#5b5d80;letter-spacing:0.32em;text-transform:uppercase;">
          The Crystarium · One founder, eight agents
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
}
