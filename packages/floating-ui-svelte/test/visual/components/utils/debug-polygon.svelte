<script lang="ts" module>
	import { box } from "../../../../src/internal/box.svelte.js";

	export const debugPolygon = box<{
		rect: [number, number][];
		tri: [number, number][];
	}>({ rect: [], tri: [] });
</script>

<script lang="ts">
	const paths = $derived([
		{
			d: `M ${debugPolygon.current.rect.map(([x, y]) => `${x},${y}`).join(" L ")} Z`,
			fill: "rgba(255,0,0,0.2)",
		},
		{
			d: `M ${debugPolygon.current.tri.map(([x, y]) => `${x},${y}`).join(" L ")} Z`,
			fill: "rgba(0,255,0,0.2)",
		},
	]);
</script>

{#if debugPolygon.current.rect.length && debugPolygon.current.tri.length}
	<svg class="fixed inset-0 w-full h-full pointer-events-none z-[99999]">
		{#each paths as { d, fill }}
			<path {d} {fill} />
		{/each}
	</svg>
{/if}
