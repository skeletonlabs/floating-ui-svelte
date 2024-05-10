<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		autoUpdate,
		offset,
		flip,
		arrow,
		useFloating,
		FloatingArrow,
		useInteractions,
		useRole,
		useClick,
	} from '$lib/index.js';
	import { useDismiss } from '$lib/hooks/useDismiss/index.svelte.js';

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
		},
	});

	// Interactions
	const click = useClick(floating.context);
	const dismiss = useDismiss(floating.context);
	const role = useRole(floating.context, { role: 'menu' });
	const interactions = useInteractions([click, role, dismiss]);
</script>

<div>
	<!-- Reference Element -->
	<button
		bind:this={floating.elements.reference}
		{...interactions.getReferenceProps()}
		class="btn-cta"
	>
		Click Me
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
					You can press the <kbd class="kbd">esc</kbd> key or click outside to
					<strong>*dismiss*</strong> this floating element.
				</p>
				<FloatingArrow bind:ref={elemArrow} context={floating.context} class="fill-surface-500" />
			</div>
		{/if}
	</div>
</div>
