<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import ExampleRaw from './Example.svelte?raw';
	import Table from '$docs/components/Table/Table.svelte';
	import { tableOptions } from './data.js';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>useDismiss</span></h1>
		<p>
			Closes the floating element when a dismissal is requested — by default, when the user presses
			the <kbd class="kbd">escape</kbd> key or outside of the floating element with their pointer.
		</p>
		<CodeBlock lang="ts" code={`import { useDismiss } from '@skeletonlabs/floating-ui-svelte';`} />
	</header>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<CodeBlock code={ExampleRaw} lang="svelte" />
	</section>
	<!-- Table: Options -->
	<section class="space-y-8">
		<h2 class="h2">Options</h2>
		<Table data={tableOptions} />
	</section>
	<!-- Reacting to dismissal -->
	<section class="space-y-8">
		<h2 class="h2">Reacting to dismissal</h2>
		<p>
			To react to the dismissal event, you can check for the <kbd class="kbd">reason</kbd> string in
			the <kbd class="kbd">onOpenChange</kbd> callback:
		</p>
		<CodeBlock
			lang="ts"
			code={`
const floating = useFloating({
	get open() {
		return open;
	},
	onOpenChange: (value, event, reason) => {
		open = value;
		if (reason === 'escape-key' || reason === 'outside-press') {
			console.log('dismissed');
		}
	},
});   	
		`}
		/>
	</section>
	<!-- FIXME: consider enabling this when FloatingOverlay is ready. -->
	<!-- Troubleshooting -->
	<!-- <section class="space-y-8">
		<h2 class="h2">Troubleshooting</h2>
		<h3 class="h3">Does not close when clicking in an iframe</h3>
		<p>You can use the <a class="anchor" href="/api/floatingoverlay">FloatingOverlay component</a> which will “cover” iframes to ensure clicks are captured in the same document as the floating element, as the click occurs on the overlay backdrop. This guarantees “outside press” detection will work.</p>
	</section> -->
	<!-- Compare -->
	<section class="space-y-8">
		<h2 class="h2">Compare</h2>
		<!-- prettier-ignore -->
		<p>
			Compare to <a class="anchor" href="https://floating-ui.com/docs/useDismiss" target="_blank">Floating UI React</a>.
		</p>
	</section>
</div>
