<script lang="ts" module>
	const ROUND_D =
		"M0 20C0 20 2.06906 19.9829 5.91817 15.4092C7.49986 13.5236 8.97939 12.3809 10.0002 12.3809C11.0202 12.3809 12.481 13.6451 14.0814 15.5472C17.952 20.1437 20 20 20 20H0Z";

	const allPlacements = ["top", "bottom", "right", "left"].flatMap(
		(placement) =>
			[
				placement,
				`${placement}-start`,
				`${placement}-end`,
			] as Array<Placement>
	);

	const borderWidth = 1;
</script>

<script lang="ts">
	import type { Placement } from "@floating-ui/utils";
	import Demo from "../../components/arrow/demo.svelte";
	import { autoPlacement, hide, shift } from "@floating-ui/dom";
</script>

<h1 class="text-5xl font-bold">Arrow</h1>
<h2 class="text-xl font-bold mb-6 my-8">Slight transparency</h2>
<div
	class="grid grid-cols-3 place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	{#each allPlacements as placement (placement)}
		<Demo
			{placement}
			arrowProps={{
				fill: "rgba(0,0,0,0.75)",
			}}
			floatingProps={{
				class: "bg-black/75 text-white p-2",
			}} />
	{/each}
</div>
<h2 class="text-xl font-bold mb-6 mt-10">{"tipRadius={2}"}</h2>
<div
	class="grid grid-cols-3 place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	{#each allPlacements as placement (placement)}
		<Demo {placement} arrowProps={{ tipRadius: 2 }} />
	{/each}
</div>
<h2 class="text-xl font-bold mb-6 mt-10">{"tipRadius={5}"}</h2>
<div
	class="grid grid-cols-3 place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	{#each allPlacements as placement (placement)}
		<Demo {placement} arrowProps={{ tipRadius: 5 }} />
	{/each}
</div>
<h2 class="text-xl font-bold mb-6 mt-10">Transparent stroke + tipRadius</h2>
<div
	class="grid grid-cols-3 place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	{#each allPlacements as placement (placement)}
		<Demo
			{placement}
			arrowProps={{
				fill: "white",
				stroke: "rgba(0,0,0,0.4)",
				strokeWidth: borderWidth,
				tipRadius: 1,
			}}
			floatingStyle={{
				border: `${borderWidth}px solid rgba(0,0,0,0.4)`,
				color: "black",
				"background-color": "white",
			}} />
	{/each}
</div>
<h2 class="text-xl font-bold mb-6 mt-10">Custom path + transparent stroke</h2>
<div
	class="grid grid-cols-3 place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	{#each allPlacements as placement (placement)}
		<Demo
			{placement}
			arrowProps={{
				width: 20,
				height: 20,
				fill: "white",
				stroke: "rgba(0,0,0,0.4)",
				strokeWidth: borderWidth,
				d: ROUND_D,
			}}
			floatingStyle={{
				border: `${borderWidth}px solid rgba(0,0,0,0.4)`,
				color: "black",
				"background-color": "white",
			}} />
	{/each}
</div>
<h2 class="text-xl font-bold mb-6 mt-10">
	Tailwind classs for fill and stroke
</h2>
<div
	class="grid grid-cols-3 place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	{#each allPlacements as placement (placement)}
		<Demo
			{placement}
			arrowProps={{
				class: "fill-white [&>path:first-of-type]:stroke-pink-500 [&>path:last-of-type]:stroke-white",
				strokeWidth: 1,
			}}
			floatingProps={{
				class: "border border-pink-500 text-pink-500 bg-white p-2",
			}} />
	{/each}
</div>
<h2 class="text-xl font-bold mb-6 mt-10">Arrow with shift()</h2>
<div
	class="grid grid-cols-1 place-items-center border border-slate-400 rounded lg:w-[40rem] h-[130rem] mb-4">
	{#each allPlacements as placement (placement)}
		<Demo
			arrowProps={{
				fill: "rgba(255,0,0)",
				staticOffset: undefined,
			}}
			floatingStyle={{
				"z-index": 1500,
			}}
			{placement}
			middleware={[
				shift(),
				// Use hide() so the examples are not shifted onto the screen while we're not looking at this section
				hide(),
			]}>
			{"0123456789 ".repeat(40)}
		</Demo>
	{/each}
</div>
<h2 class="text-xl font-bold mb-6 mt-10">Arrow with autoPlacement()</h2>
<div
	class="grid grid-cols-3 place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	{#each allPlacements as placement (placement)}
		<Demo
			arrowProps={{
				fill: "rgba(255,0,0)",
			}}
			middleware={[autoPlacement({ allowedPlacements: [placement] })]} />
	{/each}
</div>
