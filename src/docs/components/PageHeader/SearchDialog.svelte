<script lang="ts">
	import Dialog from '../Dialog/Dialog.svelte';
	import SearchIcon from 'lucide-svelte/icons/search';
	import { page } from '$app/stores';

	let open = $state(false);
	let query = $state('');

	const searchPromise = $derived.by(async () => {
		if (query === '') {
			return [];
		}

		// FIXME: https://github.com/sveltejs/eslint-plugin-svelte/issues/652
		// eslint-disable-next-line svelte/valid-compile
		const result = await $page.data.pagefind.search(query);

		if (result === null) {
			return [];
		}

		return await Promise.all(result.results.map((result) => result.data()));
	});

	$effect(() => {
		function onKeydown(event: KeyboardEvent) {
			if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				open = true;
			}
		}

		document.addEventListener('keydown', onKeydown);

		return () => {
			document.removeEventListener('keydown', onKeydown);
		};
	});
</script>

<button
	class="flex gap-4 items-center border border-surface-600 px-4 py-1 rounded-md"
	onclick={() => (open = true)}
>
	<p class="hidden md:block text-lg">Search</p>
	<SearchIcon size={20} />
</button>

<Dialog bind:open>
	<div class="divide-y-4 divide-surface-600">
		<div class="relative p-4">
			<input
				class="bg-transparent text-2xl outline-none pl-10 w-full"
				placeholder="Search the docs..."
				bind:value={query}
			/>
			<SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2" />
		</div>
		<div class="p-4 flex flex-col gap-1 max-h-[600px] overflow-auto min-h-[100px]" tabindex="-1">
			{#await searchPromise then results}
				{#if results.length > 0}
					<p class="text-lg text-center">
						Found {results.length}
						{results.length === 1 ? 'result' : 'results'} for "{query}":
					</p>
					<nav>
						<ul class="flex flex-col gap-4">
							{#each results as result}
								<li>
									<a href={result.url.replace('.html', '')} class="text-xl font-semibold"
										>{result.meta.title}</a
									>
									<!-- eslint-disable-next-line svelte/no-at-html-tags-->
									<p class="text-sm line-clamp-2">{@html result.excerpt}</p>
								</li>
							{/each}
						</ul>
					</nav>
				{:else if query !== ''}
					<p class="text-lg text-center">No results found for "{query}"</p>
				{/if}
			{/await}
		</div>
	</div>
</Dialog>

<style lang="postcss">
	:global(mark) {
		@apply bg-rose-400 rounded-md px-0.5;
	}
</style>
