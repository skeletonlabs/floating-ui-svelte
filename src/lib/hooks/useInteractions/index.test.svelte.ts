import { describe, expect, vi, it } from 'vitest';
import { withEffect } from '$lib/utils/test.svelte.js';
import { useInteractions, type ElementProps } from '../../index.js';

describe('useInteractions', () => {
	it('returns props to the corresponding getter', () => {
		const interaction: ElementProps = {
			reference: {
				id: 'reference',
			},
			floating: {
				id: 'floating',
			},
			item: {
				id: 'item',
			},
		};

		const interactions = useInteractions([interaction]);

		expect(interactions.getReferenceProps()).toHaveProperty('id');
		expect(interactions.getReferenceProps().id).toBe('reference');

		expect(interactions.getFloatingProps()).toHaveProperty('id');
		expect(interactions.getFloatingProps().id).toBe('floating');

		expect(interactions.getItemProps()).toHaveProperty('id');
		expect(interactions.getItemProps().id).toBe('item');
	});
	it(
		'updates props reactively',
		withEffect(() => {
			const reference = $state({
				'data-count': 0,
			});

			const interaction: ElementProps = {
				reference,
			};

			const interactions = useInteractions([interaction]);

			const count = $derived(interactions.getReferenceProps()['data-count']);

			expect(count).toBe(0);

			reference['data-count'] = 1;

			expect(count).toBe(1);
		}),
	);
	it('overrides duplicate non-eventlistener props with the prop from the last interaction passed in that has said duplicate prop', () => {
		const interactionOne: ElementProps = {
			reference: {
				id: 'one',
			},
		};

		const interactionTwo: ElementProps = {
			reference: {
				id: 'two',
			},
		};

		const interactions = useInteractions([interactionOne, interactionTwo]);

		expect(interactions.getReferenceProps()).toHaveProperty('id');
		expect(interactions.getReferenceProps().id).toBe('two');
	});
	it('does not override duplicate eventlistener props but instead runs them sequentially', () => {
		const one = vi.fn();
		const two = vi.fn();

		const interactionOne: ElementProps = {
			reference: {
				onclick: one,
			},
		};

		const interactionTwo: ElementProps = {
			reference: {
				onclick: two,
			},
		};

		const interactions = useInteractions([interactionOne, interactionTwo]);

		expect(interactions.getReferenceProps()).toHaveProperty('onclick');
		expect(interactions.getReferenceProps().onclick).toBeInstanceOf(Function);

		// @ts-expect-error - onclick is a function
		interactions.getReferenceProps().onclick();

		expect(one).toHaveBeenCalledOnce();
		expect(two).toHaveBeenCalledOnce();
	});
});
