<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeBlock from '../CodeBlock/CodeBlock.svelte';

	interface PreviewProps {
		preview: Snippet;
		code: Snippet;
	}

	let { preview, code }: PreviewProps = $props();

	let activeTab = $state('preview');

	function setTab(v: string) {
		activeTab = v;
	}

	// Styles
	const buttonBase = 'py-2 px-4 border-b-2 border-transparent hover:bg-surface-500/5';
</script>

<figure class="space-y-4">
	<!-- Tabs -->
	<nav class="flex border-b border-surface-500/50">
		<button
			class={buttonBase}
			onclick={() => setTab('preview')}
			class:!border-white={activeTab === 'preview'}
		>
			Preview
		</button>
		<button
			class={buttonBase}
			onclick={() => setTab('code')}
			class:!border-white={activeTab === 'code'}
		>
			Code
		</button>
	</nav>
	<!-- Panels -->
	<div>
		{#if activeTab === 'preview' && preview}<div class="preview">{@render preview()}</div>{/if}
		{#if activeTab === 'code' && code}{@render code()}{/if}
	</div>
</figure>
