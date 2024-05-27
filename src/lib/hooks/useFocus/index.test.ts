import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import App from './App.test.svelte';

it('changes the open state to `true` on focus', async () => {
	render(App);

	expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

	await fireEvent.focus(screen.getByTestId('reference'));

	expect(screen.getByTestId('floating')).toBeInTheDocument();
});

describe.skip('useFocus', () => {
	describe('default', () => {
		it('changes the open state to `true` on focus', async () => {
			render(App);

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId('reference'));

			expect(screen.getByTestId('floating')).toBeInTheDocument();
		});

		it('changes the open state to `false` on blur', async () => {
			render(App);

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId('reference'));

			expect(screen.getByTestId('floating')).toBeInTheDocument();

			await fireEvent.blur(screen.getByTestId('reference'));

			await vi.waitFor(() => {
				expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
			});
		});
	});

	describe('enabled', () => {
		it('does enable the hook when set to `true`', async () => {
			render(App, { enabled: true });

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId('reference'));

			expect(screen.getByTestId('floating')).toBeInTheDocument();
		});

		it('does not enable the hook when set to `false`', async () => {
			render(App, { enabled: false });

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId('reference'));

			await vi.waitFor(() => {
				expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
			});
		});
	});

	describe('visibleOnly', () => {
		it('does change the open state to `true` on focus when set to `true`', async () => {
			render(App, { visibleOnly: true });

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId('reference'));

			expect(screen.getByTestId('floating')).toBeInTheDocument();
		});

		it('does not change the open state to `true` on click (focus, but not focus-within) when set to `true`', async () => {
			const user = userEvent.setup();
			render(App, { visibleOnly: true });

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await user.click(screen.getByTestId('reference'));

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
		});

		it('does change the open state to `true` on focus when set to `false`', async () => {
			render(App, { visibleOnly: false });

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId('reference'));

			expect(screen.queryByTestId('floating')).toBeInTheDocument();
		});

		it('does change the open state to `true` on click (focus, but not focus-within) when set to `false`', async () => {
			const user = userEvent.setup();
			render(App, { visibleOnly: false });

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await user.click(screen.getByTestId('reference'));

			expect(screen.queryByTestId('floating')).toBeInTheDocument();
		});
	});
});