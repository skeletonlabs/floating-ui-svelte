<script lang="ts">
	import {
		useFloating,
		autoUpdate,
		type UseFloatingOptions,
		type ReferenceElement,
		type FloatingElement
	} from '../src/lib/index.js';

	let { placement, middleware, strategy, open, transform }: UseFloatingOptions = $props();

	const elements: {
		reference: ReferenceElement | null;
		floating: FloatingElement | null;
	} = $state({
		reference: null,
		floating: null
	});

	const { floatingStyles, x, y } = useFloating({
		placement,
		middleware,
		strategy,
		open,
		transform,
		whileElementsMounted: autoUpdate,
		elements
	});
</script>

<button bind:this={elements.reference} data-testid="reference"></button>
<div bind:this={elements.floating} style={floatingStyles.value} data-testid="floating"></div>

<p data-testid="x">{x.value}</p>
<p data-testid="y">{y.value}</p>
<p data-testid="placement">{placement}</p>
