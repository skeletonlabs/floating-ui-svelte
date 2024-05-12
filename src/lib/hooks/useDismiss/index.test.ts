import { fireEvent, render, screen } from '@testing-library/svelte/svelte5';
import { describe, expect, it } from 'vitest';
import App from './App.test.svelte';

describe('useDismiss', () => {
	it('dismisses on outside pointerdown', async () => {
		render(App, { open: true });

		expect(screen.queryByTestId('floating')).toBeInTheDocument();

		await fireEvent.pointerDown(document);

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
	});
	it('dismisses on `Escape` key press', async () => {
		render(App, { open: true });

		expect(screen.queryByTestId('floating')).toBeInTheDocument();

		await fireEvent.keyDown(document, { key: 'Escape' });

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
	});

	it('dismisses on reference press', async () => {
		render(App, { open: true, referencePress: true });

		expect(screen.queryByTestId('floating')).toBeInTheDocument();

		await fireEvent.pointerDown(screen.getByTestId('reference'));

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
	});

	it('dismisses on ancestor scroll', async () => {
		render(App, { open: true, ancestorScroll: true });

		expect(screen.queryByTestId('floating')).toBeInTheDocument();

		await fireEvent.scroll(window);

		expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
	});
});
