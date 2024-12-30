<script lang="ts">
    import { autoUpdate } from '@floating-ui/dom';
    import { useFloating } from '../../src/hooks/use-floating.svelte.js';
    import { useInteractions } from '../../src/hooks/use-interactions.svelte';
    import { useHover, type UseHoverOptions } from '../../src/hooks/use-hover.svelte.js';

    interface Props extends UseHoverOptions {
        open?: boolean;
        showReference?: boolean;
    }

    let { open = false, showReference = true, ...useHoverOptions }: Props = $props();

    const floating = useFloating({
        whileElementsMounted: autoUpdate,
        get open() {
            return open;
        },
        onOpenChange(v) {
            open = v;
        },
    });

    const hover = useHover(floating.context, useHoverOptions);
    const interactions = useInteractions([hover]);
</script>

{#if showReference}
    <button
            data-testid="reference"
            bind:this={floating.elements.reference}
            {...interactions.getReferenceProps()}
    ></button>
{/if}

{#if open}
    <div
            data-testid="floating"
            bind:this={floating.elements.floating}
            style={floating.floatingStyles}
            {...interactions.getFloatingProps()}
    ></div>
{/if}