import type { OpenChangeReason } from '$lib/types.js';
import { isElement } from '@floating-ui/utils/dom';
import type { FloatingContext } from '../useFloating/index.svelte.js';
import type { ElementProps } from '../useInteractions/index.svelte.js';
import { createAttribute } from '$lib/utils/create-attribute.js';
import { isMouseLikePointerType } from '$lib/utils/is-mouse-like-pointer-type.js';
import { noop } from '$lib/utils/noop.js';
import { getDocument } from '$lib/utils/get-document.js';
import { contains } from '$lib/utils/contains.js';

interface DelayOptions {
	/**
	 * Time in ms that will delay the change of the open state to true.
	 * @default 0
	 */
	open?: number;

	/**
	 * Time in ms that will delay the change of the open state to false.
	 * @default 0
	 */
	close?: number;
}

interface HandleCloseFn {
	(
		context: FloatingContext & {
			onClose: () => void;
			leave?: boolean;
		},
	): (event: MouseEvent) => void;
	__options: {
		blockPointerEvents: boolean;
	};
}

interface UseHoverOptions {
	/**
	 * Enables/disables the hook.
	 * @default true
	 */
	enabled?: boolean;

	/**
	 * Only allow pointers of type mouse to trigger the hover (thus excluding pens and touchscreens).
	 * @default false
	 */
	mouseOnly?: boolean;

	/**
	 * Time in ms that will delay the change of the open state.
	 * @default 0
	 */
	delay?: number | DelayOptions;

	/**
	 * Time in ms that the pointer must rest on the reference element before the open state is set to true.
	 * @default 0
	 */
	restMs?: number;

	/**
	 * Whether moving the pointer over the floating element will open it, without a regular hover event required.
	 * @default true
	 */
	move?: boolean;

	/**
	 * Callback to handle the closing of the floating element.
	 * @default null
	 */
	handleClose?: HandleCloseFn | null;
}

const safePolygonIdentifier = createAttribute('safe-polygon');

function getDelay(
	value: UseHoverOptions['delay'],
	prop: 'open' | 'close',
	pointerType?: PointerEvent['pointerType'],
) {
	if (pointerType && !isMouseLikePointerType(pointerType)) {
		return 0;
	}

	if (typeof value === 'number') {
		return value;
	}

	return value?.[prop];
}

