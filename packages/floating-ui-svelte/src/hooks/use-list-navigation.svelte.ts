import { DEV } from "esm-env";
import { extract } from "../internal/extract.js";
import type {
	Boxed,
	Dimensions,
	FloatingTreeType,
	MaybeGetter,
} from "../types.js";
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
	KeyboardEventHandler,
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

class ListNavigationState {
	#listRef = $derived.by(() => extract(this.opts?.listRef));
	#activeIndex = $derived.by(() => extract(this.opts?.activeIndex));
	#enabled = $derived.by(() => extract(this.opts?.enabled, true));
	#selectedIndex = $derived.by(() => extract(this.opts?.selectedIndex, null));
	#allowEscape = $derived.by(() => extract(this.opts?.allowEscape, false));
	#loop = $derived.by(() => extract(this.opts?.loop, false));
	#nested = $derived.by(() => extract(this.opts?.nested, false));
	#rtl = $derived.by(() => extract(this.opts?.rtl, false));
	#virtual = $derived.by(() => extract(this.opts?.virtual, false));
	#focusItemOnOpenProp = $derived.by(() =>
		extract(this.opts?.focusItemOnOpen, "auto"),
	);
	#focusItemOnHover = $derived.by(() =>
		extract(this.opts?.focusItemOnHover, true),
	);
	#openOnArrowKeyDown = $derived.by(() =>
		extract(this.opts?.openOnArrowKeyDown, true),
	);
	#disabledIndices = $derived.by(() =>
		extract(this.opts?.disabledIndices, undefined),
	);
	#orientation = $derived.by(() => extract(this.opts?.orientation, "vertical"));
	#cols = $derived.by(() => extract(this.opts?.cols, 1));
	#scrollItemIntoView = $derived.by(() =>
		extract(this.opts?.scrollItemIntoView, true),
	);
	#virtualItemRef: UseListNavigationOptions["virtualItemRef"];
	#itemSizes = $derived.by(() => extract(this.opts?.itemSizes));
	#dense = $derived.by(() => extract(this.opts?.dense, false));
	#floatingFocusElement = $derived.by(() =>
		getFloatingFocusElement(this.context.floating),
	);
	#parentId: string | null = null;
	#tree: FloatingTreeType | null = null;
	#index = $state(this.#selectedIndex ?? -1);

	#typeableComboboxReference = $derived.by(() =>
		isTypeableCombobox(this.context.domReference),
	);

	#key: string | null = null;
	#isPointerModality = true;
	#forceSyncFocus = false;
	#forceScrollIntoView = false;

	#activeId = $state<string | undefined>();
	#virtualId = $state<string | undefined>();
	#mounted = false;
	#previousOpen = false;
	#hasActiveIndex = $derived.by(() => this.#activeIndex != null);

	#ariaActiveDescendantProp = $derived.by(() => {
		if (this.#virtual && this.context.open && this.#hasActiveIndex) {
			return {
				"aria-activedescendant": this.#virtualId || this.#activeId,
			};
		}
		return {};
	});

	#focusItemOnOpen = $state(this.#focusItemOnOpenProp);

	constructor(
		private readonly context: FloatingContext | FloatingRootContext,
		private readonly opts: UseListNavigationOptions,
	) {
		if (DEV) {
			if (this.#allowEscape) {
				if (!this.#loop) {
					warn("`useListNavigation` looping must be enabled to allow escaping");
				}

				if (!this.#virtual) {
					warn("`useListNavigation` must be virtual to allow escaping");
				}
			}

			if (this.#orientation === "vertical" && this.#cols > 1) {
				warn(
					"In grid list navigation mode (`cols` > 1), the `orientation` should",
					'be either "horizontal" or "both".',
				);
			}
		}
		this.#virtualItemRef = this.opts.virtualItemRef;
		this.#parentId = useFloatingParentNodeId();
		this.#tree = useFloatingTree();
		this.#mounted = !!this.context.floating;

		// Sync `selectedIndex` to be the `activeIndex` upon opening the floating
		// element. Also, reset `activeIndex` upon closing the floating element.
		watch.pre(
			[
				() => this.#enabled,
				() => this.context.open,
				() => this.context.floating,
				() => this.#selectedIndex,
			],
			() => {
				if (!this.#enabled) return;
				if (this.context.open && this.context.floating) {
					if (this.#focusItemOnOpen && this.#selectedIndex != null) {
						// Regardless of the pointer modality, we want to ensure the selected
						// item comes into view when the floating element is opened.
						this.#forceScrollIntoView = true;
						this.#index = this.#selectedIndex;
						this.#onNavigate();
					}
				} else if (this.#mounted) {
					this.#index = -1;
					this.#onNavigate();
				}
			},
		);

		// Sync `activeIndex` to be the focused item while the floating element is
		// open.
		watch.pre(
			[
				() => this.#enabled,
				() => this.context.open,
				() => this.context.floating,
				() => this.#activeIndex,
				() => this.#selectedIndex,
				() => this.#nested,
				() => this.#listRef,
				() => this.#orientation,
				() => this.#rtl,
				() => this.#disabledIndices,
			],
			() => {
				if (!this.#enabled) return;
				if (!this.context.open) return;
				if (!this.context.floating) return;

				if (this.#activeIndex == null) {
					this.#forceSyncFocus = false;

					if (this.#selectedIndex != null) {
						return;
					}

					// Reset while the floating element was open (e.g. the list changed).
					if (this.#mounted) {
						this.#index = -1;
						this.#focusItem();
					}

					// Initial sync.
					if (
						(!this.#previousOpen || !this.#mounted) &&
						this.#focusItemOnOpen &&
						(this.#key != null ||
							(this.#focusItemOnOpen === true && this.#key == null))
					) {
						let runs = 0;
						const waitForListPopulated = () => {
							if (this.#listRef[0] == null) {
								// Avoid letting the browser paint if possible on the first try,
								// otherwise use rAF. Don't try more than twice, since something
								// is wrong otherwise.
								if (runs < 2) {
									const scheduler = runs
										? requestAnimationFrame
										: queueMicrotask;
									scheduler(waitForListPopulated);
								}
								runs++;
							} else {
								this.#index =
									this.#key == null ||
									isMainOrientationToEndKey(
										this.#key,
										this.#orientation,
										this.#rtl,
									) ||
									this.#nested
										? getMinIndex(this.#listRef, this.#disabledIndices)
										: getMaxIndex(this.#listRef, this.#disabledIndices);
								this.#key = null;
								this.#onNavigate();
							}
						};

						waitForListPopulated();
					}
				} else if (!isIndexOutOfBounds(this.#listRef, this.#activeIndex)) {
					this.#index = this.#activeIndex;
					this.#focusItem();
					this.#forceScrollIntoView = false;
				}
			},
		);

		// Ensure the parent floating element has focus when a nested child closes
		// to allow arrow key navigation to work after the pointer leaves the child.
		watch.pre(
			[
				() => this.#enabled,
				() => this.context.floating,
				() => this.#tree?.nodes,
				() => this.#virtual,
			],
			() => {
				if (
					!this.#enabled ||
					this.context.floating ||
					!this.#tree ||
					this.#virtual ||
					!this.#mounted
				) {
					return;
				}

				const nodes = this.#tree.nodes;
				const parent = nodes.find((node) => node.id === this.#parentId)?.context
					?.floating;
				const activeEl = activeElement(getDocument(this.context.floating));
				const treeContainsActiveEl = nodes.some(
					(node) => node.context && contains(node.context.floating, activeEl),
				);

				if (parent && !treeContainsActiveEl && this.#isPointerModality) {
					parent.focus({ preventScroll: true });
				}
			},
		);

		watch.pre(
			[
				() => this.#enabled,
				() => this.#tree?.nodes,
				() => this.#virtual,
				() => this.#virtualItemRef?.current,
			],
			() => {
				if (!this.#enabled) return;
				if (!this.#tree) return;
				if (!this.#virtual) return;
				if (this.#parentId) return;

				const handleVirtualFocus = (item: HTMLElement) => {
					this.#virtualId = item.id;
					if (this.#virtualItemRef) {
						this.#virtualItemRef.current = item;
					}
				};
				const tree = this.#tree;

				tree.events.on("virtualfocus", handleVirtualFocus);

				return () => {
					tree.events.off("virtualfocus", handleVirtualFocus);
				};
			},
		);

		$effect.pre(() => {
			this.#mounted = !!this.context.floating;
		});

		$effect.pre(() => {
			this.#previousOpen = this.context.open;
		});

		$effect.pre(() => {
			this.#focusItemOnOpen = this.#focusItemOnOpenProp;
		});

		watch.pre(
			() => this.context.open,
			() => {
				if (!this.context.open) {
					this.#key = null;
				}
			},
		);
	}

	#onNavigate = () => {
		this.opts.onNavigate?.(this.#index === -1 ? null : this.#index);
	};

	#syncCurrentTarget = (currentTarget: HTMLElement | null) => {
		if (!this.context.open) return;
		const index = this.#listRef.indexOf(currentTarget);
		if (index !== -1 && this.#index !== index) {
			this.#index = index;
			this.#onNavigate();
		}
	};

	#itemOnFocus: FocusEventHandler<HTMLElement> = ({ currentTarget }) => {
		this.#forceSyncFocus = true;
		this.#syncCurrentTarget(currentTarget);
	};

	#itemOnClick: MouseEventHandler<HTMLElement> = ({ currentTarget }) =>
		currentTarget.focus({ preventScroll: true }); // safari

	#itemOnMouseMove: MouseEventHandler<HTMLElement> = ({ currentTarget }) => {
		this.#forceSyncFocus = true;
		this.#forceScrollIntoView = false;
		this.#syncCurrentTarget(currentTarget);
	};

	#itemOnPointerLeave: PointerEventHandler<HTMLElement> = ({ pointerType }) => {
		if (!this.#isPointerModality || pointerType === "touch") return;

		this.#forceSyncFocus = true;
		this.#index = -1;
		this.#onNavigate();

		if (!this.#virtual) {
			this.#floatingFocusElement?.focus({ preventScroll: true });
		}
	};

	#item: ElementProps["item"] = $derived.by(() => ({
		onfocus: this.#itemOnFocus,
		onclick: this.#itemOnClick,
		...(this.#focusItemOnHover && {
			onmousemove: this.#itemOnMouseMove,
			onpointerleave: this.#itemOnPointerLeave,
		}),
	}));

	#focusItem() {
		const runFocus = (item: HTMLElement) => {
			if (this.#virtual) {
				this.#activeId = item.id;
				this.#tree?.events.emit("virtualfocus", item);
				if (this.#virtualItemRef) {
					this.#virtualItemRef.current = item;
				}
			} else {
				enqueueFocus(item, {
					sync: this.#forceSyncFocus,
					preventScroll: true,
				});
			}
		};

		const initialItem = this.#listRef[this.#index];

		if (initialItem) {
			runFocus(initialItem);
		}

		const scheduler = this.#forceSyncFocus
			? (v: () => void) => v()
			: requestAnimationFrame;

		scheduler(() => {
			const waitedItem = this.#listRef[this.#index] || initialItem;

			if (!waitedItem) return;

			if (!initialItem) {
				runFocus(waitedItem);
			}

			const scrollIntoViewOptions = this.#scrollItemIntoView;
			const shouldScrollIntoView =
				scrollIntoViewOptions &&
				this.#item &&
				(this.#forceScrollIntoView || !this.#isPointerModality);

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

	#commonOnKeyDown = (event: KeyboardEvent) => {
		this.#isPointerModality = true;
		this.#forceSyncFocus = true;

		// When composing a character, Chrome fires ArrowDown twice. Firefox/Safari
		// don't appear to suffer from this. `event.isComposing` is avoided due to
		// Safari not supporting it properly (although it's not needed in the first
		// place for Safari, just avoiding any possible issues).
		if (event.which === 229) return;

		// If the floating element is animating out, ignore navigation. Otherwise,
		// the `activeIndex` gets set to 0 despite not being open so the next time
		// the user ArrowDowns, the first item won't be focused.
		if (
			!this.context.open &&
			event.currentTarget === this.#floatingFocusElement
		) {
			return;
		}

		if (
			this.#nested &&
			isCrossOrientationCloseKey(event.key, this.#orientation, this.#rtl)
		) {
			stopEvent(event);
			this.context.onOpenChange(false, event, "list-navigation");

			if (isHTMLElement(this.context.domReference)) {
				if (this.#virtual) {
					this.#tree?.events.emit("virtualfocus", this.context.domReference);
				} else {
					this.context.domReference.focus();
				}
			}

			return;
		}

		const currentIndex = this.#index;
		const minIndex = getMinIndex(this.#listRef, this.#disabledIndices);
		const maxIndex = getMaxIndex(this.#listRef, this.#disabledIndices);

		if (!this.#typeableComboboxReference) {
			if (event.key === "Home") {
				stopEvent(event);
				this.#index = minIndex;
				this.#onNavigate();
			}

			if (event.key === "End") {
				stopEvent(event);
				this.#index = maxIndex;
				this.#onNavigate();
			}
		}

		// Grid navigation.
		if (this.#cols > 1) {
			const sizes =
				this.#itemSizes ||
				Array.from({ length: this.#listRef.length }, () => ({
					width: 1,
					height: 1,
				}));
			// To calculate movements on the grid, we use hypothetical cell indices
			// as if every item was 1x1, then convert back to real indices.
			const cellMap = buildCellMap(sizes, this.#cols, this.#dense);
			const minGridIndex = cellMap.findIndex(
				(index) =>
					index != null &&
					!isDisabled(this.#listRef, index, this.#disabledIndices),
			);
			// last enabled index
			const maxGridIndex = cellMap.reduce(
				(foundIndex: number, index, cellIndex) =>
					index != null &&
					!isDisabled(this.#listRef, index, this.#disabledIndices)
						? cellIndex
						: foundIndex,
				-1,
			);

			const index =
				cellMap[
					getGridNavigatedIndex(
						cellMap.map((itemIndex) =>
							itemIndex != null ? this.#listRef[itemIndex] : null,
						),
						{
							event,
							orientation: this.#orientation,
							loop: this.#loop,
							rtl: this.#rtl,
							cols: this.#cols,
							// treat undefined (empty grid spaces) as disabled indices so we
							// don't end up in them
							disabledIndices: getCellIndices(
								[
									...(this.#disabledIndices ||
										this.#listRef.map((_, index) =>
											isDisabled(this.#listRef, index) ? index : undefined,
										)),
									undefined,
								],
								cellMap,
							),
							minIndex: minGridIndex,
							maxIndex: maxGridIndex,
							prevIndex: getCellIndexOfCorner(
								this.#index > maxIndex ? minIndex : this.#index,
								sizes,
								cellMap,
								this.#cols,
								// use a corner matching the edge closest to the direction
								// we're moving in so we don't end up in the same item. Prefer
								// top/left over bottom/right.
								event.key === ARROW_DOWN
									? "bl"
									: event.key === (this.#rtl ? ARROW_LEFT : ARROW_RIGHT)
										? "tr"
										: "tl",
							),
							stopEvent: true,
						},
					)
				];

			if (index != null) {
				this.#index = index;
				this.#onNavigate();
			}

			if (this.#orientation === "both") {
				return;
			}
		}

		if (isMainOrientationKey(event.key, this.#orientation)) {
			stopEvent(event);

			// Reset the index if no item is focused.
			if (
				this.context.open &&
				!this.#virtual &&
				isElement(event.currentTarget) &&
				activeElement(event.currentTarget.ownerDocument) === event.currentTarget
			) {
				this.#index = isMainOrientationToEndKey(
					event.key,
					this.#orientation,
					this.#rtl,
				)
					? minIndex
					: maxIndex;
				this.#onNavigate();
				return;
			}

			if (isMainOrientationToEndKey(event.key, this.#orientation, this.#rtl)) {
				if (this.#loop) {
					this.#index =
						currentIndex >= maxIndex
							? this.#allowEscape && currentIndex !== this.#listRef.length
								? -1
								: minIndex
							: findNonDisabledIndex(this.#listRef, {
									startingIndex: currentIndex,
									disabledIndices: this.#disabledIndices,
								});
				} else {
					this.#index = Math.min(
						maxIndex,
						findNonDisabledIndex(this.#listRef, {
							startingIndex: currentIndex,
							disabledIndices: this.#disabledIndices,
						}),
					);
				}
			} else {
				if (this.#loop) {
					this.#index =
						currentIndex <= minIndex
							? this.#allowEscape && currentIndex !== -1
								? this.#listRef.length
								: maxIndex
							: findNonDisabledIndex(this.#listRef, {
									startingIndex: currentIndex,
									decrement: true,
									disabledIndices: this.#disabledIndices,
								});
				} else {
					this.#index = Math.max(
						minIndex,
						findNonDisabledIndex(this.#listRef, {
							startingIndex: currentIndex,
							decrement: true,
							disabledIndices: this.#disabledIndices,
						}),
					);
				}
			}

			if (isIndexOutOfBounds(this.#listRef, this.#index)) {
				this.#index = -1;
			}

			this.#onNavigate();
		}
	};

	#floatingOnPointerMove: PointerEventHandler<HTMLElement> = () => {
		this.#isPointerModality = true;
	};

	#floating: ElementProps["floating"] = $derived.by(() => ({
		"aria-orientation":
			this.#orientation === "both" ? undefined : this.#orientation,
		...(!this.#typeableComboboxReference ? this.#ariaActiveDescendantProp : {}),
		onkeydown: this.#commonOnKeyDown,
		onpointermove: this.#floatingOnPointerMove,
	}));

	#checkVirtualMouse = (event: MouseEvent) => {
		if (this.#focusItemOnOpenProp === "auto" && isVirtualClick(event)) {
			this.#focusItemOnOpen = true;
		}
	};

	#checkVirtualPointer = (event: PointerEvent) => {
		// `pointerdown` fires first, reset the state then perform the checks.
		this.#focusItemOnOpen = this.#focusItemOnOpenProp;
		if (this.#focusItemOnOpenProp === "auto" && isVirtualPointerEvent(event)) {
			this.#focusItemOnOpen = true;
		}
	};

	#referenceOnKeyDown = (event: KeyboardEvent) => {
		this.#isPointerModality = false;
		const isOpen = this.context.open;

		const isArrowKey = event.key.startsWith("Arrow");
		const isHomeOrEndKey = ["Home", "End"].includes(event.key);
		const isMoveKey = isArrowKey || isHomeOrEndKey;
		const isCrossOpenKey = isCrossOrientationOpenKey(
			event.key,
			this.#orientation,
			this.#rtl,
		);
		const isCrossCloseKey = isCrossOrientationCloseKey(
			event.key,
			this.#orientation,
			this.#rtl,
		);
		const isMainKey = isMainOrientationKey(event.key, this.#orientation);
		const isNavigationKey =
			(this.#nested ? isCrossOpenKey : isMainKey) ||
			event.key === "Enter" ||
			event.key.trim() === "";

		if (this.#virtual && isOpen) {
			const rootNode = this.#tree?.nodes.find((node) => node.parentId == null);
			const deepestNode =
				this.#tree && rootNode
					? getDeepestNode(this.#tree.nodes, rootNode.id)
					: null;

			if (isMoveKey && deepestNode && this.#virtualItemRef) {
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
								? this.#listRef.find((item) => item?.id === this.#activeId)
								: null;

					if (dispatchItem) {
						stopEvent(event);
						dispatchItem.dispatchEvent(eventObject);
						this.#virtualId = undefined;
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

			return this.#commonOnKeyDown(event);
		}

		// If a floating element should not open on arrow key down, avoid
		// setting `activeIndex` while it's closed.
		if (!isOpen && !this.#openOnArrowKeyDown && isArrowKey) return;

		if (isNavigationKey) {
			this.#key = this.#nested && isMainKey ? null : event.key;
		}

		if (this.#nested) {
			if (isCrossOpenKey) {
				stopEvent(event);

				if (isOpen) {
					this.#index = getMinIndex(this.#listRef, this.#disabledIndices);
					this.#onNavigate();
				} else {
					this.context.onOpenChange(true, event, "list-navigation");
				}
			}

			return;
		}

		if (isMainKey) {
			if (this.#selectedIndex != null) {
				this.#index = this.#selectedIndex;
			}

			stopEvent(event);

			if (!isOpen && this.#openOnArrowKeyDown) {
				this.context.onOpenChange(true, event, "list-navigation");
			} else {
				this.#commonOnKeyDown(event);
			}

			if (isOpen) {
				this.#onNavigate();
			}
		}
	};

	#referenceOnFocus = () => {
		if (this.context.open && !this.#virtual) {
			this.#index = -1;
			this.#onNavigate();
		}
	};

	#reference: ElementProps["reference"] = $derived.by(() => ({
		...this.#ariaActiveDescendantProp,
		onkeydown: this.#referenceOnKeyDown,
		onfocus: this.#referenceOnFocus,
		onpointerdown: this.#checkVirtualPointer,
		onpointerenter: this.#checkVirtualPointer,
		onmousedown: this.#checkVirtualMouse,
		onclick: this.#checkVirtualMouse,
	}));

	get floating() {
		if (!this.#enabled) return {};
		return this.#floating;
	}

	get item() {
		if (!this.#enabled) return {};
		return this.#item;
	}

	get reference() {
		if (!this.#enabled) return {};
		return this.#reference;
	}
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

function useListNavigation(
	context: FloatingContext | FloatingRootContext,
	opts: UseListNavigationOptions,
) {
	return new ListNavigationState(context, opts);
}

export { useListNavigation };
export type { UseListNavigationOptions };
