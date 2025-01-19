<script lang="ts">
	import type { Placement } from "@floating-ui/utils";
	import {
		useDelayGroup,
		useDismiss,
		useFloating,
		useFocus,
		useHover,
		useInteractions,
		useRole,
		type Delay,
	} from "../../../../src/index.js";
	import type { Snippet } from "svelte";
	import { autoUpdate, flip, offset, shift } from "@floating-ui/dom";

	let {
		label,
		placement = "top",
		delay = 0,
		children,
	}: {
		label: string;
		placement?: Placement;
		delay?: Delay;
		children?: Snippet;
	} = $props();

	let open = $state(false);

	const f = useFloating({
		open: () => open,
		onOpenChange: (v) => {
			open = v;
		},
		placement: () => placement,
		middleware: () => [offset(5), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	});

	const delayGroup = useDelayGroup(f.context);

	const ints = useInteractions([
		useHover(f.context, {
			delay: () => (delayGroup.delay === 0 ? delay : delayGroup.delay),
			move: false,
		}),
		useFocus(f.context),
		useRole(f.context, { role: "tooltip" }),
		useDismiss(f.context),
	]);
</script>
