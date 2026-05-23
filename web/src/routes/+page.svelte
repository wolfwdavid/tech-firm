<script lang="ts">
	import { enhance } from '$app/forms';

	type Tier = {
		id: 'single-origin' | 'house-blend' | 'roasters-choice';
		name: string;
		tagline: string;
		priceMonthly: number;
		features: string[];
		accent: 'email' | 'manager' | 'automations';
		featured?: boolean;
	};

	const tiers: Tier[] = [
		{
			id: 'single-origin',
			name: 'Single Origin',
			tagline: 'One agent, one focus, one month.',
			priceMonthly: 18,
			accent: 'email',
			features: [
				'One specialized AI agent, tuned to your top focus area',
				'Up to 50 decisions per month with plain-language reasoning',
				'Onboarding interview shapes the agent to how you think',
				'Pause or cancel any month'
			]
		},
		{
			id: 'house-blend',
			name: 'House Blend',
			tagline: 'The one most subscribers stay on.',
			priceMonthly: 28,
			accent: 'manager',
			featured: true,
			features: [
				'Three AI agents collaborating across your domains',
				'Shared context — each agent sees what the others decided',
				'Unlimited decisions with priority response times',
				'Weekly briefing of every decision your agents made for you'
			]
		},
		{
			id: 'roasters-choice',
			name: "Roaster's Choice",
			tagline: 'For people running their stack on autopilot.',
			priceMonthly: 48,
			accent: 'automations',
			features: [
				'A custom roster of agents, shaped to your business or life',
				'Bring-your-own-model: Claude, GPT, or local — your call',
				'Early access to new agent capabilities and integrations',
				'Monthly 1:1 with the architect who tunes your roster'
			]
		}
	];

	type FormResult = {
		success?: boolean;
		email?: string;
		tierLabel?: string;
		eventWritten?: boolean;
		eventError?: string | null;
		emailSent?: boolean;
		emailError?: string | null;
		error?: string;
	};

	let { form }: { form: FormResult | null } = $props();

	let selectedTier = $state<Tier | null>(null);
	let submitting = $state(false);

	function openModal(tier: Tier) {
		selectedTier = tier;
	}

	function closeModal() {
		selectedTier = null;
		submitting = false;
	}

	function accentBorder(accent: Tier['accent']) {
		return {
			email: 'border-role-email/40 hover:border-role-email/80',
			manager: 'border-role-manager/40 hover:border-role-manager/80',
			automations: 'border-role-automations/40 hover:border-role-automations/80'
		}[accent];
	}

	function accentText(accent: Tier['accent']) {
		return {
			email: 'text-role-email',
			manager: 'text-role-manager',
			automations: 'text-role-automations'
		}[accent];
	}

	function accentGlow(accent: Tier['accent']) {
		return {
			email: 'shadow-[0_0_60px_-20px_var(--color-role-email)]',
			manager: 'shadow-[0_0_60px_-20px_var(--color-role-manager)]',
			automations: 'shadow-[0_0_60px_-20px_var(--color-role-automations)]'
		}[accent];
	}

	function accentButton(accent: Tier['accent']) {
		return {
			email: 'bg-role-email/10 border border-role-email/60 text-role-email hover:bg-role-email/20',
			manager:
				'bg-role-manager/10 border border-role-manager/60 text-role-manager hover:bg-role-manager/20',
			automations:
				'bg-role-automations/10 border border-role-automations/60 text-role-automations hover:bg-role-automations/20'
		}[accent];
	}

	function accentBadge(accent: Tier['accent']) {
		return {
			email: 'bg-role-email/15 text-role-email border-role-email/40',
			manager: 'bg-role-manager/15 text-role-manager border-role-manager/40',
			automations: 'bg-role-automations/15 text-role-automations border-role-automations/40'
		}[accent];
	}

	function accentRing(accent: Tier['accent']) {
		return {
			email: 'focus:border-role-email focus:ring-role-email/40',
			manager: 'focus:border-role-manager focus:ring-role-manager/40',
			automations: 'focus:border-role-automations focus:ring-role-automations/40'
		}[accent];
	}
</script>

<svelte:head>
	<title>Decisions — decided for you</title>
	<meta
		name="description"
		content="A small-batch subscription, run end-to-end by one person and a constellation of AI agents."
	/>
</svelte:head>

