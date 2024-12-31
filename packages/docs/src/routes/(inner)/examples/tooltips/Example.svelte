<script lang="ts">
import {
	FloatingArrow,
	arrow,
	autoUpdate,
	flip,
	offset,
	useDismiss,
	useFloating,
	useHover,
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
	get open() {
		return open;
	},
	onOpenChange: (v) => (open = v),
	placement: "top",
	get middleware() {
		return [offset(10), flip(), elemArrow && arrow({ element: elemArrow })];
	},
});

// Interactions
const role = useRole(floating.context, { role: "tooltip" });
const hover = useHover(floating.context, { move: false });
const dismiss = useDismiss(floating.context);
const interactions = useInteractions([role, hover, dismiss]);
</script>

<div>
	<!-- Reference Element -->
	<button
		bind:this={floating.elements.reference}
		{...interactions.getReferenceProps()}
		class="btn-gradient"
	>
		Hover Me
	</button>
	<!-- Floating Element -->
	{#if open}
		<div
			bind:this={floating.elements.floating}
			style={floating.floatingStyles}
			{...interactions.getFloatingProps()}
			class="floating popover-neutral"
			transition:fade={{ duration: 200 }}
		>
			<p>
				A <strong>floating element</strong> is one that floats on top of the UI without disrupting the
				flow, like this one!
			</p>
			<FloatingArrow bind:ref={elemArrow} context={floating.context} fill="#575969" />
		</div>
	{/if}
</div>
