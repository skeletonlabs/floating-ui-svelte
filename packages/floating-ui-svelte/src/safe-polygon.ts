import { isElement } from "@floating-ui/utils/dom";
import type { Rect, Side } from "./types.js";
import type { HandleCloseFn } from "./hooks/use-hover.svelte.js";
import { contains, getTarget } from "./internal/dom.js";
import { getChildren } from "./internal/get-children.js";
import { debugPolygon } from "../test/visual/components/utils/debug-polygon.svelte";

type Point = [number, number];
type Polygon = Point[];

function isPointInPolygon(point: Point, polygon: Polygon) {
	const [x, y] = point;
	let isInside = false;
	const length = polygon.length;
	for (let i = 0, j = length - 1; i < length; j = i++) {
		const [xi, yi] = polygon[i] || [0, 0];
		const [xj, yj] = polygon[j] || [0, 0];
		const intersect =
			yi >= y !== yj >= y && x <= ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersect) {
			isInside = !isInside;
		}
	}
	return isInside;
}

function isInside(point: Point, rect: Rect) {
	return (
		point[0] >= rect.x &&
		point[0] <= rect.x + rect.width &&
		point[1] >= rect.y &&
		point[1] <= rect.y + rect.height
	);
}

interface SafePolygonOptions {
	buffer?: number;
	blockPointerEvents?: boolean;
	requireIntent?: boolean;
}

/**
 * Generates a safe polygon area that the user can traverse without closing the
 * floating element once leaving the reference element.
 * @see https://floating-ui.com/docs/useHover#safepolygon
 */
