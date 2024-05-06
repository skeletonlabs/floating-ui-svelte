import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/svelte';
import Test from './Test.svelte';

describe('useHover', () => {
	it('opens on mousenter', async () => {
		render(Test);

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

		await fireEvent.mouseEnter(screen.getByTestId('reference'));

		expect(screen.queryByTestId('floating')).toBeInTheDocument();
	});

	it('closes on mouseleave', async () => {
		render(Test);

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

		await fireEvent.mouseEnter(screen.getByTestId('reference'));

		expect(screen.queryByTestId('floating')).toBeInTheDocument();

		await fireEvent.mouseLeave(screen.getByTestId('reference'));

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
	});

	it('disables hover when enabled is `false`', async () => {
		render(Test, { enabled: false });

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
		fireEvent;
		await fireEvent.mouseEnter(screen.getByTestId('reference'));

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
	});

	describe('delay', () => {
		beforeEach(() => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
		});
		it('opens and closes with a single delay', async () => {
			const user = userEvent.setup();
			render(Test, { delay: 500 });

			vi.waitFor(() => {
				expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
			});

			await user.hover(screen.getByTestId('reference'));

			vi.advanceTimersByTime(499);

			vi.waitFor(() => {
				expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
			});

			vi.advanceTimersByTime(1);

			vi.waitFor(() => {
				expect(screen.queryByTestId('floating')).toBeInTheDocument();
			});

			await user.unhover(screen.getByTestId('reference'));

			vi.advanceTimersByTime(499);

			vi.waitFor(() => {
				expect(screen.queryByTestId('floating')).toBeInTheDocument();
			});

			vi.advanceTimersByTime(1);

			vi.waitFor(() => {
				expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
			});
		});
	});
});
