import type { HTMLAttributes } from 'svelte/elements';

interface Interaction {
	reference: HTMLAttributes<HTMLElement>;
	floating: HTMLAttributes<HTMLElement>;
}

export { type Interaction };
