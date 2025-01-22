import type {
	HTMLAttributeAnchorTarget,
	HTMLAttributes,
} from "svelte/elements";
import {
	useClick,
	useFloating,
	useInteractions,
	useTypeahead,
	type UseTypeaheadOptions,
} from "../../../../../src/index.js";
import type { Getter } from "../../../../../src/types.js";

export function useImpl({
	addUseClick = false,
	...props
}: Pick<UseTypeaheadOptions, "onMatch" | "onTypingChange"> & {
	list?: Array<string | null>;
	open?: Getter<boolean>;
	onOpenChange?: (open: boolean) => void;
	addUseClick?: boolean;
}) {
	let open = $state(true);
	let activeIndex = $state<number | null>(null);
	const f = useFloating({
		open: () => props.open?.() ?? open,
		onOpenChange: props.onOpenChange ?? ((o) => (open = o)),
	});
	const list = props.list ?? ["one", "two", "three"];

	const typeahead = useTypeahead(f.context, {
		listRef: list,
		activeIndex: () => activeIndex,
		onMatch: (idx) => {
			activeIndex = idx;
			props.onMatch?.(idx);
		},
		onTypingChange: props.onTypingChange,
	});
	const click = useClick(f.context, {
		enabled: addUseClick,
	});

	const ints = useInteractions([typeahead, click]);

	return {
		floating: f,
		get activeIndex() {
			return activeIndex;
		},
		get open() {
			return open;
		},
		getReferenceProps: (userProps?: HTMLAttributes<Element>) =>
			ints.getReferenceProps({
				role: "combobox",
				...userProps,
			}),
		getFloatingProps: () =>
			ints.getFloatingProps({
				role: "listbox",
			}),
	};
}
