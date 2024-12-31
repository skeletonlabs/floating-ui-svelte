<script lang="ts">
import { page } from "$app/stores";
import LoaderIcon from "lucide-svelte/icons/loader";
import SearchIcon from "lucide-svelte/icons/search";
import Dialog from "./Dialog.svelte";

let open = $state(false);
let query = $state("");

const searchPromise = $derived.by(async () => {
	if (query === "") {
		return [];
	}

	// FIXME: https://github.com/sveltejs/eslint-plugin-svelte/issues/652
	// eslint-disable-next-line svelte/valid-compile
	const result = await $page.data.pagefind.debouncedSearch(query, {}, 250);

	if (result === null) {
		return [];
	}

	return await Promise.all(result.results.map((result) => result.data()));
});

$effect(() => {
	function onKeydown(event: KeyboardEvent) {
		if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			open = true;
		}
	}

	document.addEventListener("keydown", onKeydown);

	return () => {
		document.removeEventListener("keydown", onKeydown);
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
		<div class="flex flex-col gap-1 p-4" tabindex="-1">
			{#if query === ''}
				<p class="text-lg text-center py-16">What can we help you find?</p>
			{:else}
				{#await searchPromise}
					<p class="text-lg text-center py-16">
						<LoaderIcon class="inline animate-spin" size={16} />
					</p>
				{:then results}
					{#if results.length > 0}
						<nav>
							<ul class="space-y-4">
								{#each results as result}
									<li>
										<a
											href={result.url.replace('.html', '')}
											class="block text-xl font-semibold hover:bg-surface-500 focus:bg-surface-500 transition p-1 rounded-md"
										>
											{result.meta.title}

											<!-- eslint-disable-next-line svelte/no-at-html-tags-->
											<p class="text-sm line-clamp-2">{@html result.excerpt}</p>
										</a>
									</li>
								{/each}
							</ul>
						</nav>
					{:else if query !== ''}
						<p class="text-lg text-center py-16">No results found for "{query}"</p>
					{/if}
				{/await}
			{/if}
		</div>
	</div>
</Dialog>

<style lang="postcss">
	:global(mark) {
		@apply bg-rose-400 rounded-md px-0.5;
	}
</style>
