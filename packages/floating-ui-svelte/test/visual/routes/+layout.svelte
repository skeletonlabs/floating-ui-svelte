<script lang="ts">
	import "../app.css";
	import { page } from "$app/state";
	import { styleObjectToString } from "../../../src/internal/style-object-to-string.js";

	let { children } = $props();

	const ROUTES = [
		"tooltip",
		"popover",
		"menu",
		"select",
		"mac-select",
		"emoji-picker",
		"autocomplete",
		"navigation",
		"drawer",
		"arrow",
		"menubar",
		"menu-virtual",
		"omnibox",
		"grid",
		"complex-grid",
	];
</script>

<div>
	<main class="p-12 lg:ml-64">
		{@render children?.()}
	</main>
	<nav
		class="fixed top-0 left-0 flex-col hidden h-full p-8 overflow-y-auto bg-slate-100 lg:w-64 lg:flex">
		<div class="">
			<a href="/" class="block mb-4 text-2xl font-bold"> Tests </a>
			<a
				href="/new"
				class="inline-block px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded">
				New
			</a>
		</div>
		<ul class="flex flex-col text-lg capitalize">
			{#each ROUTES as path (path)}
				<a
					href="/{path}"
					class="py-1"
					style={styleObjectToString({
						color: page.url.pathname === `/${path}` ? "black" : "",
						"font-weight":
							page.url.pathname === `/${path}` ? "bold" : "",
					})}>
					{path.replace("-", " ")}
				</a>
			{/each}
		</ul>
	</nav>
</div>
