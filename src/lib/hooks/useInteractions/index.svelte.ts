import type { HTMLAttributes } from 'svelte/elements';

interface Interaction {
	reference: HTMLAttributes<HTMLElement>;
	floating: HTMLAttributes<HTMLElement>;
}

function useInteractions(interactions: Array<Interaction | null | false>) {
	interactions = interactions.filter(Boolean) as Array<Interaction>;
	interactions;
}

export { useInteractions, type Interaction };
