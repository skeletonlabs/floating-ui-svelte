<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { MenuProps } from "./types.js";
	import { useFloatingParentNodeId } from "../../../../src/index.js";
	import FloatingTree from "../../../../src/components/floating-tree/floating-tree.svelte";
	import MenuImpl from "./menu-impl.svelte";
	import DebugPolygon from "../../utils/debug-polygon.svelte";

	let props: MenuProps & HTMLButtonAttributes & { floatingId?: string } =
		$props();

	const parentId = useFloatingParentNodeId();
</script>

{#if parentId === null}
	<FloatingTree>
		<MenuImpl {...props} />
	</FloatingTree>
{:else}
	<MenuImpl {...props} />
{/if}

<DebugPolygon />
