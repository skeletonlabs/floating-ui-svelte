<script lang="ts">
<<<<<<< HEAD
	import { useFloating, type Placement, autoUpdate, offset } from '$lib/index.js';

	const elements = $state<{ reference?: HTMLElement; floating?: HTMLElement }>({});
	let placement = $state<Placement>('bottom');
	const floating = useFloating({
		get placement() {
			return placement;
		},
		middleware: [offset(5)],
		elements,
		whileElementsMounted: autoUpdate
	});
</script>

<select bind:value={placement}>
	<option value="top">Top</option>
	<option value="right">Right</option>
	<option value="bottom">Bottom</option>
	<option value="left">Left</option>
</select>

<p data-testid="x">{floating.x}</p>
<p data-testid="y">{floating.y}</p>

<button bind:this={elements.reference}>Reference</button>
<div bind:this={elements.floating} style={floating.floatingStyles}>Floating</div>
=======
	import IconArrowRight from 'lucide-svelte/icons/arrow-right';
	import Logo from '$docs/components/Logo/Logo.svelte';
</script>

<div class="space-y-10">
	<header
		class="h-[75vh] flex flex-col justify-center items-center space-y-8 text-center text-balance"
	>
		<Logo />
		<h1 class="h1 text-black dark:text-white">Floating UI Svelte</h1>
		<p>A Svelte library for position floating elements and create interactions for them.</p>
		<div class="flex gap-4">
			<a href="/tooltips" class="btn-cta">
				<span>Get Started</span>
				<IconArrowRight />
			</a>
			<a
				href="https://github.com/skeletonlabs/floating-ui-svelte"
				target="_blank"
				class="btn-neutral"
			>
				GitHub
			</a>
		</div>
	</header>
</div>
>>>>>>> main
