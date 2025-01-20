<script lang="ts">
	import { useFloating } from "../../../../src/index.js";

	const f = useFloating();
</script>

<h1 class="text-5xl font-bold mb-8">New</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<div bind:this={f.reference}>Reference</div>
	<div bind:this={f.floating} style={f.floatingStyles}>Floating</div>
</div>
