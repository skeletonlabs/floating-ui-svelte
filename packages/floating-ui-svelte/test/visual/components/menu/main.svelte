<script lang="ts">
	import MenuItem from "./menu-item.svelte";
	import Menu from "./menu.svelte";
</script>

<h1 class="text-5xl font-bold mb-8">Menu</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<Menu label="Edit" floatingId="main-floating" id="main-ref">
		<MenuItem label="Undo" onclick={() => console.log("Undo")} />
		<MenuItem label="Cut" disabled />
		<Menu
			label="Copy as"
			forceMount
			id="copy-as-ref"
			floatingId="copy-as-floating">
			<MenuItem label="Text" />
			<MenuItem label="Video" />
			<Menu
				label="Image"
				forceMount
				id="image-ref"
				floatingId="image-floating">
				<MenuItem label=".png" />
				<MenuItem label=".jpg" />
				<MenuItem label=".svg" />
				<MenuItem label=".gif" />
			</Menu>
			<MenuItem label="Audio" />
		</Menu>
		<MenuItem label="Redo" />
		<Menu label="Share">
			<MenuItem label="Mail" />
			<MenuItem label="Instagram" />
		</Menu>
	</Menu>
</div>
