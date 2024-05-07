import { describe, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { testInEffect } from '$lib/test-utils.svelte.js';

import FloatingArrow from './FloatingArrow.svelte';
import { useFloating } from '$lib/hooks/useFloating/index.svelte.js';

describe('FloatingArrow', () => {
	testInEffect('renders the component to default props', () => {
		const arrowRef = document.createElement('div');
		const floating = useFloating();
		const { getByTestId } = render(FloatingArrow, {
			props: { ref: arrowRef, context: floating.context }
		});
		const component = getByTestId('floating-arrow');
		expect(component).toBeInTheDocument();
	});
});
