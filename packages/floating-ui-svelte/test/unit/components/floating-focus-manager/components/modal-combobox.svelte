<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useClick,
		useFloating,
		useInteractions,
	} from "../../../../../src/index.js";

	let open = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const ints = useInteractions([useClick(f.context)]);
</script>

<!-- svelte-ignore a11y_role_has_required_aria_props -->
<input
	bind:this={f.elements.reference}
	{...ints.getReferenceProps()}
	data-testid="input"
	role="combobox" />
{#if open}
	<FloatingFocusManager context={f.context} initialFocus={-1}>
		<div
			bind:this={f.elements.floating}
			{...ints.getFloatingProps()}
			data-testid="floating">
			<button tabindex={-1}>one</button>
		</div>
	</FloatingFocusManager>
{/if}
<!-- svelte-ignore a11y_consider_explicit_label, element_invalid_self_closing_tag -->
<button data-testid="after" />
