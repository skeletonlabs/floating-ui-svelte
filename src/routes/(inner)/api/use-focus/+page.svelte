<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import ExampleRaw from './Example.svelte?raw';
	import Table from '$docs/components/Table/Table.svelte';
	import { tableOptions } from './data.js';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>useFocus</span></h1>
		<p>
			Opens the floating element while the reference element has focus, like CSS
			<code class="code">:focus</code>.
		</p>
		<CodeBlock lang="ts" code={`import { useFocus } from '@skeletonlabs/floating-ui-svelte';`} />
		<!-- TODO: add when FloatingFocusManager is ready -->
		<!-- <p>To manage focus within the floating element itself, use <a class="anchor" href="/api/floating-focus-manager">FloatingFocusManager</a>.</p> -->
	</header>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<p>
			This Hook returns event handler props. To use it, pass it the context object returned from <code
				class="code">useFloating()</code
			>, and then feed its result into the <code class="code">useInteractions()</code> array. The returned
			prop getters are then spread onto the elements for rendering.
		</p>
		<CodeBlock code={ExampleRaw} lang="svelte" mark={[2, 5, 6]} />
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
			Compare to <a class="anchor" href="https://floating-ui.com/docs/useFocus" target="_blank">Floating UI React</a>.
		</p>
	</section>
</div>
