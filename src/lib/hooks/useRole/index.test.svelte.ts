import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte/svelte5';
import App from './App.test.svelte';

describe('useRole', () => {
	describe('default', () => {
		it('applies the `dialog` role to the floating element', () => {
			render(App, { open: true });

			expect(screen.getByTestId('floating')).toHaveAttribute('role', 'dialog');
		});
	});

	describe('enabled', () => {
		it('does apply the role when set to `true`', () => {
			render(App, { role: 'listbox', open: true });

			expect(screen.getByTestId('floating')).toHaveAttribute('role', 'listbox');
		});
		it('does not apply the role when set to `false`', () => {
			render(App, { role: 'listbox', open: true, enabled: false });

			expect(screen.getByTestId('floating')).not.toHaveAttribute('role', 'listbox');
		});
	});

	describe('role', () => {
		describe('dialog', () => {
			it('applies the `dialog` role to the floating element', () => {
				render(App, { role: 'dialog', open: true });

				expect(screen.getByTestId('floating')).toHaveAttribute('role', 'dialog');
			});

			it('applies the `aria-haspopup` attribute to the reference element', () => {
				render(App, { role: 'dialog' });

				expect(screen.getByTestId('reference')).toHaveAttribute('aria-haspopup', 'dialog');
			});

			it('applies the `aria-expanded` attribute to the reference element based on `open` state', async () => {
				const { rerender } = render(App, { role: 'dialog', open: false });

				expect(screen.getByTestId('reference')).toHaveAttribute('aria-expanded', 'false');

				await rerender({ open: true });

				expect(screen.getByTestId('reference')).toHaveAttribute('aria-expanded', 'true');
			});

			it('applies the `aria-controls` attribute with the correct id to the reference element based on the `open` state', async () => {
				const { rerender } = render(App, { role: 'dialog', open: false });

				expect(screen.getByTestId('reference')).not.toHaveAttribute('aria-controls');

				await rerender({ open: true });

				expect(screen.getByTestId('reference')).toHaveAttribute(
					'aria-controls',
					screen.getByTestId('floating').id,
				);
			});
		});

		describe('label', () => {
			it('applies the `aria-labelledby` attribute to the reference element', () => {
				render(App, { role: 'label', open: true });

				expect(screen.getByTestId('reference')).toHaveAttribute('aria-labelledby');
			});
		});

		describe('tooltip', () => {
			it('applies the `tooltip` role to the floating element', () => {
				render(App, { role: 'tooltip', open: true });

				expect(screen.getByTestId('floating')).toHaveAttribute('role', 'tooltip');
			});

			it('applies the `aria-describedby` attribute to the reference element based on the `open` state', async () => {
				const { rerender } = render(App, { role: 'tooltip', open: false });

				expect(screen.getByTestId('reference')).not.toHaveAttribute('aria-describedby');

				await rerender({ open: true });

				expect(screen.getByTestId('reference')).toHaveAttribute('aria-describedby');
			});
		});
	});
});
