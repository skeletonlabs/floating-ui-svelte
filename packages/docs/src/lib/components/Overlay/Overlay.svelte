<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div data-portal-target></div>

<div data-body>
	{@render children()}
</div>
