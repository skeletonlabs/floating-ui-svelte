<script lang="ts">
	import type { Placement } from "@floating-ui/utils";
	import {
		useDelayGroup,
		useDismiss,
		useFloating,
		useFocus,
		useHover,
		useInteractions,
		useRole,
		useTransitionStyles,
		type Delay,
	} from "../../../../src/index.js";
	import type { Snippet } from "svelte";
	import { autoUpdate, flip, offset, shift } from "@floating-ui/dom";
	import {
		box,
		type WritableBox,
	} from "../../../../src/internal/box.svelte.js";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";

	let {
		label,
		placement = "top",
		delay = 0,
		children,
	}: {
		label: string;
		placement?: Placement;
		delay?: Delay;
		children?: Snippet<
			[ref: WritableBox<Element | null>, props: Record<string, unknown>]
		>;
	} = $props();

	let open = $state(false);

	const reference = box<Element | null>(null);

	const f = useFloating({
		elements: {
			reference: () => reference.current,
		},
		onReferenceChange: (v) => {
			reference.current = v;
		},
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
		placement: () => placement,
		middleware: () => [offset(5), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	});

	const delayGroup = useDelayGroup(f.context);

	const ints = useInteractions([
		useHover(f.context, {
			delay: () => (delayGroup.delay === 0 ? delay : delayGroup.delay),
			move: false,
		}),
		useFocus(f.context),
		useRole(f.context, { role: "tooltip" }),
		useDismiss(f.context),
	]);

	const instantDuration = 0;
	const openDuration = 750;
	const closeDuration = 250;

	const transitions = useTransitionStyles(f.context, {
		duration: () =>
			delayGroup.isInstantPhase
				? {
						open: openDuration,
						close:
							delayGroup.currentId === f.context.floatingId
								? closeDuration
								: instantDuration,
					}
				: {
						open: openDuration,
						close: closeDuration,
					},
		initial: {
			opacity: 0,
			scale: "0.925",
		},
		common: ({ side }) => ({
			"transition-timing-function": "cubic-bezier(.18,.87,.4,.97)",
			"transform-origin": {
				top: "bottom",
				left: "right",
				bottom: "top",
				right: "left",
			}[side],
		}),
	});
</script>

{@render children?.(reference, ints.getReferenceProps())}

{#if transitions.isMounted}
	<FloatingPortal>
		<div
			role="presentation"
			bind:this={f.elements.floating}
			style={f.floatingStyles}>
			<div
				class="bg-black text-white p-1 px-2 rounded"
				style={transitions.styles}
				{...ints.getFloatingProps()}>
				{label}
			</div>
		</div>
	</FloatingPortal>
{/if}
