import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import { offset } from '@floating-ui/dom';
import Test from './Test.svelte';

describe('useFloating', () => {
	it('updates floating coords on placement change', async () => {
		// @ts-expect-error - Svelte 5 has a different component type. It still works.
		const { getByTestId, rerender } = render(Test, {
			placement: 'bottom',
			middleware: [offset(5)]
		});

		await waitFor(() => {
			expect(getByTestId('x').textContent).toBe('0');
			expect(getByTestId('y').textContent).toBe('5');
		});

		await rerender({
			placement: 'left',
			middleware: [offset(5)]
		});

		await waitFor(() => {
			expect(getByTestId('x').textContent).toBe('5');
			expect(getByTestId('y').textContent).toBe('0');
		});
	});
});
