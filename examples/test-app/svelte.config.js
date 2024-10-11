import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'
import { enhancedImages } from 'mdsvex-enhanced-images'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: mdsvex({
    extensions: ['.md'],
    remarkPlugins: [enhancedImages]
  }),

  kit: {
    adapter: adapter(),
    alias: {
      $images: './src/assets'
    }
  }
}

export default config
