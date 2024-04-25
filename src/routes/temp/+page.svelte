<div class="space-y-10">
	<header class="card card-gradient space-y-8">
		<h1 class="h1">useFloating</h1>
		<p>
			The main Hook of the library that acts as a controller for all other Hooks and components.
		</p>
		<pre class="pre">{`import { useFloating } from '@skeletonlabs/floatin-ui-svelte';`}</pre>
	</header>
	<section class="space-y-8">
		<h2 class="h2">Usage</h2>
		<p>Call the Hook inside a component.</p>
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
	</section>
</div>
