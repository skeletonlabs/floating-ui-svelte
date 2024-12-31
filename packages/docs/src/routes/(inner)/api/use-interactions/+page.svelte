<script lang="ts">
import CodeBlock from "$docs/components/CodeBlock/CodeBlock.svelte";
import Table from "$docs/components/Table/Table.svelte";
import { tableReturns } from "./data.js";
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>useInteractions</span></h1>
		<p>A hook to merge or compose interaction event handlers together.</p>
		<CodeBlock
			lang="ts"
			code={`import { useInteractions } from '@skeletonlabs/floating-ui-svelte';`}
		/>
	</header>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<p>
			The <code class="code">useInteractions</code> Svelte hook allows you to consume multiple interactions.
			It ensures that event listeners from different hooks are properly registered instead of being overruled
			by one another.
		</p>
		<CodeBlock
			lang="ts"
			code={`
import { useFloating, useInteractions, useHover, useFocus } from '@skeletonlabs/floating-ui-svelte';

const floating = useFloating();

const hover = useHover(floating.context);
const focus = useFocus(floating.context);

const interactions = useInteractions([hover, focus]);
`}
		/>
		<CodeBlock
			lang="svelte"
			code={`
<!-- Reference Element -->
<div {...interactions.getReferenceProps()}">
	Reference
</div>

<!-- Floating Element -->
<div {...interactions.getFloatingProps()}>
	Floating
</div>
		`}
		/>
		<p>
			When you want to apply an event handler to an element that uses a props getter, make sure to
			pass it through the getter instead of applying it directly:
		</p>
		<CodeBlock
			lang="svelte"
			code={`
<!-- Incorrect -->
<div {...interactions.getReferenceProps()} onclick={/* event handler */}>Reference</div>

<!-- Correct -->
<div {...interactions.getReferenceProps({ onclick: /* event handler */})}>Reference</div>
		`}
		/>
		<p>
			This will ensure all event handlers will be registered rather being overruled by each-other.
		</p>
	</section>
	<!-- Table: Returns -->
	<section class="space-y-8">
		<h2 class="h2">Returns</h2>
		<Table data={tableReturns} />
	</section>
	<!-- Compare -->
	<section class="space-y-8">
		<h2 class="h2">Compare</h2>
		<!-- prettier-ignore -->
		<p>
			Compare to <a class="anchor" href="https://floating-ui.com/docs/useInteractions" target="_blank">Floating UI React</a>.
		</p>
	</section>
</div>
