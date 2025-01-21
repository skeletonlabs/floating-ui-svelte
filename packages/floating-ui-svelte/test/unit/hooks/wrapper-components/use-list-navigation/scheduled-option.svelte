<script lang="ts">
	import { watch } from "../../../../../src/internal/watch.svelte.js";

	let {
		listRef = $bindable(),
		getItemProps,
		active,
		index: propIndex,
	}: {
		listRef: Array<HTMLElement | null>;
		getItemProps: () => Record<string, unknown>;
		active: boolean;
		index: number;
	} = $props();

	let index = $state(propIndex);

	$effect(() => {
		index = propIndex;
	});

	let ref = $state<HTMLElement | null>(null);

	watch.pre(
		() => ref,
		() => {
			if (index !== -1) {
				listRef[index] = ref;
			}
		}
	);
</script>

<div
	role="option"
	aria-selected={active}
	tabindex={active ? 0 : -1}
	bind:this={ref}
	{...getItemProps()}>
	opt
</div>
