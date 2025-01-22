<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { WithRef } from "../../../../src/types.js";
	import type { MenuProps } from "./types.js";
	import {
		safePolygon,
		useClick,
		useDismiss,
		useFloating,
		useFloatingNodeId,
		useFloatingParentNodeId,
		useFloatingTree,
		useHover,
		useInteractions,
		useListNavigation,
		useRole,
		useTypeahead,
	} from "../../../../src/index.js";
	import MenuContextProvider, {
		MenuContext,
		type MenuContextType,
	} from "./menu-context-provider.svelte";
	import { useListItem } from "../../../../src/components/floating-list/hooks.svelte.js";
	import { autoUpdate, flip, offset, shift } from "@floating-ui/dom";
	import { on } from "svelte/events";
	import { executeCallbacks } from "../../../../src/internal/execute-callbacks.js";
	import { watch } from "../../../../src/internal/watch.svelte.js";
	import FloatingNode from "../../../../src/components/floating-tree/floating-node.svelte";
	import { box } from "../../../../src/internal/box.svelte.js";
	import c from "clsx";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import FloatingList from "../../../../src/components/floating-list/floating-list.svelte";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import {
		styleObjectToString,
		styleStringToObject,
	} from "../../../../src/internal/style-object-to-string.js";

	let {
		children,
		label,
		forceMount = false,
		ref = $bindable(null),
		class: className,
		floatingId,
		...rest
	}: MenuProps &
		Partial<WithRef<HTMLButtonElement>> &
		HTMLButtonAttributes & { floatingId?: string } = $props();

	let open = $state(false);
	let activeIndex = $state<number | null>(null);
	let allowHover = $state(false);
	let hasFocusInside = $state(false);

	let elements = $state<Array<HTMLElement | null>>([]);
	let labels = $state<Array<string>>([]);

	const tree = useFloatingTree();
	const nodeId = useFloatingNodeId();
	const parentId = useFloatingParentNodeId();
	const isNested = parentId !== null;

	const parent = MenuContext.getOr({
		getItemProps: () => ({}),
		activeIndex: null,
		setHasFocusInside: () => {},
		allowHover: true,
		open: false,
		parent: null,
	} satisfies MenuContextType);

	const item = useListItem();

	const f = useFloating<HTMLButtonElement>({
		nodeId,
		open: () => open,
		onOpenChange: (v) => (open = v),
		placement: isNested ? "right-start" : "bottom-start",
		middleware: [
			offset({
				mainAxis: isNested ? 0 : 4,
				alignmentAxis: isNested ? -4 : 0,
			}),
			flip(),
			shift(),
		],
		whileElementsMounted: autoUpdate,
	});

	const hover = useHover(f.context, {
		enabled: () => isNested && allowHover,
		delay: { open: 75 },
		handleClose: safePolygon({ blockPointerEvents: true }),
	});

	const click = useClick(f.context, {
		event: "mousedown",
		toggle: () => !isNested || !allowHover,
		ignoreMouse: isNested,
	});

	const role = useRole(f.context, { role: "menu" });
	const dismiss = useDismiss(f.context, {
		bubbles: true,
	});
	const listNav = useListNavigation(f.context, {
		listRef: () => elements,
		activeIndex: () => activeIndex,
		nested: isNested,
		onNavigate: (v) => (activeIndex = v),
	});
	const typeahead = useTypeahead(f.context, {
		listRef: () => labels,
		onMatch: (v) => {
			if (open) {
				activeIndex = v;
			}
		},
		activeIndex: () => activeIndex,
	});

	const ints = useInteractions([
		hover,
		click,
		role,
		dismiss,
		listNav,
		typeahead,
	]);

	// Event emitter allows you to communicate across tree components.
	// This effect closes all menus when an item gets clicked anywhere
	// in the tree.
	$effect(() => {
		if (!tree) return;

		function handleTreeClick() {
			open = false;
		}

		function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
			if (event.nodeId !== nodeId && event.parentId === parentId) {
				open = false;
			}
		}
		return executeCallbacks(
			tree.events.on("click", handleTreeClick),
			tree.events.on("open", onSubMenuOpen)
		);
	});

	// Determine if "hover" logic can run based on the modality of input. This
	// prevents unwanted focus synchronization as menus open and close with
	// keyboard navigation and the cursor is resting on the menu.
	watch(
		() => allowHover,
		() => {
			function onPointerMove({ pointerType }: PointerEvent) {
				if (pointerType !== "touch") allowHover = true;
			}

			function onKeyDown() {
				allowHover = false;
			}

			return executeCallbacks(
				on(window, "pointermove", onPointerMove, {
					once: true,
					capture: true,
				}),
				on(window, "keydown", onKeyDown, { capture: true })
			);
		}
	);

	const mergedReference = box.with(
		() => ref,
		(v) => {
			f.reference = v;
			item.ref = v;
			ref = v;
		}
	);
</script>

<FloatingNode id={nodeId}>
	<button
		bind:this={mergedReference.current}
		data-open={open ? "" : undefined}
		tabindex={!isNested
			? rest.tabindex
			: parent.activeIndex === item.index
				? 0
				: -1}
		class={c(
			className ||
				"text-left flex gap-4 justify-between items-center rounded py-1 px-2",
			{
				"focus:bg-blue-500 focus:text-white outline-none": isNested,
				"bg-blue-500 text-white": open && isNested && !hasFocusInside,
				"bg-slate-200 rounded py-1 px-2":
					isNested && open && hasFocusInside,
				"bg-slate-200": !isNested && open,
			}
		)}
		{...ints.getReferenceProps({
			...rest,
			onfocus: (
				event: FocusEvent & { currentTarget: HTMLButtonElement }
			) => {
				rest.onfocus?.(event);
				hasFocusInside = false;
				parent.setHasFocusInside(true);
			},
			onmouseenter: (
				event: MouseEvent & { currentTarget: HTMLButtonElement }
			) => {
				rest.onmouseenter?.(event);
				if (parent.allowHover && parent.open) {
					parent.activeIndex = item.index;
				}
			},
		})}>
		{label}
		{#if isNested}
			<span aria-hidden="true" class="ml-4">
				<ChevronRight />
			</span>
		{/if}
	</button>
	<MenuContextProvider
		value={{
			get activeIndex() {
				return activeIndex;
			},
			set activeIndex(v: number | null) {
				activeIndex = v;
			},
			getItemProps: (u) => ints.getItemProps(u),
			setHasFocusInside: (v: boolean) => {
				hasFocusInside = v;
			},
			get allowHover() {
				return allowHover;
			},
			get open() {
				return open;
			},
			set open(v: boolean) {
				open = v;
			},
			parent,
		}}>
		<FloatingList bind:elements {labels}>
			{#if forceMount || open}
				<FloatingPortal>
					<FloatingFocusManager
						context={f.context}
						modal={false}
						initialFocus={isNested ? -1 : 0}
						returnFocus={!isNested}>
						<div
							id={floatingId}
							bind:this={f.floating}
							class="flex flex-col rounded bg-white shadow-lg outline-none p-1 border border-slate-900/10 bg-clip-padding"
							style={styleObjectToString({
								...styleStringToObject(f.floatingStyles),
								visibility: !forceMount
									? undefined
									: open
										? "visible"
										: "hidden",
							})}
							aria-hidden={!open}
							{...ints.getFloatingProps()}>
							{@render children?.()}
						</div>
					</FloatingFocusManager>
				</FloatingPortal>
			{/if}
		</FloatingList>
	</MenuContextProvider>
</FloatingNode>
