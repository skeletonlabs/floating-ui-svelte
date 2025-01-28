<script lang="ts">
	import CompositeItem from "../../../../src/components/composite/composite-item.svelte";
	import Composite from "../../../../src/components/composite/composite.svelte";
	import MenuItem from "../menu/menu-item.svelte";
	import Menu from "../menu/menu.svelte";

	let compositeRef = $state<HTMLDivElement | null>(null);
	let compositeItemRef = $state<HTMLDivElement | null>(null);
</script>

<h1 class="text-5xl font-bold mb-8">Menubar</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<Composite class="grid grid-cols-3" cols={3} orientation="horizontal">
		{#each { length: 9 } as _, i (i)}
			<CompositeItem role="menuitem" class="focus:bg-gray-200 p-2">
				Item {i + 1}
			</CompositeItem>
		{/each}
	</Composite>
</div>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<Composite
		class="flex"
		ref={compositeRef}
		role="menubar"
		orientation="horizontal">
		<CompositeItem role="menuitem" class="focus:bg-gray-200 p-2">
			File
		</CompositeItem>
		<CompositeItem
			role="menuitem"
			ref={compositeItemRef}
			class="focus:bg-gray-200 p-2 inline-block">
			{#snippet render({ children, ...props }, ref)}
				<div {...props} bind:this={ref.current}>
					{@render children?.()}
				</div>
			{/snippet}
			View
		</CompositeItem>
		<CompositeItem role="menuitem" class="focus:bg-gray-200 p-2">
			{#snippet render(props, ref)}
				<Menu label="Edit" {...props} bind:ref={ref.current}>
					<MenuItem label=".jpg" />
					<MenuItem label=".png" />
					<MenuItem label=".gif" />
					<Menu label="Submenu">
						<MenuItem label="Second level" />
						<Menu label="Open third level">
							<MenuItem label="Third level" />
						</Menu>
					</Menu>
				</Menu>
			{/snippet}
		</CompositeItem>
		<CompositeItem role="menuitem" class="focus:bg-gray-200 p-2">
			{#snippet render(props, ref)}
				<select {...props} bind:this={ref.current}>
					<option>Left</option>
					<option>Center</option>
					<option>Right</option>
				</select>
			{/snippet}
			Align
		</CompositeItem>
	</Composite>
</div>
