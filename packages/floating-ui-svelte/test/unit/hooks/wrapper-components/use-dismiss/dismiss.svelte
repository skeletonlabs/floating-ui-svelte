<script lang="ts">
	import { expect } from "vitest";
	import {
		useDismiss,
		useFloating,
		useInteractions,
		type UseDismissOptions,
	} from "../../../../../src/index.js";

	let props: UseDismissOptions & { onClose?: () => void } = $props();

	let open = $state(true);
	const f = useFloating({
		open: () => open,
		onOpenChange: (newOpen, _, reason) => {
			open = newOpen;
			if (props.outsidePress) {
				expect(reason).toBe("outside-press");
			} else if (props.escapeKey) {
				expect(reason).toBe("escape-key");
				if (!newOpen) {
					props.onClose?.();
				}
			} else if (props.referencePress) {
				expect(reason).toBe("reference-press");
			} else if (props.ancestorScroll) {
				expect(reason).toBe("ancestor-scroll");
			}
		},
	});

	const ints = useInteractions([useDismiss(f.context, props)]);
</script>

<button bind:this={f.reference} {...ints.getReferenceProps()}> open </button>

{#if open}
	<div bind:this={f.floating} role="tooltip" {...ints.getFloatingProps()}>
		<input />
	</div>
{/if}
