import { on } from "svelte/events";
import { box, type WritableBox } from "./box.svelte.js";
import { executeCallbacks } from "./execute-callbacks.js";
import type { Getter, Side } from "../types.js";
import { isElement, isHTMLElement } from "@floating-ui/utils/dom";
import { watch } from "./watch.svelte.js";

// https://stackoverflow.com/questions/55541275/typescript-check-for-the-any-type
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
/**
 * will return `true` if `T` is `any`, or `false` otherwise
 */
type IsAny<T> = IfAny<T, true, false>;

// any extends void = true
// so we need to check if T is any first
type Callback<T> = IsAny<T> extends true
	? // biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(param: any) => void
	: // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
		[T] extends [void]
		? () => void
		: (param: T) => void;

type EventHookOn<T = unknown> = (fn: Callback<T>) => { off: () => void };
type EventHookOff<T = unknown> = (fn: Callback<T>) => void;
type EventHookTrigger<T = unknown> = (param?: T) => Promise<unknown[]>;

interface EventHook<T = unknown> {
	on: EventHookOn<T>;
	off: EventHookOff<T>;
	trigger: EventHookTrigger<T>;
}

function createEventHook<T = unknown>(): EventHook<T> {
	const callbacks: Set<Callback<T>> = new Set();
	const callbacksToDispose: Callback<T>[] = [];

	function off(cb: Callback<T>) {
		callbacks.delete(cb);
	}

	function on(cb: Callback<T>) {
		callbacks.add(cb);
		const offFn = () => off(cb);
		callbacksToDispose.push(offFn);
		return { off: offFn };
	}

	const trigger: EventHookTrigger<T> = (...args) => {
		return Promise.all(
			Array.from(callbacks).map((cb) => {
				return Promise.resolve(cb(...(args as [T])));
			}),
		);
	};

	$effect(() => {
		return () => {
			executeCallbacks(callbacksToDispose);
		};
	});

	return {
		on,
		off,
		trigger,
	};
}

/**
 * Creates a box which will be reset to the default value after some time.
 *
 * @param defaultValue The value which will be set.
 * @param afterMs      A zero-or-greater delay in milliseconds.
 */
function boxAutoReset<T>(defaultValue: T, afterMs = 10000): WritableBox<T> {
	let timeout: NodeJS.Timeout | null = null;
	let value = $state(defaultValue);

	function resetAfter() {
		return setTimeout(() => {
			value = defaultValue;
		}, afterMs);
	}

	$effect(() => {
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	});

	return box.with(
		() => value,
		(v) => {
			value = v;
			if (timeout) clearTimeout(timeout);
			timeout = resetAfter();
		},
	);
}

function useGraceArea(
	getTriggerNode: Getter<HTMLElement | null>,
	getContentNode: Getter<HTMLElement | null>,
) {
	const isPointerInTransit = boxAutoReset(false, 300);
	const triggerNode = $derived(getTriggerNode());
	const contentNode = $derived(getContentNode());

	let pointerGraceArea = $state<Polygon | null>(null);
	const pointerExit = createEventHook<void>();

	function handleRemoveGraceArea() {
		pointerGraceArea = null;
		isPointerInTransit.current = false;
	}

	function handleCreateGraceArea(e: PointerEvent, hoverTarget: HTMLElement) {
		const currentTarget = e.currentTarget;
		if (!isHTMLElement(currentTarget)) return;
		const exitPoint = { x: e.clientX, y: e.clientY };
		const exitSide = getExitSideFromRect(
			exitPoint,
			currentTarget.getBoundingClientRect(),
		);
		const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
		const hoverTargetPoints = getPointsFromRect(
			hoverTarget.getBoundingClientRect(),
		);
		const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
		pointerGraceArea = graceArea;
		isPointerInTransit.current = true;
	}

	watch(
		[() => triggerNode, () => contentNode],
		([triggerNode, contentNode]) => {
			if (!triggerNode || !contentNode) return;
			const handleTriggerLeave = (e: PointerEvent) => {
				handleCreateGraceArea(e, contentNode!);
			};

			const handleContentLeave = (e: PointerEvent) => {
				handleCreateGraceArea(e, triggerNode!);
			};

			return executeCallbacks(
				on(triggerNode, "pointerleave", handleTriggerLeave),
				on(contentNode, "pointerleave", handleContentLeave),
			);
		},
	);

	watch(
		() => pointerGraceArea,
		(pointerGraceArea) => {
			const handleTrackPointerGrace = (e: PointerEvent) => {
				if (!pointerGraceArea) return;
				const target = e.target;
				if (!isElement(target)) return;
				const pointerPosition = { x: e.clientX, y: e.clientY };
				const hasEnteredTarget =
					triggerNode?.contains(target) || contentNode?.contains(target);
				const isPointerOutsideGraceArea = !isPointInPolygon(
					pointerPosition,
					pointerGraceArea,
				);

				if (hasEnteredTarget) {
					handleRemoveGraceArea();
				} else if (isPointerOutsideGraceArea) {
					handleRemoveGraceArea();
					pointerExit.trigger();
				}
			};

			return on(document, "pointermove", handleTrackPointerGrace);
		},
	);

	return {
		isPointerInTransit,
		onPointerExit: pointerExit.on,
	};
}

