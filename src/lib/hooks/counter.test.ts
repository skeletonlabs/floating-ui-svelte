import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Counter from './Counter.svelte';

describe('counter', () => {
	it('updates count', () => {
		render(Counter, { count: 0 });

		const button = screen.getByRole('button');

		expect(button).toBeInTheDocument();
		button.click();

		vi.waitFor(() => {
			expect(button.innerText).toBe('1');
		});
	});
});
