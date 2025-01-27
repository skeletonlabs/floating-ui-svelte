<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		useClick,
		useDismiss,
		useFloating,
		useInteractions,
		useListNavigation,
		useRole,
		useTypeahead,
	} from "../../../../src/index.js";
	import { autoUpdate, flip, offset, size } from "@floating-ui/dom";
	import Button from "../button.svelte";
	import ColorSwatch from "./color-swatch.svelte";
	import FloatingList from "../../../../src/components/floating-list/floating-list.svelte";
	import { SelectContext } from "./context.js";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		children,
		onChange,
	}: {
		children: Snippet;
		onChange?: (value: string) => void;
	} = $props();

	let value = $state("");
	let open = $state(false);
	let activeIndex = $state<number | null>(null);
	let selectedIndex = $state<number | null>(null);

	function setSelectedValue(newValue: string, newIndex: number) {
		selectedIndex = newIndex;
		value = newValue;
		onChange?.(newValue);
		open = false;
	}

	const f = useFloating({
		placement: "bottom-start",
		open: () => open,
		onOpenChange: (v) => (open = v),
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(5),
			flip({ padding: 10 }),
			size({
				apply({ rects, elements, availableHeight }) {
					Object.assign(elements.floating.style, {
						maxHeight: `${availableHeight}px`,
						width: `${rects.reference.width}px`,
					});
				},
				padding: 10,
			}),
		],
	});

	let elements = $state<Array<HTMLElement | null>>([]);
	let labels = $state<Array<string | null>>([]);
	let isTyping = $state(false);

	const click = useClick(f.context, { event: "mousedown" });
	const dismiss = useDismiss(f.context);
	const role = useRole(f.context, { role: "select" });
	const listNav = useListNavigation(f.context, {
		listRef: () => elements,
		activeIndex: () => activeIndex,
		selectedIndex: () => selectedIndex,
		onNavigate: (idx) => (activeIndex = idx),
		loop: true,
	});
	const typeahead = useTypeahead(f.context, {
		listRef: () => labels,
		activeIndex: () => activeIndex,
		selectedIndex: () => selectedIndex,
		onMatch: (idx) => {
			if (open) {
				activeIndex = idx;
			} else {
				setSelectedValue(labels[idx] || "", idx);
			}
		},
		onTypingChange: (newIsTyping) => {
			isTyping = newIsTyping;
		},
	});

	const ints = useInteractions([click, dismiss, role, listNav, typeahead]);

	SelectContext.set({
		get activeIndex() {
			return activeIndex;
		},
		set activeIndex(v) {
			activeIndex = v;
		},
		getItemProps: ints.getItemProps,
		get isTyping() {
			return isTyping;
		},
		get selectedIndex() {
			return selectedIndex;
		},
		set selectedIndex(v) {
			selectedIndex = v;
		},
		get selectedValue() {
			return value;
		},
		setSelectedValue,
	});
</script>

<h1 class="text-5xl font-bold mb-8">Select</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<div>
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="flex flex-col items-center" id="select-label">
			Select balloon color
		</label>
		<Button
			bind:ref={f.reference}
			aria-labelledby="select-label"
			data-open={open ? "" : undefined}
			class="flex items-center gap-2 bg-slate-200 rounded w-[10rem]"
			{...ints.getReferenceProps()}>
			{#if value}
				<ColorSwatch color={value} />
			{/if}

			{value || "Select..."}
		</Button>
	</div>
	<FloatingList bind:elements {labels}>
		{#if open}
			<FloatingPortal>
				<FloatingFocusManager context={f.context} modal={false}>
					<div
						bind:this={f.floating}
						style={f.floatingStyles}
						class="bg-slate-200/50 max-h-[20rem] overflow-y-auto rounded outline-none p-1 backdrop-blur-sm"
						{...ints.getFloatingProps()}>
						{@render children?.()}
					</div>
				</FloatingFocusManager>
			</FloatingPortal>
		{:else}
			<div hidden>{@render children?.()}</div>
		{/if}
	</FloatingList>
</div>