type Point = { x: number; y: number };
type Polygon = Point[];

function getExitSideFromRect(point: Point, rect: DOMRect): Side {
	const top = Math.abs(rect.top - point.y);
	const bottom = Math.abs(rect.bottom - point.y);
	const right = Math.abs(rect.right - point.x);
	const left = Math.abs(rect.left - point.x);

	switch (Math.min(top, bottom, right, left)) {
		case left:
			return "left";
		case right:
			return "right";
		case top:
			return "top";
		case bottom:
			return "bottom";
		default:
			throw new Error("unreachable");
	}
}

function getPaddedExitPoints(exitPoint: Point, exitSide: Side, padding = 5) {
	const paddedExitPoints: Point[] = [];
	switch (exitSide) {
		case "top":
			paddedExitPoints.push(
				{ x: exitPoint.x - padding, y: exitPoint.y + padding },
				{ x: exitPoint.x + padding, y: exitPoint.y + padding },
			);
			break;
		case "bottom":
			paddedExitPoints.push(
				{ x: exitPoint.x - padding, y: exitPoint.y - padding },
				{ x: exitPoint.x + padding, y: exitPoint.y - padding },
			);
			break;
		case "left":
			paddedExitPoints.push(
				{ x: exitPoint.x + padding, y: exitPoint.y - padding },
				{ x: exitPoint.x + padding, y: exitPoint.y + padding },
			);
			break;
		case "right":
			paddedExitPoints.push(
				{ x: exitPoint.x - padding, y: exitPoint.y - padding },
				{ x: exitPoint.x - padding, y: exitPoint.y + padding },
			);
			break;
	}
	return paddedExitPoints;
}

function getPointsFromRect(rect: DOMRect) {
	const { top, right, bottom, left } = rect;
	return [
		{ x: left, y: top },
		{ x: right, y: top },
		{ x: right, y: bottom },
		{ x: left, y: bottom },
	];
}

// Determine if a point is inside of a polygon.
// Based on https://github.com/substack/point-in-polygon
function isPointInPolygon(point: Point, polygon: Polygon) {
	const { x, y } = point;
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i]!.x;
		const yi = polygon[i]!.y;
		const xj = polygon[j]!.x;
		const yj = polygon[j]!.y;

		// prettier-ignore
		const intersect =
			yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) inside = !inside;
	}

	return inside;
}

// Returns a new array of points representing the convex hull of the given set of points.
// https://www.nayuki.io/page/convex-hull-algorithm
function getHull<P extends Point>(points: Readonly<Array<P>>): Array<P> {
	const newPoints: Array<P> = points.slice();
	newPoints.sort((a: Point, b: Point) => {
		if (a.x < b.x) return -1;
		if (a.x > b.x) return +1;
		if (a.y < b.y) return -1;
		if (a.y > b.y) return +1;
		return 0;
	});
	return getHullPresorted(newPoints);
}

// Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
function getHullPresorted<P extends Point>(
	points: Readonly<Array<P>>,
): Array<P> {
	if (points.length <= 1) return points.slice();

	const upperHull: Array<P> = [];
	for (let i = 0; i < points.length; i++) {
		const p = points[i]!;
		while (upperHull.length >= 2) {
			const q = upperHull[upperHull.length - 1]!;
			const r = upperHull[upperHull.length - 2]!;
			if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
				upperHull.pop();
			else break;
		}
		upperHull.push(p);
	}
	upperHull.pop();

	const lowerHull: Array<P> = [];
	for (let i = points.length - 1; i >= 0; i--) {
		const p = points[i]!;
		while (lowerHull.length >= 2) {
			const q = lowerHull[lowerHull.length - 1]!;
			const r = lowerHull[lowerHull.length - 2]!;
			if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
				lowerHull.pop();
			else break;
		}
		lowerHull.push(p);
	}
	lowerHull.pop();

	if (
		upperHull.length === 1 &&
		lowerHull.length === 1 &&
		upperHull[0]!.x === lowerHull[0]!.x &&
		upperHull[0]!.y === lowerHull[0]!.y
	) {
		return upperHull;
	}
	return upperHull.concat(lowerHull);
}

export { useGraceArea };
