<script lang="ts">
	import {
		useClick,
		useFloating,
		useInteractions,
		useListNavigation,
	} from "../../../../../src/index.js";

	let open = $state(false);
	let list = $state<Array<HTMLLIElement | null>>([]);
	let activeIndex = $state<number | null>(null);
	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
	});

	const ints = useInteractions([
		useClick(f.context),
		useListNavigation(f.context, {
			listRef: () => list,
			activeIndex: () => activeIndex,
			onNavigate: (v) => (activeIndex = v),
		}),
	]);
</script>

<!-- svelte-ignore a11y_role_has_required_aria_props -->
<input
	role="combobox"
	bind:this={f.elements.reference}
	{...ints.getReferenceProps()} />
{#if open}
	<div
		role="menu"
		bind:this={f.elements.floating}
		{...ints.getFloatingProps()}>
		<ul>
			{#each ["one", "two", "three"] as string, index}
				<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<li
					data-testid={`item-${index}`}
					aria-selected={activeIndex === index}
					tabindex={-1}
					bind:this={list[index]}
					{...ints.getItemProps()}>
					{string}
				</li>
			{/each}
		</ul>
	</div>
{/if}
