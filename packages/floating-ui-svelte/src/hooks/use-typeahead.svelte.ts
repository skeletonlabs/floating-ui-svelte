import { stopEvent } from "../internal/dom.js";
import { extract } from "../internal/extract.js";
import { watch } from "../internal/watch.svelte.js";
import type { MaybeGetter } from "../types.js";
import type { FloatingRootContext } from "./use-floating-root-context.svelte.js";
import type { FloatingContext } from "./use-floating.svelte.js";
import type { ElementProps } from "./use-interactions.svelte.js";

interface UseTypeaheadOptions {
	/**
	 * A ref which contains an array of strings whose indices match the HTML
	 * elements of the list.
	 * @default empty list
	 */
	listRef: MaybeGetter<Array<string | null>>;
	/**
	 * The index of the active (focused or highlighted) item in the list.
	 * @default null
	 */
	activeIndex: MaybeGetter<number | null>;
	/**
	 * Callback invoked with the matching index if found as the user types.
	 */
	onMatch?: (index: number) => void;
	/**
	 * Callback invoked with the typing state as the user types.
	 */
	onTypingChange?: (isTyping: boolean) => void;
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: MaybeGetter<boolean>;
	/**
	 * A function that returns the matching string from the list.
	 * @default lowercase-finder
	 */
	findMatch?:
		| null
		| ((
				list: Array<string | null>,
				typedString: string,
		  ) => string | null | undefined);
	/**
	 * The number of milliseconds to wait before resetting the typed string.
	 * @default 750
	 */
	resetMs?: MaybeGetter<number>;
	/**
	 * An array of keys to ignore when typing.
	 * @default []
	 */
	ignoreKeys?: MaybeGetter<Array<string>>;
	/**
	 * The index of the selected item in the list, if available.
	 * @default null
	 */
	selectedIndex?: MaybeGetter<number | null>;
}

/**
 * Provides a matching callback that can be used to focus an item as the user
 * types, often used in tandem with `useListNavigation()`.
 */
function useTypeahead(
	context: FloatingContext | FloatingRootContext,
	opts: UseTypeaheadOptions,
): ElementProps {
	const listRef = $derived(extract(opts.listRef, []));
	const activeIndex = $derived(extract(opts.activeIndex, null));
	const enabled = $derived(extract(opts.enabled, true));
	const findMatch = opts.findMatch ?? null;
	const resetMs = $derived(extract(opts.resetMs, 750));
	const ignoreKeys = $derived(extract(opts.ignoreKeys, []));
	const selectedIndex = $derived(extract(opts.selectedIndex, null));

	let prevIndex: number | null = selectedIndex ?? activeIndex ?? -1;

	let timeoutId = -1;
	let str = "";
	let matchIndex: number | null = null;

	watch.pre(
		() => context.open,
		() => {
			if (!context.open) return;
			clearTimeout(timeoutId);
			matchIndex = null;
			str = "";
		},
	);

	watch.pre(
		[() => context.open, () => selectedIndex, () => activeIndex],
		() => {
			// sync arrow key nav but not typeahead nav
			if (context.open && str === "") {
				prevIndex = selectedIndex ?? activeIndex ?? -1;
			}
		},
	);

	function setTypingChange(value: boolean) {
		if (value) {
			if (!context.data.typing) {
				context.data.typing = value;
				opts.onTypingChange?.(value);
			}
		} else {
			if (context.data.typing) {
				context.data.typing = value;
				opts.onTypingChange?.(value);
			}
		}
	}

	function getMatchingIndex(
		list: Array<string | null>,
		orderedList: Array<string | null>,
		string: string,
	) {
		const str = findMatch
			? findMatch(orderedList, string)
			: orderedList.find(
					(text) =>
						text?.toLocaleLowerCase().indexOf(string.toLocaleLowerCase()) === 0,
				);

		return str ? list.indexOf(str) : -1;
	}

	function onkeydown(event: KeyboardEvent) {
		const listContent = listRef;
		const isOpen = context.open;

		if (str.length > 0 && str[0] !== " ") {
			if (getMatchingIndex(listContent, listContent, str) === -1) {
				setTypingChange(false);
			} else if (event.key === " ") {
				stopEvent(event);
			}
		}

		if (
			listContent == null ||
			ignoreKeys.includes(event.key) ||
			// Character key.
			event.key.length !== 1 ||
			// Modifier key.
			event.ctrlKey ||
			event.metaKey ||
			event.altKey
		) {
			return;
		}

		if (isOpen && event.key !== " ") {
			stopEvent(event);
			setTypingChange(true);
		}

		// Bail out if the list contains a word like "llama" or "aaron". TODO:
		// allow it in this case, too.
		const allowRapidSuccessionOfFirstLetter = listContent.every((text) =>
			text
				? text[0]?.toLocaleLowerCase() !== text[1]?.toLocaleLowerCase()
				: true,
		);

		// Allows the user to cycle through items that start with the same letter
		// in rapid succession.
		if (allowRapidSuccessionOfFirstLetter && str === event.key) {
			str = "";
			prevIndex = matchIndex;
		}

		str += event.key;
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => {
			str = "";
			prevIndex = matchIndex;
			setTypingChange(false);
		}, resetMs);

		const index = getMatchingIndex(
			listContent,
			[
				...listContent.slice((prevIndex || 0) + 1),
				...listContent.slice(0, (prevIndex || 0) + 1),
			],
			str,
		);

		if (index !== -1) {
			opts.onMatch?.(index);
			matchIndex = index;
		} else if (event.key !== " ") {
			str = "";
			setTypingChange(false);
		}
	}

	function floatingOnKeyUp(event: KeyboardEvent) {
		if (event.key === " ") {
			setTypingChange(false);
		}
	}

	$effect(() => {
		return () => {
			window.clearTimeout(timeoutId);
		};
	});

	const reference: ElementProps["reference"] = $derived(
		enabled
			? {
					onkeydown,
				}
			: {},
	);

	const floating: ElementProps["floating"] = $derived({
		onkeydown,
		onkeyup: floatingOnKeyUp,
	});

	return {
		get reference() {
			if (!enabled) return {};
			return reference;
		},
		get floating() {
			if (!enabled) return {};
			return floating;
		},
	};
}

export { useTypeahead };
export type { UseTypeaheadOptions };
