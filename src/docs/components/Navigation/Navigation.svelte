<script lang="ts">
	import { page } from '$app/stores';
	import { drawer } from '$docs/stores.svelte';
	// Icons (Docs)
	import IconGetStarted from 'lucide-svelte/icons/rocket';
	// Icons (Examples)
	import IconTooltips from 'lucide-svelte/icons/message-square';
	import IconPopovers from 'lucide-svelte/icons/square-chevron-down';
	import IconModals from 'lucide-svelte/icons/layers-2';
	import IconContextMenus from 'lucide-svelte/icons/square-menu';
	// Icons (API)
	import IconUseFloating from 'lucide-svelte/icons/cloud';
	import IconUseInteractions from 'lucide-svelte/icons/pointer';
	import IconUseHover from 'lucide-svelte/icons/square-mouse-pointer';
	// import IconUseClick from 'lucide-svelte/icons/mouse-pointer-2';
	import IconUseRole from 'lucide-svelte/icons/person-standing';
	import IconFloatingArrow from 'lucide-svelte/icons/triangle';
	// import IconUtils from 'lucide-svelte/icons/wand-sparkles';
	// Components
	import Logo from '$docs/components/Logo/Logo.svelte';

	// Props
	let { classes = '' } = $props();

	// Navigation
	const navigation = [
		{
			label: 'Docs',
			links: [{ icon: IconGetStarted, href: '/docs/getting-started', label: 'Getting Started' }],
		},
		{
			label: 'Examples',
			links: [
				{ icon: IconTooltips, href: '/examples/tooltips', label: 'Tooltips' },
				{ icon: IconPopovers, href: '/examples/popovers', label: 'Popovers' },
				{ icon: IconModals, href: '/examples/modals', label: 'Modals' },
				{ icon: IconContextMenus, href: '/examples/context-menus', label: 'Context Menus' },
			],
		},
		{
			label: 'API Reference',
			links: [
				{ icon: IconUseFloating, href: '/api/use-floating', label: 'useFloating' },
				{ icon: IconUseInteractions, href: '/api/use-interactions', label: 'useInteractions' },
				{ icon: IconUseHover, href: '/api/use-hover', label: 'useHover' },
				// { icon: IconUseClick, href: '/api/use-click', label: 'useClick' },
				{ icon: IconUseRole, href: '/api/use-role', label: 'useRole' },
				{ icon: IconFloatingArrow, href: '/api/floating-arrow', label: 'Floating Arrow' },
				// { icon: IconUtils, href: '/api/utilities', label: 'Utilities' }
			],
		},
	];

	// FIXME: Remove when Svelte 5 supports $page, see: https://github.com/sveltejs/eslint-plugin-svelte/issues/652
	// eslint-disable-next-line svelte/valid-compile
	const navActive = (href: string) => $page.route.id?.replace('/(inner)', '') == href;
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
	<div class="p-4 py-8 pb-32">
		{#each navigation as section}
			<nav>
				<span class="block font-bold text-white p-4">{section.label}</span>
				<ul class="border-l border-surface-500/50 ml-4">
					{#each section.links as link}
						<li>
							<a
								href={link.href}
								class="grid grid-cols-[24px_1fr] items-center gap-4 rounded-tr-xl rounded-br-xl px-4 py-3 text-left hover:bg-surface-500/20"
								class:nav-active={navActive(link.href)}
								onclick={() => drawer.close()}
							>
								<svelte:component this={link.icon} size={24} />
								<span>{link.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		{/each}
	</div>
</div>

<style lang="postcss">
	.nav-active {
		@apply bg-pink-400/10 text-pink-400 hover:bg-pink-400/20;
	}
</style>
