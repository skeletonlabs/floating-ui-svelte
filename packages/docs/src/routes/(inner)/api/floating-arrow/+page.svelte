<script lang="ts">
import CodeBlock from "$lib/components/CodeBlock/CodeBlock.svelte";
import Table from "$lib/components/Table/Table.svelte";
import { tableProps } from "./data.js";
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>FloatingArrow</span></h1>
		<p>
			Renders a customizable <code class="code">{'<svg>'}</code> pointing arrow triangle inside the floating
			element that gets automatically positioned.
		</p>
		<CodeBlock
			lang="ts"
			code={`import { FloatingArrow } from '@skeletonlabs/floating-ui-svelte';`}
		/>
	</header>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<CodeBlock
			lang="ts"
			code={`
import { arrow, useFloating, FloatingArrow, autoUpdate, offset } from '@skeletonlabs/floating-ui-svelte';

let arrowRef: HTMLElement | null = $state(null);

const floating = useFloating({
	get middleware() {
		return [
			offset(10),
			arrowRef && arrow({ element: arrowRef })
		];
	}
});
`}
		/>
		<CodeBlock
			lang="svelte"
			code={`
<!-- Reference Element -->
<button bind:this="{floating.elements.reference}">
	Reference
</button>

<!-- Floating Element -->
<div
	bind:this="{floating.elements.floating}"
	style="{floating.floatingStyles}"
	class="floating"
>
	<div>Floating</div>
	<FloatingArrow
		bind:this="{arrowRef}"
		context="{floating.context}"
	/>
</div>
		`}
		/>
	</section>
	<!-- Table: Props -->
	<section class="space-y-8">
		<h2 class="h2">Props</h2>
		<Table data={tableProps} />
	</section>
	<!-- Utility Classes and Styles -->
	<section class="space-y-8">
		<h2 class="h2">Utility Classes and Styles</h2>
		<p>Provide arbitrary utility classes using the standard attribute.</p>
		<CodeBlock lang="svelte" code={`<FloatingArrow class="fill-white" />`} />
	</section>
	<!-- Compare -->
	<section class="space-y-8">
		<h2 class="h2">Compare</h2>
		<!-- prettier-ignore -->
		<p>
			Compare to <a class="anchor" href="https://floating-ui.com/docs/floatingArrow" target="_blank">Floating UI React</a>.
		</p>
	</section>
</div>
