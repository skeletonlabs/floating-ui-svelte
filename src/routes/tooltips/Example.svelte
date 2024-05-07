<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		autoUpdate,
		offset,
		flip,
		arrow,
		useFloating,
		FloatingArrow,
		useHover,
		useInteractions,
		useRole
	} from '$lib/index.js';

	// State
	let open = $state(false);
	let elemArrow: HTMLElement | null = $state(null);

	// Use Floating
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange: (v) => (open = v),
		placement: 'top',
		get middleware() {
			return [offset(10), flip(), elemArrow && arrow({ element: elemArrow })];
		}
	});

	// Interactions
	const hover = useHover(floating.context);
	const role = useRole(floating.context, { role: 'tooltip' });
	const interactions = useInteractions([hover, role]);
</script>

<div>
	<!-- Reference Element -->
	<button
		bind:this={floating.elements.reference}
		{...interactions.getReferenceProps()}
		class="btn-cta"
	>
		Hover Me
	</button>
	<!-- Floating Element -->
	<div
		bind:this={floating.elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
		class="floating"
	>
		{#if open}
			<div
				class="bg-surface-500 text-white p-8 max-w-sm rounded shadow-xl"
				transition:fade={{ duration: 200 }}
			>
				<p>
					A <strong>floating element</strong> is one that floats on top of the UI without disrupting
					the flow, like this one!
				</p>
				<FloatingArrow bind:ref={elemArrow} context={floating.context} class="fill-surface-500" />
			</div>
		{/if}
	</div>
</div>
