<script lang="ts">
	import { arrow, useFloating, FloatingArrow } from '$lib/index.js';

	let arrowRef: HTMLElement | null = $state(null);

	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null
	});

	const floating = useFloating({
		placement: 'top',
		elements,
		get middleware() {
			return [arrowRef && arrow({ element: arrowRef })];
		}
	});
</script>

<div class="space-y-10">
	<section>
		<button bind:this={elements.reference} class="btn-rose-sm">Reference</button>
		<div
			bind:this={elements.floating}
			style={floating.floatingStyles}
			class="floating bg-surface-500 text-white p-4 rounded"
		>
			<p>Floating</p>
			<FloatingArrow bind:ref={arrowRef} context={floating.context} classes="fill-surface-500" />
		</div>
	</section>
</div>
