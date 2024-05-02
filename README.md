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
<script>
	import { useFloating } from '@skeletonlabs/floating-ui-svelte';

	const elements = $state({ reference: null, floating: null });
	const floating = useFloating({ elements });
</script>

<div bind:this="{elements.reference}">Reference</div>
<div bind:this="{elements.floating}" style="{floating.floatingStyles}">Floating</div>
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

#### Return Values

| Property | Description | Type |
| -------- | ----------- | ---- |
| x | The x-coord of the floating element. | number |
| y | The y-coord of the floating element. | number |
| placement | The stateful placement, which can be different from the initial `placement` passed as options. | Placement |
| strategy | The stateful strategy, which can be different from the initial `strategy` passed as options. | Strategy |
| middlewareData | Additional data from middleware. | MiddlewareData  |
| isPositioned   | The boolean that let you know if the floating element has been positioned. | boolean |
| floatingStyles | CSS styles to apply to the floating element to position it. | string |
| update | The function to update floating position manually. | () => void |
| context | Context object containing internal logic to alter the behavior of the floating element. | FloatingContext |

### useInteractions

(tbd)

### useHover

(tbd)

### useFocus

(tbd)

### useClick

(tbd)

### useRole

(tbd)

### useDismiss

(tbd)

### useTransition

(tbd)

### FloatingArrow

(tbd)

### FloatingOverlay

(tbd)

### FloatingFocusManager

(tbd)

## Attribution

Based on [Floating UI](https://github.com/floating-ui/floating-ui) and [Floating UI React](https://floating-ui.com/docs/react). Maintained by [Hugo Korte](https://github.com/Hugos68), [Skeleton Labs](https://www.skeletonlabs.co/), and the [Svelte community](https://svelte.dev/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
