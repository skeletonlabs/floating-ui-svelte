<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import FloatingPortal from "../../../../../src/components/floating-portal/floating-portal.svelte";
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
		bind:this={f.reference}
		{...ints.getReferenceProps()}
		data-testid="input"
		role="combobox" />
	{#if open}
		<FloatingPortal>
			<FloatingFocusManager
				context={f.context}
				initialFocus={-1}
				modal={false}>
				<div
					bind:this={f.floating}
					style={f.floatingStyles}
					{...ints.getFloatingProps()}>
					<button>one</button>
					<button>two</button>
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	{/if}
	<button>outside</button>
</div>
