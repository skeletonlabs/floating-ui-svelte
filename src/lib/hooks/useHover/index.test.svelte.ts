import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/svelte';
import App from './App.test.svelte';

vi.useFakeTimers();

describe('useHover', () => {
	it('opens on mousenter', async () => {
		render(App);

		await fireEvent.mouseEnter(screen.getByRole('button'));
		expect(screen.queryByRole('tooltip')).toBeInTheDocument();

		cleanup();
	});

	it('closes on mouseleave', async () => {
		render(App);

		await fireEvent.mouseEnter(screen.getByRole('button'));
		await fireEvent.mouseLeave(screen.getByRole('button'));
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

		cleanup();
	});

	describe('delay', () => {
		it('delays open and close when delay is provided a single value', async () => {
			render(App, { delay: 500 });

			await fireEvent.mouseEnter(screen.getByRole('button'));

			await act(async () => {
				vi.advanceTimersByTime(499);
			});

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(1);
			});

			expect(screen.queryByRole('tooltip')).toBeInTheDocument();

			cleanup();
		});
		it('delays only open when only open is provided a value', async () => {
			render(App, { delay: { open: 500 } });

			await fireEvent.mouseEnter(screen.getByRole('button'));

			await act(async () => {
				vi.advanceTimersByTime(499);
			});

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(1);
			});

			expect(screen.queryByRole('tooltip')).toBeInTheDocument();

			cleanup();
		});
		it('delays only close when only close is provided a value', async () => {
			render(App, { delay: { close: 500 } });

			await fireEvent.mouseEnter(screen.getByRole('button'));
			await fireEvent.mouseLeave(screen.getByRole('button'));

			await act(async () => {
				vi.advanceTimersByTime(499);
			});

			expect(screen.queryByRole('tooltip')).toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(1);
			});

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			cleanup();
		});
	});
});
