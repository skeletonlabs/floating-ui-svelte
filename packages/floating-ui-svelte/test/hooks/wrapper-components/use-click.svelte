<script lang="ts">
import { autoUpdate } from "@floating-ui/dom";
import {
	type UseClickOptions,
	useClick,
} from "../../../src/hooks/use-click.svelte";
import { useFloating } from "../../../src/hooks/use-floating.svelte";
import { useHover } from "../../../src/hooks/use-hover.svelte";
import { useInteractions } from "../../../src/hooks/use-interactions.svelte";

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