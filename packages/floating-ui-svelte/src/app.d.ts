// These global variables enable projects that potentially use multiple versions of
// floating ui via dependencies, etc. to share these variables across all instances.
// From experience with vaul-svelte using Bits UI under the hood, without these globals,
// composing multiple instances of floating ui components would not work as expected.
declare global {
	var fuiLockCount: { current: number };
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	var fuiLockCleanup: { current: Function };
	var fuiPrevFocusedElements: Element[];
}

export {};
