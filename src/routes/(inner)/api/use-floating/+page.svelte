<script lang="ts">
	import CodeBlock from '$docs/components/CodeBlock/CodeBlock.svelte';
	import { tableOptions, tableReturns } from './data.js';
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
		<p>
			The <code class="code">useFloating</code> Svelte hook acts as a controller for all other Floating
			UI Svelte features. It handles positioning your floating elements (tooltips, popovers, etc.) relative
			to an anchored element. Automatically calculates the best placement and updates it as needed, providing
			access to properties for position and style.
		</p>
		<CodeBlock lang="ts" code={`const floating = useFloating({\n\t/* options */\n});`} />
		<CodeBlock
			lang="html"
			code={`
<!-- Reference Element -->
<button bind:this="{floating.elements.reference}">
	Reference
</button>\n
<!-- Floating Element -->
<div
	bind:this="{floating.elements.floating}"
	style="{floating.floatingStyles}"
	class="floating"
>
	Floating
</div>
		`}
		/>
	</section>
	<!-- Alert: Destructuring -->
	<div class="alert">
		<h3 class="h3">Note</h3>
		<p>Destructured variables are not supported as this would break reactivity.</p>
	</div>
	<!-- Table: Options -->
	<section class="space-y-8">
		<h2 class="h2">Options</h2>
		<div class="table-wrap">
			<table class="table caption-bottom">
				<tbody class="hover:[&>tr]:preset-tonal-primary">
					{#each tableOptions as row}
						<tr>
							<td><code class="code">{row.property}</code></td>
							<td class="space-y-1">
								<p>{row.description}</p>
								<div class="flex items-center gap-2">
									<p class="meta-type" title="Type">{row.type}</p>
									{#if row.default}<p class="meta-default" title="Default">{row.default}</p>{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
	<!-- Table: Returns -->
	<section class="space-y-8">
		<h2 class="h2">Returns</h2>
		<div class="table-wrap">
			<table class="table caption-bottom">
				<tbody class="hover:[&>tr]:preset-tonal-primary">
					{#each tableReturns as row}
						<tr>
							<td><code class="code">{row.property}</code></td>
							<td class="space-y-1">
								<p>{row.description}</p>
								<p class="meta-type" title="Type">{row.type}</p>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
	<!-- Compare -->
	<section class="space-y-8">
		<h2 class="h2">Compare</h2>
		<!-- prettier-ignore -->
		<p>
			Compare to <a class="anchor" href="https://floating-ui.com/docs/useFloating" target="_blank">Floating UI React</a>.
		</p>
	</section>
</div>
