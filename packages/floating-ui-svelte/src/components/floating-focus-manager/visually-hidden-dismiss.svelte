<script lang="ts" module>
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { WithRef } from "../../types.js";
	import { HIDDEN_STYLES_STRING } from "../focus-guard.svelte";

	interface VisuallyHiddenDismissProps
		extends HTMLButtonAttributes,
			WithRef<HTMLButtonElement> {}

	export type { VisuallyHiddenDismissProps };
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...rest
	}: VisuallyHiddenDismissProps = $props();
</script>

<button
	{...rest}
	bind:this={ref}
	type="button"
	tabindex={-1}
	style={HIDDEN_STYLES_STRING}>
	{@render children?.()}
</button>
