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
			it('applies the `aria-haspopup` attribute to the reference element', () => {
				render(App, { role: 'dialog' });

				expect(screen.getByTestId('reference')).toHaveAttribute('aria-haspopup', 'dialog');
			});

			it('applies the `dialog` role to the floating element', () => {
				render(App, { role: 'dialog', open: true });

				expect(screen.getByTestId('floating')).toHaveAttribute('role', 'dialog');
			});

			it('applies the `aria-expanded` attribute to the reference element based on `open` state', async () => {
				const { rerender } = render(App, { role: 'dialog', open: false });

				expect(screen.getByTestId('reference')).toHaveAttribute('aria-expanded', 'false');

				await rerender({ role: 'dialog', open: true });

				expect(screen.getByTestId('reference')).toHaveAttribute('aria-expanded', 'true');
			});
		});
	});
});
