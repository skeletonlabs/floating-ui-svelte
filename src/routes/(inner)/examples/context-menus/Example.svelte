<script lang="ts">
	import { safePolygon } from '$lib/other/safePolygon/index.svelte.js';
	import {
		useClick,
		useFloating,
		useHover,
		useInteractions,
	} from '@skeletonlabs/floating-ui-svelte';

	let open = $state(false);

	const floating = useFloating({
		get open() {
			return open;
		},
		onOpenChange(v) {
			open = v;
			submenuOpen = false;
		},
		placement: 'bottom-start',
	});
	const click = useClick(floating.context);
	const interactions = useInteractions([click]);

	let submenuOpen = $state(false);

	const submenuFloating = useFloating({
		get open() {
			return submenuOpen;
		},
		onOpenChange(v) {
			submenuOpen = v;
		},
		placement: 'right-start',
	});

	const submenuHover = useHover(submenuFloating.context, {
		handleClose: safePolygon({ blockPointerEvents: true }),
	});

	const submenuInteractions = useInteractions([submenuHover]);
</script>

<button bind:this={floating.elements.reference} {...interactions.getReferenceProps()}
	>Reference</button
>

{#if open}
	<div
		class="bg-red-700"
		bind:this={floating.elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
	>
		<button
			bind:this={submenuFloating.elements.reference}
			{...submenuInteractions.getReferenceProps()}>Reference</button
		>
		{#if submenuOpen}
			<div
				class="bg-cyan-700 h-[200px]"
				bind:this={submenuFloating.elements.floating}
				style={submenuFloating.floatingStyles}
				{...submenuInteractions.getFloatingProps()}
			>
				Floating
			</div>
		{/if}
	</div>
{/if}
