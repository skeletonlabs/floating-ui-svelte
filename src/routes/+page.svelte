<script lang="ts">
	import { autoUpdate, offset } from '@floating-ui/dom';
	import { useFloating } from '$lib/hooks/use-floating.svelte.js';

	const elements = $state<{ reference?: HTMLElement; floating?: HTMLElement }>({});

	const { floatingStyles, x, y } = useFloating({
		placement: 'bottom',
		middleware: [offset(5)],
		elements,
		whileElementsMounted: autoUpdate
	});

	$inspect(x);
	$inspect(y);
</script>

<p data-testid="x">{x.value}</p>
<p data-testid="y">{y.value}</p>

<button bind:this={elements.reference}>Reference</button>
<div bind:this={elements.floating} style={floatingStyles.value}>Floating</div>
