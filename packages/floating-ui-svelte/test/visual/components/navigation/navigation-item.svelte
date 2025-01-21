<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import {
		safePolygon,
		useDismiss,
		useFloating,
		useFloatingNodeId,
		useFocus,
		useHover,
		useInteractions,
	} from "../../../../src/index.js";
	import { flip, offset, shift } from "@floating-ui/dom";
	import FloatingNode from "../../../../src/components/floating-tree/floating-node.svelte";
	import FloatingPortal from "../../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingFocusManager from "../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";

	let {
		label,
		href,
		children,
		...restProps
	}: Omit<HTMLAnchorAttributes, "href"> & {
		label: string;
		href: string;
	} = $props();

	let open = $state(false);
	const hasChildren = $derived(!!children);

	const nodeId = useFloatingNodeId();

	const f = useFloating<HTMLAnchorElement>({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
		nodeId,
		middleware: [offset(8), flip(), shift()],
		placement: "right-start",
	});

	const ints = useInteractions([
		useHover(f.context, {
			handleClose: safePolygon(),
			enabled: () => hasChildren,
		}),
		useFocus(f.context, {
			enabled: () => hasChildren,
		}),
		useDismiss(f.context, {
			enabled: () => hasChildren,
		}),
	]);
</script>

<FloatingNode id={nodeId}>
	<li>
		<a
			{href}
			bind:this={f.reference}
			class="w-48 bg-slate-100 p-2 rounded my-1 flex justify-between items-center"
			{...ints.getReferenceProps(restProps)}>
			{label}
			{#if hasChildren}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 15 15"
					><path
						fill="currentColor"
						fill-rule="evenodd"
						d="M6.158 3.135a.5.5 0 0 1 .707.023l3.75 4a.5.5 0 0 1 0 .684l-3.75 4a.5.5 0 1 1-.73-.684L9.566 7.5l-3.43-3.658a.5.5 0 0 1 .023-.707"
						clip-rule="evenodd" /></svg>
			{/if}
		</a>
	</li>
	{#if open}
		<FloatingPortal>
			<FloatingFocusManager
				context={f.context}
				modal={false}
				initialFocus={-1}>
				<div
					data-testid="subnavigation"
					bind:this={f.floating}
					class="flex flex-col bg-slate-100 overflow-y-auto rounded outline-none px-4 py-2 backdrop-blur-sm"
					style={f.floatingStyles}
					{...ints.getFloatingProps()}>
					<button type="button" onclick={() => (open = false)}>
						Close
					</button>
					<ul class="flex flex-col">{@render children?.()}</ul>
				</div>
			</FloatingFocusManager>
		</FloatingPortal>
	{/if}
</FloatingNode>
