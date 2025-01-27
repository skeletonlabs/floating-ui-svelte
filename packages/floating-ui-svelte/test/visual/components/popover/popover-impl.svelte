<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { Placement } from "@floating-ui/utils";
	import {
		box,
		type WritableBox,
	} from "../../../../src/internal/box.svelte.js";
	export interface PopoverImplProps {
		content: Snippet<
			[
				{
					close: () => void;
					labelId: string;
					descriptionId: string;
				},
			]
		>;
		placement?: Placement;
		modal?: boolean;
		children?: Snippet<
			[ref: WritableBox<Element | null>, props: Record<string, unknown>]
		>;
		bubbles?: boolean;
	}
</script>

<script lang="ts">
	import {
		useClick,
		useDismiss,
		useFloating,
		useFloatingNodeId,
		useId,
		useInteractions,
		useRole,
	} from "../../../../src/index.js";
	import { autoUpdate, flip, offset, shift } from "@floating-ui/dom";
	import FloatingNode from "../../../../src/components/floating-tree/floating-node.svelte";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		content,
		placement,
		children,
		modal = true,
		bubbles = true,
	}: PopoverImplProps = $props();

	let open = $state(false);

	const nodeId = useFloatingNodeId();
	const ref = box<Element | null>(null);

	const f = useFloating({
		reference: () => ref.current,
		onReferenceChange: (v) => {
			ref.current = v;
		},
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
		nodeId,
		placement: () => placement,
		middleware: [offset(10), flip(), shift()],
		whileElementsMounted: autoUpdate,
	});

	const id = useId();
	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;

	const ints = useInteractions([
		useClick(f.context),
		useRole(f.context),
		useDismiss(f.context, { bubbles: () => bubbles }),
	]);
</script>

<FloatingNode id={nodeId}>
	{@render children?.(
		ref,
		ints.getReferenceProps({ "data-open": open ? "" : undefined })
	)}

	{#if open}
		<FloatingPortal>
			<FloatingFocusManager context={f.context} {modal}>
				<div
					class="bg-white border border-slate-900/10 shadow-md rounded px-4 py-6 bg-clip-padding"
					bind:this={f.floating}
					style={f.floatingStyles}
					aria-labelledby={labelId}
					aria-describedby={descriptionId}
					{...ints.getFloatingProps()}>
					{@render content({
						labelId,
						descriptionId,
						close: () => (open = false),
					})}
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	{/if}
</FloatingNode>
