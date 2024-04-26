<script lang="ts">
	import { useFloating, type Placement, autoUpdate, offset } from '$lib/index.js';

	const elements = $state<{ reference?: HTMLElement; floating?: HTMLElement }>({});

	let placement = $state<Placement>('bottom');

	const { floatingStyles, x, y } = useFloating({
		middleware: [offset(5)],
		elements,
		whileElementsMounted: autoUpdate
	});
</script>

<select bind:value={placement}>
	<option value="top">Top</option>
	<option value="right">Right</option>
	<option value="bottom">Bottom</option>
	<option value="left">Left</option>
</select>

<p data-testid="x">{x.value}</p>
<p data-testid="y">{y.value}</p>

<button bind:this={elements.reference}>Reference</button>
<div bind:this={elements.floating} style={floatingStyles.value}>Floating</div>
