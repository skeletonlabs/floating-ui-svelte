<script lang="ts">
	import { page } from '$app/stores';
	import { drawer } from '$lib/stores.svelte';
	// Icons
	import IconStart from 'lucide-svelte/icons/rocket';
	import IconTooltips from 'lucide-svelte/icons/message-square';
	import IconPopovers from 'lucide-svelte/icons/square-mouse-pointer';
	import IconModals from 'lucide-svelte/icons/layers-2';
	import IconContextMenus from 'lucide-svelte/icons/square-menu';
	// Components
	import Logo from '$lib/components/Logo/Logo.svelte';

	// Props
	let { classes = '' } = $props();

	// Navigation
	const navExternal = [
		{
			icon: IconStart,
			href: 'https://github.com/skeletonlabs/floating-ui-svelte?tab=readme-ov-file#floating-ui-svelte',
			label: 'Getting Started'
		}
	];
	const navHooks = [
		{ icon: IconTooltips, href: '/tooltips', label: 'Tooltips' },
		{ icon: IconPopovers, href: '/popovers', label: 'Popovers' },
		{ icon: IconModals, href: '/modals', label: 'Modals' },
		{ icon: IconContextMenus, href: '/context-menus', label: 'Context Menus' }
	];

	// eslint-disable-next-line svelte/valid-compile
	const navActive = (href: string) => $page.route.id == href;
</script>

<div
	class="fixed bottom-0 left-0 top-0 z-0 w-72 overflow-y-auto bg-surface-50 dark:border-r dark:border-surface-700 dark:bg-surface-800 no-scrollbar {classes}"
>
	<!-- Nav Header -->
	<header
		class="light-nav-gradient dark:dark-nav-gradient flex aspect-square items-center justify-center backdrop-blur"
	>
		<a href="/">
			<Logo />
		</a>
	</header>
	<!-- Nav List -->
	<nav class="space-y-8 p-4 py-8 pb-32">
		<!-- External Links -->
		<ul>
			{#each navExternal as link}
				<li>
					<a
						href={link.href}
						target="_blank"
						class="nav-link"
						class:nav-active={navActive(link.href)}
						onclick={() => drawer.close()}
					>
						<svelte:component this={link.icon} size={24} />
						<span>{link.label}</span>
					</a>
				</li>
			{/each}
		</ul>
		<!-- Hooks -->
		<ul>
			{#each navHooks as link}
				<li>
					<a
						href={link.href}
						class="nav-link"
						class:nav-active={$page.route.id === link.href}
						onclick={() => drawer.close()}
					>
						<svelte:component this={link.icon} size={24} />
						<span>{link.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</div>

<style lang="postcss">
	.nav-link {
		@apply grid grid-cols-[24px_1fr] items-center gap-4 rounded-xl px-4 py-3 text-left hover:bg-surface-500/20;
	}
	.nav-active {
		@apply bg-pink-400/10 text-pink-400 hover:bg-pink-400/20;
	}
</style>
