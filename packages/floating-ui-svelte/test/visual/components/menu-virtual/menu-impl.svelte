<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { Boxed } from "../../../../src/types.js";
	import type { HTMLAttributes } from "svelte/elements";
	import {
		safePolygon,
		useDismiss,
		useFloating,
		useFloatingNodeId,
		useFloatingParentNodeId,
		useFloatingTree,
		useHover,
		useId,
		useInteractions,
		useListNavigation,
		useRole,
	} from "../../../../src/index.js";
	import { useListItem } from "../../../../src/components/floating-list/hooks.svelte.js";
	import { autoUpdate, flip, offset, shift } from "@floating-ui/dom";
	import { on } from "svelte/events";
	import { box } from "../../../../src/internal/box.svelte.js";
	import type { WithRef } from "../../../../src/types.js";
	import FloatingNode from "../../../../src/components/floating-tree/floating-node.svelte";

	interface MenuProps {
		label: string;
		nested?: boolean;
		children?: Snippet;
		virtualItemRef: Boxed<HTMLElement | null>;
	}
	export type { MenuProps };
</script>

<script lang="ts">
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import c from "clsx";
	import MenuContextProvider, {
		MenuContext,
		type MenuContextType,
	} from "../menu/menu-context-provider.svelte";
	import FloatingList from "../../../../src/components/floating-list/floating-list.svelte";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	let {
		children,
		label,
		virtualItemRef,
		ref = $bindable(null),
		...rest
	}: MenuProps & HTMLAttributes<HTMLElement> & WithRef = $props();

	let open = $state(false);
	let activeIndex = $state<number | null>(null);
	let allowHover = $state(false);
	let hasFocusInside = $state(false);

	let elements = $state<Array<HTMLElement | null>>([]);
	let labels = $state<Array<string>>([]);

	const tree = useFloatingTree();
	const nodeId = useFloatingNodeId();
	const parentId = useFloatingParentNodeId();
	const isNested = parentId != null;

	const parent = MenuContext.getOr({
		getItemProps: () => ({}),
		activeIndex: null,
		setHasFocusInside: () => {},
		allowHover: true,
		open: false,
		parent: null,
	} satisfies MenuContextType);

	const item = useListItem();

	const f = useFloating({
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

	const role = useRole(f.context, { role: "listbox" });
	const dismiss = useDismiss(f.context, { bubbles: true });
	const listNav = useListNavigation(f.context, {
		listRef: () => elements,
		activeIndex: () => activeIndex,
		nested: isNested,
		onNavigate: (v) => (activeIndex = v),
		virtual: true,
		virtualItemRef,
	});

	const ints = useInteractions([hover, role, dismiss, listNav]);
	function handleTreeClick() {
		open = false;
	}

	function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
		if (event.nodeId !== nodeId && event.parentId === parentId) {
			open = false;
		}
	}

	$effect(() => {
		if (!tree) return;

		tree.events.on("click", handleTreeClick);
		tree.events.on("open", onSubMenuOpen);

		return () => {
			tree.events.off("click", handleTreeClick);
			tree.events.off("open", onSubMenuOpen);
		};
	});

	$effect(() => {
		if (open && tree) {
			tree.events.emit("menuopen", { parentId, nodeId });
		}
	});
	function onPointerMove({ pointerType }: PointerEvent) {
		if (pointerType !== "touch") {
			allowHover = true;
		}
	}

	function onKeyDown() {
		allowHover = false;
	}
	// Determine if "hover" logic can run based on the modality of input. This
	// prevents unwanted focus synchronization as menus open and close with
	// keyboard navigation and the cursor is resting on the menu.
	$effect(() => {
		const removePointerMove = on(window, "pointermove", onPointerMove, {
			once: true,
			capture: true,
		});
		const removeKeyDown = on(window, "keydown", onKeyDown, {
			capture: true,
		});

		return () => {
			removePointerMove();
			removeKeyDown();
		};
	});

	const id = useId();

	const mergedReference = box.with(
		() => ref,
		(v) => {
			ref = v;
			f.reference = v;
			item.ref = v;
		}
	);
</script>

<FloatingNode id={nodeId}>
	{#if isNested}
		<!-- svelte-ignore a11y_role_supports_aria_props -->
		<div
			{id}
			bind:this={mergedReference.current}
			data-open={open ? "" : undefined}
			tabindex={-1}
			role="menuitem"
			aria-autocomplete="list"
			class={c(
				rest.class ||
					"text-left flex gap-4 justify-between items-center rounded py-1 px-2 cursor-default",
				{
					"bg-red-500 text-white": parent.activeIndex === item.index,
					"focus:bg-red-500 outline-none": isNested,
					"bg-red-100 text-red-900":
						open && isNested && !hasFocusInside,
					"bg-red-100 rounded py-1 px-2":
						isNested && open && hasFocusInside,
				}
			)}
			{...ints.getReferenceProps({
				...parent.getItemProps({
					...rest,
					onfocus(
						event: FocusEvent & { currentTarget: HTMLElement }
					) {
						rest.onfocus?.(event);
						hasFocusInside = false;
						parent.setHasFocusInside(true);
					},
					onmouseenter(
						event: MouseEvent & { currentTarget: HTMLElement }
					) {
						rest.onmouseenter?.(event);
						if (parent.allowHover && parent.open) {
							parent.activeIndex = item.index;
						}
					},
				}),
			})}>
			{label}
			<span aria-hidden="true" class="ml-4">
				<ChevronRight />
			</span>
		</div>
	{:else}
		<!-- svelte-ignore a11y_role_has_required_aria_props -->
		<input
			class="border border-slate-500"
			bind:this={mergedReference.current}
			{id}
			data-open={open ? "" : undefined}
			tabindex={isNested ? -1 : 0}
			role="combobox"
			aria-autocomplete="list"
			{...ints.getReferenceProps({
				onkeydown(event: KeyboardEvent) {
					if (event.key === " " || event.key === "Enter") {
						// console.log("clicked", virtualItemRef.current);
					}
				},
			})} />
	{/if}
	<MenuContextProvider
		value={{
			get activeIndex() {
				return activeIndex;
			},
			set activeIndex(v: number | null) {
				activeIndex = v;
			},
			getItemProps: ints.getItemProps,
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
			{#if open}
				<FloatingPortal>
					<FloatingFocusManager
						context={f.context}
						initialFocus={-1}
						returnFocus={!isNested}>
						<div
							bind:this={f.floating}
							class="flex flex-col rounded bg-white shadow-lg outline-none p-1 border border-slate-900/10 bg-clip-padding"
							style={f.floatingStyles}
							{...ints.getFloatingProps()}>
							{@render children?.()}
						</div>
					</FloatingFocusManager>
				</FloatingPortal>
			{/if}
		</FloatingList>
	</MenuContextProvider>
</FloatingNode>
