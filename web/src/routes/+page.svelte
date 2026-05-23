<script lang="ts">
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
			email:
				'bg-role-email/10 border border-role-email/60 text-role-email hover:bg-role-email/20',
			manager:
				'bg-role-manager/10 border border-role-manager/60 text-role-manager hover:bg-role-manager/20',
			automations:
				'bg-role-automations/10 border border-role-automations/60 text-role-automations hover:bg-role-automations/20'
		}[accent];
	}

	function subscribe(tier: Tier) {
		// Wired in task #4 — for now, soft acknowledgement so the button feels alive.
		alert(`${tier.name} — Supabase signup wire-up is in progress.`);
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
						class="bg-role-storefront/15 text-role-storefront border-role-storefront/40 absolute -top-3 left-8 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[var(--tracking-widest)]"
						>Most chosen</span
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
					onclick={() => subscribe(tier)}
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
