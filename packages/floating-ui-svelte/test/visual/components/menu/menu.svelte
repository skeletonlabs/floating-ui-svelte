<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { MenuProps } from "./types.js";
	import {
		useFloatingParentNodeId,
		type WithRef,
	} from "../../../../src/index.js";
	import FloatingTree from "../../../../src/components/floating-tree/floating-tree.svelte";
	import MenuImpl from "./menu-impl.svelte";

	let {
		ref = $bindable(null),
		...rest
	}: WithRef<HTMLElement> &
		MenuProps &
		HTMLButtonAttributes & { floatingId?: string } = $props();

	const parentId = useFloatingParentNodeId();
</script>

{#if parentId === null}
	<FloatingTree>
		<MenuImpl {...rest} bind:ref />
	</FloatingTree>
{:else}
	<MenuImpl {...rest} bind:ref />
{/if}

<!-- <DebugPolygon /> -->
