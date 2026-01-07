import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler', // or "modern"
				// svelte.config.js must define $styles alias as
				// './src/styles/mixins' does not work in this version
				additionalData: "@use '$styles/mixins' as *;"
			}
		}
	},
	plugins: [sveltekit(),],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	}
})