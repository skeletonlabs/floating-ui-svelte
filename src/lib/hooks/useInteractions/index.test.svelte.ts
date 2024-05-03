import { describe, expect, vi, it } from 'vitest';
import { type ElementProps, useInteractions } from '../../index.js';

describe('useInteractions', () => {
	it('returns props to the corresponding getter', () => {
		const interaction: ElementProps = {
			reference: {
				id: 'reference'
			},
			floating: {
				id: 'floating'
			},
			item: {
				id: 'item'
			}
		};

		const interactions = useInteractions([interaction]);

		expect(interactions.getReferenceProps()).toHaveProperty('id');
		expect(interactions.getReferenceProps().id).toBe('reference');

		expect(interactions.getFloatingProps()).toHaveProperty('id');
		expect(interactions.getFloatingProps().id).toBe('floating');

		expect(interactions.getItemProps()).toHaveProperty('id');
		expect(interactions.getItemProps().id).toBe('item');
	});
	it('overrides duplicate non-eventlistener props with the latest interaction', () => {
		const interactionOne: ElementProps = {
			reference: {
				id: 'one'
			}
		};

		const interactionTwo: ElementProps = {
			reference: {
				id: 'two'
			}
		};

		const interactions = useInteractions([interactionOne, interactionTwo]);

		expect(interactions.getReferenceProps()).toHaveProperty('id');
		expect(interactions.getReferenceProps().id).toBe('two');
	});
	it('does not override duplicate eventlistener props but instead runes them sequentially', () => {
		const one = vi.fn();
		const two = vi.fn();

		const interactionOne: ElementProps = {
			reference: {
				onclick: one
			}
		};

		const interactionTwo: ElementProps = {
			reference: {
				onclick: two
			}
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
