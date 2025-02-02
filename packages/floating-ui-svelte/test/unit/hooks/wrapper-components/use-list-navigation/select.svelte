<script lang="ts">
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import FloatingList from "../../../../../src/components/floating-list/floating-list.svelte";
	import {
		useClick,
		useFloating,
		useInteractions,
		useListNavigation,
	} from "../../../../../src/index.js";
	import SelectOption from "./select-option.svelte";

	let activeIndex = $state<number | null>(null);
	let selectedIndex = $state<number | null>(2);
	let open = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
	});

	let elements = $state<Array<HTMLElement | null>>([]);

	const click = useClick(f.context);
	const listNav = useListNavigation(f.context, {
		listRef: () => elements,
		activeIndex: () => activeIndex,
		selectedIndex: () => selectedIndex,
		onNavigate: (idx) => (activeIndex = idx),
	});

	const ints = useInteractions([listNav, click]);
	const options = [
		"core",
		"dom",
		"react",
		"react-dom",
		"vue",
		"react-native",
	];
</script>

<button bind:this={f.elements.reference} {...ints.getReferenceProps()}>
	Open
</button>
{#if open}
	<FloatingFocusManager context={f.context} modal={false}>
		<div
			bind:this={f.elements.floating}
			style={f.floatingStyles}
			{...ints.getFloatingProps()}>
			<FloatingList bind:elements>
				{#each options as option (option)}
					<SelectOption {option} {activeIndex} {selectedIndex} />
				{/each}
			</FloatingList>
		</div>
	</FloatingFocusManager>
{/if}
