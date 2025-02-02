<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useClick,
		useDismiss,
		useFloating,
		useInteractions,
	} from "../../../../../src/index.js";
	import ConnectedDrawer from "./connected-drawer.svelte";

	let open = $state(false);
	let isDrawerOpen = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const ints = useInteractions([useClick(f.context), useDismiss(f.context)]);
</script>

<button
	bind:this={f.elements.reference}
	data-testid="parent-reference"
	{...ints.getReferenceProps()}>ref</button>
{#if open}
	<FloatingFocusManager context={f.context}>
		<div bind:this={f.elements.floating} {...ints.getFloatingProps()}>
			Parent Floating
			<button
				data-testid="parent-floating-reference"
				onclick={() => {
					isDrawerOpen = true;
					open = false;
				}}>parent floating ref</button>
		</div>
	</FloatingFocusManager>
{/if}
{#if isDrawerOpen}
	<ConnectedDrawer
		open={isDrawerOpen}
		onOpenChange={(v) => (isDrawerOpen = v)} />
{/if}
