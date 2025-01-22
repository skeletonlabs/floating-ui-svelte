import { DEV } from "esm-env";
import { extract } from "../internal/extract.js";
import type { Boxed, Dimensions, MaybeGetter } from "../types.js";
import type { FloatingRootContext } from "./use-floating-root-context.svelte.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import { warn } from "../internal/log.js";
import { getFloatingFocusElement } from "../internal/get-floating-focus-element.js";
import {
	useFloatingParentNodeId,
	useFloatingTree,
} from "../components/floating-tree/hooks.svelte.js";
import { isTypeableCombobox } from "../internal/is-typeable-element.js";
import { enqueueFocus } from "../internal/enqueue-focus.js";
import type {
	FocusEventHandler,
	MouseEventHandler,
	PointerEventHandler,
} from "svelte/elements";
import type { ElementProps } from "./use-interactions.svelte.js";
import { watch } from "../internal/watch.svelte.js";
import {
	ARROW_DOWN,
	ARROW_LEFT,
	ARROW_RIGHT,
	ARROW_UP,
	buildCellMap,
	findNonDisabledIndex,
	getCellIndexOfCorner,
	getCellIndices,
	getGridNavigatedIndex,
	getMaxIndex,
	getMinIndex,
	isDisabled,
	isIndexOutOfBounds,
} from "../internal/composite.js";
import {
	activeElement,
	contains,
	getDocument,
	isVirtualClick,
	isVirtualPointerEvent,
	stopEvent,
} from "../internal/dom.js";
import { isElement, isHTMLElement } from "@floating-ui/utils/dom";
import { getDeepestNode } from "../internal/get-children.js";

