import type { WritableBox } from "../../src/internal/box.svelte.js";

export type ReferenceSnippetProps = [
	WritableBox<Element | null>,
	Record<string, unknown>,
];
