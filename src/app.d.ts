// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			highlighter: import('shiki').Highlighter;
			pagefind: import('vite-plugin-pagefind').Pagefind;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
