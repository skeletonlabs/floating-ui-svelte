import { afterEach, describe, expect, it } from 'vitest';
import { screen, cleanup, render } from '@testing-library/svelte';
import { withEffect } from '$lib/utils/test.svelte.js';

import FloatingArrow from './FloatingArrow.svelte';
import { useFloating } from '$lib/hooks/useFloating/index.svelte.js';

describe('FloatingArrow', () => {
	afterEach(() => cleanup());

	it(
		'renders the component to default props',
		withEffect(() => {
			const arrowRef = document.createElement('div');
			const floating = useFloating();
			render(FloatingArrow, {
				props: { ref: arrowRef, context: floating.context },
			});
			const component = screen.getByTestId('floating-arrow');
			expect(component).toBeInTheDocument();
		}),
	);

	it(
		'renders position based on context placement',
		withEffect(() => {
			const arrowRef = document.createElement('div');
			const floating = useFloating({ placement: 'left' });
			render(FloatingArrow, {
				props: { ref: arrowRef, context: floating.context, width: 20, height: 20 },
			});
			const component = screen.getByTestId('floating-arrow');
			expect(component.style.left).toBe('calc(100% - 0px)');
		}),
	);

	it(
		'renders with a custom width and height',
		withEffect(() => {
			const arrowRef = document.createElement('div');
			const floating = useFloating();
			render(FloatingArrow, {
				props: { ref: arrowRef, context: floating.context, width: 20, height: 20 },
			});
			const component = screen.getByTestId('floating-arrow');
			expect(component.getAttribute('width')).equals('20');
			expect(component.getAttribute('height')).equals('20');
		}),
	);

	it(
		'renders with a custom transform',
		withEffect(() => {
			const arrowRef = document.createElement('div');
			const floating = useFloating();
			render(FloatingArrow, {
				props: { ref: arrowRef, context: floating.context, transform: '123px' },
			});
			const component = screen.getByTestId('floating-arrow');
			expect(component.style.transform).toContain('123px');
		}),
	);

	it(
		'renders with a custom fill',
		withEffect(() => {
			const arrowRef = document.createElement('div');
			const floating = useFloating();
			const testFillColor = 'green';
			render(FloatingArrow, {
				props: { ref: arrowRef, context: floating.context, fill: testFillColor },
			});
			const component = screen.getByTestId('floating-arrow');
			expect(component.style.fill).toContain(testFillColor);
		}),
	);
});
