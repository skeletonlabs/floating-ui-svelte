<script lang="ts">
	import {
		autoUpdate,
		offset,
		useClick,
		useDismiss,
		useFloating,
		useInteractions,
	} from '$lib/index.js';
	import SearchIcon from 'lucide-svelte/icons/search';
	import LoaderIcon from 'lucide-svelte/icons/loader';
	import type { Pagefind } from '$docs/types.js';

	let pagefind: Pagefind | null = null;

	$effect(() => {
		// @ts-expect-error - Pagefind will be present at runtime
		import('/pagefind/pagefind.js').then((module: Pagefind) => {
			pagefind = module;
			pagefind.init();
		});
	});

	let open = $state(false);

	const floating = useFloating({
		whileElementsMounted: autoUpdate,
		get open() {
			return open;
		},
		onOpenChange(value) {
			open = value;
		},
		middleware: [offset(10)],
	});

	// TODO: Move to `useFocus` once https://github.com/skeletonlabs/floating-ui-svelte/pull/99 is merged
	const click = useClick(floating.context);
	const dismiss = useDismiss(floating.context);
	const interactions = useInteractions([click, dismiss]);

	let query = $state('');

	const searchPromise = $derived.by(async () => {
		if (pagefind === null || query === '') {
			return [];
		}
		const result = await pagefind.debouncedSearch(query);

		if (result === null) {
			return [];
		}

		return await Promise.all(result.results.map((result) => result.data()));
	});

	$effect(() => {
		if (query !== '') {
			open = true;
		}
	});
</script>

<form class="relative">
	<input
		bind:value={query}
		bind:this={floating.elements.reference}
		{...interactions.getReferenceProps()}
		placeholder="Search..."
		class="bg-surface-600 px-2 py-1 rounded-md"
	/>
	<div class="absolute top-1/2 -translate-y-1/2 right-4">
		{#if query !== ''}
			{#await searchPromise}
				<LoaderIcon size={20} class="animate-spin" />
			{:then}
				<SearchIcon size={20} />
			{/await}
		{:else}
			<SearchIcon size={20} />
		{/if}
	</div>
</form>

{#if open && query !== ''}
	<nav
		class="floating bg-surface-600 p-4 rounded-md max-h-[50vh] overflow-y-auto shadow-2xl flex flex-col gap-4"
		bind:this={floating.elements.floating}
		{...interactions.getFloatingProps()}
		style={floating.floatingStyles}
	>
		{#await searchPromise}
			<p class="text-center">Loading results for: "{query}"</p>
		{:then results}
			{#if results.length > 0}
				<p class="text-center">{results.length} results for: "{query}"</p>
				<ul class="flex flex-col gap-4">
					{#each results as result}
						<ol>
							<a
								class="flex flex-col gap-2"
								onclick={() => (query = '')}
								href={result.url.replace('.html', '')}
							>
								<p class="font-bold text-xl">{result.meta.title}</p>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								<p class="max-w-[50ch] text-ellipsis text-sm">{@html result.excerpt}</p>
							</a>
						</ol>
					{/each}
				</ul>
			{:else if query !== ''}
				<p>No results found for query: "{query}"</p>
			{:else}
				<p>Type something to see results</p>
			{/if}
		{/await}
	</nav>
{/if}

<style lang="postcss">
	:global(mark) {
		@apply bg-rose-400 rounded-md px-0.5;
	}
</style>
