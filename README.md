# mdsvex-enhanced-images

@sveltejs/enhanced-images for MDsveX.

With this package, normal Markdown-style images will be converted to `<enhanced:img>`.

## Usage

```js
import { enhancedImages } from 'mdsvex-enhanced-images`

mdsvex({
    remarkPlugins: [ enhancedImages ],
}),
```
