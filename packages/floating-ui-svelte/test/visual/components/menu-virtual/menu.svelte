<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { WithRef } from "../../../../src/types.js";
	import type { MenuProps } from "./menu-impl.svelte";
	import { useFloatingParentNodeId } from "../../../../src/index.js";
	import FloatingTree from "../../../../src/components/floating-tree/floating-tree.svelte";
	import MenuImpl from "./menu-impl.svelte";

	let {
		ref = $bindable(null),
		...rest
	}: MenuProps & WithRef & HTMLAttributes<HTMLElement> = $props();

	const parentId = useFloatingParentNodeId();
</script>

{#if parentId === null}
	<FloatingTree>
		<MenuImpl {...rest} bind:ref />
	</FloatingTree>
{:else}
	<MenuImpl {...rest} bind:ref />
{/if}
