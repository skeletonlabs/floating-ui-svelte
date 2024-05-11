import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte/svelte5';
import App from './App.test.svelte';

describe('useClick', () => {
	describe('enabled', () => {
		it('is set to `true` by default', async () => {
			render(App);

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});
		});

		it('enables the hook when `enabled` is `true`', async () => {
			render(App, { enabled: true });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});
		});
		it('disables the hook when `enabled` is `false`', async () => {
			render(App, { enabled: false });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
			});
		});
	});

	describe('event', () => {
		it('is set to `click` by default', async () => {
			render(App);

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});
		});

		it('opens on click when `event` is set to `click`', async () => {
			render(App, { event: 'click' });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});
		});

		it('opens on mousedown when `event` is set to `mousedown`', async () => {
			render(App, { event: 'mousedown' });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.mouseDown(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});
		});
	});

	describe('toggle', () => {
		it('is set to `true` by default', async () => {
			render(App);

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
			});
		});

		it('when set to `true` changes `open` state to both `true` and `false`', async () => {
			render(App, { toggle: true });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
			});
		});

		it('when set to `true` changes `open` state to `false` when `open` is initially set to `true`', async () => {
			render(App, { toggle: true, open: true });

			expect(screen.queryByRole('tooltip')).toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
			});
		});

		it('when set to `false` changes `open` state to `true` and not back to `false`', async () => {
			render(App, { toggle: false });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});
		});
		it('when set to `false` does not change `open` state back to `false` when `open` is initially set to `true`', async () => {
			render(App, { toggle: false, open: true });

			expect(screen.queryByRole('tooltip')).toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});
		});
	});

	describe('keyboardHandlers', () => {
		it('when set to `true` returns a `Space` keyup event handler', async () => {
			render(App, { element: 'div' });

			await fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

			expect(screen.queryByRole('tooltip')).toBeInTheDocument();
		});

		it('when set to `true` returns a `Space` keyup event handler', async () => {
			render(App, { element: 'div' });

			await fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
			await fireEvent.keyUp(screen.getByRole('button'), { key: ' ' });

			expect(screen.queryByRole('tooltip')).toBeInTheDocument();
		});

		it('when applied to a typable reference does not return a `Space` key event handler', async () => {
			render(App, { element: 'input' });

			await fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
			await fireEvent.keyUp(screen.getByRole('button'), { key: ' ' });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
		});

		it('when applied to a typable reference does not return a `Enter` key event handler', async () => {
			render(App, { element: 'input' });

			await fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

			expect(screen.queryByRole('tooltip')).toBeInTheDocument();
		});
	});
	it('does not change `open` state to `false` on mouseleave when paired with `useHover`', async () => {
		render(App, { enableHover: true });

		await fireEvent.mouseEnter(screen.getByRole('button'));
		await fireEvent.click(screen.getByRole('button'));
		await fireEvent.mouseLeave(screen.getByRole('button'));

		expect(screen.queryByRole('tooltip')).toBeInTheDocument();
	});
});
