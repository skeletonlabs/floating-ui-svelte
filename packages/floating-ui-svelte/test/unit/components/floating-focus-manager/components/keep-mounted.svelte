<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		useClick,
		useDismiss,
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

	const ints = useInteractions([useClick(f.context), useDismiss(f.context)]);
</script>

<button
	data-testid="reference"
	bind:this={f.reference}
	{...ints.getReferenceProps()}>reference</button>
<FloatingFocusManager context={f.context} disabled={!open} modal={false}>
	<div
		bind:this={f.floating}
		data-testid="floating"
		{...ints.getFloatingProps()}>
		<button data-testid="child">child</button>
	</div>
</FloatingFocusManager>
<button data-testid="after">after</button>
