import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte/svelte5';
import App from './App.test.svelte';

const ARIA_ROLES = ['grid', 'listbox', 'menu', 'tree', 'tooltip', 'alertdialog', 'dialog'] as const;

describe('useRole', () => {
	it('by default applies the "dialog" role to the floating element', () => {
		render(App, { open: true });
		expect(screen.queryByRole('dialog')).toBeInTheDocument();
	});

	for (const role of ARIA_ROLES) {
		it(`applies the "${role}" role to the floating element`, () => {
			render(App, { role, open: true });
			expect(screen.queryByRole(role)).toBeInTheDocument();
		});
	}

	describe('tooltip', () => {
		it.skip('sets correct aria attributes based on the open state', async () => {
			const { rerender } = render(App, { role: 'tooltip', open: true });

			expect(screen.getByTestId('reference')).toHaveAttribute(
				'aria-describedby',
				screen.getByRole('tooltip').getAttribute('id'),
			);

			await rerender({ role: 'tooltip', open: false });

			expect(screen.getByTestId('reference')).not.toHaveAttribute('aria-describedby');
		});
	});

	describe('label', () => {
		it.skip('sets correct aria attributes based on the open state', async () => {
			const { rerender } = render(App, { role: 'label', open: true });

			expect(screen.getByTestId('reference')).toHaveAttribute(
				'aria-labelledby',
				screen.getByRole('tooltip').getAttribute('id'),
			);

			await rerender({ role: 'tooltip', open: false });

			expect(screen.getByRole('button')).not.toHaveAttribute('aria-labelledby');
		});
	});

	describe('dialog', () => {
		it.skip('sets correct aria attributes based on the open state', async () => {
			const { rerender } = render(App, { role: 'dialog', open: false });

			expect(screen.getByTestId('reference')).toHaveAttribute('aria-haspopup', 'dialog');
			expect(screen.getByTestId('reference')).toHaveAttribute('aria-expanded', 'false');

			await rerender({ role: 'dialog', open: true });

			expect(screen.getByRole('dialog')).toBeInTheDocument();
			expect(screen.getByTestId('reference')).toHaveAttribute(
				'aria-controls',
				screen.getByRole('dialog').getAttribute('id'),
			);
		});
	});
});
