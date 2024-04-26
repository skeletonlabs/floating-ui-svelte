<script lang="ts">
	import { drawer } from '$lib/stores.svelte';

	// Icons
	import IconMenu from 'lucide-svelte/icons/menu';
</script>

<header class="sticky top-0 z-10 bg-surface-200/75 dark:bg-surface-800/75 backdrop-blur">
	<div class="container mx-auto flex justify-between gap-4 p-4 lg:px-32">
		<div class="flex items-center gap-4">
			<button type="button" class="inline-block lg:hidden" onclick={() => drawer.toggle()}>
				<IconMenu />
			</button>
			<strong>Floating UI Svelte</strong>
		</div>
		<div class="flex items-center gap-4">
			<a
				href="https://github.com/skeletonlabs/floating-ui-svelte"
				class="hover:underline"
				target="_blank"
			>
				GitHub
			</a>
			<a
				href="https://github.com/skeletonlabs/floating-ui-svelte/releases"
				class="btn"
				target="_blank"
			>
				v1.0.0
			</a>
		</div>
	</div>
</header>
