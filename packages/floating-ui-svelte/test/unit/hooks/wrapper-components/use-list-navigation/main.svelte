<script lang="ts">
	import {
		useClick,
		useFloating,
		useInteractions,
		useListNavigation,
		type UseListNavigationOptions,
	} from "../../../../../src/index.js";

	let props: Omit<Partial<UseListNavigationOptions>, "listRef"> = $props();

	let open = $state(false);
	let listRef = $state<Array<HTMLLIElement | null>>([]);
	let activeIndex = $state<number | null>(null);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
	});

	const ints = useInteractions([
		useClick(f.context),
		useListNavigation(f.context, {
			...props,
			listRef: () => listRef,
			activeIndex: () => activeIndex,
			onNavigate: (index) => {
				activeIndex = index;
				props.onNavigate?.(index);
			},
		}),
	]);
</script>

<button {...ints.getReferenceProps()} bind:this={f.reference}> Open </button>
{#if open}
	<div role="menu" {...ints.getFloatingProps()} bind:this={f.floating}>
		<ul>
			{#each ["one", "two", "three"] as str, index (str)}
				<li
					role="option"
					data-testid={`item-${index}`}
					aria-selected={activeIndex === index}
					tabindex={-1}
					{...ints.getItemProps()}
					bind:this={listRef[index]}>
					{str}
				</li>
			{/each}
		</ul>
	</div>
{/if}
