<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import type { PropertiesHyphen } from "csstype";
	import { styleObjectToString } from "../internal/style-object-to-string.js";
	import type { WithRef } from "../types.js";
	import { isSafari } from "../internal/environment.js";
	import { on } from "svelte/events";
	import { createAttribute } from "../internal/dom.js";

	export const HIDDEN_STYLES: PropertiesHyphen = {
		border: 0,
		clip: "rect(0 0 0 0)",
		height: "1px",
		margin: "-1px",
		overflow: "hidden",
		padding: 0,
		position: "fixed",
		"white-space": "nowrap",
		width: "1px",
		top: 0,
		left: 0,
	};

	export const HIDDEN_STYLES_STRING = styleObjectToString(HIDDEN_STYLES);

	let activeElement: HTMLElement | undefined;
	let timeoutId: number | undefined;

	function setActiveElementOnTab(event: KeyboardEvent) {
		if (event.key === "Tab") {
			activeElement = event.target as typeof activeElement;
			clearTimeout(timeoutId);
		}
	}

	interface FocusGuardProps
		extends HTMLAttributes<HTMLSpanElement>,
			WithRef<HTMLSpanElement> {}

	export type { FocusGuardProps };
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...rest
	}: FocusGuardProps = $props();

	let role = $state<"button">();

	$effect(() => {
		if (isSafari()) {
			// Unlike other screen readers such as NVDA and JAWS, the virtual cursor
			// on VoiceOver does trigger the onFocus event, so we can use the focus
			// trap element. On Safari, only buttons trigger the onFocus event.
			// NB: "group" role in the Sandbox no longer appears to work, must be a
			// button role.
			role = "button";
		}

		return on(document, "keydown", setActiveElementOnTab);
	});

	const mergedProps: HTMLAttributes<HTMLSpanElement> = $derived({
		...rest,
		tabindex: 0,
		role,
		"aria-hidden": role ? undefined : "true",
		[createAttribute("focus-guard")]: "",
		style: HIDDEN_STYLES_STRING,
	});
</script>

<span {...mergedProps} bind:this={ref}>
	{@render children?.()}
</span>
