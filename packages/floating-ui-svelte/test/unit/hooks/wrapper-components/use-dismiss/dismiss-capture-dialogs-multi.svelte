<script lang="ts">
	import DismissCaptureNestedDialog from "./dismiss-capture-nested-dialog.svelte";
	import DismissOverlay from "./dismiss-overlay.svelte";

	let {
		outsidePress = [false, false],
		escapeKey = [false, false],
	}: { outsidePress?: [boolean, boolean]; escapeKey?: [boolean, boolean] } =
		$props();
</script>

<DismissOverlay>
	<DismissCaptureNestedDialog
		id="outer"
		capture={{ outsidePress: outsidePress[0], escapeKey: escapeKey[0] }}>
		<DismissCaptureNestedDialog
			id="inner"
			capture={{
				outsidePress: outsidePress[1],
				escapeKey: escapeKey[1],
			}}>
			{null}
		</DismissCaptureNestedDialog>
	</DismissCaptureNestedDialog>
</DismissOverlay>
