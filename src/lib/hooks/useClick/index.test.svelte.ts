import { describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
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

			cleanup();
		});
		it('disables the hook when `enabled` is `false`', async () => {
			render(App, { enabled: false });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
			});

			cleanup();
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

			cleanup();
		});

		it('opens on click when `event` is set to `click`', async () => {
			render(App, { event: 'click' });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.click(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});

			cleanup();
		});

		it('opens on mousedown when `event` is set to `mousedown`', async () => {
			render(App, { event: 'mousedown' });

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await fireEvent.mouseDown(screen.getByRole('button'));

			await vi.waitFor(() => {
				expect(screen.queryByRole('tooltip')).toBeInTheDocument();
			});

			cleanup();
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

			cleanup();
		});

		it('changes `open` state to both `true` and `false` when set to `true`', async () => {
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

			cleanup();
		});

		it('changes `open` state to `true` when set to `false`', async () => {
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

			cleanup();
		});
	});
});
