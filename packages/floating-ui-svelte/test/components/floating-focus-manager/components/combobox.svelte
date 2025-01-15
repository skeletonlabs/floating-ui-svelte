<script lang="ts">
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import { useFloating } from "../../../../src/index.js";

	let {
		outsideElementsInert = false,
		modal = true,
	}: { outsideElementsInert?: boolean; modal?: boolean } = $props();

	let open = $state(false);
	const floating = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});
</script>

<!-- svelte-ignore a11y_role_has_required_aria_props -->
<input
	role="combobox"
	data-testid="reference"
	bind:this={floating.reference}
	onfocus={() => (open = true)} />
<button data-testid="btn-1">btn1</button>
<button data-testid="btn-2">btn2</button>

{#if open}
	<FloatingFocusManager
		context={floating.context}
		{modal}
		order={["reference"]}
		{outsideElementsInert}>
		<div
			role="listbox"
			bind:this={floating.floating}
			data-testid="floating">
		</div>
	</FloatingFocusManager>
{/if}
