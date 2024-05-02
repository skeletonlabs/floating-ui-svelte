<script lang="ts">
	import { arrow, useFloating, FloatingArrow } from '$lib/index.js';

	let elemRef: HTMLElement;

	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null
	});

	const floating = useFloating({
		placement: 'top',
		elements,
		middleware: [arrow({ element: elemRef })]
	});
</script>

<div bind:this={elements.reference}>Reference</div>
<div bind:this={elements.floating} style={floating.floatingStyles}>Floating</div>

<div class="space-y-10">
	<section class="space-y-4">
		<FloatingArrow ref={elemRef} context={floating.context} />
	</section>
	<section class="space-y-4">
		<p>Page: Context Menus</p>
	</section>
</div>
