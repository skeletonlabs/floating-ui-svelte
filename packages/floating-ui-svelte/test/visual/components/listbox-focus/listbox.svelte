<script lang="ts">
	import type { Snippet } from "svelte";
	import { useFloating, useListNavigation } from "../../../../src/index.js";

	let { children }: { children: Snippet } = $props();

	let activeIndex = $state<number | null>(1);
	let selectedIndex = $state<number | null>(null);

	const f = useFloating({
		open: true,
	});

	let elements = $state<Array<HTMLElement | null>>([]);
	let labels = $state<Array<string>>([]);

	function handleSelect(index: number | null) {
		selectedIndex = index;
	}

	function handleTypeaheadMatch(index: number | null) {
		activeIndex = index;
	}

	const listNav = useListNavigation(f.context, {
		listRef: () => elements,
		activeIndex: () => activeIndex,
		selectedIndex: () => selectedIndex,
		onNavigate: (v) => (activeIndex = v),
		focusItemOnHover: false,
	});
</script>
