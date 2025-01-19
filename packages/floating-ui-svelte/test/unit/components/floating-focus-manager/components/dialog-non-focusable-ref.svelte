<script lang="ts">
	import Dialog from "./dialog.svelte";
</script>

<Dialog>
	{#snippet reference(ref, props)}
		<div
			{...props}
			bind:this={ref.current}
			data-testid="non-focusable-reference">
			<button data-testid="open-dialog"> open dialog </button>
		</div>
	{/snippet}

	{#snippet content(handleClose)}
		<button onclick={handleClose} data-testid="close-dialog">close</button>
	{/snippet}
</Dialog>
