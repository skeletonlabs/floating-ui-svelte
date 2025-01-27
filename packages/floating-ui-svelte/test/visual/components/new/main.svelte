<script lang="ts">
	import DismissNestedDialog from "../../../unit/hooks/wrapper-components/use-dismiss/dismiss-nested-dialog.svelte";

	let {
		outsidePress = [false, false],
	}: { outsidePress?: [boolean, boolean] } = $props();
</script>

<DismissNestedDialog testId="outer" capture={{ outsidePress: false }}>
	<DismissNestedDialog
		testId="inner"
		capture={{
			outsidePress: false,
		}}>
		<button>test button</button>
	</DismissNestedDialog>
</DismissNestedDialog>
