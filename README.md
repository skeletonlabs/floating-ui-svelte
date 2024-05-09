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

## Attribution

Based on [Floating UI](https://github.com/floating-ui/floating-ui) and [Floating UI React](https://floating-ui.com/docs/react). Maintained by [Hugo Korte](https://github.com/Hugos68), [Skeleton Labs](https://www.skeletonlabs.co/), and the [Svelte community](https://svelte.dev/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
