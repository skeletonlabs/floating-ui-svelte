<script lang="ts">
	import type { FloatingFocusManagerProps } from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import FloatingFocusManager from "../../../../../src/components/floating-focus-manager/floating-focus-manager.svelte";
	import { useFloating } from "../../../../../src/index.js";

	let {
		renderInput = false,
		initialFocus,
		returnFocus = true,
		...rest
	}: Partial<
		Omit<FloatingFocusManagerProps, "initialFocus" | "returnFocus"> & {
			initialFocus?: "two" | number;
			renderInput?: boolean;
			returnFocus?: boolean | "inputRef";
		}
	> = $props();

	let ref = $state<HTMLButtonElement | null>(null);
	let open = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
	});
</script>

<button
	data-testid="increment-initialFocus"
	onclick={() => {
		if (typeof initialFocus === "number") {
			initialFocus++;
		}
	}}>
	increment initial focus
</button>

<button
	data-testid="reference"
	bind:this={f.elements.reference}
	onclick={() => {
		open = !open;
	}}>button</button>

<input />
<input data-testid="focus-target" bind:this={inputRef} />
<input />

{#if open}
	<FloatingFocusManager
		{...rest}
		initialFocus={initialFocus === "two" ? ref : initialFocus}
		returnFocus={returnFocus === "inputRef" ? inputRef : returnFocus}
		context={f.context}>
		<div
			role="dialog"
			bind:this={f.elements.floating}
			data-testid="floating">
			<button data-testid="one">close</button>
			<button data-testid="two" bind:this={ref}> confirm </button>
			<button data-testid="three" onclick={() => (open = false)}>
				x
			</button>
			{#if renderInput}
				<!-- svelte-ignore a11y_autofocus -->
				<input autofocus data-testid="input" />
			{/if}
		</div>
	</FloatingFocusManager>
{/if}
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div tabindex={0} data-testid="last">x</div>
