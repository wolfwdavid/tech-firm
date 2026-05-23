<script lang="ts">
	type Tier = {
		id: 'single-origin' | 'house-blend' | 'roasters-choice';
		name: string;
		tagline: string;
		priceMonthly: number;
		features: string[];
		accent: 'storefront' | 'customer' | 'payments';
		featured?: boolean;
	};

	const tiers: Tier[] = [
		{
			id: 'single-origin',
			name: 'Single Origin',
			tagline: 'One bean, one farm, one month.',
			priceMonthly: 18,
			accent: 'customer',
			features: [
				'250g of one rotating single-origin bean',
				'Shipped the day it is roasted',
				'Tasting card with farm & process notes',
				'Pause or skip any month'
			]
		},
		{
			id: 'house-blend',
			name: 'House Blend',
			tagline: 'The one most subscribers stay on.',
			priceMonthly: 28,
			accent: 'storefront',
			featured: true,
			features: [
				'350g of our signature seasonal blend',
				'Two grind options: whole-bean or filter',
				'Companion brew guide refreshed monthly',
				'Free shipping inside the lower 48'
			]
		},
		{
			id: 'roasters-choice',
			name: "Roaster's Choice",
			tagline: 'For the people who keep their grinder dialed.',
			priceMonthly: 48,
			accent: 'payments',
			features: [
				'500g curated by the roaster — anything goes',
				'Includes one experimental / micro-lot per quarter',
				'Early access to limited releases',
				'Private monthly Q&A with the roaster'
			]
		}
	];

	function accentBorder(accent: Tier['accent']) {
		return {
			storefront: 'border-role-storefront/40 hover:border-role-storefront/80',
			customer: 'border-role-customer/40 hover:border-role-customer/80',
			payments: 'border-role-payments/40 hover:border-role-payments/80'
		}[accent];
	}

	function accentText(accent: Tier['accent']) {
		return {
			storefront: 'text-role-storefront',
			customer: 'text-role-customer',
			payments: 'text-role-payments'
		}[accent];
	}

	function accentGlow(accent: Tier['accent']) {
		return {
			storefront: 'shadow-[0_0_60px_-20px_var(--color-role-storefront)]',
			customer: 'shadow-[0_0_60px_-20px_var(--color-role-customer)]',
			payments: 'shadow-[0_0_60px_-20px_var(--color-role-payments)]'
		}[accent];
	}

	function accentButton(accent: Tier['accent']) {
		return {
			storefront:
				'bg-role-storefront/10 border border-role-storefront/60 text-role-storefront hover:bg-role-storefront/20',
			customer:
				'bg-role-customer/10 border border-role-customer/60 text-role-customer hover:bg-role-customer/20',
			payments:
				'bg-role-payments/10 border border-role-payments/60 text-role-payments hover:bg-role-payments/20'
		}[accent];
	}

	function subscribe(tier: Tier) {
		// Wired in task #4 — for now, soft acknowledgement so the button feels alive.
		alert(`${tier.name} — Supabase signup wire-up is in progress.`);
	}
</script>

<svelte:head>
	<title>Pour Decisions — coffee, decided for you</title>
	<meta
		name="description"
		content="A small-batch coffee subscription, run end-to-end by one person and a constellation of AI agents."
	/>
</svelte:head>

<div class="min-h-screen px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
	<header class="mx-auto flex max-w-6xl items-center justify-between">
		<div class="flex items-baseline gap-3">
			<span
				class="text-role-storefront font-display text-2xl tracking-[var(--tracking-mystic)] uppercase"
				>Pour Decisions</span
			>
		</div>
		<div
			class="text-text-muted hidden gap-6 text-xs uppercase tracking-[var(--tracking-widest)] sm:flex"
		>
			<span><span class="text-text-primary">47</span> subscribers</span>
			<span><span class="text-text-primary">$2,340</span> mrr</span>
			<span class="text-role-storefront">● live</span>
		</div>
	</header>

	<section class="mx-auto mt-20 max-w-3xl text-center">
		<p class="text-text-secondary mb-4 text-xs uppercase tracking-[var(--tracking-mystic)]">
			A one-person AI business
		</p>
		<h1 class="font-display text-text-primary text-5xl leading-tight sm:text-6xl">
			Coffee, <span class="text-role-storefront italic">decided</span> for you.
		</h1>
		<p class="text-text-secondary mt-6 text-lg leading-relaxed">
			Every month, a 250–500g bag chosen by the roaster, shipped the day it's roasted, paired with
			brewing notes written in plain language. The whole operation runs from one laptop and a
			handful of specialized agents.
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
