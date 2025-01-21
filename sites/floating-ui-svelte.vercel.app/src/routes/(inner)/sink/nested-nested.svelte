<script lang="ts">
	import NestedDialog from "./nested-dialog.svelte";
</script>

<NestedDialog>
	{#snippet reference(ref, refProps)}
		<button data-testid="open-dialog" bind:this={ref.current} {...refProps}>
			open dialog
		</button>
	{/snippet}
	{#snippet content(close)}
		<NestedDialog>
			{#snippet reference(nestedRef, nestedRefProps)}
				<button
					data-testid="open-nested-dialog"
					bind:this={nestedRef.current}
					{...nestedRefProps}>
					open nested dialog
				</button>
			{/snippet}

			{#snippet content(nestedClose)}
				<button
					onclick={() => nestedClose()}
					data-testid="close-nested-dialog">
					close nested dialog
				</button>
			{/snippet}
		</NestedDialog>
		<button onclick={() => close()} data-testid="close-dialog">
			close dialog
		</button>
	{/snippet}
</NestedDialog>
