<script lang="ts" module>
	const emojis = [
		{
			name: "apple",
			emoji: "🍎",
		},
		{
			name: "orange",
			emoji: "🍊",
		},
		{
			name: "watermelon",
			emoji: "🍉",
		},
		{
			name: "strawberry",
			emoji: "🍓",
		},
		{
			name: "pear",
			emoji: "🍐",
		},
		{
			name: "banana",
			emoji: "🍌",
		},
		{
			name: "pineapple",
			emoji: "🍍",
		},
		{
			name: "cherry",
			emoji: "🍒",
		},
		{
			name: "peach",
			emoji: "🍑",
		},
	];
</script>

<script lang="ts">
	import type { Placement } from "@floating-ui/utils";
	import {
		useClick,
		useDismiss,
		useFloating,
		useId,
		useInteractions,
		useListNavigation,
		useRole,
	} from "../../../../src/index.js";
	import { arrow, autoUpdate, flip, offset } from "@floating-ui/dom";
	import type { KeyboardEventHandler } from "svelte/elements";
	import Button from "../button.svelte";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import FloatingArrow from "../../../../src/components/floating-arrow.svelte";
	import Option from "./option.svelte";

	let open = $state(false);
	let search = $state("");
	let selectedEmoji = $state<string | null>(null);
	let activeIndex = $state<number | null>(null);
	let placement = $state<Placement | null>(null);

	let arrowEl: HTMLElement = $state(null)!;
	let listRef = $state<Array<HTMLElement | null>>([]);

	const noResultsId = useId();

	const f = useFloating({
		placement: () => placement ?? "bottom-start",
		open: () => open,
		onOpenChange: (v) => (open = v),
		middleware: () =>
			// We don't want flipping to occur while searching, as the floating element
			// will resize and cause disorientation.
			[
				offset(8),
				...(placement ? [] : [flip()]),
				arrow({
					element: arrowEl,
					padding: 20,
				}),
			],
		whileElementsMounted: autoUpdate,
	});

	// Handles opening the floating element via the Choose Emoji button.
	const openInts = useInteractions([
		useClick(f.context),
		useDismiss(f.context),
		useRole(f.context, { role: "menu" }),
	]);

	const listInts = useInteractions([
		useListNavigation(f.context, {
			listRef: () => listRef,
			// I don't think its possible to do open ? (index) => activeIndex = index : undefined
			// because this wouldn't react to the open state.
			// We don't have a way to discriminate between getters and regular functions, so we
			// need to leave this up to the user to handle within the function?
			onNavigate: (index) => {
				if (open) {
					activeIndex = index;
				}
			},
			activeIndex: () => activeIndex,
			cols: 3,
			orientation: "horizontal",
			loop: true,
			focusItemOnOpen: false,
			virtual: true,
			allowEscape: true,
		}),
	]);

	$effect(() => {
		if (open) {
			placement = f.placement;
		} else {
			search = "";
			activeIndex = null;
			placement = null;
		}
	});

	const filteredEmojis = $derived(
		emojis.filter(({ name }) =>
			name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
		)
	);

	function handleEmojiClick() {
		if (activeIndex !== null) {
			selectedEmoji = filteredEmojis[activeIndex].emoji;
			open = false;
		}
	}

	const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
		if (event.key === "Enter") {
			handleEmojiClick();
		}
	};
</script>

<h1 class="text-5xl font-bold mb-8">Emoji Picker</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<div class="text-center">
		<Button
			bind:ref={f.elements.reference}
			class="text-2xl"
			aria-label="Choose emoji"
			aria-describedby="emoji-label"
			data-open={open ? "" : undefined}
			{...openInts.getReferenceProps()}>
			☻
		</Button>
		<br />
		{#if selectedEmoji}
			<span id="emoji-label">
				<span
					style="font-size: 30;"
					aria-label={emojis.find(
						({ emoji }) => emoji === selectedEmoji
					)?.name}>
					{selectedEmoji}
				</span>{" "}
				selected
			</span>
		{/if}
		{#if open}
			<FloatingPortal>
				<FloatingFocusManager context={f.context} modal={false}>
					<div
						bind:this={f.elements.floating}
						class="bg-white/70 backdrop-blur-sm border border-slate-900/10 shadow-md rounded-lg p-4 bg-clip-padding"
						style={f.floatingStyles}
						{...openInts.getFloatingProps(
							listInts.getFloatingProps()
						)}>
						<FloatingArrow
							bind:ref={arrowEl}
							context={f.context}
							fill="white"
							stroke="rgba(0,0,0,0.1)"
							strokeWidth={1}
							height={8}
							tipRadius={1} />
						<span class="opacity-40 text-sm uppercase">
							Emoji Picker
						</span>
						<input
							class="block w-36 my-2 p-1 border border-slate-300 outline-none focus:border-blue-600 rounded"
							placeholder="Search emoji"
							bind:value={search}
							aria-controls={filteredEmojis.length === 0
								? noResultsId
								: undefined}
							{...listInts.getReferenceProps({
								onkeydown: handleKeyDown,
							})} />
						{#if filteredEmojis.length === 0}
							<p
								id={noResultsId}
								role="region"
								aria-atomic="true"
								aria-live="assertive">
								No results.
							</p>
						{:else}
							<div class="grid grid-cols-3" role="listbox">
								{#each filteredEmojis as { name, emoji }, index (name)}
									<Option
										{name}
										bind:ref={listRef[index]}
										selected={selectedEmoji === emoji}
										active={activeIndex === index}
										{index}
										{...listInts.getItemProps({
											onclick: handleEmojiClick,
										})}>
										{emoji}
									</Option>
								{/each}
							</div>
						{/if}
					</div>
				</FloatingFocusManager>
			</FloatingPortal>
		{/if}
	</div>
</div>
