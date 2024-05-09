<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import Table from '$docs/components/Table/Table.svelte';
	import { tableOptions } from './data.js';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>useClick</span></h1>
		<p>Opens or closes the floating element when clicking the reference element.</p>
		<CodeBlock lang="ts" code={`import { useClick } from '@skeletonlabs/floating-ui-svelte';`} />
	</header>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<CodeBlock
			lang="ts"
			code={`
import { useFloating, useInteractions, useClick } from '@skeletonlabs/floating-ui-svelte';

const floating = useFloating();
const click = useClick(floating.context);
const interactions = useInteractions([hover]);
`}
		/>
		<CodeBlock
			lang="svelte"
			code={`
<!-- Reference Element -->
<button
	bind:this="{floating.elements.reference}"
	{...interactions.getReferenceProps()}
>
	Reference
</button>

<!-- Floating Element -->
<div
	bind:this="{floating.elements.floating}"
	style="{floating.floatingStyles}"
	{...interactions.getFloatingProps()}
>
	Tooltip
</div>
		`}
		/>
	</section>
	<!-- Table: Options -->
	<section class="space-y-8">
		<h2 class="h2">Options</h2>
		<Table data={tableOptions} />
	</section>
	<!-- Compare -->
	<section class="space-y-8">
		<h2 class="h2">Compare</h2>
		<!-- prettier-ignore -->
		<p>
			Compare to <a class="anchor" href="https://floating-ui.com/docs/useClick" target="_blank">Floating UI React</a>.
		</p>
	</section>
</div>
