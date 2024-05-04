<script lang="ts">
	let { count }: { count: number } = $props();

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>{count}</button>
