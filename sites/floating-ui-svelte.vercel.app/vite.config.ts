import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import pagefind from "vite-plugin-pagefind";

export default defineConfig({
	plugins: [sveltekit(), pagefind()],
	optimizeDeps: {
		exclude: ["@skeletonlabs/floating-ui-svelte"],
	},
});
