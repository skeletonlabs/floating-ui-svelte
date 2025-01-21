import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
	server: {
		port: 1234,
		fs: {
			strict: false,
		},
	},
	root: "./test/visual",
	plugins: [sveltekit(), tailwindcss(), svelteTesting()],
	test: {
		root: "./test/unit",
		include: ["./**/*.test.ts"],
		setupFiles: ["./test/unit/setup.ts"],
		environment: "jsdom",
	},
});
