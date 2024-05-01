<script lang="ts">
	import FloatingArrow from '$lib/components/FloatingArrow/FloatingArrow.svelte';

	let elemRef: HTMLElement;

	// MOCKED ---------------
	// prettier-ignore
	let mockContext = {
		placement: 'bottom',
		elements: { floating: '' },
		middlewareData: { arrow: '' }
	};
	// ----------------------
</script>

<div class="space-y-10">
	<section class="space-y-4">
		<FloatingArrow ref={elemRef} context={mockContext} />
	</section>
	<section class="space-y-4">
		<p>Page: Context Menus</p>
	</section>
</div>
