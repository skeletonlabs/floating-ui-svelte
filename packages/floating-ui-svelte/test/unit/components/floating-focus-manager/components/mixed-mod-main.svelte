<script lang="ts">
	import NestedDialog from "./mixed-mod-nested-dialog.svelte";

	let sideDialogOpen = $state(false);
</script>

<NestedDialog modal={false}>
	{#snippet reference(ref, props)}
		<button data-testid="open-dialog" bind:this={ref.current} {...props}>
			Open Dialog
		</button>
	{/snippet}

	{#snippet content(handleClose)}
		<button onclick={handleClose} data-testid="close-dialog">
			Close Dialog
		</button>
		<button
			onclick={() => (sideDialogOpen = true)}
			data-testid="open-nested-dialog">
			Open nested Dialog
		</button>
	{/snippet}

	{#snippet sideChildren()}
		<NestedDialog modal={true} open={sideDialogOpen}>
			{#snippet content(handleClose)}
				<button onclick={handleClose} data-testid="close-nested-dialog">
					Close Nested Dialog
				</button>
			{/snippet}
		</NestedDialog>
	{/snippet}
</NestedDialog>
