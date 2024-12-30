import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	build: {
		emptyOutDir: true,
		sourcemap: true,
		outDir: "./dist",
	},
	// @ts-expect-error: vitest `config.plugins` type mismatches with vite `config.plugins`, no clue why
	plugins: [svelte(), svelteTesting()],
	test: {
		include: ["./test/{hooks, components}/*.ts"],
		setupFiles: ["./test/internal/setup.ts"],
		environment: "jsdom",
		coverage: {
			reporter: ["text"],
		},
	},
});
