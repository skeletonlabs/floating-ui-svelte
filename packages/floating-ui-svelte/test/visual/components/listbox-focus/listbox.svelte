<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		useFloating,
		useInteractions,
		useListNavigation,
		useRole,
		useTypeahead,
	} from "../../../../src/index.js";
	import { SelectContext } from "./context.js";
	import FloatingList from "../../../../src/components/floating-list/floating-list.svelte";

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

	const typeahead = useTypeahead(f.context, {
		listRef: () => labels,
		activeIndex: () => activeIndex,
		selectedIndex: () => selectedIndex,
		onMatch: handleTypeaheadMatch,
	});

	const role = useRole(f.context, { role: "listbox" });

	const ints = useInteractions([listNav, typeahead, role]);

	SelectContext.set({
		get activeIndex() {
			return activeIndex;
		},
		get selectedIndex() {
			return selectedIndex;
		},
		getItemProps: ints.getItemProps,
		handleSelect,
	});
</script>

<button onclick={() => (selectedIndex = 1)} data-testid="reference">
	Select
</button>
<div bind:this={f.floating} {...ints.getFloatingProps()}>
	<FloatingList bind:elements {labels}>
		{@render children?.()}
	</FloatingList>
</div>
