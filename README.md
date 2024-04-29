# Floating UI Svelte

A Floating UI wrapper for Svelte.

## Attribution

This project is maintained by [Hugo Korte](https://github.com/Hugos68), [Skeleton Labs](https://www.skeletonlabs.co/), and the [Svelte](https://svelte.dev/) community. Based on the amazing work by [Floating UI](https://github.com/floating-ui/floating-ui).

## Installation

Install the package using your preferred package manager.

```bash
npm install @skeletonlabs/floating-ui-svelte
# pnpm install @skeletonlabs/floating-ui-svelte
# yarn install @skeletonlabs/floating-ui-svelte
# bun install @skeletonlabs/floating-ui-svelte
```

## Usage

Import the desired hook or component from floating-ui-svelte, for example:

```js
import { useFloating, type UseFloatingOptions } from '@skeletonlabs/floating-ui-svelte';

const options: UseFloatingOptions = { ... };

const floating = useFloating(options);
```

## API

### `useFloating`

The `useFloating` hook takes care of positioning your floating UI elements (tooltips, popovers, etc.) relative to another element.
It automatically calculates the best placement and updates it as needed, giving you properties to access the position and styles.

#### Usage

```html
<script>
	import { useFloating } from '@skeletonlabs/floating-ui-svelte';

	const elements = $state({ reference: null, floating: null });

	const floating = useFloating({ elements });
</script>

<div bind:this="{elements.reference}">Reference</div>
<div bind:this="{elements.floating}" styles="{floating.floatingStyles}">Floating</div>
```

Note: You cannot destructure (`const { ... } = useFloating(...)`) because this will cause the destructured variables to _not_ be reactive.

#### Options

| Property             | Description                                                                                                                      | Type                                                                                       | Default Value |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------- |
| open                 | Represents the open/close state of the floating element.                                                                         | boolean                                                                                    | true          |
| onOpenChange         | Event handler that can be invoked whenever the open state changes.                                                               | (open: boolean, event?: Event, reason?: OpenChangeReason) => void                          | -             |
| placement            | Where to place the floating element relative to its reference element.                                                           | Placement                                                                                  | 'bottom'      |
| strategy             | The type of CSS position property to use.                                                                                        | Strategy                                                                                   | 'absolute'    |
| middleware           | These are plain objects that modify the positioning coordinates in some fashion, or provide useful data for the consumer to use. | Array<Middleware \| undefined \| null \| false>                                            | undefined     |
| transform            | Whether to use `transform` instead of `top` and `left` styles to position the floating element (`floatingStyles`).               | boolean                                                                                    | true          |
| elements             | The reference and floating elements.                                                                                             | FloatingElements                                                                           | -             |
| whileElementsMounted | Callback to handle mounting/unmounting of the elements.                                                                          | (reference: ReferenceElement, floating: FloatingElement, update: () => void) => () => void | -             |

#### Return

| Property       | Description                                                                                    | Type            |
| -------------- | ---------------------------------------------------------------------------------------------- | --------------- |
| x              | The x-coord of the floating element.                                                           | number          |
| y              | The y-coord of the floating element.                                                           | number          |
| placement      | The stateful placement, which can be different from the initial `placement` passed as options. | Placement       |
| strategy       | The stateful strategy, which can be different from the initial `strategy` passed as options.   | Strategy        |
| middlewareData | Additional data from middleware.                                                               | MiddlewareData  |
| isPositioned   | The boolean that let you know if the floating element has been positioned.                     | boolean         |
| floatingStyles | CSS styles to apply to the floating element to position it.                                    | string          |
| update         | The function to update floating position manually.                                             | () => void      |
| context        | Context object containing internal logic to alter the behavior of the floating element.        | FloatingContext |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
