import type { HTMLAttributes } from "svelte/elements";
import { FOCUSABLE_ATTRIBUTE } from "../internal/get-floating-focus-element.js";

const ACTIVE_KEY = "active";
const SELECTED_KEY = "selected";

interface ExtendedUserProps {
	[ACTIVE_KEY]?: boolean;
	[SELECTED_KEY]?: boolean;
}

interface ElementProps {
	reference?: HTMLAttributes<Element>;
	floating?: HTMLAttributes<HTMLElement>;
	item?:
		| HTMLAttributes<HTMLElement>
		| ((props: ExtendedUserProps) => HTMLAttributes<HTMLElement>);
}

interface UseInteractionsReturn {
	getReferenceProps: (
		userProps?: Record<string, unknown>,
	) => Record<string, unknown>;
	getFloatingProps: (
		userProps?: Record<string, unknown>,
	) => Record<string, unknown>;
	getItemProps: (
		userProps?: Omit<Record<string, unknown>, "selected" | "active"> &
			ExtendedUserProps,
	) => Record<string, unknown>;
}

function mergeProps<Key extends keyof ElementProps>(
	userProps: (HTMLAttributes<Element> & ExtendedUserProps) | undefined,
	propsList: Array<ElementProps>,
	elementKey: Key,
): Record<string, unknown> {
	const map = new Map<string, Array<(...args: unknown[]) => void>>();
	const isItem = elementKey === "item";

	let domUserProps = userProps;
	if (isItem && userProps) {
		const { [ACTIVE_KEY]: _, [SELECTED_KEY]: __, ...validProps } = userProps;
		domUserProps = validProps;
	}

	return {
		...(elementKey === "floating" && {
			tabindex: -1,
			[FOCUSABLE_ATTRIBUTE]: "",
		}),
		...domUserProps,
		...propsList
			.map((value) => {
				const propsOrGetProps = value ? value[elementKey] : null;
				if (typeof propsOrGetProps === "function") {
					return userProps ? propsOrGetProps(userProps) : null;
				}
				return propsOrGetProps;
			})
			.concat(userProps)
			.reduce((acc: Record<string, unknown>, props) => {
				if (!props) {
					return acc;
				}
				for (const [key, value] of Object.entries(props)) {
					if (isItem && [ACTIVE_KEY, SELECTED_KEY].includes(key)) {
						continue;
					}
					if (key.indexOf("on") === 0) {
						if (!map.has(key)) {
							map.set(key, []);
						}

						if (typeof value === "function") {
							map.get(key)?.push(value);

							acc[key] = (...args: unknown[]) => {
								return map
									.get(key)
									?.map((fn) => fn(...args))
									.find((val) => val !== undefined);
							};
						}
					} else {
						acc[key] = value;
					}
				}
				return acc;
			}, {}),
	};
}

class Interactions {
	constructor(private readonly propsList: Array<ElementProps> = []) {}

	getReferenceProps = $derived((userProps?: HTMLAttributes<Element>) => {
		return mergeProps(userProps, this.propsList, "reference");
	});

	getFloatingProps = $derived((userProps?: HTMLAttributes<Element>) => {
		return mergeProps(userProps, this.propsList, "floating");
	});

	getItemProps = $derived(
		(
			userProps?: Omit<HTMLAttributes<Element>, "selected" | "active"> &
				ExtendedUserProps,
		) => {
			return mergeProps(userProps, this.propsList, "item");
		},
	);
}

function useInteractions(
	propsList: Array<ElementProps> = [],
): UseInteractionsReturn {
	return new Interactions(propsList);
}

export type { UseInteractionsReturn, ElementProps, ExtendedUserProps };
export { useInteractions, Interactions };
