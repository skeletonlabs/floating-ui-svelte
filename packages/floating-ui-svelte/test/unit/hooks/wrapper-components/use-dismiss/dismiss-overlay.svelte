<script lang="ts">
	import type { Snippet } from "svelte";
	import { styleObjectToString } from "../../../../../src/internal/style-object-to-string.js";

	let { children }: { children: Snippet } = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	style={styleObjectToString({ width: "100vw", height: "100vh" })}
	onpointerdown={(e) => e.stopPropagation()}
	onkeydown={(e) => {
		if (e.key === "Escape") {
			e.stopPropagation();
		}
	}}>
	<span>outside</span>
	{@render children?.()}
</div>
