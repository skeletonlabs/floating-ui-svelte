<script lang="ts">
	import { version } from '$app/environment';
	import { drawer } from '$docs/stores.svelte';

	// Icons
	import IconMenu from 'lucide-svelte/icons/menu';
	import SearchDialog from './SearchDialog.svelte';
</script>

<header
	class="sticky top-0 z-10 bg-surface-200/75 dark:bg-surface-800/75 backdrop-blur border-b border-surface-500/20"
>
	<div class="container mx-auto flex justify-between gap-4 p-4 lg:px-32">
		<div class="flex items-center gap-4">
			<button type="button" class="inline-block lg:hidden" onclick={() => drawer.toggle()}>
				<IconMenu />
			</button>
			<a href="/" class="font-bold">Floating UI Svelte</a>
		</div>
		<SearchDialog />
		<div class="flex items-center gap-4">
			<a
				href="https://github.com/skeletonlabs/floating-ui-svelte"
				class="hover:underline"
				target="_blank"
			>
				GitHub
			</a>
			<a href="https://discord.gg/EXqV7W8MtY" class="hover:underline" target="_blank"> Discord </a>
			<a
				href="https://github.com/skeletonlabs/floating-ui-svelte/releases"
				class="btn-rose-sm"
				target="_blank"
			>
				v{version}
			</a>
		</div>
	</div>
</header>
