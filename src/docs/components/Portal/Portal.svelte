<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let element: HTMLElement | null = $state(null);

	$effect.pre(() => {
		const target = document.querySelector('[data-portal-target]');
		if (element === null || target === null) {
			return;
		}

		target.appendChild(element);

		return () => {
			if (element === null) {
				return;
			}
			element.remove();
		};
	});
</script>

<div class="contents" bind:this={element}>
	{@render children()}
</div>
