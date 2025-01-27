<script lang="ts">
	import DismissNestedDialog from "./dismiss-nested-dialog.svelte";

	let {
		escapeKey,
		outsidePress,
		bubbles,
	}: {
		outsidePress?: [boolean, boolean];
		escapeKey?: [boolean, boolean];
		bubbles?: boolean;
	} = $props();

	const firstBubbles = $derived(
		outsidePress === undefined && escapeKey === undefined
			? undefined
			: {
					outsidePress: outsidePress ? outsidePress[0] : undefined,
					escapeKey: escapeKey ? escapeKey[0] : undefined,
				}
	);

	const secondBubbles = $derived(
		outsidePress === undefined && escapeKey === undefined
			? undefined
			: {
					outsidePress: outsidePress ? outsidePress[1] : undefined,
					escapeKey: escapeKey ? escapeKey[1] : undefined,
				}
	);
</script>

<DismissNestedDialog
	testId="outer"
	bubbles={bubbles === true ? true : firstBubbles}>
	<DismissNestedDialog
		testId="inner"
		bubbles={bubbles === true ? true : secondBubbles}>
		<button>test button</button>
	</DismissNestedDialog>
</DismissNestedDialog>