interface UseListNavigationOptions {
	/**
	 * A ref that holds an array of list items.
	 * @default empty list
	 */
	listRef: MaybeGetter<Array<HTMLElement | null>>;
	/**
	 * The index of the currently active (focused or highlighted) item, which may
	 * or may not be selected.
	 * @default null
	 */
	activeIndex: MaybeGetter<number | null>;
	/**
	 * A callback that is called when the user navigates to a new active item,
	 * passed in a new `activeIndex`.
	 */
	onNavigate?: (activeIndex: number | null) => void;
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: MaybeGetter<boolean>;
	/**
	 * The currently selected item index, which may or may not be active.
	 * @default null
	 */
	selectedIndex?: MaybeGetter<number | null>;
	/**
	 * Whether to focus the item upon opening the floating element. 'auto' infers
	 * what to do based on the input type (keyboard vs. pointer), while a boolean
	 * value will force the value.
	 * @default 'auto'
	 */
	focusItemOnOpen?: MaybeGetter<boolean | "auto">;
	/**
	 * Whether hovering an item synchronizes the focus.
	 * @default true
	 */
	focusItemOnHover?: MaybeGetter<boolean>;
	/**
	 * Whether pressing an arrow key on the navigation’s main axis opens the
	 * floating element.
	 * @default true
	 */
	openOnArrowKeyDown?: MaybeGetter<boolean>;
	/**
	 * By default elements with either a `disabled` or `aria-disabled` attribute
	 * are skipped in the list navigation — however, this requires the items to
	 * be rendered.
	 * This prop allows you to manually specify indices which should be disabled,
	 * overriding the default logic.
	 * For Windows-style select menus, where the menu does not open when
	 * navigating via arrow keys, specify an empty array.
	 * @default undefined
	 */
	disabledIndices?: MaybeGetter<Array<number>>;
	/**
	 * Determines whether focus can escape the list, such that nothing is selected
	 * after navigating beyond the boundary of the list. In some
	 * autocomplete/combobox components, this may be desired, as screen
	 * readers will return to the input.
	 * `loop` must be `true`.
	 * @default false
	 */
	allowEscape?: MaybeGetter<boolean>;
	/**
	 * Determines whether focus should loop around when navigating past the first
	 * or last item.
	 * @default false
	 */
	loop?: MaybeGetter<boolean>;
	/**
	 * If the list is nested within another one (e.g. a nested submenu), the
	 * navigation semantics change.
	 * @default false
	 */
	nested?: MaybeGetter<boolean>;
	/**
	 * Whether the direction of the floating element’s navigation is in RTL
	 * layout.
	 * @default false
	 */
	rtl?: MaybeGetter<boolean>;
	/**
	 * Whether the focus is virtual (using `aria-activedescendant`).
	 * Use this if you need focus to remain on the reference element
	 * (such as an input), but allow arrow keys to navigate list items.
	 * This is common in autocomplete listbox components.
	 * Your virtually-focused list items must have a unique `id` set on them.
	 * If you’re using a component role with the `useRole()` Hook, then an `id` is
	 * generated automatically.
	 * @default false
	 */
	virtual?: MaybeGetter<boolean>;
	/**
	 * The orientation in which navigation occurs.
	 * @default 'vertical'
	 */
	orientation?: MaybeGetter<"vertical" | "horizontal" | "both">;
	/**
	 * Specifies how many columns the list has (i.e., it’s a grid). Use an
	 * orientation of 'horizontal' (e.g. for an emoji picker/date picker, where
	 * pressing ArrowRight or ArrowLeft can change rows), or 'both' (where the
	 * current row cannot be escaped with ArrowRight or ArrowLeft, only ArrowUp
	 * and ArrowDown).
	 * @default 1
	 */
	cols?: MaybeGetter<number>;
	/**
	 * Whether to scroll the active item into view when navigating. The default
	 * value uses nearest options.
	 */
	scrollItemIntoView?: MaybeGetter<boolean | ScrollIntoViewOptions>;
	/**
	 * When using virtual focus management, this holds a ref to the
	 * virtually-focused item. This allows nested virtual navigation to be
	 * enabled, and lets you know when a nested element is virtually focused from
	 * the root reference handling the events. Requires `FloatingTree` to be
	 * setup.
	 */
	virtualItemRef?: Boxed<HTMLElement | null>;
	/**
	 * Only for `cols > 1`, specify sizes for grid items.
	 * `{ width: 2, height: 2 }` means an item is 2 columns wide and 2 rows tall.
	 */
	itemSizes?: MaybeGetter<Dimensions[]>;
	/**
	 * Only relevant for `cols > 1` and items with different sizes, specify if
	 * the grid is dense (as defined in the CSS spec for `grid-auto-flow`).
	 * @default false
	 */
	dense?: MaybeGetter<boolean>;
}

