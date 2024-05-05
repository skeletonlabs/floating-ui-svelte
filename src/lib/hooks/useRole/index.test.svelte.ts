import { it_in_effect } from '$lib/test-utils.svelte.js';
import { describe, expect } from 'vitest';
import { useFloating } from '../useFloating/index.svelte.js';
import { useRole } from './index.svelte.js';

describe('useRole', () => {
	describe('tooltip', () => {
		it_in_effect('sets the correct role', async () => {
			const referenceEl = document.createElement('div');
			const floatingEl = document.createElement('div');

			const floating = useFloating({
				elements: {
					reference: referenceEl,
					floating: floatingEl
				}
			});

			const role = useRole(floating.context, { role: 'tooltip' });

			expect(role.floating?.role).toBe('tooltip');
		});
	});
});
