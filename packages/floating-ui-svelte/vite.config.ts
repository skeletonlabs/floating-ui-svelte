import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from "vitest/config";

export default defineConfig({
	build: {
		emptyOutDir: true,
		sourcemap: true,
		outDir: "./dist",
	},
	plugins: [svelte(), svelteTesting()],
	test: {
		include: ['./test/**/*.ts'],
		exclude: ['./test/internal/**/*.ts'],
		setupFiles: ['./test/internal/setup.ts'],
		environment: 'jsdom',
		coverage: {
			reporter: ['text'],
		}
	}
});
