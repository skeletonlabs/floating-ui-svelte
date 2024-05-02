import type { HTMLAttributes } from 'svelte/elements';

const ACTIVE_KEY = 'active';
const SELECTED_KEY = 'selected';

interface ExtendedUserProps {
	[ACTIVE_KEY]?: boolean;
	[SELECTED_KEY]?: boolean;
}

interface ElementProps {
	reference?: HTMLAttributes<Element>;
	floating?: HTMLAttributes<HTMLElement>;
	item?: HTMLAttributes<HTMLElement> | ((props: ExtendedUserProps) => HTMLAttributes<HTMLElement>);
}

function mergeProps<Key extends keyof ElementProps>(
	userProps: (HTMLAttributes<Element> & ExtendedUserProps) | undefined,
	propsList: Array<ElementProps | void>,
	elementKey: Key
): Record<string, unknown> {
	const map = new Map<string, Array<(...args: unknown[]) => void>>();
	const isItem = elementKey === 'item';

	let domUserProps = userProps;
	if (isItem && userProps) {
		const { [ACTIVE_KEY]: _, [SELECTED_KEY]: __, ...validProps } = userProps;
		domUserProps = validProps;
	}

	return {
		...(elementKey === 'floating' && { tabIndex: -1 }),
		...domUserProps,
		...propsList
			.map((value) => {
				const propsOrGetProps = value ? value[elementKey] : null;
				if (typeof propsOrGetProps === 'function') {
					return userProps ? propsOrGetProps(userProps) : null;
				}
				return propsOrGetProps;
			})
			.concat(userProps)
			.reduce((acc: Record<string, unknown>, props) => {
				if (!props) {
					return acc;
				}

				Object.entries(props).forEach(([key, value]) => {
					if (isItem && [ACTIVE_KEY, SELECTED_KEY].includes(key)) {
						return;
					}

					if (key.indexOf('on') === 0) {
						if (!map.has(key)) {
							map.set(key, []);
						}

						if (typeof value === 'function') {
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
				});

				return acc;
			}, {})
	};
}

interface UseInteractionsReturn {
	getReferenceProps: (userProps?: HTMLAttributes<Element>) => Record<string, unknown>;
	getFloatingProps: (userProps?: HTMLAttributes<Element>) => Record<string, unknown>;
	getItemProps: (
		userProps?: Omit<HTMLAttributes<HTMLElement>, 'selected' | 'active'> & ExtendedUserProps
	) => Record<string, unknown>;
}

function useInteractions(propsList: Array<ElementProps | void> = []): UseInteractionsReturn {
	const getReferenceProps = $derived((userProps?: HTMLAttributes<Element>) =>
		mergeProps(userProps, propsList, 'reference')
	);
	const getFloatingProps = $derived((userProps?: HTMLAttributes<Element>) =>
		mergeProps(userProps, propsList, 'floating')
	);

	const getItemProps = $derived(
		(userProps?: Omit<HTMLAttributes<HTMLElement>, 'selected' | 'active'> & ExtendedUserProps) => {
			return mergeProps(userProps, propsList, 'item');
		}
	);

	return {
		get getReferenceProps() {
			return getReferenceProps;
		},
		get getFloatingProps() {
			return getFloatingProps;
		},
		get getItemProps() {
			return getItemProps;
		}
	};
}

export { useInteractions, type UseInteractionsReturn, type ElementProps };
