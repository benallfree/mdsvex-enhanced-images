# Enhanced Images Plugin for MDsveX

This plugin converts Markdown images to `<enhanced:img>` components.

## Features

- Automatically imports images used in Markdown
- Converts Markdown image syntax to `<enhanced:img>`
- Handles path resolution for various import scenarios

## Usage

```bash
npm install mdsvex mdsvex-enhanced-images @sveltejs/enhanced-img
```

```js
// svelte.config.js
import { enhancedImages } from 'mdsvex-enhanced-images'

export default {
  preprocess: [
    mdsvex({
      remarkPlugins: [enhancedImages]
    })
  ]
}
```

```js
// vite.config.js
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [enhancedImages(), sveltekit()]
})
```

Now use normal Markdown-style images just as you normally would. By default, paths beginning with `$`, `@`, `./`, or `../` are left unchanged while all other paths are converted to relative paths by prepending `./`.

```md
![Example](example.png) // Resolves to ./example.png
![Example](../example.png) // Resolves to ../example.png
![Example]($images/example.png) // Resolves to $images/example.png
![Example](@images/example.png) // Resolves to @images/example.png
```

## Advanced Usage: Custom Path Resolution

If the default path resolution strategy doesn't work for your needs, you can optionally provide a custom `resolve` function:

```js
mdsvex({
  remarkPlugins: [
    [
      enhancedImages,
      {
        resolve: (path) => path
      }
    ]
  ]
})
```

### Example: Make non-relative paths resolve to `src/assets/images`

If you just want to change the resolution of non-relative paths (most common case), you can use `defaultResolverFactory` to create a custom resolver. The factory's stock resolver will handle paths starting with `$`, `@`, or `./` or `../` unchanged, and call your custom relative resolver for all other paths.

```js
// svelte.config.js
import { defaultResolverFactory } from 'mdsvex-enhanced-images'
import { join } from 'path'

const config = {
  preprocess: [
    mdsvex({
      remarkPlugins: [
        [
          enhancedImages,
          {
            resolve: defaultResolverFactory((path) =>
              join('src', 'assets', 'images', path)
            )
          }
        ]
      ]
    })
  ]
}
```

Now, images with non-relative paths in Markdown will resolve to `src/assets/images`:

```md
![Example](example.png) // Resolves to src/assets/images/example.png (new)
![Example](../example.png) // Resolves to ../example.png (unchanged)
![Example]($images/example.png) // Resolves to $images/example.png (unchanged)
![Example](@images/example.png) // Resolves to @images/example.png (unchanged)
```

## License

MIT
