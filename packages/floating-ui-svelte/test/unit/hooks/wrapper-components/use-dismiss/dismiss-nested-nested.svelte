<script lang="ts">
	import DismissNestedDialog from "./dismiss-nested-dialog.svelte";

	let { outsidePress }: { outsidePress?: [boolean, boolean] } = $props();
</script>

<DismissNestedDialog
	testId="outer"
	bubbles={outsidePress === undefined
		? undefined
		: { outsidePress: outsidePress[0] }}>
	<DismissNestedDialog
		testId="inner"
		bubbles={outsidePress === undefined
			? undefined
			: { outsidePress: outsidePress[1] }}>
		<button>test button</button>
	</DismissNestedDialog>
</DismissNestedDialog>
