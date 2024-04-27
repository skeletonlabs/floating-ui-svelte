import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['test/**/*.{test,test.svelte}.{js,ts}'],
		environment: 'jsdom',
		coverage: {
			reporter: ['html', 'text'],
			include: ['src/lib/**/*.{js,ts}']
		}
	}
});
