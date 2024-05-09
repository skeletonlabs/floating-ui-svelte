<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
</script>

<div class="space-y-10">
	<!-- Header -->
	<header class="card card-gradient space-y-8">
		<h1 class="h1"><span>Utilities</span></h1>
		<p>Below you'll find a number of useful utilities.</p>
	</header>
	<!-- Usage -->
	<section class="space-y-8">
		<h2 class="h2"><code class="code-title">useId()</code></h2>
		<p>
			Generates a unique identifier string. This function combines a random string and an
			incrementing counter to ensure uniqueness.
		</p>
		<CodeBlock
			lang="ts"
			code={`
import { useId } from '@skeletonlabs/floating-ui-svelte';

const id = useId();
`}
		/>
	</section>
	<!-- Compare -->
	<section class="space-y-8">
		<h2 class="h2">Compare</h2>
		<!-- prettier-ignore -->
		<p>
			Compare to <a class="anchor" href="https://floating-ui.com/docs/react-utils" target="_blank">Floating UI React</a>.
		</p>
	</section>
</div>
