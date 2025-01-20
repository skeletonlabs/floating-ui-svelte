<script lang="ts">
	import type { Placement } from "@floating-ui/utils";

	let open = $state(false);
	let search = $state("");
	let selectedEmoji = $state<string | null>(null);
	let activeIndex = $state<number | null>(null);
	let placement = $state<Placement | null>(null);

	let arrowEl: HTMLElement = null!;
</script>
