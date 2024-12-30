import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		emptyOutDir: true,
		sourcemap: true,
		outDir: "./dist",
	},
	plugins: [svelte()],
});
