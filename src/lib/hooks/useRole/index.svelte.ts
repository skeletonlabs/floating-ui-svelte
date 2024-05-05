import { Map as ReactiveMap } from 'svelte/reactivity';
import type { FloatingContext } from '../useFloating/index.svelte.js';
import type { ElementProps } from '../useInteractions/index.svelte.js';

type AriaRole = 'tooltip' | 'dialog' | 'alertdialog' | 'menu' | 'listbox' | 'grid' | 'tree';
type ComponentRole = 'select' | 'label' | 'combobox';

interface UseRoleOptions {
	/**
	 * Whether the Hook is enabled, including all internal Effects and event
	 * handlers.
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * The role of the floating element.
	 * @default 'dialog'
	 */
	role?: AriaRole | ComponentRole;
}

const componentRoleToAriaRoleMap = new ReactiveMap<AriaRole | ComponentRole, AriaRole | false>([
	['select', 'listbox'],
	['combobox', 'listbox'],
	['label', false]
]);

function useRole(context: FloatingContext, options: UseRoleOptions = {}): ElementProps {
	const enabled = $derived(options.enabled ?? true);
	const role = $derived(options.role ?? 'dialog');

	const ariaRole = $derived(
		(componentRoleToAriaRoleMap.get(role) ?? role) as AriaRole | false | undefined
	);

	// FIXME: Uncomment the commented code once useId and useFloatingParentNodeId are implemented.
	const referenceId = '123abc';
	const parentId = undefined;
	// const referenceId = useId();
	// const parentId = useFloatingParentNodeId();

	const isNested = parentId != null;

	const elementProps: ElementProps = $derived.by(() => {
		if (!enabled) {
			return {};
		}

		const floatingProps = {
			id: context.floatingId,
			...(ariaRole && { role: ariaRole })
		};

		if (ariaRole === 'tooltip' || role === 'label') {
			return {
				reference: {
					[`aria-${role === 'label' ? 'labelledby' : 'describedby'}`]: context.open
						? context.floatingId
						: undefined
				},
				floating: floatingProps
			};
		}

		return {
			reference: {
				'aria-expanded': context.open ? 'true' : 'false',
				'aria-haspopup': ariaRole === 'alertdialog' ? 'dialog' : ariaRole,
				'aria-controls': context.open ? context.floatingId : undefined,
				...(ariaRole === 'listbox' && { role: 'combobox' }),
				...(ariaRole === 'menu' && { id: referenceId }),
				...(ariaRole === 'menu' && isNested && { role: 'menuitem' }),
				...(role === 'select' && { 'aria-autocomplete': 'none' }),
				...(role === 'combobox' && { 'aria-autocomplete': 'list' })
			},
			floating: {
				...floatingProps,
				...(ariaRole === 'menu' && { 'aria-labelledby': referenceId })
			},
			item({ active, selected }) {
				const commonProps = {
					role: 'option',
					...(active && { id: `${context.floatingId}-option` })
				};

				// For `menu`, we are unable to tell if the item is a `menuitemradio`
				// or `menuitemcheckbox`. For backwards-compatibility reasons, also
				// avoid defaulting to `menuitem` as it may overwrite custom role props.
				switch (role) {
					case 'select':
						return {
							...commonProps,
							'aria-selected': active && selected
						};
					case 'combobox': {
						return {
							...commonProps,
							...(active && { 'aria-selected': true })
						};
					}
				}

				return {};
			}
		};
	});

	return elementProps;
}

export { useRole, type UseRoleOptions };
