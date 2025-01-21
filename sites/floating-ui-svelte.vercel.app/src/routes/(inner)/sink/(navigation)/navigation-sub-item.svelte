<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		label,
		href,
		...restProps
	}: Omit<HTMLAnchorAttributes, "href" | "children"> & {
		label: string;
		href: string;
	} = $props();
</script>

<a {href} {...restProps} class="NavigationItem">
	{label}
</a>
