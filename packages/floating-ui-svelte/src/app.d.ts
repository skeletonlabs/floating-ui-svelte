declare global {
	var fui_lock_count: { current: number };
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	var fui_lock_cleanup: { current: Function };
}

export {};
