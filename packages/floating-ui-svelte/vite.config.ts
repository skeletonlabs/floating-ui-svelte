import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	server: {
		port: 1234,
	},
	root: "./test/visual",
	plugins: [svelte(), tailwindcss(), svelteTesting()],
	test: {
		root: "./test/unit",
		include: ["./**/*.test.ts"],
		setupFiles: ["./setup.ts"],
		environment: "jsdom",
	},
});
