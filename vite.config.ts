import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
// import path from 'path'

export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {
				// svelte.config.js must define $styles alias as
				// './src/styles/mixins' does not work in this version
				additionalData: `
					@use '$styles/variables' as *;
					@use '$styles/mixins' as *;
				`
			}
		}
	},
	plugins: [sveltekit(),],
	// resolve: {
	// 	alias: {
	// 		$lib: path.resolve('./src/lib')
	// 	}
	// }
})