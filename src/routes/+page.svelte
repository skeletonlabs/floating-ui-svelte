<script lang="ts">
	import { autoUpdate, flip, offset } from '@floating-ui/dom';
	import { useFloating } from '$lib/hooks/use-floating.svelte.js';
	import type { Placement } from '@floating-ui/dom';

	const placement = $state<Placement>('left');
	const elements = $state<{ reference?: HTMLElement; floating?: HTMLElement }>({});
	const { floatingStyles } = useFloating({
		get placement() {
			return placement;
		},
		middleware: [flip(), offset(2)],
		elements,
		whileElementsMounted: autoUpdate
	});
</script>

<button
	class="fixed left-4 top-4 rounded-md bg-green-300 p-2"
	onclick={() => {
		elements.floating?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
	}}
>
	Bring floating into view
</button>

<div class="flex h-[300vh] w-[300vw] items-center justify-center">
	<div>
		<button class="rounded-md bg-cyan-300 p-2" bind:this={elements.reference}>Reference</button>
		<div
			class="absolute left-0 top-0 w-max rounded-md bg-red-300 p-4"
			bind:this={elements.floating}
			style={floatingStyles.value}
		>
			Floating
		</div>
	</div>
</div>
