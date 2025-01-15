<script lang="ts">
	import type { ComponentProps } from "svelte";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";
	import { useFloating } from "../../../../src/index.js";

	let {
		order,
	}: Omit<
		ComponentProps<typeof FloatingFocusManager>,
		"context" | "children"
	> = $props();

	let open = $state(false);
	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});
</script>

<span tabIndex={0} data-testid="first"></span>
<button
	data-testid="reference"
	bind:this={f.reference}
	onclick={() => (open = true)}>ref</button>

{#if open}
	<FloatingPortal>
		<FloatingFocusManager context={f.context} modal={false} {order}>
			<div data-testid="floating" bind:this={f.floating}>
				<span tabIndex={0} data-testid="inside"></span>
			</div>
		</FloatingFocusManager>
	</FloatingPortal>
{/if}
<span tabIndex={0} data-testid="last"></span>
