<script lang="ts">
	import { type Snippet } from 'svelte';
	import { createFocusTrap } from 'focus-trap';
	import Portal from '../Portal/Portal.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { beforeNavigate } from '$app/navigation';

	interface Props {
		children: Snippet;
		type?: 'modal' | 'drawer';
		open?: boolean;
	}

	let { children, type = 'drawer', open = $bindable(false) }: Props = $props();

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

	const commonClasses = 'fixed z-50';

	const classes = $derived(
		{
			drawer: `${commonClasses} top-0 left-0 right-0 bottom-0 h-screen w-fit max-w-[500px]`,
			modal: `${commonClasses} top-4 md:top-[15%] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[500px] rounded-md bg-surface-700`,
		}[type],
	);

	const flyParams = $derived(
		{
			drawer: { x: -200, duration: 200 },
			modal: { y: 50, easing: cubicOut, duration: 250 },
		}[type],
	);
</script>

<Portal>
	{#if open}
		<div class="fixed inset-0 z-50 bg-black bg-opacity-50"></div>
		<div in:fly={flyParams} class={classes} role="dialog" aria-modal="true" use:focus_trap>
			{@render children()}
		</div>
	{/if}
</Portal>
