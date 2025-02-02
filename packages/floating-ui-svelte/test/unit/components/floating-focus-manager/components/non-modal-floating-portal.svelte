<script lang="ts">
	import type { ComponentProps } from "svelte";
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import FloatingPortal from "../../../../../src/components/floating-portal/floating-portal.svelte";
	import { useFloating } from "../../../../../src/index.js";

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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span id="first" tabindex={0} data-testid="first"></span>
<button
	id="reference"
	data-testid="reference"
	bind:this={f.elements.reference}
	onclick={() => (open = true)}>ref</button>
{#if open}
	<FloatingPortal>
		<FloatingFocusManager context={f.context} modal={false} {order}>
			<div
				id="floating"
				data-testid="floating"
				bind:this={f.elements.floating}
				class="bg-blue-800 w-48 z-[1000] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<span id="inside" tabindex={0} data-testid="inside"></span>
			</div>
		</FloatingFocusManager>
	</FloatingPortal>
{/if}
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span tabindex={0} data-testid="last" id="last"></span>
