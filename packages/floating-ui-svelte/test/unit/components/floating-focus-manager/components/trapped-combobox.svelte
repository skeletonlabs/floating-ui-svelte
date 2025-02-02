<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useClick,
		useDismiss,
		useFloating,
		useInteractions,
		useRole,
	} from "../../../../../src/index.js";

	let open = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const ints = useInteractions([
		useRole(f.context),
		useDismiss(f.context),
		useClick(f.context),
	]);
</script>

<div class="App">
	<!-- svelte-ignore a11y_role_has_required_aria_props -->
	<input
		bind:this={f.elements.reference}
		{...ints.getReferenceProps()}
		data-testid="input"
		role="combobox" />
	{#if open}
		<FloatingFocusManager context={f.context}>
			<div
				bind:this={f.elements.floating}
				style={f.floatingStyles}
				{...ints.getFloatingProps()}>
				<button>one</button>
				<button>two</button>
			</div>
		</FloatingFocusManager>
	{/if}
</div>
