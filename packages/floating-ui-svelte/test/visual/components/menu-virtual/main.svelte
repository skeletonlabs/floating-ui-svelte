<script lang="ts">
	import { box } from "../../../../src/internal/box.svelte.js";
	import MenuItem from "./menu-item.svelte";
	import Menu from "./menu.svelte";

	let virtualItemRef = box<HTMLElement | null>(null);
</script>

<h1 class="text-5xl font-bold mb-8">Menu Virtual</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<Menu label="Edit" {virtualItemRef}>
		<MenuItem label="Undo" onclick={() => console.log("Undo")} />
		<MenuItem label="Redo" />
		<MenuItem label="Cut" disabled />
		<Menu label="Copy as" {virtualItemRef}>
			<MenuItem label="Text" />
			<MenuItem label="Video" />
			<Menu label="Image" {virtualItemRef}>
				<MenuItem label=".png" />
				<MenuItem label=".jpg" />
				<MenuItem label=".svg" />
				<MenuItem label=".gif" />
			</Menu>
			<MenuItem label="Audio" />
		</Menu>
		<Menu label="Share" {virtualItemRef}>
			<MenuItem label="Mail" />
			<MenuItem label="Instagram" />
		</Menu>
	</Menu>
</div>
