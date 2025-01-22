import type { Snippet } from "svelte";

export interface MenuProps {
	label: string;
	nested?: boolean;
	children?: Snippet;
	forceMount?: boolean;
}
