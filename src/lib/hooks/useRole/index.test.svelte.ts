import { describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import App from './App.test.svelte';

const ARIA_ROLES = ['grid', 'listbox', 'menu', 'tree', 'tooltip', 'alertdialog', 'dialog'] as const;

describe('useRole', () => {
	it('by default applies the "dialog" role to the floating element', () => {
		render(App, { role: undefined });
		expect(screen.queryByRole('dialog')).toBeInTheDocument();
		cleanup();
	});

	for (const role of ARIA_ROLES) {
		it(`applies the "${role}" role to the floating element`, () => {
			render(App, { role });
			expect(screen.queryByRole(role)).toBeInTheDocument();
			cleanup();
		});
	}

	it.skip('sets correct aria attributes based on the open state', async () => {
		const { rerender } = render(App, { role: 'tooltip', open: true });

		expect(screen.getByRole('button')).toHaveAttribute('aria-describedby');

		await rerender({ role: 'tooltip', open: false });

		expect(screen.getByRole('buton')).not.toHaveAttribute('aria-describedby');

		cleanup();
	});
});
