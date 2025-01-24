<script lang="ts" module>
	import type { HTMLAttributes } from "svelte/elements";
	import { getPlatform } from "../internal/environment.js";
	import type { WithRef } from "../types.js";

	// So we can use the same object even if multiple libs with different versions
	// that use floating UI are loaded :)
	globalThis.fuiLockCount ??= { current: 0 };
	globalThis.fuiLockCleanup ??= { current: () => {} };

	interface FloatingOverlayProps
		extends Partial<WithRef>,
			HTMLAttributes<HTMLDivElement> {
		/**
		 * Whether the overlay should lock scrolling on the document body.
		 * @default false
		 */
		lockScroll?: boolean;
	}

	function enableScrollLock() {
		const isIOS = /iP(hone|ad|od)|iOS/.test(getPlatform());
		const bodyStyle = document.body.style;
		// RTL <body> scrollbar
		const scrollbarX =
			Math.round(document.documentElement.getBoundingClientRect().left) +
			document.documentElement.scrollLeft;
		const paddingProp = scrollbarX ? "paddingLeft" : "paddingRight";
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;
		const scrollX = bodyStyle.left
			? Number.parseFloat(bodyStyle.left)
			: window.scrollX;
		const scrollY = bodyStyle.top
			? Number.parseFloat(bodyStyle.top)
			: window.scrollY;

		bodyStyle.overflow = "hidden";

		if (scrollbarWidth) {
			bodyStyle[paddingProp] = `${scrollbarWidth}px`;
		}

		// Only iOS doesn't respect `overflow: hidden` on document.body, and this
		// technique has fewer side effects.
		if (isIOS) {
			// iOS 12 does not support `visualViewport`.
			const offsetLeft = window.visualViewport?.offsetLeft || 0;
			const offsetTop = window.visualViewport?.offsetTop || 0;

			Object.assign(bodyStyle, {
				position: "fixed",
				top: `${-(scrollY - Math.floor(offsetTop))}px`,
				left: `${-(scrollX - Math.floor(offsetLeft))}px`,
				right: "0",
			});
		}

		return () => {
			Object.assign(bodyStyle, {
				overflow: "",
				[paddingProp]: "",
			});

			if (isIOS) {
				Object.assign(bodyStyle, {
					position: "",
					top: "",
					left: "",
					right: "",
				});
				window.scrollTo(scrollX, scrollY);
			}
		};
	}

	export type { FloatingOverlayProps };
</script>

<script lang="ts">
	import { mergeStyles } from "../internal/style-object-to-string.js";

	let {
		ref = $bindable(null),
		lockScroll = false,
		children,
		style,
		...rest
	}: FloatingOverlayProps = $props();

	$effect(() => {
		if (!lockScroll) return;

		globalThis.fuiLockCount.current++;
		if (globalThis.fuiLockCount.current === 1) {
			globalThis.fuiLockCleanup.current = enableScrollLock();
		}

		return () => {
			globalThis.fuiLockCount.current--;
			if (globalThis.fuiLockCount.current === 0) {
				globalThis.fuiLockCleanup.current();
			}
		};
	});
</script>

<div
	bind:this={ref}
	{...rest}
	style={mergeStyles(
		{
			position: "fixed",
			overflow: "auto",
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		},
		style
	)}>
	{@render children?.()}
</div>
