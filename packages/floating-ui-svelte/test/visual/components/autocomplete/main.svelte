<script lang="ts" module>
	export const data = [
		"Alfalfa Sprouts",
		"Apple",
		"Apricot",
		"Artichoke",
		"Asian Pear",
		"Asparagus",
		"Atemoya",
		"Avocado",
		"Bamboo Shoots",
		"Banana",
		"Bean Sprouts",
		"Beans",
		"Beets",
		"Belgian Endive",
		"Bell Peppers",
		"Bitter Melon",
		"Blackberries",
		"Blueberries",
		"Bok Choy",
		"Boniato",
		"Boysenberries",
		"Broccoflower",
		"Broccoli",
		"Brussels Sprouts",
		"Cabbage",
		"Cactus Pear",
		"Cantaloupe",
		"Carambola",
		"Carrots",
		"Casaba Melon",
		"Cauliflower",
		"Celery",
		"Chayote",
		"Cherimoya",
		"Cherries",
		"Coconuts",
		"Collard Greens",
		"Corn",
		"Cranberries",
		"Cucumber",
		"Dates",
		"Dried Plums",
		"Eggplant",
		"Endive",
		"Escarole",
		"Feijoa",
		"Fennel",
		"Figs",
		"Garlic",
		"Gooseberries",
		"Grapefruit",
		"Grapes",
		"Green Beans",
		"Green Onions",
		"Greens",
		"Guava",
		"Hominy",
		"Honeydew Melon",
		"Horned Melon",
		"Iceberg Lettuce",
		"Jerusalem Artichoke",
		"Jicama",
		"Kale",
		"Kiwifruit",
		"Kohlrabi",
		"Kumquat",
		"Leeks",
		"Lemons",
		"Lettuce",
		"Lima Beans",
		"Limes",
		"Longan",
		"Loquat",
		"Lychee",
		"Madarins",
		"Malanga",
		"Mandarin Oranges",
		"Mangos",
		"Mulberries",
		"Mushrooms",
		"Napa",
		"Nectarines",
		"Okra",
		"Onion",
		"Oranges",
		"Papayas",
		"Parsnip",
		"Passion Fruit",
		"Peaches",
		"Pears",
		"Peas",
		"Peppers",
		"Persimmons",
		"Pineapple",
		"Plantains",
		"Plums",
		"Pomegranate",
		"Potatoes",
		"Prickly Pear",
		"Prunes",
		"Pummelo",
		"Pumpkin",
		"Quince",
		"Radicchio",
		"Radishes",
		"Raisins",
		"Raspberries",
		"Red Cabbage",
		"Rhubarb",
		"Romaine Lettuce",
		"Rutabaga",
		"Shallots",
		"Snow Peas",
		"Spinach",
		"Sprouts",
		"Squash",
		"Strawberries",
		"String Beans",
		"Sweet Potato",
		"Tangelo",
		"Tangerines",
		"Tomatillo",
		"Tomato",
		"Turnip",
		"Ugli Fruit",
		"Water Chestnuts",
		"Watercress",
		"Watermelon",
		"Waxed Beans",
		"Yams",
		"Yellow Squash",
		"Yuca/Cassava",
		"Zucchini Squash",
	];
</script>

<script lang="ts">
	import { autoUpdate, flip, offset, size } from "@floating-ui/dom";

	import {
		useDismiss,
		useFloating,
		useInteractions,
		useListNavigation,
		useRole,
	} from "../../../../src/index.js";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import AutocompleteItem from "./autocomplete-item.svelte";

	let open = $state(false);
	let inputValue = $state("");
	let activeIndex = $state<number | null>(null);

	let listRef = $state<Array<HTMLElement | null>>([]);

	const f = useFloating<HTMLInputElement>({
		whileElementsMounted: autoUpdate,
		open: () => open,
		onOpenChange: (v) => (open = v),
		middleware: [
			offset(5),
			flip({ padding: 10 }),
			size({
				apply({ rects, elements, availableHeight }) {
					Object.assign(elements.floating.style, {
						width: `${rects.reference.width}px`,
						maxHeight: `${availableHeight}px`,
					});
				},
				padding: 10,
			}),
		],
	});

	const ints = useInteractions([
		useRole(f.context, { role: "combobox" }),
		useDismiss(f.context),
		useListNavigation(f.context, {
			listRef: () => listRef,
			activeIndex: () => activeIndex,
			onNavigate: (v) => (activeIndex = v),
			virtual: true,
			loop: true,
			allowEscape: true,
		}),
	]);

	const filteredItems = $derived(
		data.filter((item) =>
			item.toLowerCase().startsWith(inputValue.toLowerCase())
		)
	);
</script>

<h1 class="text-5xl font-bold mb-8">Autocomplete</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<input
		bind:this={f.elements.reference}
		bind:value={() => inputValue,
		(v) => {
			inputValue = v;
			if (!open) {
				open = true;
			}
		}}
		class="border-2 p-2 rounded border-slate-300 focus:border-blue-500 outline-none"
		placeholder="Enter fruit"
		aria-autocomplete="list"
		{...ints.getReferenceProps({
			onkeydown: (event: KeyboardEvent) => {
				if (
					event.key === "Enter" &&
					activeIndex != null &&
					filteredItems[activeIndex]
				) {
					inputValue = filteredItems[activeIndex];
					activeIndex = null;
					open = false;
				}
			},
		})} />
	{#if open}
		<FloatingPortal>
			<FloatingFocusManager
				context={f.context}
				initialFocus={-1}
				visuallyHiddenDismiss>
				<div
					bind:this={f.elements.floating}
					class="bg-slate-100 rounded overflow-y-auto"
					style={f.floatingStyles}
					{...ints.getFloatingProps()}>
					{#each filteredItems as item, index (item)}
						<AutocompleteItem
							bind:ref={() => listRef[index],
							(v) => (listRef[index] = v)}
							{...ints.getItemProps({
								active: activeIndex === index,
								onclick() {
									inputValue = item;
									open = false;
									f.elements.domReference?.focus();
								},
							})}
							active={activeIndex === index}>
							{item}
						</AutocompleteItem>
					{/each}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	{/if}
</div>
