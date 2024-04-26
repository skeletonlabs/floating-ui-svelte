// Resuable State Stores

// Navigation Drawer ---

export function createDrawer() {
	let value = $state(false);
	return {
		get value() {
			return value;
		},
		toggle: () => (value = !value)
	};
}
