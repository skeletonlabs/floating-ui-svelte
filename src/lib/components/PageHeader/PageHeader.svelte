<script lang="ts">
	import { createDrawer } from '$lib/stores.svelte';

	// Icons
	import IconMenu from 'lucide-svelte/icons/menu';

	// Local
	const drawer = createDrawer();
</script>

<header
	class="sticky top-0 z-10 flex justify-between gap-4 bg-surface-200/75 dark:bg-surface-800/75 backdrop-blur p-4 lg:px-32"
>
	<div class="flex items-center gap-4">
		<button type="button" class="inline-block lg:hidden" onclick={() => drawer.toggle()}
			><IconMenu /></button
		>
		<a href="https://github.com/skeletonlabs/floating-ui-svelte" class="hover:underline">GitHub</a>
	</div>
	<a href="https://github.com/skeletonlabs/floating-ui-svelte" class="btn">Version 1.0.0</a>
</header>
