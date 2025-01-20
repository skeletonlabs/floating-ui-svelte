<script lang="ts" module>
	import { type Snippet } from "svelte";
	import type { FloatingRootContext } from "../../hooks/use-floating-root-context.svelte.js";
	import type { FloatingContext } from "../../hooks/use-floating.svelte.js";
	import { getNodeName, isHTMLElement } from "@floating-ui/utils/dom";
	import {
		getNextTabbable,
		getPreviousTabbable,
		getTabbableOptions,
		isOutsideEvent,
	} from "../../internal/tabbable.js";
	import { isTabbable, tabbable, type FocusableElement } from "tabbable";
	import { isTypeableCombobox } from "../../internal/is-typeable-element.js";
	import { markOthers, supportsInert } from "../../internal/mark-others.js";
	import { useFloatingTree } from "../floating-tree/hooks.svelte.js";
	import { usePortalContext } from "../floating-portal/hooks.svelte.js";
	import { getFloatingFocusElement } from "../../internal/get-floating-focus-element.js";
	import {
		activeElement,
		contains,
		createAttribute,
		getDocument,
		getTarget,
		isVirtualClick,
		isVirtualPointerEvent,
		stopEvent,
	} from "../../internal/dom.js";
	import { enqueueFocus } from "../../internal/enqueue-focus.js";
	import { on } from "svelte/events";
	import { getChildren } from "../../internal/get-children.js";
	import { getAncestors } from "../../internal/get-ancestors.js";
	import { executeCallbacks } from "../../internal/execute-callbacks.js";
	import type { Boxed, OpenChangeReason } from "../../types.js";
	import { watch } from "../../internal/watch.svelte.js";
	import FocusGuard, { HIDDEN_STYLES_STRING } from "../focus-guard.svelte";

	const LIST_LIMIT = 20;
	globalThis.fuiPrevFocusedElements ??= [];

	function addPreviouslyFocusedElement(element: Element | null) {
		globalThis.fuiPrevFocusedElements =
			globalThis.fuiPrevFocusedElements.filter((el) => el.isConnected);

		if (element && getNodeName(element) !== "body") {
			globalThis.fuiPrevFocusedElements.push(element);
			if (globalThis.fuiPrevFocusedElements.length > LIST_LIMIT) {
				globalThis.fuiPrevFocusedElements =
					globalThis.fuiPrevFocusedElements.slice(-LIST_LIMIT);
			}
		}
	}

	function getPreviouslyFocusedElement() {
		return globalThis.fuiPrevFocusedElements
			.slice()
			.reverse()
			.find((el) => el.isConnected);
	}

	function getFirstTabbableElement(container: Element) {
		const tabbableOptions = getTabbableOptions();
		if (isTabbable(container, tabbableOptions)) {
			return container;
		}

		return tabbable(container, tabbableOptions)[0] || container;
	}

	interface FloatingFocusManagerProps {
		children: Snippet;
		/**
		 * The floating context returned from `useFloatingRootContext`.
		 */
		context: FloatingRootContext | FloatingContext;
		/**
		 * Whether or not the focus manager should be disabled. Useful to delay focus
		 * management until after a transition completes or some other conditional
		 * state.
		 * @default false
		 */
		disabled?: boolean;
		/**
		 * The order in which focus cycles.
		 * @default ['content']
		 */
		order?: Array<"reference" | "floating" | "content">;
		/**
		 * Which element to initially focus. Can be either a number (tabbable index as
		 * specified by the `order`) or a ref.
		 * @default 0
		 */
		initialFocus?: number | HTMLElement | null;
		/**
		 * Determines if the focus guards are rendered. If not, focus can escape into
		 * the address bar/console/browser UI, like in native dialogs.
		 * @default true
		 */
		guards?: boolean;
		/**
		 * Determines if focus should be returned to the reference element once the
		 * floating element closes/unmounts (or if that is not available, the
		 * previously focused element). This prop is ignored if the floating element
		 * lost focus.
		 * It can be also set to a ref to explicitly control the element to return focus to.
		 * @default true
		 */
		returnFocus?: boolean | HTMLElement | null;
		/**
		 * Determines if focus should be restored to the nearest tabbable element if
		 * focus inside the floating element is lost (such as due to the removal of
		 * the currently focused element from the DOM).
		 * @default false
		 */
		restoreFocus?: boolean;
		/**
		 * Determines if focus is “modal”, meaning focus is fully trapped inside the
		 * floating element and outside content cannot be accessed. This includes
		 * screen reader virtual cursors.
		 * @default true
		 */
		modal?: boolean;
		/**
		 * If your focus management is modal and there is no explicit close button
		 * available, you can use this prop to render a visually-hidden dismiss
		 * button at the start and end of the floating element. This allows
		 * touch-based screen readers to escape the floating element due to lack of
		 * an `esc` key.
		 * @default undefined
		 */
		visuallyHiddenDismiss?: boolean | string;
		/**
		 * Determines whether `focusout` event listeners that control whether the
		 * floating element should be closed if the focus moves outside of it are
		 * attached to the reference and floating elements. This affects non-modal
		 * focus management.
		 * @default true
		 */
		closeOnFocusOut?: boolean;
		/**
		 * Determines whether outside elements are `inert` when `modal` is enabled.
		 * This enables pointer modality without a backdrop.
		 * @default false
		 */
		outsideElementsInert?: boolean;
	}

	type DismissButtonSnippetProps = {
		ref: Boxed<HTMLElement>;
	};

	export type { FloatingFocusManagerProps };
