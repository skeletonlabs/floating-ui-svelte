<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import FloatingPortal from "../../../../../src/components/floating-portal/floating-portal.svelte";
	import {
		useClick,
		useFloating,
		useInteractions,
	} from "../../../../../src/index.js";

	let { modal = true }: { modal: boolean } = $props();

	let open = $state(false);
	let removed = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const ints = useInteractions([useClick(f.context)]);
</script>

{#if !removed}
	<button
		bind:this={f.elements.reference}
		{...ints.getReferenceProps()}
		data-testid="reference">reference</button>
{/if}
{#if open}
	<FloatingPortal>
		<FloatingFocusManager context={f.context} {modal}>
			<div bind:this={f.elements.floating} {...ints.getFloatingProps()}>
				<button
					data-testid="remove"
					onclick={() => {
						removed = true;
						open = false;
					}}>
					remove
				</button>
			</div>
		</FloatingFocusManager>
	</FloatingPortal>
{/if}
<button data-testid="fallback">fallback</button>
