<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import Table from '$docs/components/Table/Table.svelte';
	import { tableOptions } from './data.js';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>useRole</span></h1>
		<p>
			Adds base screen reader props to the reference and floating elements for a given
			<code class="code">role</code>.
		</p>
		<CodeBlock lang="ts" code={`import { useRole } from '@skeletonlabs/floating-ui-svelte';`} />
		<p>
			This is useful to automatically apply ARIA props to the reference and floating elements to
			ensure they’re accessible to assistive technology, including item elements if narrowly
			specified.
		</p>
	</header>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<CodeBlock
			lang="ts"
			code={`
import { useFloating, useInteractions, useRole } from '@skeletonlabs/floating-ui-svelte';

const floating = useFloating();
const role = useRole(floating.context, { role: 'tooltip' });
const interactions = useInteractions([role]);
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
</div>

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
			Compare to <a class="anchor" href="https://floating-ui.com/docs/useRole" target="_blank">Floating UI React</a>.
		</p>
	</section>
</div>
