<script lang="ts">
	import type { UseTypeaheadOptions } from "../../../../../src/index.js";
	import { useImpl } from "./impl.svelte.js";

	let props: Pick<UseTypeaheadOptions, "onMatch" | "onTypingChange"> & {
		list?: Array<string>;
	} = $props();

	const impl = useImpl(props);
</script>

<input bind:this={impl.floating.reference} {...impl.getReferenceProps()} />
<div bind:this={impl.floating.floating} {...impl.getFloatingProps()}></div>
