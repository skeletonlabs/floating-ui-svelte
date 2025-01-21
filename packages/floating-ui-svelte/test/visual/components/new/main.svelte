<script lang="ts">
	import {
		useDismiss,
		useFloating,
		useInteractions,
		useListNavigation,
	} from "../../../../src/index.js";
	import { styleObjectToString } from "../../../../src/internal/style-object-to-string.js";

	let open = $state(false);
	let inputValue = $state("");
	let activeIndex = $state<number | null>(null);

	let listRef = $state<Array<HTMLElement | null>>([]);

	const data = ["a", "ab", "abc", "abcd"];

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => (open = v),
	});

	const ints = useInteractions([
		useDismiss(f.context),
		useListNavigation(f.context, {
			listRef: () => listRef,
			activeIndex: () => activeIndex,
			onNavigate: (index) => {
				activeIndex = index;
			},
			virtual: true,
			loop: true,
		}),
	]);

	$effect(() => {
		if (inputValue) {
			activeIndex = null;
			open = true;
		} else {
			open = false;
		}
	});

	const items = $derived(
		data.filter((item) =>
			item.toLowerCase().startsWith(inputValue.toLowerCase())
		)
	);
</script>

<input
	bind:this={f.reference}
	{...ints.getReferenceProps({
		placeholder: "Enter fruit",
		"aria-autocomplete": "list",
	})}
	bind:value={inputValue}
	data-testid="reference" />
{#if open}
	<div
		bind:this={f.floating}
		{...ints.getFloatingProps({
			style: styleObjectToString({
				position: f.strategy,
				left: f.x ? `${f.x}` : "",
				top: f.y ? `${f.y}` : "",
				background: "#eee",
				color: "black",
				"overflow-y": "auto",
			}),
		})}
		data-testid="floating">
		<ul>
			{#each items as item, index (item)}
				<li
					bind:this={listRef[index]}
					{...ints.getItemProps({
						onclick: () => {
							inputValue = item;
							open = false;
							f.domReference?.focus();
						},
					})}>
					{item}
				</li>
			{/each}
		</ul>
	</div>
{/if}
<div data-testid="active-index">{activeIndex}</div>