function useListNavigation(
	context: FloatingContext | FloatingRootContext,
	opts: UseListNavigationOptions,
) {
	const { virtualItemRef, onNavigate: onNavigateProp } = opts;
	const listRef = $derived(extract(opts.listRef));
	const selectedIndex = $derived(extract(opts.selectedIndex, null));
	const activeIndex = $derived(extract(opts.activeIndex, null));
	const enabled = $derived(extract(opts.enabled, true));
	const allowEscape = $derived(extract(opts.allowEscape, false));
	const loop = $derived(extract(opts.loop, false));
	const nested = $derived(extract(opts.nested, false));
	const rtl = $derived(extract(opts.rtl, false));
	const virtual = $derived(extract(opts.virtual, false));
	const focusItemOnOpenProp = $derived(extract(opts.focusItemOnOpen, "auto"));
	const focusItemOnHover = $derived(extract(opts.focusItemOnHover, true));
	const openOnArrowKeyDown = $derived(extract(opts.openOnArrowKeyDown, true));
	const disabledIndices = $derived(extract(opts.disabledIndices, undefined));
	const orientation = $derived(extract(opts.orientation, "vertical"));
	const cols = $derived(extract(opts.cols, 1));
	const scrollItemIntoView = $derived(extract(opts.scrollItemIntoView, true));
	const itemSizes = $derived(extract(opts.itemSizes));
	const dense = $derived(extract(opts.dense, false));
	const floatingFocusElement = $derived(
		getFloatingFocusElement(context.floating),
	);
	const parentId = useFloatingParentNodeId();
	const tree = useFloatingTree();
	const typeableComboboxReference = $derived(
		isTypeableCombobox(context.domReference),
	);

	const hasActiveIndex = $derived(activeIndex != null);

	const ariaActiveDescendantProp = $derived.by(() => {
		if (virtual && context.open && hasActiveIndex) {
			return {
				"aria-activedescendant": virtualId || activeId,
			};
		}
		return {};
	});

	let index = $state(selectedIndex ?? -1);
	let key: string | null = null;
	let isPointerModality = true;
	let forceSyncFocus = false;
	let forceScrollIntoView = false;
	let activeId = $state<string | undefined>();
	let virtualId = $state<string | undefined>();
	let mounted = !!context.floating;
	let focusItemOnOpen = $state(focusItemOnOpenProp);

	const onNavigate = () => {
		onNavigateProp?.(index === -1 ? null : index);
	};

	if (DEV) {
		if (allowEscape) {
			if (!loop) {
				warn("`useListNavigation` looping must be enabled to allow escaping");
			}

			if (!virtual) {
				warn("`useListNavigation` must be virtual to allow escaping");
			}
		}

		if (orientation === "vertical" && cols > 1) {
			warn(
				"In grid list navigation mode (`cols` > 1), the `orientation` should",
				'be either "horizontal" or "both".',
			);
		}
	}

	// Sync `selectedIndex` to be the `activeIndex` upon opening the floating
	// element. Also, reset `activeIndex` upon closing the floating element.
	watch.pre(
		[
			() => enabled,
			() => context.open,
			() => context.floating,
			() => selectedIndex,
		],
		(_, [__, ___, prevFloating]) => {
			if (!enabled) return;
			const prevMounted = !!prevFloating;
			if (context.open && context.floating) {
				if (focusItemOnOpen && selectedIndex != null) {
					// Regardless of the pointer modality, we want to ensure the selected
					// item comes into view when the floating element is opened.
					forceScrollIntoView = true;
					index = selectedIndex;
					onNavigate();
				}
			} else if (prevMounted) {
				index = -1;
				onNavigate();
			}
		},
	);

	// Sync `activeIndex` to be the focused item while the floating element is
	// open.
	watch.pre(
		[
			() => enabled,
			() => context.open,
			() => context.floating,
			() => activeIndex,
			() => selectedIndex,
			() => nested,
			() => $state.snapshot(listRef),
			() => orientation,
			() => rtl,
			() => disabledIndices,
		],
		(_, [__, prevOpen, prevFloating]) => {
			const prevMounted = !!prevFloating;
			if (!enabled) return;
			if (!context.open) return;
			if (!context.floating) return;

			if (activeIndex == null) {
				forceSyncFocus = false;

				if (selectedIndex != null) {
					return;
				}

				// Reset while the floating element was open (e.g. the list changed).
				if (prevMounted) {
					index = -1;
					focusItem();
				}

				// Initial sync.
				if (
					(!prevOpen || !prevMounted) &&
					focusItemOnOpen &&
					(key != null || (focusItemOnOpen === true && key == null))
				) {
					let runs = 0;
					const waitForListPopulated = () => {
						if (listRef[0] == null) {
							// Avoid letting the browser paint if possible on the first try,
							// otherwise use rAF. Don't try more than twice, since something
							// is wrong otherwise.
							if (runs < 2) {
								const scheduler = runs ? requestAnimationFrame : queueMicrotask;
								scheduler(waitForListPopulated);
							}
							runs++;
						} else {
							index =
								key == null ||
								isMainOrientationToEndKey(key, orientation, rtl) ||
								nested
									? getMinIndex(listRef, disabledIndices)
									: getMaxIndex(listRef, disabledIndices);
							key = null;
							onNavigate();
						}
					};

					waitForListPopulated();
				}
			} else if (!isIndexOutOfBounds(listRef, activeIndex)) {
				index = activeIndex;
				focusItem();
				forceScrollIntoView = false;
			}
		},
	);

	// Ensure the parent floating element has focus when a nested child closes
	// to allow arrow key navigation to work after the pointer leaves the child.
	watch.pre(
		[() => enabled, () => context.floating, () => tree?.nodes, () => virtual],
		() => {
			if (!enabled || context.floating || !tree || virtual || !mounted) return;

			const nodes = tree.nodes;
			const parent = nodes.find((node) => node.id === parentId)?.context
				?.floating;
			const activeEl = activeElement(getDocument(context.floating));
			const treeContainsActiveEl = nodes.some(
				(node) => node.context && contains(node.context.floating, activeEl),
			);

			if (parent && !treeContainsActiveEl && isPointerModality) {
				parent.focus({ preventScroll: true });
			}
		},
	);

	watch.pre(
		[
			() => enabled,
			() => tree?.nodes,
			() => virtual,
			() => virtualItemRef?.current,
		],
		() => {
			if (!enabled) return;
			if (!tree) return;
			if (!virtual) return;
			if (parentId) return;

			const handleVirtualFocus = (item: HTMLElement) => {
				virtualId = item.id;
				if (virtualItemRef) {
					virtualItemRef.current = item;
				}
			};
			const localTree = tree;

			localTree.events.on("virtualfocus", handleVirtualFocus);

			return () => {
				localTree.events.off("virtualfocus", handleVirtualFocus);
			};
		},
	);

	$effect.pre(() => {
		mounted = !!context.floating;
	});

	$effect.pre(() => {
		focusItemOnOpen = focusItemOnOpenProp;
	});

	function focusItem() {
		const runFocus = (item: HTMLElement) => {
			if (virtual) {
				activeId = item.id;
				tree?.events.emit("virtualfocus", item);
				if (virtualItemRef) {
					virtualItemRef.current = item;
				}
			} else {
				enqueueFocus(item, {
					sync: forceSyncFocus,
					preventScroll: true,
				});
			}
		};

		const initialItem = listRef[index];

		if (initialItem) {
			runFocus(initialItem);
		}

		const scheduler = forceSyncFocus
			? (v: () => void) => v()
			: requestAnimationFrame;

		scheduler(() => {
			const waitedItem = listRef[index] || initialItem;

			if (!waitedItem) return;

			if (!initialItem) {
				runFocus(waitedItem);
			}

			const scrollIntoViewOptions = scrollItemIntoView;
			const shouldScrollIntoView =
				scrollIntoViewOptions &&
				item &&
				(forceScrollIntoView || !isPointerModality);

			if (shouldScrollIntoView) {
				// JSDOM doesn't support `.scrollIntoView()` but it's widely supported
				// by all browsers.
				waitedItem.scrollIntoView?.(
					typeof scrollIntoViewOptions === "boolean"
						? { block: "nearest", inline: "nearest" }
						: scrollIntoViewOptions,
				);
			}
		});
	}

	const syncCurrentTarget = (currentTarget: HTMLElement | null) => {
		if (!context.open) return;
		const localIndex = listRef.indexOf(currentTarget);
		if (localIndex !== -1 && index !== localIndex) {
			index = localIndex;
			onNavigate();
		}
	};

	const itemOnFocus: FocusEventHandler<HTMLElement> = ({ currentTarget }) => {
		forceSyncFocus = true;
		syncCurrentTarget(currentTarget);
	};

	const itemOnClick: MouseEventHandler<HTMLElement> = ({ currentTarget }) =>
		currentTarget.focus({ preventScroll: true }); // safari

	const itemOnMouseMove: MouseEventHandler<HTMLElement> = ({
		currentTarget,
	}) => {
		forceSyncFocus = true;
		forceScrollIntoView = false;
		syncCurrentTarget(currentTarget);
	};

	const itemOnPointerLeave: PointerEventHandler<HTMLElement> = ({
		pointerType,
	}) => {
		if (!isPointerModality || pointerType === "touch") return;

		forceSyncFocus = true;
		index = -1;
		onNavigate();

		if (!virtual) {
			floatingFocusElement?.focus({ preventScroll: true });
		}
	};

	const item: ElementProps["item"] = $derived({
		onfocus: itemOnFocus,
		onclick: itemOnClick,
		...(focusItemOnHover && {
			onmousemove: itemOnMouseMove,
			onpointerleave: itemOnPointerLeave,
		}),
	});

	const commonOnKeyDown = (event: KeyboardEvent) => {
		isPointerModality = true;
		forceSyncFocus = true;

		// When composing a character, Chrome fires ArrowDown twice. Firefox/Safari
		// don't appear to suffer from this. `event.isComposing` is avoided due to
		// Safari not supporting it properly (although it's not needed in the first
		// place for Safari, just avoiding any possible issues).
		if (event.which === 229) return;

		// If the floating element is animating out, ignore navigation. Otherwise,
		// the `activeIndex` gets set to 0 despite not being open so the next time
		// the user ArrowDowns, the first item won't be focused.
		if (!context.open && event.currentTarget === floatingFocusElement) return;

		if (nested && isCrossOrientationCloseKey(event.key, orientation, rtl)) {
			stopEvent(event);
			context.onOpenChange(false, event, "list-navigation");

			if (isHTMLElement(context.domReference)) {
				if (virtual) {
					tree?.events.emit("virtualfocus", context.domReference);
				} else {
					context.domReference.focus();
				}
			}

			return;
		}

		const currentIndex = index;
		const filteredListRef = listRef.filter((item) => item !== null);
		const minIndex = getMinIndex(filteredListRef, disabledIndices);
		const maxIndex = getMaxIndex(filteredListRef, disabledIndices);

		if (!typeableComboboxReference) {
			if (event.key === "Home") {
				stopEvent(event);
				index = minIndex;
				onNavigate();
			}

			if (event.key === "End") {
				stopEvent(event);
				index = maxIndex;
				onNavigate();
			}
		}

		// Grid navigation.
		if (cols > 1) {
			const sizes =
				itemSizes ||
				Array.from({ length: filteredListRef.length }, () => ({
					width: 1,
					height: 1,
				}));
			// To calculate movements on the grid, we use hypothetical cell indices
			// as if every item was 1x1, then convert back to real indices.
			const cellMap = buildCellMap(sizes, cols, dense);
			const minGridIndex = cellMap.findIndex(
				(index) =>
					index != null && !isDisabled(filteredListRef, index, disabledIndices),
			);
			// last enabled index
			const maxGridIndex = cellMap.reduce(
				(foundIndex: number, index, cellIndex) =>
					index != null && !isDisabled(filteredListRef, index, disabledIndices)
						? cellIndex
						: foundIndex,
				-1,
			);

			const localIndex =
				cellMap[
					getGridNavigatedIndex(
						cellMap.map((itemIndex) =>
							itemIndex != null ? filteredListRef[itemIndex] : null,
						),
						{
							event,
							orientation,
							loop,
							rtl,
							cols,
							// treat undefined (empty grid spaces) as disabled indices so we
							// don't end up in them
							disabledIndices: getCellIndices(
								[
									...(disabledIndices ||
										filteredListRef.map((_, index) =>
											isDisabled(filteredListRef, index) ? index : undefined,
										)),
									undefined,
								],
								cellMap,
							),
							minIndex: minGridIndex,
							maxIndex: maxGridIndex,
							prevIndex: getCellIndexOfCorner(
								index > maxIndex ? minIndex : index,
								sizes,
								cellMap,
								cols,
								// use a corner matching the edge closest to the direction
								// we're moving in so we don't end up in the same item. Prefer
								// top/left over bottom/right.
								event.key === ARROW_DOWN
									? "bl"
									: event.key === (rtl ? ARROW_LEFT : ARROW_RIGHT)
										? "tr"
										: "tl",
							),
							stopEvent: true,
						},
					)
				];

			if (localIndex != null) {
				console.log("localIndex", localIndex);
				index = localIndex;
				onNavigate();
			}

			if (orientation === "both") return;
		}

		if (isMainOrientationKey(event.key, orientation)) {
			stopEvent(event);

			// Reset the index if no item is focused.
			if (
				context.open &&
				!virtual &&
				isElement(event.currentTarget) &&
				activeElement(event.currentTarget.ownerDocument) === event.currentTarget
			) {
				index = isMainOrientationToEndKey(event.key, orientation, rtl)
					? minIndex
					: maxIndex;
				onNavigate();
				return;
			}

			if (isMainOrientationToEndKey(event.key, orientation, rtl)) {
				if (loop) {
					index =
						currentIndex >= maxIndex
							? allowEscape && currentIndex !== filteredListRef.length
								? -1
								: minIndex
							: findNonDisabledIndex(filteredListRef, {
									startingIndex: currentIndex,
									disabledIndices: disabledIndices,
								});
				} else {
					index = Math.min(
						maxIndex,
						findNonDisabledIndex(filteredListRef, {
							startingIndex: currentIndex,
							disabledIndices: disabledIndices,
						}),
					);
				}
			} else {
				if (loop) {
					index =
						currentIndex <= minIndex
							? allowEscape && currentIndex !== -1
								? filteredListRef.length
								: maxIndex
							: findNonDisabledIndex(filteredListRef, {
									startingIndex: currentIndex,
									decrement: true,
									disabledIndices: disabledIndices,
								});
				} else {
					index = Math.max(
						minIndex,
						findNonDisabledIndex(filteredListRef, {
							startingIndex: currentIndex,
							decrement: true,
							disabledIndices: disabledIndices,
						}),
					);
				}
			}

			if (isIndexOutOfBounds(filteredListRef, index)) {
				index = -1;
			}

			onNavigate();
		}
	};

	const floatingOnPointerMove: PointerEventHandler<HTMLElement> = () => {
		isPointerModality = true;
	};

	const floating: ElementProps["floating"] = $derived({
		"aria-orientation": orientation === "both" ? undefined : orientation,
		...(!typeableComboboxReference ? ariaActiveDescendantProp : {}),
		onkeydown: commonOnKeyDown,
		onpointermove: floatingOnPointerMove,
	});

	const checkVirtualMouse = (event: MouseEvent) => {
		if (focusItemOnOpenProp === "auto" && isVirtualClick(event)) {
			focusItemOnOpen = true;
		}
	};

	const checkVirtualPointer = (event: PointerEvent) => {
		// `pointerdown` fires first, reset the state then perform the checks.
		focusItemOnOpen = focusItemOnOpenProp;
		if (focusItemOnOpenProp === "auto" && isVirtualPointerEvent(event)) {
			focusItemOnOpen = true;
		}
	};

	const referenceOnKeyDown = (event: KeyboardEvent) => {
		isPointerModality = false;
		const isOpen = context.open;

		const isArrowKey = event.key.startsWith("Arrow");
		const isHomeOrEndKey = ["Home", "End"].includes(event.key);
		const isMoveKey = isArrowKey || isHomeOrEndKey;
		const isCrossOpenKey = isCrossOrientationOpenKey(
			event.key,
			orientation,
			rtl,
		);
		const isCrossCloseKey = isCrossOrientationCloseKey(
			event.key,
			orientation,
			rtl,
		);
		const isMainKey = isMainOrientationKey(event.key, orientation);
		const isNavigationKey =
			(nested ? isCrossOpenKey : isMainKey) ||
			event.key === "Enter" ||
			event.key.trim() === "";

		if (virtual && isOpen) {
			const rootNode = tree?.nodes.find((node) => node.parentId == null);
			const deepestNode =
				tree && rootNode ? getDeepestNode(tree.nodes, rootNode.id) : null;

			if (isMoveKey && deepestNode && virtualItemRef) {
				const eventObject = new KeyboardEvent("keydown", {
					key: event.key,
					bubbles: true,
				});

				if (isCrossOpenKey || isCrossCloseKey) {
					const isCurrentTarget =
						deepestNode.context?.domReference === event.currentTarget;
					const dispatchItem =
						isCrossCloseKey && !isCurrentTarget
							? deepestNode.context?.domReference
							: isCrossOpenKey
								? listRef.find((item) => item?.id === activeId)
								: null;

					if (dispatchItem) {
						stopEvent(event);
						dispatchItem.dispatchEvent(eventObject);
						virtualId = undefined;
					}
				}

				if ((isMainKey || isHomeOrEndKey) && deepestNode.context) {
					if (
						deepestNode.context.open &&
						deepestNode.parentId &&
						event.currentTarget !== deepestNode.context.domReference
					) {
						stopEvent(event);
						deepestNode.context.domReference?.dispatchEvent(eventObject);
						return;
					}
				}
			}

			return commonOnKeyDown(event);
		}

		// If a floating element should not open on arrow key down, avoid
		// setting `activeIndex` while it's closed.
		if (!isOpen && !openOnArrowKeyDown && isArrowKey) return;

		if (isNavigationKey) {
			key = nested && isMainKey ? null : event.key;
		}

		if (nested) {
			if (isCrossOpenKey) {
				stopEvent(event);

				if (isOpen) {
					index = getMinIndex(listRef, disabledIndices);
					onNavigate();
				} else {
					context.onOpenChange(true, event, "list-navigation");
				}
			}

			return;
		}

		if (isMainKey) {
			if (selectedIndex != null) {
				index = selectedIndex;
			}

			stopEvent(event);

			if (!isOpen && openOnArrowKeyDown) {
				context.onOpenChange(true, event, "list-navigation");
			} else {
				commonOnKeyDown(event);
			}

			if (isOpen) {
				onNavigate();
			}
		}
	};

	const referenceOnFocus = () => {
		if (context.open && !virtual) {
			index = -1;
			onNavigate();
		}
	};

	const reference: ElementProps["reference"] = $derived({
		...ariaActiveDescendantProp,
		onkeydown: referenceOnKeyDown,
		onfocus: referenceOnFocus,
		onpointerdown: checkVirtualPointer,
		onpointerenter: checkVirtualPointer,
		onmousedown: checkVirtualMouse,
		onclick: checkVirtualMouse,
	});

	return {
		get floating() {
			if (!enabled) return {};
			return floating;
		},
		get item() {
			if (!enabled) return {};
			return item;
		},
		get reference() {
			if (!enabled) return {};
			return reference;
		},
	};
}

