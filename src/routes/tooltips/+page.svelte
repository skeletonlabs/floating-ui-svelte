<script lang="ts">
	import { arrow, useFloating, FloatingArrow, autoUpdate, offset } from '$lib/index.js';
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import Example from './Example.svelte';
	import exampleCode from './Example.svelte?raw';
	import Preview from '$docs/components/Preview/Preview.svelte';
</script>

<div class="space-y-10">
	<header class="card card-gradient space-y-8">
		<h1 class="h1">
			<span>Tooltips</span>
		</h1>
		<p>
			A tooltip is a floating element that displays information related to an anchor element when it
			receives keyboard focus or the mouse hovers over it.
		</p>
	</header>
	<!-- Essentials -->
	<section class="space-y-8">
		<h2 class="h2">Essentials</h2>
		<p>An accessible tooltip component has the following qualities:</p>
		<ul class="list-disc list-outside translate-x-8 space-y-4">
			<li>
				<span class="highlight">Dynamic anchor positioning</span>: The tooltip is positioned next to
				its reference element, and remains anchored to it while avoiding collisions.
			</li>
			<li>
				<span class="highlight">Events</span>: When the mouse hovers over the reference element, or
				when the reference element receives keyboard focus, the tooltip opens. When the mouse
				leaves, or the reference is blurred, the tooltip closes.
			</li>
			<li>
				<span class="highlight">Dismissal</span>: When the user presses the
				<kbd class="kbd">esc</kbd> key while the tooltip is open, it closes.
			</li>
			<li>
				<span class="highlight">Role</span>: The elements are given relevant role and ARIA
				attributes to be accessible to screen readers.
			</li>
		</ul>
	</section>
	<!-- Preview -->
	<section class="space-y-8">
		<h2 class="h2">Example</h2>
		<Preview>
			{#snippet preview()}<Example />{/snippet}
			{#snippet code()}<CodeBlock code={exampleCode} lang="html" />{/snippet}
		</Preview>
	</section>
</div>
