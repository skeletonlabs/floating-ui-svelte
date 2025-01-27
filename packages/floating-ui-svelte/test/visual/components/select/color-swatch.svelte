<script lang="ts">
	import { styleObjectToString } from "../../../../src/internal/style-object-to-string.js";

	let { color }: { color?: string } = $props();
</script>

<div
	aria-hidden="true"
	class="rounded-full w-4 h-4 border border-slate-900/20 bg-clip-padding"
	style={styleObjectToString({ background: color?.toLowerCase() })}>
</div>
