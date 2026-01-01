import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler', // or "modern"
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