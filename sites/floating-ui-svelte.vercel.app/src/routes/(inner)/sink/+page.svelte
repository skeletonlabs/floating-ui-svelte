<script lang="ts">
	import {
		FloatingFocusManager,
		FloatingPortal,
		useFloating,
	} from "@skeletonlabs/floating-ui-svelte";

	//bg-blue-800 w-48 z-[1000] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]
	import type { ComponentProps } from "svelte";

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

<span id="first" tabIndex={0} data-testid="first"></span>
<button
	id="reference"
	data-testid="reference"
	bind:this={f.reference}
	onclick={() => (open = true)}>ref</button>
{#if open}
	<FloatingPortal>
		<FloatingFocusManager
			context={f.context}
			modal={false}
			order={["reference", "content"]}>
			<div
				id="floating"
				data-testid="floating"
				bind:this={f.floating}
				class="bg-blue-800 w-48 z-[1000] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
				<span id="inside" tabIndex={0} data-testid="inside"></span>
			</div>
		</FloatingFocusManager>
	</FloatingPortal>
{/if}
<span tabIndex={0} data-testid="last" id="last"></span>
