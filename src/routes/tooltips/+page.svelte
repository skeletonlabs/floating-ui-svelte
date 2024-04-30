<script>
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import Example from './Example.svelte';
	import exampleCode from './Example.svelte?raw';
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
		<CodeBlock
			code={`import { useFloating } from '@skeletonlabs/floatin-ui-svelte';`}
			lang="typescript"
		/>
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
	<section class="space-y-8">
		<h2 class="h2">Examples</h2>
		<p>Both of these examples have sections explaining them in-depth below.</p>
		<div>
			<Example />
		</div>
	</section>
	<section class="space-y-8">
		<h2 class="h2">Open state</h2>
		<CodeBlock code={exampleCode} lang="html" />
		<p>
			<code class="code">isOpen</code> determines whether or not the tooltip is currently open on the
			screen. It is used for conditional rendering.
		</p>
	</section>
	<!--
	<p>
		First, give the floating element initial CSS styles so that it becomes an
		absolutely-positioned element that floats on top of the UI with layout ready for being
		measured:
	</p>
	<p>
		The <code class="code">-start</code> and <code class="code">-end</code> alignments are
		<a href="/" class="anchor">logical</a> and will adapt to the writing direction (e.g. RTL) as expected.
	</p>
	<div class="alert">
		<h3 class="h3">Note</h3>
		<p>
			You aren’t limited to just these 12 placements though. <code class="code">offset</code> allows
			you to create any placement.
		</p>
	</div> -->
</div>
