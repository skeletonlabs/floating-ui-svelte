<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		useDismiss,
		useFloating,
		useInteractions,
	} from "../../../../../src/index.js";
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		children,
		id,
		modal,
	}: { children?: Snippet; id: string; modal?: boolean | null } = $props();

	let open = $state(true);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
	});

	const dismiss = useDismiss(f.context);

	const ints = useInteractions([dismiss]);
</script>

{#snippet Dialog()}
	<div
		role="dialog"
		data-testid={id}
		bind:this={f.floating}
		{...ints.getFloatingProps()}>
		{@render children?.()}
	</div>
{/snippet}

<button bind:this={f.reference} {...ints.getReferenceProps()}>open</button>
{#if open}
	{#if modal == null}
		{@render Dialog()}
	{:else}
		<FloatingFocusManager context={f.context} {modal}>
			{@render Dialog()}
		</FloatingFocusManager>
	{/if}
{/if}