</script>

<script lang="ts">
	import VisuallyHiddenDismiss from "./visually-hidden-dismiss.svelte";
	import { box } from "../../internal/box.svelte.js";
	import { reactiveActiveElement } from "../../internal/active-element.svelte.js";
	import { sleep } from "../../internal/sleep.js";
	import { handleGuardFocus } from "../../internal/handle-guard-focus.js";

	let {
		context,
		children,
		disabled = false,
		order = ["content"],
		guards: _guards = true,
		initialFocus = 0,
		returnFocus = true,
		restoreFocus = false,
		modal = true,
		visuallyHiddenDismiss = false,
		closeOnFocusOut = true,
		outsideElementsInert = false,
	}: FloatingFocusManagerProps = $props();

	const nodeId = $derived(context.data.floatingContext?.nodeId);
	const ignoreInitialFocus = $derived(
		typeof initialFocus === "number" && initialFocus < 0
	);

	// If the reference is a combobox and is typeable (e.g. input/textarea),
	// there are different focus semantics. The guards should not be rendered, but
	// aria-hidden should be applied to all nodes still. Further, the visually
	// hidden dismiss button should only appear at the end of the list, not the
	// start.
	const isUntrappedTypeableCombobox = $derived(
		isTypeableCombobox(context.domReference) && ignoreInitialFocus
	);

	const inertSupported = supportsInert();
	const guards = $derived(inertSupported ? _guards : true);
	const useInert = $derived(
		!guards || (inertSupported && outsideElementsInert)
	);
	const tree = useFloatingTree();
	const portalContext = usePortalContext();

	const startDismissButtonRef = box<HTMLElement>(null!);
	const endDismissButtonRef = box<HTMLButtonElement>(null!);

	let preventReturnFocus = false;
	let isPointerDown = false;
	let tabbableIndex = $state(-1);
	let prevActiveElement: Element | null = null;

	let beforeGuardRef = $state<HTMLSpanElement | null>(null);
	let afterGuardRef = $state<HTMLSpanElement | null>(null);

	const isInsidePortal = portalContext != null;

	$effect(() => {
		if (reactiveActiveElement.current === null) return;
		prevActiveElement = reactiveActiveElement.current;
	});

	const floatingFocusElement = $derived(
		getFloatingFocusElement(context.floating)
	);

	function getTabbableContent(
		container: Element | null = floatingFocusElement
	) {
		return container ? tabbable(container, getTabbableOptions()) : [];
	}

	function getTabbableElements(container?: Element) {
		const content = getTabbableContent(container);
		const ordered = order
			.map((type) => {
				if (context.domReference && type === "reference") {
					return context.domReference;
				}

				if (floatingFocusElement && type === "floating") {
					return floatingFocusElement;
				}

				return content;
			})
			.filter(Boolean)
			.flat() as Array<FocusableElement>;
		return ordered;
	}

	watch(
		[
			() => disabled,
			() => context.domReference,
			() => floatingFocusElement,
			() => modal,
			() => order,
			() => isUntrappedTypeableCombobox,
		],
		() => {
			if (disabled || !modal) return;

			function onKeyDown(event: KeyboardEvent) {
				if (event.key !== "Tab") return;

				// The focus guards have nothing to focus, so we need to stop the event.
				if (
					contains(
						floatingFocusElement,
						activeElement(getDocument(floatingFocusElement))
					) &&
					getTabbableContent().length === 0 &&
					!isUntrappedTypeableCombobox
				) {
					stopEvent(event);
				}

				const els = getTabbableElements();
				const target = getTarget(event);

				if (
					order[0] === "reference" &&
					target === context.domReference
				) {
					stopEvent(event);
					if (event.shiftKey) {
						enqueueFocus(els[els.length - 1]);
					} else {
						enqueueFocus(els[1]);
					}
				}

				if (
					order[1] === "floating" &&
					target === floatingFocusElement &&
					event.shiftKey
				) {
					stopEvent(event);
					enqueueFocus(els[0]);
				}
			}

			const doc = getDocument(floatingFocusElement);

			return on(doc, "keydown", onKeyDown);
		}
	);

	watch([() => disabled, () => context.floating], () => {
		if (disabled || !context.floating) return;

		function handleFocusIn(event: FocusEvent) {
			const target = getTarget(event) as Element | null;
			const tabbableContent =
				getTabbableContent() as Array<Element | null>;
			const index = tabbableContent.indexOf(target);
			if (index !== -1) {
				tabbableIndex = index;
			}
		}

		return on(context.floating, "focusin", handleFocusIn);
	});

	watch(
		[
			() => disabled,
			() => context.domReference,
			() => context.floating,
			() => floatingFocusElement,
			() => modal,
			() => tree,
			() => portalContext,
			() => closeOnFocusOut,
			() => restoreFocus,
			() => isUntrappedTypeableCombobox,
		],
		() => {
			if (disabled || !closeOnFocusOut) return;

			// In Safari, buttons lose focus when pressing them.
			function handlePointerDown() {
				isPointerDown = true;
				setTimeout(() => {
					isPointerDown = false;
				});
			}

			function handleFocusOutside(event: FocusEvent) {
				const relatedTarget = event.relatedTarget as HTMLElement | null;

				queueMicrotask(() => {
					const movedToUnrelatedNode = !(
						contains(context.domReference, relatedTarget) ||
						contains(context.floating, relatedTarget) ||
						contains(relatedTarget, context.floating) ||
						contains(portalContext?.portalNode, relatedTarget) ||
						relatedTarget?.hasAttribute(
							createAttribute("focus-guard")
						) ||
						(tree &&
							(getChildren(tree.nodes, nodeId).find(
								(node) =>
									contains(
										node.context?.floating,
										relatedTarget
									) ||
									contains(
										node.context?.domReference,
										relatedTarget
									)
							) ||
								getAncestors(tree.nodes, nodeId).find(
									(node) =>
										[
											node.context?.floating,
											getFloatingFocusElement(
												node.context?.floating
											),
										].includes(relatedTarget) ||
										node.context?.domReference ===
											relatedTarget
								)))
					);

					// Restore focus to the previous tabbable element index to prevent
					// focus from being lost outside the floating tree.
					if (
						restoreFocus &&
						movedToUnrelatedNode &&
						activeElement(getDocument(floatingFocusElement)) ===
							getDocument(floatingFocusElement).body
					) {
						// Let `FloatingPortal` effect knows that focus is still inside the
						// floating tree.
						if (isHTMLElement(floatingFocusElement)) {
							floatingFocusElement.focus();
						}

						const prevTabbableIndex = tabbableIndex;
						const tabbableContent =
							getTabbableContent() as Array<Element | null>;
						const nodeToFocus =
							tabbableContent[prevTabbableIndex] ||
							tabbableContent[tabbableContent.length - 1] ||
							floatingFocusElement;

						if (isHTMLElement(nodeToFocus)) {
							nodeToFocus.focus();
						}
					}

					// Focus did not move inside the floating tree, and there are no tabbable
					// portal guards to handle closing.
					if (
						(isUntrappedTypeableCombobox ? true : !modal) &&
						relatedTarget &&
						movedToUnrelatedNode &&
						!isPointerDown &&
						relatedTarget !== getPreviouslyFocusedElement()
					) {
						preventReturnFocus = true;
						context.onOpenChange(false, event, "focus-out");
					}
				});
			}

			if (context.floating && isHTMLElement(context.domReference)) {
				return executeCallbacks(
					on(context.domReference, "focusout", handleFocusOutside),
					on(context.domReference, "pointerdown", handlePointerDown),
					on(context.floating, "focusout", handleFocusOutside)
				);
			}
		}
	);

	watch.pre(
		() => beforeGuardRef,
		() => {
			if (!portalContext) return;
			portalContext.beforeInsideGuard = beforeGuardRef;
		}
	);
	watch.pre(
		() => afterGuardRef,
		() => {
			if (!portalContext) return;
			portalContext.afterInsideGuard = afterGuardRef;
		}
	);

	watch(
		[
			() => disabled,
			() => context.domReference,
			() => context.floating,
			() => modal,
			() => order,
			() => portalContext,
			() => isUntrappedTypeableCombobox,
			() => guards,
			() => useInert,
			() => tree?.nodes,
		],
		() => {
			if (disabled || !context.floating) return;

			// Don't hide portals nested within the parent portal.
			const portalNodes = Array.from(
				portalContext?.portalNode?.querySelectorAll(
					`[${createAttribute("portal")}]`
				) || []
			);

			const ancestorFloatingNodes =
				tree && !modal
					? getAncestors(tree?.nodes, nodeId).map(
							(node) => node.context?.floating
						)
					: [];

			const insideElements = [
				context.floating,
				...portalNodes,
				...ancestorFloatingNodes,
				startDismissButtonRef.current,
				endDismissButtonRef.current,
				beforeGuardRef,
				afterGuardRef,
				portalContext?.beforeOutsideGuard,
				portalContext?.afterOutsideGuard,
				order.includes("reference") || isUntrappedTypeableCombobox
					? context.domReference
					: null,
			].filter((x): x is Element => x != null);

			const cleanup =
				modal || isUntrappedTypeableCombobox
					? markOthers(insideElements, !useInert, useInert)
					: markOthers(insideElements);

			return () => {
				cleanup();
			};
		}
	);

	watch.pre(
		[
			() => disabled,
			() => context.open,
			() => floatingFocusElement,
			() => ignoreInitialFocus,
			() => initialFocus,
		],
		() => {
			if (disabled || !isHTMLElement(floatingFocusElement)) return;

			const doc = getDocument(floatingFocusElement);
			const previouslyFocusedElement = activeElement(doc);
			// Wait for any effect state setters to execute to set `tabindex`.
			queueMicrotask(() => {
				const focusableElements =
					getTabbableElements(floatingFocusElement);
				const initialFocusValue = initialFocus;
				const elToFocus =
					(typeof initialFocusValue === "number"
						? focusableElements[initialFocusValue]
						: initialFocusValue) || floatingFocusElement;
				const focusAlreadyInsideFloatingEl = contains(
					floatingFocusElement,
					previouslyFocusedElement
				);

				if (
					!ignoreInitialFocus &&
					!focusAlreadyInsideFloatingEl &&
					context.open
				) {
					enqueueFocus(elToFocus, {
						preventScroll: elToFocus === floatingFocusElement,
					});
				}
			});
		}
	);

	watch.pre(
		[
			() => disabled,
			() => context.floating,
			() => floatingFocusElement,
			() => returnFocus,
			() => context.data,
			() => context.events,
			() => tree?.nodes,
			() => isInsidePortal,
			() => context.domReference,
		],
		() => {
			if (disabled || !floatingFocusElement) return;

			let preventReturnFocusScroll = false;

			const doc = getDocument(floatingFocusElement);
			const previouslyFocusedElement = activeElement(doc);
			const contextData = context.data;
			let openEvent = contextData.openEvent;

			addPreviouslyFocusedElement(previouslyFocusedElement);

			// Dismissing via outside press should always ignore `returnFocus` to
			// prevent unwanted scrolling.
			function onOpenChange({
				open,
				reason,
				event,
				nested,
			}: {
				open: boolean;
				reason: OpenChangeReason;
				event: Event;
				nested: boolean;
			}) {
				if (open) {
					openEvent = event;
				}

				if (reason === "escape-key" && context.domReference) {
					addPreviouslyFocusedElement(context.domReference);
				}

				if (
					["hover", "safe-polygon"].includes(reason) &&
					event.type === "mouseleave"
				) {
					preventReturnFocus = true;
				}

				if (reason !== "outside-press") return;

				if (nested) {
					preventReturnFocus = false;
					preventReturnFocusScroll = true;
				} else {
					preventReturnFocus = !(
						isVirtualClick(event as MouseEvent) ||
						isVirtualPointerEvent(event as PointerEvent)
					);
				}
			}

			context.events.on("openchange", onOpenChange);

			const fallbackEl = doc.createElement("span");
			fallbackEl.setAttribute("tabindex", "-1");
			fallbackEl.setAttribute("aria-hidden", "true");
			fallbackEl.setAttribute("style", HIDDEN_STYLES_STRING);

			if (isInsidePortal && context.domReference) {
				context.domReference.insertAdjacentElement(
					"afterend",
					fallbackEl
				);
			}

			function getReturnElement() {
				if (typeof returnFocus === "boolean") {
					return getPreviouslyFocusedElement() || fallbackEl;
				}

				return returnFocus || fallbackEl;
			}

			return () => {
				context.events.off("openchange", onOpenChange);

				const isFocusInsideFloatingTree =
					contains(context.floating, prevActiveElement) ||
					(tree &&
						getChildren(tree.nodes, nodeId).some((node) =>
							contains(node.context?.floating, prevActiveElement)
						));
				const shouldFocusReference =
					isFocusInsideFloatingTree ||
					(openEvent &&
						["click", "mousedown"].includes(openEvent.type));

				if (shouldFocusReference && context.domReference) {
					addPreviouslyFocusedElement(context.domReference);
				}

				const returnElement = getReturnElement();

				queueMicrotask(() => {
					// This is `returnElement`, if it's tabbable, or its first tabbable child.
					const tabbableReturnElement =
						getFirstTabbableElement(returnElement);
					if (
						// eslint-disable-next-line react-hooks/exhaustive-deps
						returnFocus &&
						!preventReturnFocus &&
						isHTMLElement(tabbableReturnElement) &&
						// If the focus moved somewhere else after mount, avoid returning focus
						// since it likely entered a different element which should be
						// respected: https://github.com/floating-ui/floating-ui/issues/2607
						(tabbableReturnElement !== prevActiveElement &&
						prevActiveElement !== doc.body
							? isFocusInsideFloatingTree
							: true)
					) {
						tabbableReturnElement.focus({
							preventScroll: preventReturnFocusScroll,
						});
					}

					fallbackEl.remove();
				});
			};
		}
	);

	watch(
		() => disabled,
		() => {
			disabled;
			// The `returnFocus` cleanup behavior is inside a microtask; ensure we
			// wait for it to complete before resetting the flag.
			queueMicrotask(() => {
				preventReturnFocus = false;
			});
		}
	);

	watch.pre(
		[
			() => disabled,
			() => portalContext,
			() => modal,
			() => context.open,
			() => closeOnFocusOut,
			() => context.domReference,
		],
		() => {
			if (disabled || !portalContext) return;

			portalContext.setFocusManagerState({
				modal,
				open: context.open,
				closeOnFocusOut,
				onOpenChange: context.onOpenChange,
				domReference: context.domReference,
			});

			return () => {
				portalContext.setFocusManagerState(null);
			};
		}
	);

	watch.pre(
		[
			() => disabled,
			() => context.floating,
			() => floatingFocusElement,
			() => context.domReference,
			() => order,
			() => ignoreInitialFocus,
		],
		() => {
			if (disabled) return;
			if (!floatingFocusElement) return;
			if (typeof MutationObserver !== "function") return;
			if (ignoreInitialFocus) return;

			const handleMutation = () => {
				const tabIndex = floatingFocusElement.getAttribute("tabindex");
				const tabbableContent =
					getTabbableContent() as Array<Element | null>;
				const activeEl = activeElement(getDocument(context.floating));
				const _tabbableIndex = tabbableContent.indexOf(activeEl);

				if (_tabbableIndex !== -1) {
					tabbableIndex = _tabbableIndex;
				}

				if (
					order.includes("floating") ||
					(activeEl !== context.domReference &&
						tabbableContent.length === 0)
				) {
					if (tabIndex !== "0") {
						floatingFocusElement.setAttribute("tabindex", "0");
					}
				} else if (tabIndex !== "-1") {
					floatingFocusElement.setAttribute("tabindex", "-1");
				}
			};

			handleMutation();
			const observer = new MutationObserver(handleMutation);

			observer.observe(floatingFocusElement, {
				childList: true,
				subtree: true,
				attributes: true,
			});

			return () => {
				observer.disconnect();
			};
		}
	);

	const shouldRenderGuards = $derived(
		!disabled &&
			guards &&
			(modal ? !isUntrappedTypeableCombobox : true) &&
			(isInsidePortal || modal)
	);
