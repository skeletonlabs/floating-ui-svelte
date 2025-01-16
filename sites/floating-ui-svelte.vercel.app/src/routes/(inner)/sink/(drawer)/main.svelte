<script lang="ts">
	import Button from "../button.svelte";
	import Drawer from "./drawer.svelte";
</script>

<h1 class="text-5xl font-bold mb-8">Drawer</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<Drawer>
		{#snippet reference(ref, props)}
			<Button
				id="my-button"
				bind:ref={() => ref.current, (v) => (ref.current = v)}
				{...props}>
				My button
			</Button>
		{/snippet}
		{#snippet content({ labelId, descriptionId, close })}
			<h2 id={labelId} class="text-xl font-bold">Title</h2>
			<p id={descriptionId}>Description</p>
			<Button id="close-button" class="bg-white mt-4" onclick={close}
				>Close</Button>
		{/snippet}
	</Drawer>
	<Button id="next-button">Next button</Button>
	<div id="drawer-root"></div>
</div>
