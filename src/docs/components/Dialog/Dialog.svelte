<script lang="ts">
	import { type Snippet } from 'svelte';
	import Portal from '../Portal/Portal.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		children: Snippet;
		open?: boolean;
	}

	let { children, open = $bindable(false) }: Props = $props();

	$effect(() => {
		const content = document.querySelector<HTMLDivElement>('[data-body]')!;

		if (open) {
			document.body.style.overflow = 'hidden';
			content.inert = true;
		} else {
			document.body.style.overflow = '';
			content.inert = false;
		}

		return () => {
			document.body.style.overflow = '';
			content.inert = false;
		};
	});

	$effect(() => {
		function onKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				open = false;
			}
		}

		document.addEventListener('keydown', onKeydown);

		return () => {
			document.removeEventListener('keydown', onKeydown);
		};
	});
</script>

<Portal>
	{#if open}
		<button
			onclick={() => (open = false)}
			class="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black bg-opacity-50"
		></button>
		<div
			in:fly={{ y: 50, easing: cubicOut, duration: 250 }}
			class="fixed left-1/2 -translate-x-1/2 top-[15%] z-50 max-w-[500px]"
			role="dialog"
			aria-modal="true"
		>
			{@render children()}
		</div>
	{/if}
</Portal>
