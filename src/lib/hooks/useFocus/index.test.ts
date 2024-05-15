import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte/svelte5';
import App from './App.test.svelte';

describe('useFocus', () => {
	describe('default', () => {
		it('changes the open state to `true` on focus', async () => {
			render(App);

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId('reference'));

			expect(screen.queryByTestId('floating')).toBeInTheDocument();
		});

		it('changes the open state to `false` on blur', async () => {
			render(App);

			expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

			await fireEvent.focus(screen.getByTestId('reference'));

			expect(screen.queryByTestId('floating')).toBeInTheDocument();

			await fireEvent.blur(screen.getByTestId('reference'));

			await waitFor(() => {
				expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
			});
		});
	});
});
