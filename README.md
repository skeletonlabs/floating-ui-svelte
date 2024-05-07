# Floating UI Svelte

A Floating UI wrapper for Svelte.

## Installation

```bash
npm install @skeletonlabs/floating-ui-svelte
# pnpm install @skeletonlabs/floating-ui-svelte
# yarn install @skeletonlabs/floating-ui-svelte
# bun install @skeletonlabs/floating-ui-svelte
```

## Usage

### Making elements "float"

We want it to float on top of the UI though, so it doesn’t disrupt the flow of the document. Add this class to all floating elements. Note that Floating UI does not have opinions about how your elements stack on the z-axis.

```css
.floating {
	width: max-content;
	position: absolute;
	top: 0;
	left: 0;
}

```

### The Basics

Import the desired hook or component from floating-ui-svelte. [View each example](https://floating-ui-svelte.vercel.app/) for additional guidance.

```js
import { useFloating, type UseFloatingOptions } from '@skeletonlabs/floating-ui-svelte';

const options: UseFloatingOptions = { /* ... */ };
const floating = useFloating(options);
```

## API

### useFloating

The `useFloating` Svelte hook acts as a controller for all other Floating UI Svelte features. It handles positioning your floating elements (tooltips, popovers, etc.) relative to an anchored element. Automatically calculates the best placement and updates it as needed, providing access to properties for position and style.

#### Usage

```html
<script lang="ts">
	import { useFloating } from '@skeletonlabs/floating-ui-svelte';

	const floating = useFloating({ elements });
</script>

<button bind:this="{floating.elements.reference}">Reference</button>
<div bind:this="{floating.elements.floating}" style="{floating.floatingStyles}" class="floating">Floating</div>
```

> [!WARNING]
> Destructured variables are not supported as this would break reactivity.

#### Options

| Property | Description | Type | Default Value |
| -------- | ----------- | ---- | ------------- |
| open | Represents the open/close state of the floating element. | boolean | true |
| onOpenChange | Event handler that can be invoked whenever the open state changes. | (open: boolean, event?: Event, reason?: OpenChangeReason) => void | - |
| placement | Where to place the floating element relative to its reference element. | Placement | 'bottom' |
| strategy | The type of CSS position property to use. | Strategy | 'absolute' |
| middleware | Supports all [Floating UI middleware](https://floating-ui.com/docs/middleware). | Array<Middleware \| undefined \| null \| false> | undefined     |
| transform | Whether to use `transform` instead of `top` and `left` styles to position the floating element (`floatingStyles`). | boolean | true          |
| elements | The reference and floating elements. | FloatingElements | - |
| whileElementsMounted | Callback to handle mounting/unmounting of the elements. | (reference: ReferenceElement, floating: FloatingElement, update: () => void) => () => void | - |

#### Return Value

| Property | Description | Type |
| -------- | ----------- | ---- |
| x | The x-coord of the floating element. | number |
| y | The y-coord of the floating element. | number |
| placement | The stateful placement, which can be different from the initial `placement` passed as options. | Placement |
| strategy | The stateful strategy, which can be different from the initial `strategy` passed as options. | Strategy |
| middlewareData | Additional data from middleware. | MiddlewareData  |
| isPositioned   | The boolean that let you know if the floating element has been positioned. | boolean |
| floatingStyles | CSS styles to apply to the floating element to position it. | string |
| elements | The reference and floating elements. | FloatingElements |
| update | The function to update floating position manually. | () => void |
| context | Context object containing internal logic to alter the behavior of the floating element. | FloatingContext |

### useInteractions

The `useInteractions` Svelte hook allows you to consume multiple interactions. It ensures that event listeners from different hooks are properly registered instead of being overruled by one another.

#### Usage

```html
<script>
	import { useFloating, useInteractions, useHover, useFocus } from '@skeletonlabs/floating-ui-svelte';

	const floating = useFloating();

	const hover = useHover(floating.context);
	const focus = useFocus(floating.context);

	const interactions = useInteractions([hover, focus]);
</script>

<div {...interactions.getReferenceProps()}>Reference</div>
<div {...interactions.getFloatingProps()}>Floating</div>
```

If you want to apply an event handler the an element that is using a props getter make sure to pass them through the getter instead of applying them directly:
```diff
- <div {...interactions.getReferenceProps()} onclick={/* ... */}>Reference</div>
+ <div {...interactions.getReferenceProps({ onclick: /* ... */})}>Reference</div>
```
This will ensure all event handlers will be registered rather being overruled by eachother.

#### Return Value

| Property | Description | Type |
| -------- | ----------- | ---- |
| getReferenceProps | The merged attributes for the `reference` element. | (userProps?: HTMLAttributes<Element>) => Record<string, unknown> |
| getFloatingProps | The merged attributes for the `floating` element. | (userProps?: HTMLAttributes<Element>) => Record<string, unknown> |
| getItemProps | The merged attributes for when dealing with a list inside the `floating` element. | (userProps?: HTMLAttributes<Element> & ExtendedUserProps) => Record<string, unknown> |

### useHover

#### Usage

```html
<script>
	import { useFloating, useInteractions, useHover } from '@skeletonlabs/floating-ui-svelte';

	const floating = useFloating();
	const hover = useHover(floating.context);
	const interactions = useInteractions([hover]);
</script>

<button {...interactions.getReferenceProps()}>Reference</button>
<div {...interactions.getFloatingProps()}>Tooltip</div>
```

#### Options

| Property | Description | Type | Default Value |
| -------- | ----------- | ---- | ------------- |
| enabled | Enables the hook. | boolean | true |
| mouseOnly | Only allow pointers of type mouse to trigger the hover (thus excluding pens and touchscreens). | boolean | false |
| delay | Time in ms that will delay the change of the open state. Also accepts an object with open and close properties for finer grained control. | number | 0 |
| restMs | Time in ms that the pointer must rest on the reference element before the open state is set to true. | number | 0 |
| move | Whether moving the pointer over the floating element will open it, without a regular hover event required. | boolean | true |
| handleClose | Callback to handle the closing of the floating element. | HandleCloseFn | null |

### useFocus

(tbd)

### useClick

(tbd)

### useRole

#### Usage

```html
<script>
	import { useFloating, useInteractions, useRole } from '@skeletonlabs/floating-ui-svelte';

	const floating = useFloating();
	const role = useRole(floating.context, { role: 'tooltip' });
	const interactions = useInteractions([role]);
</script>

<button {...interactions.getReferenceProps()}>Reference</button>
<div {...interactions.getFloatingProps()}>Tooltip</div>
```

#### Options

| Property | Description | Type | Default Value |
| -------- | ----------- | ---- | ------------- |
| enabled | Enables the interaction | boolean | true |
| role | The role that the floating element should be | [AriaRole](https://floating-ui.com/docs/useRole#native-roles) \| [ComponentRole](https://floating-ui.com/docs/useRole#component-roles) | 'dialog' |

### useDismiss

(tbd)

### useTransition

(tbd)

### FloatingArrow

Renders a customizable `<svg>` pointing arrow triangle inside the floating element that gets automatically positioned.

```html
<script lang="ts">
	import { arrow, useFloating, FloatingArrow, autoUpdate, offset } from '$lib/index.js';

	let arrowRef: HTMLElement | null = $state(null);

	const elements: { reference: HTMLElement | null; floating: HTMLElement | null } = $state({
		reference: null,
		floating: null
	});

	const floating = useFloating({
		elements,
		get middleware() {
			return [
				offset(10),
				arrowRef && arrow({ element: arrowRef })
			];
		}
	});
</script>

<button bind:this={elements.reference}>Reference</button>
<div bind:this={elements.floating} style={floating.floatingStyles} class="floating">
	<div>Floating</div>
	<FloatingArrow
		bind:ref={arrowRef}
		context={floating.context}
		classes="fill-surface-500"
	/>
</div>
```

#### Props

| Prop | Description | Default | Type |
| -------- | ----------- | ---- | ---- |
| ref* | Binded element reference. | - | HTMLElement, null |
| context* | The context object returned from useFloating(). | - | FloatingContext |
| width | The width of the arrow. | `14` | number |
| height | The height of the arrow. | `7` | number |
| tipRadius | The radius (rounding) of the arrow tip. | `0` (sharp) | number |
| staticOffset | A static offset override of the arrow from the floating element edge. Often desirable if the floating element is smaller than the reference element along the relevant axis and has an edge alignment (`start`/`end`). | `undefined` (use dynamic path) | string, number, null |
| d | A custom path for the arrow. Useful if you want fancy rounding. The path should be inside a square SVG and placed at the `bottom` of it. The path is designed for the 'bottom' placement, which will be rotated for other placements. | `"black"` (browser default) | string |
| fill | The color of the arrow. | xxx | string |
| stroke | The stroke (border) color of the arrow. This must match (or be less than) the floating element’s border width. | `"none"` | string |
| strokeWidth | The stroke (border) width of the arrow. | `0` | number |

#### Utility Classes and Styles

Provide artibrary utility classes using the standard attribute.

```html
<FloatingArrow class="fill-white" />
```

### FloatingOverlay

(tbd)

### FloatingFocusManager

(tbd)

## Attribution

Based on [Floating UI](https://github.com/floating-ui/floating-ui) and [Floating UI React](https://floating-ui.com/docs/react). Maintained by [Hugo Korte](https://github.com/Hugos68), [Skeleton Labs](https://www.skeletonlabs.co/), and the [Svelte community](https://svelte.dev/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
