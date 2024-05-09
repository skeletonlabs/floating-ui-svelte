import { describe, expect, it } from 'vitest';
import { withEffect } from '$lib/test-utils.svelte.js';
import { render } from '@testing-library/svelte';
import FloatingArrow from './FloatingArrow.svelte';
import { useFloating } from '$lib/hooks/useFloating/index.svelte.js';

describe('FloatingArrow', () => {
	it(
		'renders the component to default props',
		withEffect(() => {
			const arrowRef = document.createElement('div');
			const floating = useFloating();
			const { getByTestId } = render(FloatingArrow, {
				props: { ref: arrowRef, context: floating.context },
			});
			const component = getByTestId('floating-arrow');
			expect(component).toBeInTheDocument();
		}),
	);
});
