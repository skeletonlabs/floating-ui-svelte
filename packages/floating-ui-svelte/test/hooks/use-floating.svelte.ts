import {
	type Middleware,
	type MiddlewareData,
	type Placement,
	type Strategy,
	offset,
} from "@floating-ui/dom";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { type FloatingContext, useFloating } from "../../src/index.js";
import { useId } from "../../src/index.js";
import { withRunes } from "../internal/with-runes.svelte.js";

function createElements(): { reference: HTMLElement; floating: HTMLElement } {
	const reference = document.createElement("div");
	const floating = document.createElement("div");
	reference.id = useId();
	floating.id = useId();
	return { reference, floating };
}

describe("useFloating", () => {
	describe("elements", () => {
		it(
			"can be set",
			withRunes(() => {
				const elements = createElements();
				const floating = useFloating({ elements });
				expect(floating.elements).toEqual(elements);
			}),
		);
		it(
			"can be set through the return value",
			withRunes(() => {
				const floating = useFloating();

				const elements = createElements();

				floating.elements.reference = elements.reference;
				floating.elements.floating = elements.floating;

				expect(floating.elements).toEqual(elements);
			}),
		);
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("elements");
			}),
		);
		it(
			"is an object",
			withRunes(() => {
				const floating = useFloating();
				expect(floating.elements).toBeTypeOf("object");
			}),
		);
		it(
			"defaults to {}",
			withRunes(() => {
				const floating = useFloating();
				expect(floating.elements).toEqual({});
			}),
		);
		it(
			"is reactive",
			withRunes(async () => {
				let elements = $state(createElements());

				const floating = useFloating({
					get elements() {
						return elements;
					},
				});

				expect(floating.elements).toEqual(elements);

				elements = createElements();

				await vi.waitFor(() => {
					expect(floating.elements).toEqual(elements);
				});
			}),
		);
		it(
			"is synced externally",
			withRunes(() => {
				const elements = $state(createElements());

				const floating = useFloating({
					get elements() {
						return elements;
					},
				});

				const newElements = createElements();

				floating.elements.reference = newElements.reference;
				floating.elements.floating = newElements.floating;

				expect(elements).toEqual(newElements);
			}),
		);
	});

	describe("transform", () => {
		it(
			"can be set",
			withRunes(async () => {
				const transform = true;
				const floating = useFloating({
					elements: createElements(),
					transform,
				});

				await vi.waitFor(() => {
					expect(floating.floatingStyles).contain(
						"transform: translate(0px, 0px)",
					);
				});
			}),
		);
		it(
			'defaults to "true"',
			withRunes(async () => {
				const floating = useFloating({
					elements: createElements(),
				});
				await vi.waitFor(() => {
					expect(floating.floatingStyles).contain(
						"transform: translate(0px, 0px)",
					);
				});
			}),
		);
		it(
			"is reactive",
			withRunes(async () => {
				let transform = $state(true);

				const floating = useFloating({
					elements: createElements(),
					get transform() {
						return transform;
					},
				});

				await vi.waitFor(() => {
					expect(floating.floatingStyles).contain(
						"transform: translate(0px, 0px)",
					);
				});

				transform = false;

				await vi.waitFor(() => {
					expect(floating.floatingStyles).not.contain(
						"transform: translate(0px, 0px)",
					);
				});
			}),
		);
	});

	describe("translate", () => {
		it(
			"can be set",
			withRunes(async () => {
				const translate = true;
				const floating = useFloating({
					elements: createElements(),
					translate,
				});

				await vi.waitFor(() => {
					expect(floating.floatingStyles).contain(
						"translate: 0px 0px",
					);
				});
			}),
		);
		it(
			'defaults to "false"',
			withRunes(async () => {
				const floating = useFloating({
					elements: createElements(),
				});
				await vi.waitFor(() => {
					expect(floating.floatingStyles).contain(
						"transform: translate(0px, 0px)",
					);
				});
			}),
		);
		it(
			"is reactive",
			withRunes(async () => {
				let translate = $state(true);

				const floating = useFloating({
					elements: createElements(),
					get translate() {
						return translate;
					},
				});

				await vi.waitFor(() => {
					expect(floating.floatingStyles).contain(
						"translate: 0px 0px",
					);
				});

				translate = false;

				await vi.waitFor(() => {
					expect(floating.floatingStyles).not.contain(
						"translate: 0px 0px",
					);
				});
			}),
		);
	});

	describe("strategy", () => {
		it(
			"can be set",
			withRunes(() => {
				const strategy: Strategy = "fixed";
				const floating = useFloating({ strategy });
				expect(floating.strategy).toBe(strategy);
			}),
		);
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("strategy");
			}),
		);
		it(
			"is of type Strategy",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.strategy).toMatchTypeOf<Strategy>();
			}),
		);
		it(
			'defaults to "absolute"',
			withRunes(() => {
				const floating = useFloating();
				expect(floating.strategy).toBe("absolute");
			}),
		);
		it(
			"is reactive",
			withRunes(async () => {
				let strategy: Strategy = $state("absolute");

				const floating = useFloating({
					elements: createElements(),
					get strategy() {
						return strategy;
					},
				});

				expect(floating.strategy).toBe(strategy);

				strategy = "fixed";

				await vi.waitFor(() => {
					expect(floating.strategy).toBe(strategy);
				});
			}),
		);
	});

	describe("placement", () => {
		it(
			"can be set",
			withRunes(() => {
				const placement: Placement = "top";
				const floating = useFloating({ placement });
				expect(floating.placement).toBe(placement);
			}),
		);
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("placement");
			}),
		);
		it(
			"is of type Placement",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.placement).toMatchTypeOf<Placement>();
			}),
		);
		it(
			'defaults to "bottom"',
			withRunes(() => {
				const floating = useFloating();
				expect(floating.placement).toBe("bottom");
			}),
		);
		it(
			"is reactive",
			withRunes(async () => {
				let placement: Placement = $state("bottom");

				const floating = useFloating({
					elements: createElements(),
					get placement() {
						return placement;
					},
				});

				expect(floating.placement).toBe(placement);

				placement = "top";

				await vi.waitFor(() => {
					expect(floating.placement).toBe(placement);
				});
			}),
		);
	});

	describe("middleware", () => {
		it(
			"can be set",
			withRunes(async () => {
				const middleware: Array<Middleware> = [offset(5)];

				const floating = useFloating({
					elements: createElements(),
					middleware,
				});
				await vi.waitFor(() => {
					expect(floating.x).toBe(0);
					expect(floating.y).toBe(5);
				});
			}),
		);
		it(
			"is reactive",
			withRunes(async () => {
				const middleware: Array<Middleware> = $state([]);

				const floating = useFloating({
					elements: createElements(),
					get middleware() {
						return middleware;
					},
				});

				await vi.waitFor(() => {
					expect(floating.x).toBe(0);
					expect(floating.y).toBe(0);
				});

				middleware.push(offset(10));

				await vi.waitFor(() => {
					expect(floating.x).toBe(0);
					expect(floating.y).toBe(10);
				});
			}),
		);
	});

	describe("open", () => {
		it(
			"can be set",
			withRunes(() => {
				const floating = useFloating({ open: true });
				expect(floating.open).toBe(true);
			}),
		);
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("open");
			}),
		);
		it(
			"defaults to true",
			withRunes(() => {
				const floating = useFloating();
				expect(floating.open).toBe(true);
			}),
		);
		it(
			"is of type boolean",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.open).toMatchTypeOf<boolean>();
			}),
		);
		it(
			"is reactive",
			withRunes(async () => {
				let open = $state(false);

				const floating = useFloating({
					elements: createElements(),
					get open() {
						return open;
					},
				});

				expect(floating.open).toBe(open);

				open = true;

				await vi.waitFor(() => {
					expect(floating.open).toBe(open);
				});
			}),
		);
	});

	describe("whileElementsMounted", () => {
		it(
			"can be set",
			withRunes(async () => {
				const whileElementsMounted = vi.fn();

				useFloating({
					elements: createElements(),
					whileElementsMounted,
				});

				await vi.waitFor(() => {
					expect(whileElementsMounted).toHaveBeenCalled();
				});
			}),
		);
		it(
			"is only called when elements are mounted",
			withRunes(async () => {
				const whileElementsMounted = vi.fn();

				useFloating({
					elements: undefined,
					whileElementsMounted,
				});

				await vi.waitFor(() => {
					expect(whileElementsMounted).not.toHaveBeenCalled();
				});
			}),
		);
		it(
			"calls the cleanup function when elements are unmounted",
			withRunes(async () => {
				const cleanup = vi.fn();
				const whileElementsMounted = vi.fn(() => cleanup);

				const floating = useFloating({
					elements: createElements(),
					whileElementsMounted,
				});

				await vi.waitFor(() => {
					expect(whileElementsMounted).toHaveBeenCalled();
				});

				floating.elements.reference = undefined;
				floating.elements.floating = undefined;

				await vi.waitFor(() => {
					expect(cleanup).toHaveBeenCalled();
				});
			}),
		);
		it(
			"is called with the correct arguments",
			withRunes(async () => {
				const whileElementsMounted = vi.fn();
				const elements = createElements();

				const floating = useFloating({
					elements,
					whileElementsMounted,
				});

				await vi.waitFor(() => {
					expect(whileElementsMounted).toHaveBeenCalledWith(
						elements.reference,
						elements.floating,
						floating.update,
					);
				});
			}),
		);
	});

	describe("onOpenChange", () => {
		it(
			"can be set",
			withRunes(async () => {
				const onOpenChange = vi.fn();

				useFloating({
					elements: createElements(),
					onOpenChange,
				});

				await vi.waitFor(() => {
					expect(onOpenChange).not.toHaveBeenCalled();
				});
			}),
		);
		// TODO: Add tests for onOpenChange once we have well tested hooks that can trigger the open state
	});

	describe("x", () => {
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("x");
			}),
		);
		it(
			"is of type number",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.x).toMatchTypeOf<number>();
			}),
		);
		it(
			"defaults to 0",
			withRunes(() => {
				const floating = useFloating();
				expect(floating.x).toBe(0);
			}),
		);
		it(
			"is reactively set based on placement",
			withRunes(async () => {
				let placement: Placement = $state("left");

				const floating = useFloating({
					elements: createElements(),
					middleware: [offset(10)],
					get placement() {
						return placement;
					},
				});

				await vi.waitFor(() => {
					expect(floating.x).toBe(-10);
				});

				placement = "right";

				await vi.waitFor(() => {
					expect(floating.x).toBe(10);
				});
			}),
		);
	});

	describe("y", () => {
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("y");
			}),
		);
		it(
			"is of type number",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.y).toMatchTypeOf<number>();
			}),
		);
		it(
			"defaults to 0",
			withRunes(() => {
				const floating = useFloating();
				expect(floating.y).toBe(0);
			}),
		);
		it(
			"is reactively set based on placement",
			withRunes(async () => {
				let placement: Placement = $state("top");

				const floating = useFloating({
					elements: createElements(),
					middleware: [offset(10)],
					get placement() {
						return placement;
					},
				});

				await vi.waitFor(() => {
					expect(floating.y).toBe(-10);
				});

				placement = "bottom";

				await vi.waitFor(() => {
					expect(floating.y).toBe(10);
				});
			}),
		);
	});

	describe("middlewareData", () => {
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("middlewareData");
			}),
		);
		it(
			"is of type MiddlewareData",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.middlewareData).toMatchTypeOf<MiddlewareData>();
			}),
		);
		it(
			"defaults to {}",
			withRunes(() => {
				const floating = useFloating();
				expect(floating.middlewareData).toEqual({});
			}),
		);
		it(
			"is reactively set based on data returned by middleware",
			withRunes(async () => {
				const middleware: Array<Middleware> = $state([]);

				const floating = useFloating({
					elements: createElements(),
					get middleware() {
						return middleware;
					},
				});

				await vi.waitFor(() => {
					expect(floating.middlewareData).toEqual({});
				});

				middleware.push({
					name: "foobar",
					fn: () => ({ data: { foo: "bar" } }),
				});

				await vi.waitFor(() => {
					expect(floating.middlewareData).toEqual({ foobar: { foo: "bar" } });
				});
			}),
		);
	});

	describe("isPositioned", () => {
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("isPositioned");
			}),
		);
		it(
			"is of type boolean",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.isPositioned).toMatchTypeOf<boolean>();
			}),
		);
		it(
			"defaults to false",
			withRunes(() => {
				const floating = useFloating();
				expect(floating.isPositioned).toBe(false);
			}),
		);
		it(
			"is set to true once the position is calculated",
			withRunes(async () => {
				const floating = useFloating({
					open: false,
					elements: {
						reference: document.createElement("div"),
						floating: document.createElement("div"),
					},
				});

				expect(floating.isPositioned).toBe(false);

				await floating.update();

				vi.waitFor(() => {
					expect(floating.isPositioned).toBe(true);
				});
			}),
		);
		it(
			"isPositioned is reset to false when open is set to false",
			withRunes(async () => {
				let open = $state(true);

				const floating = useFloating({
					elements: createElements(),
					get open() {
						return open;
					},
				});

				await vi.waitFor(() => {
					expect(floating.isPositioned).toBe(true);
				});

				open = false;

				await vi.waitFor(() => {
					expect(floating.isPositioned).toBe(false);
				});
			}),
		);
	});

	describe("floatingStyles", () => {
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("floatingStyles");
			}),
		);
		it(
			"is of type string",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.floatingStyles).toMatchTypeOf<string>();
			}),
		);
		it(
			"defaults to position: absolute; left: 0px; top: 0px;",
			withRunes(() => {
				const floating = useFloating();
				expect(floating.floatingStyles).toBe(
					"position: absolute; left: 0px; top: 0px;",
				);
			}),
		);
	});

	describe("update", () => {
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("update");
			}),
		);
		it(
			"is of type function",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.update).toBeFunction();
			}),
		);
	});

	describe("context", () => {
		it(
			"is returned",
			withRunes(() => {
				const floating = useFloating();
				expect(floating).toHaveProperty("context");
			}),
		);
		it(
			"is of type FloatingContext",
			withRunes(() => {
				const floating = useFloating();
				expectTypeOf(floating.context).toMatchTypeOf<FloatingContext>();
			}),
		);
		it(
			"updates open reactively",
			withRunes(() => {
				let open = $state(true);

				const floating = useFloating({
					elements: createElements(),
					get open() {
						return open;
					},
				});

				expect(floating.context.open).toBe(true);

				open = false;

				expect(floating.context.open).toBe(false);
			}),
		);
		it(
			"updates placement reactively",
			withRunes(async () => {
				let placement: Placement = $state("left");

				const floating = useFloating({
					elements: createElements(),
					get placement() {
						return placement;
					},
				});

				expect(floating.context.placement).toBe("left");

				placement = "right";

				await vi.waitFor(() => {
					expect(floating.context.placement).toBe("right");
				});
			}),
		);
		it(
			"updates strategy reactively",
			withRunes(async () => {
				let strategy: Strategy = $state("absolute");

				const floating = useFloating({
					elements: createElements(),
					get strategy() {
						return strategy;
					},
				});

				expect(floating.context.strategy).toBe("absolute");

				strategy = "fixed";

				await vi.waitFor(() => {
					expect(floating.context.strategy).toBe("fixed");
				});
			}),
		);
		it(
			"updates x reactively",
			withRunes(async () => {
				const middleware: Array<Middleware> = $state([]);

				const floating = useFloating({
					elements: createElements(),
					placement: "right",
					get middleware() {
						return middleware;
					},
				});

				expect(floating.context.x).toBe(0);

				middleware.push(offset(10));

				await vi.waitFor(() => {
					expect(floating.context.x).toBe(10);
				});
			}),
		);
		it(
			"updates y reactively",
			withRunes(async () => {
				const middleware: Array<Middleware> = $state([]);

				const floating = useFloating({
					elements: createElements(),
					placement: "bottom",
					get middleware() {
						return middleware;
					},
				});

				expect(floating.context.y).toBe(0);

				middleware.push(offset(10));

				await vi.waitFor(() => {
					expect(floating.context.y).toBe(10);
				});
			}),
		);
		it(
			"updates isPositioned reactively",
			withRunes(async () => {
				let open = $state(true);

				const floating = useFloating({
					elements: createElements(),
					get open() {
						return open;
					},
				});

				await vi.waitFor(() => {
					expect(floating.context.isPositioned).toBe(true);
				});

				open = false;

				await vi.waitFor(() => {
					expect(floating.context.isPositioned).toBe(false);
				});
			}),
		);

		it(
			"updates middlewareData reactively",
			withRunes(async () => {
				const middleware: Array<Middleware> = $state([]);

				const floating = useFloating({
					elements: createElements(),
					get middleware() {
						return middleware;
					},
				});

				expect(floating.context.middlewareData).toEqual({});

				middleware.push({
					name: "foobar",
					fn: () => ({ data: { foo: "bar" } }),
				});

				await vi.waitFor(() => {
					expect(floating.context.middlewareData).toEqual({
						foobar: { foo: "bar" },
					});
				});
			}),
		);
		it(
			"updates elements reactively",
			withRunes(async () => {
				let elements = $state(createElements());

				const floating = useFloating({
					get elements() {
						return elements;
					},
				});

				expect(floating.context.elements).toEqual(elements);

				elements = createElements();

				await vi.waitFor(() => {
					expect(floating.context.elements).toEqual(elements);
				});
			}),
		);
		it(
			"updates nodeId reactively",
			withRunes(async () => {
				let nodeId = $state(useId());
				const floating = useFloating({
					get nodeId() {
						return nodeId;
					},
				});

				expect(floating.context.nodeId).toBe(nodeId);

				nodeId = useId();

				await vi.waitFor(() => {
					expect(floating.context.nodeId).toBe(nodeId);
				});
			}),
		);
	});
});
