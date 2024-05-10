import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter(),
		alias: {
			$docs: './src/docs',
			'@skeletonlabs/floating-ui-svelte': './src/lib/index.js',
		},
		version: {
			name: JSON.parse(readFileSync('./package.json')).version ?? '0.0.0',
		},
	},
};

export default config;
