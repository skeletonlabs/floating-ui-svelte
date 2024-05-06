<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import Example from './Example.svelte';
	import exampleCode from './Example.svelte?raw';
	import Preview from '$docs/components/Preview/Preview.svelte';
</script>

<div class="space-y-10">
	<!-- Alert: Work in Progress -->
	<aside class="alert text-center">
		<p>NOTE: this section is a working in progress and still under active developement.</p>
	</aside>
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>Tooltips</span></h1>
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
			<li class="opacity-50 line-through">
				COMING SOON: <span class="highlight">Dismissal</span>: When the user presses the
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
	<!-- Open State -->
	<section class="space-y-8">
		<h2 class="h2">Open State</h2>
		<CodeBlock code={`let open = $state(false);`} lang="ts" />
		<p>
			<code class="code">open</code> determines whether or not the tooltip is currently open on the screen.
			It is used for conditional rendering.
		</p>
	</section>
	<!-- useFloating Hook -->
	<section class="space-y-8">
		<h2 class="h2">useFloating Hook</h2>
		<p>
			The <code class="code">useFloating()</code> Hook provides positioning and context for our tooltip.
			We need to pass it some information:
		</p>
		<CodeBlock code={`const floating = useFloating({ /* ...settings... */ });`} lang="ts" />
		<ul class="list-disc list-outside translate-x-8 space-y-4">
			<li>
				<code class="code">open</code>: The open state from our <code class="code">useState()</code>
				Hook above.
			</li>
			<li>
				<code class="code">onOpenChange</code>: A callback function that will be called when the
				tooltip is opened or closed. We’ll use this to update our <code class="code">open</code> state.
			</li>
			<li>
				<code class="code">middleware</code>: Import and pass middleware to the array that ensure
				the tooltip remains on the screen, no matter where it ends up being positioned.
			</li>
			<li>
				<code class="code">whileElementsMounted</code>: Ensure the tooltip remains anchored to the
				reference element by updating the position when necessary, only while both the reference and
				floating elements are mounted for performance.
			</li>
		</ul>
	</section>
	<!-- Interaction Hooks -->
	<section class="space-y-8">
		<h2 class="h2">Interaction Hooks</h2>
		<p>
			The <code class="code">useInteractions()</code> hooks returns an object containing keys of props
			that enable the tooltip to be opened, closed, or accessible to screen readers.
		</p>
		<p>
			Using the <code class="code">context</code> that was returned from the Hook, call the interaction
			Hooks.
		</p>
		<CodeBlock
			code={`
const hover = useHover(floating.context);
const role = useRole(floating.context, { role: 'tooltip' });
const interactions = useInteractions([hover, role]);
		`}
			lang="ts"
		/>
		<ul class="list-disc list-outside translate-x-8 space-y-4">
			<li>
				<code class="code">useHover()</code>: adds the ability to toggle the tooltip open or closed
				when the reference element is hovered over. The <code class="code">move</code> option is set
				to false so that
				<code class="code">mousemove</code> events are ignored.
			</li>
			<li class="opacity-50 line-through">
				COMING SOON: <code class="code">useFocus()</code>: adds the ability to toggle the tooltip
				open or closed when the reference element is focused.
			</li>
			<li class="opacity-50 line-through">
				COMING SOON: <code class="code">useDismiss()</code>: adds the ability to dismiss the tooltip
				when the user presses the <kbd class="kbd">esc</kbd> key.
			</li>
			<li>
				<code class="code">useRole()</code>: adds the correct ARIA attributes for a
				<code class="code">tooltip</code> to the tooltip and reference elements.
			</li>
		</ul>
	</section>
	<!-- Rendering -->
	<section class="space-y-8">
		<h2 class="h2">Rendering</h2>
		<p>Now we have all the variables and Hooks set up, we can render out our elements.</p>
		<CodeBlock
			lang="html"
			code={`
<!-- Reference Element -->
<button bind:this={elemReference} {...interactions.getReferenceProps()}>Hover Me</button>\n
<!-- Floating Element -->
<div
	bind:this={elemFloating}
	style={floating.floatingStyles}
	{...interactions.getFloatingProps()}
	class="floating"
>
	{#if open}
		<div>
			<p>This is the floating element</p>
			<FloatingArrow bind:ref={elemArrow} context={floating.context} />
		</div>
	{/if}
</div>
		`}
		/>
		<p>
			<code class="code">{`{...getReferenceProps()}`}</code> and
			<code class="code">{`{...getFloatingProps()}`}</code> spreads the props from the interaction
			Hooks onto the relevant elements. They contain props like
			<code class="code">onMouseEnter</code>, <code class="code">aria-describedby</code>, etc.
		</p>
	</section>
</div>
