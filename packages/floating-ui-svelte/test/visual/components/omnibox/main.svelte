<script lang="ts">
	import { autoUpdate, flip, offset, size } from "@floating-ui/dom";
	import {
		useDismiss,
		useFloating,
		useFocus,
		useInteractions,
		useListNavigation,
		useRole,
	} from "../../../../src/index.js";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import FloatingList from "../../../../src/components/floating-list/floating-list.svelte";
	import { SelectContext } from "./context.js";
	import SearchOption from "./search-option.svelte";

	let open = $state(false);
	let activeIndex = $state<number | null>(null);
	let isFocusEnabled = $state(true);

	let options = $state(["svelte", "floating-ui", "skeleton-ui", "bits-ui"]);

	let removedIndex = null;

	const f = useFloating<HTMLInputElement>({
		open: () => open,
		onOpenChange: (v) => (open = v),
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(2),
			flip({ padding: 15 }),
			size({
				apply({ availableHeight, elements, rects }) {
					Object.assign(elements.floating.style, {
						width: `${rects.reference.width}px`,
						maxHeight: `${availableHeight}px`,
					});
				},
				padding: 15,
			}),
		],
	});

	let elements = $state<Array<HTMLElement | null>>([]);

	const hasOptions = $derived(options.length > 0);

	const focus = useFocus(f.context, {
		enabled: () => hasOptions && isFocusEnabled,
	});

	const dismiss = useDismiss(f.context);

	const role = useRole(f.context, {
		enabled: () => hasOptions,
		role: "listbox",
	});
	const listNav = useListNavigation(f.context, {
		listRef: () => elements,
		activeIndex: () => activeIndex,
		onNavigate: (v) => (activeIndex = v),
		virtual: true,
		allowEscape: true,
		loop: true,
	});

	const ints = useInteractions([focus, dismiss, role, listNav]);

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: HTMLInputElement }
	) {
		const value = event.currentTarget.value.trim();

		if (event.key !== "Enter" && !event.key.startsWith("Arrow")) {
			activeIndex = null;
			return;
		}

		if (event.key === "Enter" && value && !options.includes(value)) {
			options = [value, ...options];
		}

		if (event.key === "Enter" && activeIndex !== null) {
			event.currentTarget.value = options[activeIndex];
			open = false;
		}
	}

	function handleOnBlur() {
		isFocusEnabled = true;
	}

	SelectContext.set({
		get activeIndex() {
			return activeIndex;
		},
		getItemProps: ints.getItemProps,
	});
</script>

<h1 class="text-5xl font-bold mb-8">Omnibox</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<input
		bind:this={f.elements.reference}
		class="rounded-full sm:w-48 md:w-96 bg-gray-100 px-4 py-2 border border-transparent focus:bg-white focus focus:border-blue-500 outline-none"
		placeholder="Search"
		{...ints.getReferenceProps({
			onkeydown: (
				e: KeyboardEvent & { currentTarget: HTMLInputElement }
			) => handleKeyDown(e),
			onblur: handleOnBlur,
		})} />
	{#if open}
		<FloatingFocusManager
			context={f.context}
			initialFocus={-1}
			restoreFocus
			modal={false}>
			<div
				class="bg-white bg-clip-padding rounded-lg shadow-md border border-slate-900/10 text-left overflow-y-auto"
				bind:this={f.elements.floating}
				style={f.floatingStyles}
				{...ints.getFloatingProps()}>
				<div class="flex justify-between align-items-center p-4">
					<h3 class="font-bold text-xl">Recent</h3>
					{#if hasOptions}
						<button
							class="text-blue-500 font-bold px-2 py-1 rounded-lg hover:bg-sky-50"
							onclick={() => {
								options = [];
								open = false;
							}}
							onkeydown={(e) => {
								if (e.key !== "Escape") {
									e.stopPropagation();
								}
							}}>
							Clear all
						</button>
					{/if}
				</div>
				{#if !hasOptions}
					<p class="px-4 pb-4">No recent searches.</p>
				{/if}
				<FloatingList bind:elements>
					{#each options as option, index (option)}
						<SearchOption
							value={option}
							onRemove={() => {
								removedIndex = index;
								options = options.filter((o) => o !== option);
							}}
							onclick={() => {
								if (
									activeIndex === null ||
									!f.elements.domReference
								) {
									return;
								}
								open = false;
								isFocusEnabled = false;
								const domRef = f.elements
									.domReference as HTMLInputElement;
								domRef.value = options[activeIndex];
							}} />
					{/each}
				</FloatingList>
			</div>
		</FloatingFocusManager>
	{/if}
</div>
