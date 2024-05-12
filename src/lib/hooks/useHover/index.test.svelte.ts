import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/svelte/svelte5';
import App from './App.test.svelte';

vi.useFakeTimers();

describe('useHover', () => {
	it('opens on mousenter', async () => {
		render(App);

		await fireEvent.mouseEnter(screen.getByTestId('reference'));
		expect(screen.queryByTestId('floating')).toBeInTheDocument();
	});

	it('closes on mouseleave', async () => {
		render(App);

		await fireEvent.mouseEnter(screen.getByTestId('reference'));
		await fireEvent.mouseLeave(screen.getByTestId('reference'));
		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
	});

	describe('delay', () => {
		it('delays open and close when delay is provided a single value', async () => {
			render(App, { delay: 100 });

			await fireEvent.mouseEnter(screen.getByTestId('reference'));

			await act(async () => {
				vi.advanceTimersByTime(99);
			});

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(1);
			});

			expect(screen.queryByTestId('floating')).toBeInTheDocument();
		});
		it('delays only open when only open is provided a value', async () => {
			render(App, { delay: { open: 100 } });

			await fireEvent.mouseEnter(screen.getByTestId('reference'));

			await act(async () => {
				vi.advanceTimersByTime(99);
			});

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(1);
			});

			expect(screen.queryByTestId('floating')).toBeInTheDocument();
		});
		it('delays only close when only close is provided a value', async () => {
			render(App, { delay: { close: 100 } });

			await fireEvent.mouseEnter(screen.getByTestId('reference'));
			await fireEvent.mouseLeave(screen.getByTestId('reference'));

			await act(async () => {
				vi.advanceTimersByTime(99);
			});

			expect(screen.queryByTestId('floating')).toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(1);
			});

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
		});
	});

	describe('restMs', () => {
		it('opens on mousenter once restMs has passed', async () => {
			render(App, { restMs: 100 });

			await fireEvent.mouseMove(screen.getByTestId('reference'));

			await act(async () => {
				vi.advanceTimersByTime(99);
			});

			await fireEvent.mouseMove(screen.getByTestId('reference'));

			await act(async () => {
				vi.advanceTimersByTime(1);
			});

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.mouseMove(screen.getByTestId('reference'));

			await act(async () => {
				vi.advanceTimersByTime(100);
			});

			expect(screen.queryByTestId('floating')).toBeInTheDocument();
		});

		it('restMs + nullish open delay should respect restMs', async () => {
			render(App, { restMs: 100, delay: { close: 100 } });

			await fireEvent.mouseEnter(screen.getByTestId('reference'));

			await act(async () => {
				vi.advanceTimersByTime(99);
			});

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await act(async () => {
				vi.advanceTimersByTime(1);
			});
		});

		it.skip('ignores restMs on touch pointers', async () => {
			render(App, { restMs: 100 });

			await fireEvent.pointerDown(screen.getByTestId('reference'), { pointerType: 'touch' });
			await fireEvent.mouseMove(screen.getByTestId('reference'));

			await act(async () => {});

			expect(screen.queryByTestId('floating')).toBeInTheDocument();
		});

		it('ignores restMs on touch pointers when mouseOnly is true ', async () => {
			render(App, { restMs: 100, mouseOnly: true });

			await fireEvent.pointerDown(screen.getByTestId('reference'), { pointerType: 'touch' });
			await fireEvent.mouseMove(screen.getByTestId('reference'));

			await act(async () => {});

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
		});
	});

	it.skip('does not show after delay when reference element changes mid delay', async () => {
		const { rerender } = render(App, { delay: 100 });
		await fireEvent.mouseEnter(screen.getByTestId('reference'));

		await act(async () => {
			vi.advanceTimersByTime(50);
		});

		await rerender({ showReference: false });

		await act(async () => {
			vi.advanceTimersByTime(50);
		});

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
	});
});
