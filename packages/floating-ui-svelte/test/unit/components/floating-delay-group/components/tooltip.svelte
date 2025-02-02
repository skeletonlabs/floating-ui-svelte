<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		useDelayGroup,
		useFloating,
		useHover,
		useInteractions,
	} from "../../../../../src/index.js";
	import {
		box,
		type WritableBox,
	} from "../../../../../src/internal/box.svelte.js";
	import { styleObjectToString } from "../../../../../src/internal/style-object-to-string.js";

	let {
		reference,
		label,
	}: {
		reference: Snippet<
			[ref: WritableBox<Element | null>, props: Record<string, unknown>]
		>;
		label: string;
	} = $props();

	let open = $state(false);

	const ref = box<Element | null>(null);

	const f = useFloating({
		elements: {
			reference: () => ref.current,
		},
		onReferenceChange: (v) => {
			ref.current = v;
		},
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const group = useDelayGroup(f.context);

	const ints = useInteractions([
		useHover(f.context, { delay: () => group.delay }),
	]);
</script>

{@render reference(ref, ints.getReferenceProps())}

{#if open}
	<div
		data-testid={`floating-${label}`}
		bind:this={f.elements.floating}
		style={styleObjectToString({
			position: f.strategy,
			top: f.y ? `${f.y}` : "",
			left: f.x ? `${f.x}` : "",
		})}>
		{label}
	</div>
{/if}
