import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	test: {
		include: ['test/**/*.{test,test.svelte}.{js,ts}'],
		environment: 'jsdom',
		alias: {
			'@testing-library/svelte': '@testing-library/svelte/svelte5'
		}
	}
});