function doSwitch(
	orientation: UseListNavigationOptions["orientation"],
	vertical: boolean,
	horizontal: boolean,
) {
	switch (orientation) {
		case "vertical":
			return vertical;
		case "horizontal":
			return horizontal;
		default:
			return vertical || horizontal;
	}
}

function isMainOrientationKey(
	key: string,
	orientation: UseListNavigationOptions["orientation"],
) {
	const vertical = key === ARROW_UP || key === ARROW_DOWN;
	const horizontal = key === ARROW_LEFT || key === ARROW_RIGHT;
	return doSwitch(orientation, vertical, horizontal);
}

function isMainOrientationToEndKey(
	key: string,
	orientation: UseListNavigationOptions["orientation"],
	rtl: boolean,
) {
	const vertical = key === ARROW_DOWN;
	const horizontal = rtl ? key === ARROW_LEFT : key === ARROW_RIGHT;
	return (
		doSwitch(orientation, vertical, horizontal) ||
		key === "Enter" ||
		key === " " ||
		key === ""
	);
}

function isCrossOrientationOpenKey(
	key: string,
	orientation: UseListNavigationOptions["orientation"],
	rtl: boolean,
) {
	const vertical = rtl ? key === ARROW_LEFT : key === ARROW_RIGHT;
	const horizontal = key === ARROW_DOWN;
	return doSwitch(orientation, vertical, horizontal);
}

function isCrossOrientationCloseKey(
	key: string,
	orientation: UseListNavigationOptions["orientation"],
	rtl: boolean,
) {
	const vertical = rtl ? key === ARROW_RIGHT : key === ARROW_LEFT;
	const horizontal = key === ARROW_UP;
	return doSwitch(orientation, vertical, horizontal);
}

export { useListNavigation };
export type { UseListNavigationOptions };
