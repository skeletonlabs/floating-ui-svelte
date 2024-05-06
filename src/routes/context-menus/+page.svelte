<script lang="ts">
	import Test from '$lib/hooks/useHover/App.test.svelte';

	let showReference = $state(true);
</script>

<Test {showReference} delay={500} />

<svelte:window on:keydown={(e) => e.key === 'Escape' && (showReference = !showReference)} />
