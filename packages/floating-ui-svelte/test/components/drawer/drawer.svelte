<script lang="ts">
	import { MediaQuery } from "svelte/reactivity";
	import {
		useClick,
		useDismiss,
		useFloating,
		useId,
		useInteractions,
		useRole,
		type Boxed,
	} from "../../../src/index.js";
	import FloatingFocusManager from "../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import type { Snippet } from "svelte";
	import { box } from "../../../src/internal/box.svelte.js";
	import FloatingPortal from "../../../src/components/floating-portal/floating-portal.svelte";
	import FloatingOverlay from "../../../src/components/floating-overlay.svelte";

	let {
		reference,
		content,
	}: {
		reference: Snippet<
			[reference: Boxed<Element | null>, props: Record<string, unknown>]
		>;
		content: Snippet<
			[{ labelId: string; descriptionId: string; close: () => void }]
		>;
	} = $props();

	let open = $state(false);

	const ref = box<Element | null>(null);

	const isLargeScreen = new MediaQuery("min-width: 1400px");
	const f = useFloating({
		reference: () => ref.current,
		onReferenceChange: (v) => {
			ref.current = v;
		},
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});

	const id = useId();

	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;

	const modal = $derived(!isLargeScreen.current);

	const ints = useInteractions([
		useClick(f.context),
		useRole(f.context),
		useDismiss(f.context, {
			outsidePress: () => modal,
			outsidePressEvent: "mousedown",
		}),
	]);
</script>

{#snippet Content()}
	<FloatingFocusManager context={f.context} {modal} closeOnFocusOut={modal}>
		<div
			bind:this={f.floating}
			aria-labelledby={labelId}
			aria-describedby={descriptionId}
			class="absolute top-0 right-0 h-full w-48 bg-slate-100 p-4"
			{...ints.getFloatingProps()}>
			{@render content({
				labelId,
				descriptionId,
				close: () => (open = false),
			})}
		</div>
	</FloatingFocusManager>
{/snippet}

{@render reference?.(ref, ints.getReferenceProps())}

{#if open}
	<FloatingPortal>
		{#if modal}
			<FloatingOverlay
				lockScroll
				style="background: rgba(0, 0, 0, 0.8); z-index: 1;">
				{@render Content()}
			</FloatingOverlay>
		{:else}
			{@render Content()}
		{/if}
	</FloatingPortal>
{/if}
