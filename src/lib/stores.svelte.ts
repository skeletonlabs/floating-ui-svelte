// Resuable State Stores

// Navigation Drawer ---

function createDrawer() {
	let value = $state(false);
	return {
		get value() {
			return value;
		},
		toggle: () => (value = !value)
	};
}

export const drawer = createDrawer();
