<div class="space-y-10">
	<header class="card card-gradient space-y-8">
		<h1 class="h1">
			<span>useFloating</span>
		</h1>
		<p>
			The main Hook of the library that acts as a controller for all other Hooks and components.
		</p>
		<pre class="pre">{`import { useFloating } from '@skeletonlabs/floatin-ui-svelte';`}</pre>
	</header>
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<p>At its most basic, the function accepts two elements:</p>
		<ul class="list-disc list-outside translate-x-4 space-y-2">
			<li>
				<span class="highlight">Reference element</span> — also known as the anchor element, this is
				the element that is being referred to for positioning. Often this is a button that triggers a
				floating popover like a tooltip or menu.
			</li>
			<li>
				<span class="highlight">Floating element</span> — this is the element that floats next to the
				reference element, remaining anchored to it. This is the popover or tooltip itself.
			</li>
		</ul>
		<pre class="pre">{`
<button id="button">My reference element</button>
<div id="tooltip">My floating element</div>
        `.trim()}</pre>
		<p>
			First, give the floating element initial CSS styles so that it becomes an
			absolutely-positioned element that floats on top of the UI with layout ready for being
			measured:
		</p>
		<pre class="pre">{`
function App() {
  const {refs, floatingStyles} = useFloating();
  return (
    <>
      <div ref={refs.setReference} />
      <div ref={refs.setFloating} style={floatingStyles} />
    </>
  );
}
        `.trim()}</pre>
		<p>
			The <code class="code">-start</code> and <code class="code">-end</code> alignments are
			<a href="/" class="anchor">logical</a> and will adapt to the writing direction (e.g. RTL) as expected.
		</p>
	</section>
</div>