</script>

{#snippet DismissButton({ ref }: DismissButtonSnippetProps)}
	{#if !disabled && visuallyHiddenDismiss && modal}
		<VisuallyHiddenDismiss
			bind:ref={ref.current}
			onclick={(event) => context.onOpenChange(false, event)}>
			{typeof visuallyHiddenDismiss === "string"
				? visuallyHiddenDismiss
				: "Dismiss"}
		</VisuallyHiddenDismiss>
	{/if}
{/snippet}

{#if shouldRenderGuards}
	<FocusGuard
		type="inside"
		bind:ref={() => beforeGuardRef, (v) => (beforeGuardRef = v)}
		onfocus={(event) => {
			if (modal) {
				sleep().then(() => {
					const els = getTabbableElements();
					enqueueFocus(
						order[0] === "reference" ? els[0] : els[els.length - 1]
					);
				});
			} else if (
				portalContext?.preserveTabOrder &&
				portalContext.portalNode
			) {
				preventReturnFocus = false;
				if (isOutsideEvent(event, portalContext.portalNode)) {
					sleep().then(() => {
						const nextTabbable =
							getNextTabbable() || context.domReference;
						nextTabbable?.focus();
					});
				} else {
					handleGuardFocus(portalContext.beforeOutsideGuard);
				}
			}
		}} />
{/if}
<!--
Ensure the first swipe is the list item. The end of the listbox popup
will have a dismiss button.
-->
{#if !isUntrappedTypeableCombobox}
	{@render DismissButton({ ref: startDismissButtonRef })}
{/if}
{@render children?.()}
{@render DismissButton({ ref: endDismissButtonRef })}
{#if shouldRenderGuards}
	<FocusGuard
		type="inside"
		bind:ref={() => afterGuardRef, (v) => (afterGuardRef = v)}
		onfocus={(event) => {
			if (modal) {
				sleep().then(() => {
					enqueueFocus(getTabbableElements()[0]);
				});
			} else if (
				portalContext?.preserveTabOrder &&
				portalContext.portalNode
			) {
				if (closeOnFocusOut) {
					preventReturnFocus = true;
				}

				if (isOutsideEvent(event, portalContext.portalNode)) {
					sleep().then(() => {
						const prevTabbable =
							getPreviousTabbable() || context.domReference;

						prevTabbable?.focus();
					});
				} else {
					handleGuardFocus(portalContext.afterOutsideGuard);
				}
			}
		}} />
{/if}
