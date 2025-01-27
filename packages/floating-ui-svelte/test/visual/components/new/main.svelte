<script lang="ts">
	import DismissNestedDialog from "../../../unit/hooks/wrapper-components/use-dismiss/dismiss-nested-dialog.svelte";

	let {
		outsidePress = [false, false],
	}: { outsidePress?: [boolean, boolean] } = $props();
</script>

<DismissNestedDialog
	testId="outer"
	bubbles={{
		escapeKey: false,
	}}>
	<DismissNestedDialog
		testId="inner"
		bubbles={{
			escapeKey: false,
		}}>
		<button>test button</button>
	</DismissNestedDialog>
</DismissNestedDialog>
