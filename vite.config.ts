import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import pagefind from 'vite-plugin-pagefind';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting(), pagefind()],
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
