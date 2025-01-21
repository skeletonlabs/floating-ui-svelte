// @ts-check
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		files: {
			routes: "./test/visual/routes",
			appTemplate: "./test/visual/app.html",
			params: "./test/visual/params",
		},
	},
};

export default config;
