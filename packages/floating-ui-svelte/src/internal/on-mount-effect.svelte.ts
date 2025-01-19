import { untrack } from "svelte";

function onMountEffect(fn: () => void) {
	$effect(() => {
		const cleanup = untrack(() => fn());
		return cleanup;
	});
}

function preOnMountEffect(fn: () => void) {
	$effect.pre(() => {
		const cleanup = untrack(() => fn());
		return cleanup;
	});
}

onMountEffect.pre = preOnMountEffect;

export { onMountEffect };
