<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';

	// ...
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>useFloating</span></h1>
		<p>
			The main Hook of the library that acts as a controller for all other Hooks and components.
		</p>
		<CodeBlock lang="ts" code={`import { useFloating } from '@skeletonlabs/floating-ui-svelte';`} />
	</header>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<p>Call the Hook inside a component.</p>
		<CodeBlock lang="ts" code={`(snippet)`} />
	</section>
	<!-- Options -->
	<section class="space-y-8">
		<h2 class="h2">Options</h2>
		<p>The Hook accepts an object of options to configure its behavior.</p>
		<CodeBlock lang="ts" code={`(snippet)`} />
		<h3 class="h3"><code class="code">placement</code></h3>
		<p>default: <code class="code">'bottom'</code></p>
		<p>The placement of the floating element relative to the reference element.</p>
		<CodeBlock lang="ts" code={`(snippet)`} />
	</section>
</div>
