<script>
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import Preview from '$docs/components/Preview/Preview.svelte';
	import Example from './Example.svelte';
	import ExampleRaw from './Example.svelte?raw';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>Popovers</span></h1>
		<p>
			This is a functional Popover that uses a combination of hooks and components, each of which is
			described in the sections below.
		</p>
	</header>
	<!-- Essentials -->
	<section class="space-y-8">
		<h2 class="h2">Essentials</h2>
		<p>An accessible popover component has the following qualities:</p>
		<ul class="ul">
			<li>
				<span class="highlight">Dynamic anchor positioning</span>: The popover is positioned next to
				its reference element, remaining anchored to it while avoiding collisions.
			</li>
			<li>
				<span class="highlight">Events</span>: When the reference element is clicked, it toggles the
				popover open or closed.
			</li>
			<li>
				<span class="highlight">Dismissal</span>: When the user presses the
				<kbd class="kbd">esc</kbd> key or outside the popover while it is open, it closes.
			</li>
			<li>
				<span class="highlight">Role</span>: The elements are given relevant role and ARIA
				attributes to be accessible to screen readers.
			</li>
			<li>
				<span class="highlight">Focus management</span>: Focus is managed for non-modal or modal
				behavior.
			</li>
		</ul>
	</section>
	<!-- Example -->
	<section class="space-y-8">
		<h2 class="h2">Example</h2>
		<Preview>
			{#snippet preview()}<Example />{/snippet}
			{#snippet code()}<CodeBlock code={ExampleRaw} lang="svelte" />{/snippet}
		</Preview>
	</section>
	<!-- Open State -->
	<section class="space-y-8">
		<h2 class="h2">Open State</h2>
		<CodeBlock code={`let open = $state(false);`} lang="ts" />
		<p>
			<code class="code">open</code> determines whether or not the popover is currently open on the screen.
			It is used for conditional rendering.
		</p>
	</section>
	<h2 class="h2">Basic Popover</h2>
	<!-- useFloating Hook -->
	<section class="space-y-8">
		<h3 class="h3">useFloating Hook</h3>
		<p>
			The <a class="anchor" href="/api/use-floating">useFloating</a> hook provides positioning and context
			for our popover. We need to pass it some information:
		</p>
		<CodeBlock code={`const floating = useFloating({ /* ...settings... */ });`} lang="ts" />
		<ul class="ul">
			<li>
				<code class="code">open</code>: The open state from our <code class="code">useState()</code>
				Hook above.
			</li>
			<li>
				<code class="code">onOpenChange</code>: A callback function that will be called when the
				popover is opened or closed. We’ll use this to update our <code class="code">open</code> state.
			</li>
			<li>
				<code class="code">middleware</code>: Import and pass middleware to the array that ensure
				the popover remains on the screen, no matter where it ends up being positioned.
			</li>
			<li>
				<code class="code">whileElementsMounted</code>: Ensure the popover remains anchored to the
				reference element by updating the position when necessary, only while both the reference and
				floating elements are mounted for performance.
			</li>
		</ul>
	</section>
	<!-- Interaction Hooks -->
	<section class="space-y-8">
		<h3 class="h3">Interaction Hooks</h3>
		<p>
			The <a class="anchor" href="/api/use-interactions">useInteractions</a> hooks returns an object
			containing keys of props that enable the popover to be opened, closed, or accessible to screen
			readers. Using the
			<code class="code">context</code> that was returned from the Hook, call the interaction Hooks.
		</p>
		<CodeBlock
			code={`
const role = useRole(floating.context);
const click = useClick(floating.context);
const dismiss = useDismiss(floating.context);
const interactions = useInteractions([role, click, dismiss]);
		`}
			lang="ts"
		/>
		<ul class="ul">
			<li>
				<code class="code">useClick()</code>: adds the ability to toggle the popover open or closed
				when the reference element is clicked.
			</li>
			<li>
				<code class="code">useDismiss()</code>: adds the ability to dismiss the popover when the
				user presses the <kbd class="kbd">esc</kbd> key or presses outside of the popover.
			</li>
			<li>
				<code class="code">useRole()</code>: adds the correct ARIA attributes for a
				<code class="code">dialog</code> to the popover and reference elements.
			</li>
		</ul>
		<p>
			Finally, <code class="code">useInteractions()</code> merges all of their props into prop getters
			which can be used for rendering.
		</p>
	</section>
	<!-- Rendering -->
	<section class="space-y-8">
		<h3 class="h3">Rendering</h3>
		<p>Now we have all the variables and Hooks set up, we can render out our elements.</p>
		<CodeBlock
			lang="html"
			code={`
<!-- Reference Element -->
<button
	bind:this={floating.elements.reference}
	{...interactions.getReferenceProps()}
	class="btn-gradient"
>
	Click Me
</button>\n
<!-- Floating Element -->
{#if open}
	<div
		bind:this={floating.elements.floating}
		style={floating.floatingStyles}
		{...interactions.getFloatingProps()}
		class="floating popover-neutral"
		transition:fade={{ duration: 200 }}
	>
		<p>
			You can press the <kbd class="kbd">esc</kbd> key or click outside to
			<strong>*dismiss*</strong> this floating element.
		</p>
		<FloatingArrow bind:ref={elemArrow} context={floating.context} fill="#575969" />
	</div>
{/if}
		`}
		/>
		<ul class="ul">
			<li>
				<code class="code">{`{...getReferenceProps()}`}</code> /
				<code class="code">{`{...getFloatingProps()}`}</code>
				spreads the props from the interaction Hooks onto the relevant elements. They contain props like
				<code class="code">onClick</code>, <code class="code">aria-expanded</code>, etc.
			</li>
			<!-- TODO: flush out when FloatingManager available. -->
			<li class="opacity-50 line-through">
				COMING SOON: <code class="code">{`<FloatingFocusManager />`}</code> is a component that manages
				focus of the popover for non-modal or modal behavior. It should directly wrap the floating element
				and only be rendered when the popover is also rendered.
			</li>
		</ul>
	</section>

	<!-- TODO: flush out when FloatingManager available. -->

	<!-- Modals and Non-Modal Behavior -->
	<section class="space-y-8">
		<h3 class="h3">Modals and Non-Modal Behavior</h3>
		<div class="alert">Coming Soon.</div>
	</section>
	<!-- Reusable Popover Component -->
	<h2 class="h2">Reusable Popover Component</h2>
	<div class="alert">Coming Soon.</div>
</div>
