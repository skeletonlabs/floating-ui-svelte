<script lang="ts">
	import {
		autoUpdate,
		offset,
		arrow,
		useFloating,
		FloatingArrow,
		useHover,
		useInteractions,
		useRole
	} from '$lib/index.js';

	// State
	let open = $state(false);

	// Element References
	let elemArrow: HTMLElement | null = $state(null);
	let elemReference: HTMLElement | null = $state(null);
	let elemFloating: HTMLElement | null = $state(null);

	// Use Floating
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange: (v) => (open = v),
		placement: 'top',
		elements: {
			get reference() {
				return elemReference;
			},
			get floating() {
				return elemFloating;
			}
		},
		get middleware() {
			return [offset(10), elemArrow && arrow({ element: elemArrow })];
		}
	});

	// Interactions
	const hover = useHover(floating.context);
	const role = useRole(floating.context, { role: 'tooltip' });
	const interactions = useInteractions([hover, role]);
</script>

<div>
	<!-- Reference Element -->
	<button bind:this={elemReference} {...interactions.getReferenceProps()} class="btn-rose-sm">
		Hover Me
	</button>
	<!-- Floating Element -->
	<div
		bind:this={elemFloating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
		class="floating"
	>
		{#if floating.isPositioned}
			<div class="bg-surface-500 text-white p-4 rounded shadow-xl">
				<p>This is the floating element</p>
				<FloatingArrow bind:ref={elemArrow} context={floating.context} class="fill-surface-500" />
			</div>
		{/if}
	</div>
</div>
