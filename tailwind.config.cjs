/** @type {import('tailwindcss').Config}*/
const config = {
	darkMode: 'selector',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				surface: {
					50: 'rgb(var(--color-surface-50) / <alpha-value>)',
					100: 'rgb(var(--color-surface-100) / <alpha-value>)',
					200: 'rgb(var(--color-surface-200) / <alpha-value>)',
					300: 'rgb(var(--color-surface-300) / <alpha-value>)',
					400: 'rgb(var(--color-surface-400) / <alpha-value>)',
					500: 'rgb(var(--color-surface-500) / <alpha-value>)',
					600: 'rgb(var(--color-surface-600) / <alpha-value>)',
					700: 'rgb(var(--color-surface-700) / <alpha-value>)',
					800: 'rgb(var(--color-surface-800) / <alpha-value>)',
					900: 'rgb(var(--color-surface-900) / <alpha-value>)',
					950: 'rgb(var(--color-surface-950) / <alpha-value>)',
				}
			}
		}
	},
	plugins: []
};

module.exports = config;
