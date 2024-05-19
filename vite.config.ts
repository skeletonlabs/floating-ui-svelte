import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { pagefind, type Config } from 'vite-plugin-pagefind';

const pagefindConfig: Config = {
	buildDir: 'build',
	buildScript: 'build:docs',
	assetsDir: 'static',
};

export default defineConfig({
	plugins: [sveltekit(), svelteTesting(), pagefind(pagefindConfig)],
	experimental: {
		// Remove when https://github.com/sveltejs/vite-plugin-svelte/issues/909 is fixed
		hmrPartialAccept: false,
	},
	test: {
		include: ['./src/lib/**/*.{test,test.svelte}.{js,ts}'],
		setupFiles: ['./src/vitest.setup.ts'],
		environment: 'jsdom',
		coverage: {
			reporter: ['html', 'text'],
			include: ['./src/lib/**/*.{js,ts}'],
		},
	},
});
