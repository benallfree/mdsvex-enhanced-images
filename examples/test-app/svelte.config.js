import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import { enhancedImages } from 'mdsvex-enhanced-images'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      remarkPlugins: [enhancedImages]
    })
  ],

  kit: {
    adapter: adapter(),
    alias: {
      $images: './src/assets'
    }
  }
}

export default config
