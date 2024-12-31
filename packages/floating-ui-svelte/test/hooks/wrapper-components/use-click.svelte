<script lang="ts">
import { autoUpdate } from "@floating-ui/dom";
import {
	type UseClickOptions,
	useClick,
} from "../../../src/lib/hooks/use-click.svelte.js";
import { useFloating } from "../../../src/lib/hooks/use-floating.svelte.js";
import { useHover } from "../../../src/lib/hooks/use-hover.svelte.js";
import { useInteractions } from "../../../src/lib/hooks/use-interactions.svelte.js";

interface Props extends UseClickOptions {
	open?: boolean;
	element?: string;
	enableHover?: boolean;
}

let {
	open = false,
	element = "button",
	enableHover = false,
	...useClickOptions
}: Props = $props();

const floating = useFloating({
	whileElementsMounted: autoUpdate,
	get open() {
		return open;
	},
	onOpenChange(v) {
		open = v;
	},
});

const click = useClick(floating.context, useClickOptions);
const hover = useHover(floating.context, { enabled: enableHover });
const interactions = useInteractions([click, hover]);
</script>

<svelte:element
        this={element}
        data-testid="reference"
        bind:this={floating.elements.reference}
        {...interactions.getReferenceProps()}
></svelte:element>

{#if open}
    <div
            data-testid="floating"
            bind:this={floating.elements.floating}
            style={floating.floatingStyles}
            {...interactions.getFloatingProps()}
    ></div>
{/if}