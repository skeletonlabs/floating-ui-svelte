<script lang="ts">
	import { type Snippet } from 'svelte';
	import { createFocusTrap } from 'focus-trap';
	import Portal from '../Portal/Portal.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { beforeNavigate } from '$app/navigation';

	interface Props {
		children: Snippet;
		open?: boolean;
	}

	let { children, open = $bindable(false) }: Props = $props();

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	});

	function focus_trap(node: HTMLElement) {
		const trap = createFocusTrap(node, {
			returnFocusOnDeactivate: true,
			preventScroll: true,
			escapeDeactivates: () => {
				open = false;
				return true;
			},
			allowOutsideClick: () => {
				open = false;
				return true;
			},
		});
		trap.activate();
		return {
			destroy() {
				trap.deactivate();
			},
		};
	}

	beforeNavigate(() => {
		open = false;
	});
</script>

<Portal>
	{#if open}
		<div class="fixed inset-0 z-50 bg-black bg-opacity-50"></div>
		<div
			in:fly={{ y: 50, easing: cubicOut, duration: 250 }}
			class="fixed left-1/2 -translate-x-1/2 top-4 md:top-[15%] z-50 w-[calc(100%-2rem)] max-w-[500px] bg-surface-700 rounded-md"
			role="dialog"
			aria-modal="true"
			use:focus_trap
		>
			{@render children()}
		</div>
	{/if}
</Portal>
