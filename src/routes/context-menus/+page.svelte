<script lang="ts">
	import { arrow, useFloating, FloatingArrow, autoUpdate, offset } from '$lib/index.js';

	let arrowRef: HTMLElement | null = $state(null);

	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null
	});

	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		open: true,
		placement: 'bottom',
		elements,
		get middleware() {
			return [offset(10), arrowRef && arrow({ element: arrowRef })];
		}
	});
</script>

<div class="space-y-10">
	<section class="preview">
		<div>
			<!-- Reference -->
			<button bind:this={elements.reference} class="btn-rose-sm">Reference</button>
			<!-- Floating -->
			<div bind:this={elements.floating} style={floating.floatingStyles} class="floating">
				{#if floating.isPositioned}
					<div class="bg-surface-500 text-white p-4 rounded shadow-xl">
						<p>This is the floating element</p>
						<FloatingArrow
							bind:ref={arrowRef}
							context={floating.context}
							class="fill-surface-500"
						/>
					</div>
				{/if}
			</div>
		</div>
	</section>
</div>
