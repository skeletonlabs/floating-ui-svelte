<script lang="ts">
	import DismissPopover from "./dismiss-popover.svelte";

	let { modal }: { modal: [boolean, boolean] | null } = $props();
</script>

<DismissPopover id="popover-1" modal={modal ? modal[0] : true}>
	<DismissPopover id="popover-2" modal={modal ? modal[1] : null} />
</DismissPopover>