<div class="min-h-screen px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
	<header class="mx-auto flex max-w-6xl items-center justify-between">
		<div class="flex items-baseline gap-3">
			<span
				class="text-role-manager font-display text-2xl tracking-[var(--tracking-mystic)] uppercase"
				>Decisions</span
			>
		</div>
		<div
			class="text-text-muted hidden gap-6 text-xs uppercase tracking-[var(--tracking-widest)] sm:flex"
		>
			<span><span class="text-text-primary">47</span> subscribers</span>
			<span><span class="text-text-primary">$2,340</span> mrr</span>
			<span class="text-role-manager">● live</span>
		</div>
	</header>

	<section class="mx-auto mt-20 max-w-3xl text-center">
		<p class="text-text-secondary mb-4 text-xs uppercase tracking-[var(--tracking-mystic)]">
			A one-person AI business
		</p>
		<h1 class="font-display text-text-primary text-5xl leading-tight sm:text-6xl">
			<span class="text-role-manager italic">Decided</span> for you.
		</h1>
		<p class="text-text-secondary mt-6 text-lg leading-relaxed">
			Each month, a hand-picked set of decisions made on your behalf — by specialized AI agents
			tuned to how you think — delivered with plain-language reasoning. The whole operation runs
			from one laptop and a handful of specialized agents.
		</p>
	</section>

	<section class="mx-auto mt-24 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each tiers as tier (tier.id)}
			<article
				class="bg-deep/70 group relative rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 {accentBorder(
					tier.accent
				)} {tier.featured ? accentGlow(tier.accent) : ''}"
			>
				{#if tier.featured}
					<span
						class="absolute -top-3 left-8 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[var(--tracking-widest)] {accentBadge(
							tier.accent
						)}">Most chosen</span
					>
				{/if}

				<header class="mb-6">
					<h2 class="font-display text-text-primary text-2xl">{tier.name}</h2>
					<p class="text-text-muted mt-1 text-sm italic">{tier.tagline}</p>
				</header>

				<p class="mb-8 flex items-baseline gap-2">
					<span class="font-display text-text-primary text-5xl">${tier.priceMonthly}</span>
					<span class="text-text-muted text-sm">/ month</span>
				</p>

				<ul class="mb-10 space-y-3">
					{#each tier.features as feature}
						<li class="text-text-secondary flex items-start gap-3 text-sm leading-relaxed">
							<span class="{accentText(tier.accent)} mt-1 text-xs">◆</span>
							<span>{feature}</span>
						</li>
					{/each}
				</ul>

				<button
					type="button"
					onclick={() => openModal(tier)}
					class="w-full rounded-lg px-5 py-3 text-sm font-medium uppercase tracking-[var(--tracking-widest)] transition-colors duration-200 {accentButton(
						tier.accent
					)}"
				>
					Subscribe
				</button>
			</article>
		{/each}
	</section>

	<footer class="mx-auto mt-24 max-w-3xl text-center">
		<p class="text-text-muted text-xs uppercase tracking-[var(--tracking-mystic)]">
			Operated by the Crystarium — one founder, eight agents
		</p>
	</footer>
</div>

{#if selectedTier}
	{@const tier = selectedTier}
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="subscribe-title"
		class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
	>
		<button
			type="button"
			aria-label="Close"
			onclick={closeModal}
			class="bg-void/80 absolute inset-0 backdrop-blur-sm"
		></button>

		<div
			class="bg-deep border-border-glow relative w-full max-w-md rounded-2xl border p-8 {accentGlow(
				tier.accent
			)}"
		>
			<button
				type="button"
				onclick={closeModal}
				aria-label="Close"
				class="text-text-muted hover:text-text-primary absolute right-4 top-4 text-xl leading-none"
				>×</button
			>

			{#if form?.success && form.tierLabel}
				<header class="mb-4">
					<p
						class="text-role-manager mb-2 text-xs uppercase tracking-[var(--tracking-mystic)]"
					>
						Welcome to {form.tierLabel}
					</p>
					<h2 id="subscribe-title" class="font-display text-text-primary text-2xl">
						You're in.
					</h2>
				</header>
				<p class="text-text-secondary text-sm leading-relaxed">
					A confirmation is on its way to <span class="text-text-primary">{form.email}</span>.
					Your agents are being tuned right now — your first decision brief will arrive within
					24 hours.
				</p>
				{#if form.eventError || form.emailError}
					<details class="text-text-muted mt-4 text-xs">
						<summary class="cursor-pointer">Demo diagnostics</summary>
						<ul class="mt-2 space-y-1">
							<li>
								Automation event:
								{form.eventWritten ? 'written ✓' : `skipped — ${form.eventError}`}
							</li>
							<li>
								Welcome email: {form.emailSent ? 'sent ✓' : `skipped — ${form.emailError}`}
							</li>
						</ul>
					</details>
				{/if}
				<button
					type="button"
					onclick={closeModal}
					class="mt-8 w-full rounded-lg px-5 py-3 text-sm font-medium uppercase tracking-[var(--tracking-widest)] {accentButton(
						tier.accent
					)}"
				>
					Done
				</button>
			{:else}
				<header class="mb-6">
					<p
						class="{accentText(
							tier.accent
						)} mb-2 text-xs uppercase tracking-[var(--tracking-mystic)]"
					>
						{tier.name} · ${tier.priceMonthly}/mo
					</p>
					<h2 id="subscribe-title" class="font-display text-text-primary text-2xl">
						Start your subscription
					</h2>
				</header>

				<form
					method="POST"
					action="?/subscribe"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update({ reset: false });
							submitting = false;
						};
					}}
					class="space-y-4"
				>
					<input type="hidden" name="tier" value={tier.id} />

					<label class="block">
						<span
							class="text-text-muted block text-xs uppercase tracking-[var(--tracking-widest)]"
							>Email</span
						>
						<input
							type="email"
							name="email"
							required
							autocomplete="email"
							placeholder="you@yourdomain.com"
							class="bg-surface-1 border-border-faint text-text-primary placeholder:text-text-muted mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 {accentRing(
								tier.accent
							)}"
						/>
					</label>

					<label class="block">
						<span
							class="text-text-muted block text-xs uppercase tracking-[var(--tracking-widest)]"
							>Name (optional)</span
						>
						<input
							type="text"
							name="name"
							autocomplete="name"
							placeholder="What should your agents call you?"
							class="bg-surface-1 border-border-faint text-text-primary placeholder:text-text-muted mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 {accentRing(
								tier.accent
							)}"
						/>
					</label>

					{#if form?.error}
						<p class="text-role-content text-xs">{form.error}</p>
					{/if}

					<button
						type="submit"
						disabled={submitting}
						class="w-full rounded-lg px-5 py-3 text-sm font-medium uppercase tracking-[var(--tracking-widest)] transition-colors duration-200 disabled:opacity-50 {accentButton(
							tier.accent
						)}"
					>
						{submitting ? 'Tuning your agents…' : `Subscribe to ${tier.name}`}
					</button>

					<p class="text-text-muted text-center text-xs">
						No card on file yet — payment wires up in v2.1.
					</p>
				</form>
			{/if}
		</div>
	</div>
{/if}