function safePolygon(options: SafePolygonOptions = {}) {
	const {
		buffer = 0.5,
		blockPointerEvents = false,
		requireIntent = true,
	} = options;

	let timeoutId: number;
	let hasLanded = false;
	let lastX: number | null = null;
	let lastY: number | null = null;
	let lastCursorTime = performance.now();

	function getCursorSpeed(x: number, y: number): number | null {
		const currentTime = performance.now();
		const elapsedTime = currentTime - lastCursorTime;

		if (lastX === null || lastY === null || elapsedTime === 0) {
			lastX = x;
			lastY = y;
			lastCursorTime = currentTime;
			return null;
		}

		const deltaX = x - lastX;
		const deltaY = y - lastY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const speed = distance / elapsedTime; // px / ms

		lastX = x;
		lastY = y;
		lastCursorTime = currentTime;

		return speed;
	}

	const fn: HandleCloseFn = (context) => {
		return (event: MouseEvent) => {
			function close() {
				clearTimeout(timeoutId);
				context.onClose();
			}

			clearTimeout(timeoutId);

			if (
				!context.domReference ||
				!context.floating ||
				context.placement == null ||
				context.x == null ||
				context.y == null
			) {
				return;
			}

			const { clientX, clientY } = event;
			const clientPoint: Point = [clientX, clientY];
			const target = getTarget(event) as Element | null;
			const isLeave = event.type === "mouseleave";
			const isOverFloatingEl = contains(context.floating, target);
			const isOverReferenceEl = contains(context.domReference, target);

			const refRect = context.domReference.getBoundingClientRect();
			const rect = context.floating.getBoundingClientRect();
			const side = context.placement.split("-")[0] as Side;
			const cursorLeaveFromRight = context.x > rect.right - rect.width / 2;
			const cursorLeaveFromBottom = context.y > rect.bottom - rect.height / 2;
			const isOverReferenceRect = isInside(clientPoint, refRect);
			console.log("isOverReferenceRect", isOverReferenceRect);
			const isFloatingWider = rect.width > refRect.width;
			const isFloatingTaller = rect.height > refRect.height;
			const left = (isFloatingWider ? refRect : rect).left;
			const right = (isFloatingWider ? refRect : rect).right;
			const top = (isFloatingTaller ? refRect : rect).top;
			const bottom = (isFloatingTaller ? refRect : rect).bottom;

			if (isOverFloatingEl) {
				hasLanded = true;

				if (!isLeave) return;
			}

			if (isOverReferenceEl) {
				hasLanded = false;
			}

			if (isOverReferenceEl && !isLeave) {
				hasLanded = true;
				return;
			}

			// Prevent overlapping floating element from being stuck in an open-close
			// loop: https://github.com/floating-ui/floating-ui/issues/1910
			if (
				isLeave &&
				isElement(event.relatedTarget) &&
				contains(context.floating, event.relatedTarget)
			) {
				return;
			}

			// If any nested child is open, abort.
			if (
				context.tree &&
				getChildren(context.tree.nodes, context.nodeId).some(
					({ context }) => context?.open,
				)
			) {
				return;
			}

			// If the pointer is leaving from the opposite side, the "buffer" logic
			// creates a point where the floating element remains open, but should be
			// ignored.
			// A constant of 1 handles floating point rounding errors.
			if (
				(side === "top" && context.y >= refRect.bottom - 1) ||
				(side === "bottom" && context.y <= refRect.top + 1) ||
				(side === "left" && context.x >= refRect.right - 1) ||
				(side === "right" && context.x <= refRect.left + 1)
			) {
				console.log("1");
				return close();
			}

			// Ignore when the cursor is within the rectangular trough between the
			// two elements. Since the triangle is created from the cursor point,
			// which can start beyond the ref element's edge, traversing back and
			// forth from the ref to the floating element can cause it to close. This
			// ensures it always remains open in that case.
			let rectPoly: Point[] = [];

			switch (side) {
				case "top":
					rectPoly = [
						[left, refRect.top + 1],
						[left, rect.bottom - 1],
						[right, rect.bottom - 1],
						[right, refRect.top + 1],
					];
					break;
				case "bottom":
					rectPoly = [
						[left, rect.top + 1],
						[left, refRect.bottom - 1],
						[right, refRect.bottom - 1],
						[right, rect.top + 1],
					];
					break;
				case "left":
					rectPoly = [
						[rect.right - 1, bottom],
						[rect.right - 1, top],
						[refRect.left + 1, top],
						[refRect.left + 1, bottom],
					];
					break;
				case "right":
					rectPoly = [
						[refRect.right - 1, bottom],
						[refRect.right - 1, top],
						[rect.left + 1, top],
						[rect.left + 1, bottom],
					];
					break;
			}

			function getPolygon([x, y]: Point): Array<Point> {
				switch (side) {
					case "top": {
						const cursorPointOne: Point = [
							isFloatingWider
								? x + buffer / 2
								: cursorLeaveFromRight
									? x + buffer * 4
									: x - buffer * 4,
							y + buffer + 1,
						];
						const cursorPointTwo: Point = [
							isFloatingWider
								? x - buffer / 2
								: cursorLeaveFromRight
									? x + buffer * 4
									: x - buffer * 4,
							y + buffer + 1,
						];
						const commonPoints: [Point, Point] = [
							[
								rect.left,
								cursorLeaveFromRight
									? rect.bottom - buffer
									: isFloatingWider
										? rect.bottom - buffer
										: rect.top,
							],
							[
								rect.right,
								cursorLeaveFromRight
									? isFloatingWider
										? rect.bottom - buffer
										: rect.top
									: rect.bottom - buffer,
							],
						];

						return [cursorPointOne, cursorPointTwo, ...commonPoints];
					}
					case "bottom": {
						const cursorPointOne: Point = [
							isFloatingWider
								? x + buffer / 2
								: cursorLeaveFromRight
									? x + buffer * 4
									: x - buffer * 4,
							y - buffer,
						];
						const cursorPointTwo: Point = [
							isFloatingWider
								? x - buffer / 2
								: cursorLeaveFromRight
									? x + buffer * 4
									: x - buffer * 4,
							y - buffer,
						];
						const commonPoints: [Point, Point] = [
							[
								rect.left,
								cursorLeaveFromRight
									? rect.top + buffer
									: isFloatingWider
										? rect.top + buffer
										: rect.bottom,
							],
							[
								rect.right,
								cursorLeaveFromRight
									? isFloatingWider
										? rect.top + buffer
										: rect.bottom
									: rect.top + buffer,
							],
						];

						return [cursorPointOne, cursorPointTwo, ...commonPoints];
					}
					case "left": {
						const cursorPointOne: Point = [
							x + buffer + 1,
							isFloatingTaller
								? y + buffer / 2
								: cursorLeaveFromBottom
									? y + buffer * 4
									: y - buffer * 4,
						];
						const cursorPointTwo: Point = [
							x + buffer + 1,
							isFloatingTaller
								? y - buffer / 2
								: cursorLeaveFromBottom
									? y + buffer * 4
									: y - buffer * 4,
						];
						const commonPoints: [Point, Point] = [
							[
								cursorLeaveFromBottom
									? rect.right - buffer
									: isFloatingTaller
										? rect.right - buffer
										: rect.left,
								rect.top,
							],
							[
								cursorLeaveFromBottom
									? isFloatingTaller
										? rect.right - buffer
										: rect.left
									: rect.right - buffer,
								rect.bottom,
							],
						];

						return [...commonPoints, cursorPointOne, cursorPointTwo];
					}
					case "right": {
						const cursorPointOne: Point = [
							x - buffer,
							isFloatingTaller
								? y + buffer / 2
								: cursorLeaveFromBottom
									? y + buffer * 4
									: y - buffer * 4,
						];
						const cursorPointTwo: Point = [
							x - buffer,
							isFloatingTaller
								? y - buffer / 2
								: cursorLeaveFromBottom
									? y + buffer * 4
									: y - buffer * 4,
						];
						const commonPoints: [Point, Point] = [
							[
								cursorLeaveFromBottom
									? rect.left + buffer
									: isFloatingTaller
										? rect.left + buffer
										: rect.right,
								rect.top,
							],
							[
								cursorLeaveFromBottom
									? isFloatingTaller
										? rect.left + buffer
										: rect.right
									: rect.left + buffer,
								rect.bottom,
							],
						];

						return [cursorPointOne, cursorPointTwo, ...commonPoints];
					}
				}
			}

			const polygon = getPolygon([context.x, context.y]);
			debugPolygon.current.tri = polygon;
			debugPolygon.current.rect = rectPoly;

			if (isPointInPolygon([clientX, clientY], rectPoly)) {
				return;
			}

			if (hasLanded && !isOverReferenceRect) {
				console.log("2");
				return close();
			}

			if (!isLeave && requireIntent) {
				const cursorSpeed = getCursorSpeed(event.clientX, event.clientY);
				const cursorSpeedThreshold = 0.1;
				if (cursorSpeed !== null && cursorSpeed < cursorSpeedThreshold) {
					return close();
				}
			}

			if (
				!isPointInPolygon(
					[clientX, clientY],
					getPolygon([context.x, context.y]),
				)
			) {
				console.log("4");
				close();
			} else if (!hasLanded && requireIntent) {
				function here() {
					console.log("5");
					close();
				}
				timeoutId = window.setTimeout(here, 40);
			}
		};
	};

	fn.__options = {
		blockPointerEvents,
	};

	return fn;
}

export type { SafePolygonOptions };
export { safePolygon };
