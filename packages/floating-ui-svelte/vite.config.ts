import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	test: {
		include: ["./test/**/*.test.ts"],
		setupFiles: ["./test/setup.ts"],
		environment: "jsdom",
	},
});
