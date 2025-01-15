<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

<nav class="Navigation">
	<ul class="NavigationList">{@render children?.()}</ul>
</nav>
