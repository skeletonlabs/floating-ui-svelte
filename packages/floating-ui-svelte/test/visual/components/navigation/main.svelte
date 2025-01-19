<script lang="ts">
	import NavigationItem from "./navigation-item.svelte";
	import NavigationSubItem from "./navigation-sub-item.svelte";
	import Navigation from "./navigation.svelte";
</script>

<h1 class="text-5xl font-bold mb-8">Navigation</h1>
<div
	class="grid place-items-center border border-slate-400 rounded lg:w-[40rem] h-[20rem] mb-4">
	<Navigation>
		<NavigationItem label="Home" href="#" />
		<NavigationItem label="Product" href="#">
			<NavigationSubItem label="Link 1" href="#" />
			<NavigationSubItem label="Link 2" href="#" />
			<NavigationSubItem label="Link 3" href="#" />
		</NavigationItem>
		<NavigationItem label="About" href="#" />
	</Navigation>
</div>