function useHover(context: FloatingContext, options: UseHoverOptions = {}): ElementProps {
	const {
		open,
		onOpenChange,
		data,
		events,
		elements: { reference, floating },
	} = $derived(context);

	const enabled = $derived(options.enabled ?? true);
	const mouseOnly = $derived(options.mouseOnly ?? false);
	const delay = $derived(options.delay ?? 0);
	const restMs = $derived(options.restMs ?? 0);
	const move = $derived(options.move ?? true);
	const handleClose = $derived(options.handleClose ?? null);

	// const tree = useFloatingTree();
	// const parentId = useFloatingParentNodeId();
	let pointerType: string | undefined = undefined;
	let timeout = -1;
	let handler: ((event: MouseEvent) => void) | undefined = undefined;
	let restTimeout = -1;
	let blockMouseMove = true;
	let performedPointerEventsMutation = false;
	let unbindMouseMove = noop;

	const isHoverOpen = $derived.by(() => {
		const type = data.openEvent?.type;
		return type?.includes('mouse') && type !== 'mousedown';
	});

	const isClickLikeOpenEvent = $derived(
		data.openEvent ? ['click', 'mousedown'].includes(data.openEvent.type) : false,
	);

	$effect(() => {
		if (!enabled) {
			return;
		}

		const onOpenChange = ({ open }: { open: boolean }) => {
			if (!open) {
				clearTimeout(timeout);
				clearTimeout(restTimeout);
				blockMouseMove = true;
			}
		};

		events.on('openchange', onOpenChange);
		return () => {
			events.off('openchange', onOpenChange);
		};
	});

	$effect(() => {
		if (enabled || !handleClose || !open) {
			return;
		}

		const onLeave = (event: MouseEvent) => {
			if (!isHoverOpen) {
				return;
			}
			onOpenChange(false, event, 'hover');
		};

		const document = getDocument(floating);
		document.addEventListener('mouseleave', onLeave);
		return () => {
			document.removeEventListener('mouseleave', onLeave);
		};
	});

	const closeWithDelay = (
		event: Event,
		runElseBranch = true,
		reason: OpenChangeReason = 'hover',
	) => {
		const closeDelay = getDelay(delay, 'close', pointerType);
		if (closeDelay && !handler) {
			clearTimeout(timeout);
			timeout = window.setTimeout(() => onOpenChange(false, event, reason), closeDelay);
		} else if (runElseBranch) {
			clearTimeout(timeout);
			onOpenChange(false, event, reason);
		}
	};

	const cleanupMouseMoveHandler = () => {
		unbindMouseMove();
		handler = undefined;
	};

	const clearPointerEvents = () => {
		if (!performedPointerEventsMutation) {
			return;
		}
		const body = getDocument(floating).body;
		body.style.pointerEvents = '';
		body.removeAttribute(safePolygonIdentifier);
		performedPointerEventsMutation = false;
	};

	// Block pointer-events of every element other than the reference and floating
	// while the floating element is open and has a `handleClose` handler. Also
	// handles nested floating elements.
	// https://github.com/floating-ui/floating-ui/issues/1722
	$effect(() => {
		if (!enabled) {
			return;
		}

		if (open && handleClose?.__options.blockPointerEvents && isHoverOpen) {
			const body = getDocument(floating).body;
			body.setAttribute(safePolygonIdentifier, '');
			body.style.pointerEvents = 'none';
			performedPointerEventsMutation = true;

			if (isElement(reference) && floating) {
				const ref = reference as unknown as HTMLElement | SVGSVGElement;

				// const parentFloating = tree?.nodesRef.current.find((node) => node.id === parentId)?.context
				// 	?.elements.floating;

				// if (parentFloating) {
				// 	parentFloating.style.pointerEvents = '';
				// }

				ref.style.pointerEvents = 'auto';
				floating.style.pointerEvents = 'auto';

				return () => {
					ref.style.pointerEvents = '';
					floating.style.pointerEvents = '';
				};
			}
		}
	});

	$effect(() => {
		if (!open) {
			pointerType = undefined;
			cleanupMouseMoveHandler();
			clearPointerEvents();
		}
	});

	$effect(() => {
		return () => {
			cleanupMouseMoveHandler();
			clearTimeout(timeout);
			clearTimeout(restTimeout);
			clearPointerEvents();
		};
	});

	const elementProps = $derived.by(() => {
		if (!enabled) {
			return {};
		}

		const onmouseenter = (event: MouseEvent) => {
			clearTimeout(timeout);
			blockMouseMove = false;

			if (
				(mouseOnly && !isMouseLikePointerType(pointerType)) ||
				(restMs > 0 && !getDelay(delay, 'open'))
			) {
				return;
			}

			const openDelay = getDelay(delay, 'open', pointerType);

			if (openDelay) {
				timeout = window.setTimeout(() => {
					onOpenChange(true, event, 'hover');
				}, openDelay);
			} else {
				onOpenChange(true, event, 'hover');
			}
		};

		return {
			reference: {
				onpointerdown: (event: PointerEvent) => (pointerType = event.pointerType),
				onpointerenter: (event: PointerEvent) => (pointerType = event.pointerType),
				onmouseenter,
				onmousemove: (event: MouseEvent) => {
					if (move) {
						onmouseenter(event);
					}
					function handleMouseMove() {
						if (!blockMouseMove) {
							onOpenChange(true, event, 'hover');
						}
					}

					if (mouseOnly && !isMouseLikePointerType(pointerType)) {
						return;
					}

					if (open || restMs === 0) {
						return;
					}

					clearTimeout(restTimeout);

					if (pointerType === 'touch') {
						handleMouseMove();
					} else {
						restTimeout = window.setTimeout(handleMouseMove, restMs);
					}
				},
				onmouseleave: (event: MouseEvent) => {
					if (!isClickLikeOpenEvent) {
						unbindMouseMove();

						const doc = getDocument(floating);
						clearTimeout(restTimeout);

						if (handleClose) {
							// Prevent clearing `onScrollMouseLeave` timeout.
							if (!open) {
								clearTimeout(timeout);
							}

							handler = handleClose({
								...context,
								// tree,
								x: event.clientX,
								y: event.clientY,
								onClose() {
									clearPointerEvents();
									cleanupMouseMoveHandler();
									closeWithDelay(event, true, 'safe-polygon');
								},
							});

							const localHandler = handler;

							doc.addEventListener('mousemove', localHandler);
							unbindMouseMove = () => {
								doc.removeEventListener('mousemove', localHandler);
							};

							return;
						}

						// Allow interactivity without `safePolygon` on touch devices. With a
						// pointer, a short close delay is an alternative, so it should work
						// consistently.
						const shouldClose =
							pointerType === 'touch'
								? !contains(floating, event.relatedTarget as Element | null)
								: true;
						if (shouldClose) {
							closeWithDelay(event);
						}
					}

					if (open && !isClickLikeOpenEvent) {
						handleClose?.({
							...context,
							// tree,
							x: event.clientX,
							y: event.clientY,
							onClose() {
								clearPointerEvents();
								cleanupMouseMoveHandler();
								closeWithDelay(event);
							},
						})(event);
					}
				},
			},
			floating: {
				onmouseenter() {
					clearTimeout(timeout);
				},
				onmouseleave(event: MouseEvent) {
					if (!isClickLikeOpenEvent) {
						handleClose?.({
							...context,
							// tree,
							x: event.clientX,
							y: event.clientY,
							onClose() {
								clearPointerEvents();
								cleanupMouseMoveHandler();
								closeWithDelay(event);
							},
						})(event);
					}
					closeWithDelay(event, false);
				},
			},
		};
	});

	return elementProps;
}

export { useHover, type UseHoverOptions };
