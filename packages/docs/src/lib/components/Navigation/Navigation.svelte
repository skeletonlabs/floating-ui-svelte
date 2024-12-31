<script lang="ts">
import { page } from "$app/state";
// Components
import Logo from "$lib/components/Logo/Logo.svelte";
import { getDrawer } from "$lib/stores.svelte";
import IconUseDismiss from "lucide-svelte/icons/circle-x";
// Icons (API)
import IconUseFloating from "lucide-svelte/icons/cloud";
import IconUseFocus from "lucide-svelte/icons/keyboard";
import IconModals from "lucide-svelte/icons/layers-2";
// Icons (Examples)
import IconTooltips from "lucide-svelte/icons/message-square";
import IconUseClick from "lucide-svelte/icons/mouse-pointer-2";
import IconUseRole from "lucide-svelte/icons/person-standing";
import IconUseInteractions from "lucide-svelte/icons/pointer";
// Icons (Docs)
import IconGetStarted from "lucide-svelte/icons/rocket";
import IconPopovers from "lucide-svelte/icons/square-chevron-down";
import IconContextMenus from "lucide-svelte/icons/square-menu";
import IconUseHover from "lucide-svelte/icons/square-mouse-pointer";
import IconFloatingArrow from "lucide-svelte/icons/triangle";
import IconUtils from "lucide-svelte/icons/wand-sparkles";
import { on } from "svelte/events";

// Props
let { classes = "" } = $props();

// Navigation
const navigation = [
	{
		label: "Docs",
		links: [
			{
				Icon: IconGetStarted,
				href: "/docs/getting-started",
				label: "Getting Started",
			},
		],
	},
	{
		label: "Examples",
		links: [
			{ Icon: IconTooltips, href: "/examples/tooltips", label: "Tooltips" },
			{ Icon: IconPopovers, href: "/examples/popovers", label: "Popovers" },
			{ Icon: IconModals, href: "/examples/modals", label: "Modals" },
			{
				Icon: IconContextMenus,
				href: "/examples/context-menus",
				label: "Context Menus",
			},
		],
	},
	{
		label: "API Reference",
		links: [
			{
				Icon: IconUseFloating,
				href: "/api/use-floating",
				label: "useFloating",
			},
			{
				Icon: IconUseInteractions,
				href: "/api/use-interactions",
				label: "useInteractions",
			},
			{ Icon: IconUseHover, href: "/api/use-hover", label: "useHover" },
			{ Icon: IconUseFocus, href: "/api/use-focus", label: "useFocus" },
			{ Icon: IconUseClick, href: "/api/use-click", label: "useClick" },
			{ Icon: IconUseRole, href: "/api/use-role", label: "useRole" },
			{ Icon: IconUseDismiss, href: "/api/use-dismiss", label: "useDismiss" },
			{
				Icon: IconFloatingArrow,
				href: "/api/floating-arrow",
				label: "Floating Arrow",
			},
			{ Icon: IconUtils, href: "/api/utilities", label: "Utilities" },
		],
	},
] as const;

const drawer = getDrawer();

const navActive = (href: string) =>
	page.route.id?.replace("/(inner)", "") === href;

$effect(() => {
	return on(window, "resize", () => {
		drawer.open = false;
	});
});
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
	<div class="p-8 pt-0 pb-32">
		{#each navigation as section}
			<nav>
				<span class="block font-bold text-white py-4">{section.label}</span>
				<ul class="border-l border-surface-500/50">
					{#each section.links as link}
						<li>
							<a
								href={link.href}
								class="grid grid-cols-[24px_1fr] items-center gap-4 rounded-tr-xl rounded-br-xl px-4 py-3 text-left hover:bg-surface-500/20"
								class:nav-active={navActive(link.href)}
								onclick={() => (drawer.open = false)}
							>
								<link.Icon size={24}></link.Icon>
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
