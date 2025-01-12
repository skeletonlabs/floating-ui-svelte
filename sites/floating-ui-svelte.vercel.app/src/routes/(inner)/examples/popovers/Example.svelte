<script lang="ts">
	import {
		FloatingArrow,
		arrow,
		autoUpdate,
		flip,
		offset,
		useClick,
		useDismiss,
		useFloating,
		useInteractions,
		useRole,
	} from "@skeletonlabs/floating-ui-svelte";
	import { fade } from "svelte/transition";

	// State
	let open = $state(false);
	let elemArrow: HTMLElement | null = $state(null);

	// Use Floating
	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
		placement: "top",
		middleware: () => [
			offset(10),
			flip(),
			elemArrow && arrow({ element: elemArrow }),
		],
	});

	// Interactions
	const role = useRole(floating.context);
	const click = useClick(floating.context);
	const dismiss = useDismiss(floating.context);
	const interactions = useInteractions([role, click, dismiss]);
</script>

<div>
	<!-- Reference Element -->
	<button
		bind:this={floating.reference}
		{...interactions.getReferenceProps()}
		class="btn-gradient">
		Click Me
	</button>
	<!-- Floating Element -->
	{#if open}
		<div
			bind:this={floating.floating}
			style={floating.floatingStyles}
			{...interactions.getFloatingProps()}
			class="floating popover-neutral"
			transition:fade={{ duration: 200 }}>
			<p>
				You can press the <kbd class="kbd">esc</kbd> key or click
				outside to
				<strong>*dismiss*</strong> this floating element.
			</p>
			<FloatingArrow
				bind:ref={elemArrow}
				context={floating.context}
				fill="#575969" />
		</div>
	{/if}
</div>
