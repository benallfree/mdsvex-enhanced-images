# mdsvex-enhanced-images

[@sveltejs/enhanced-img](https://kit.svelte.dev/docs/images#sveltejs-enhanced-img) for [MDsveX](https://mdsvex.pngwn.io/).

With this package, normal Markdown-style images will be converted to `<enhanced:img>`.

## Usage

```js
import { enhancedImages } from 'mdsvex-enhanced-images`

mdsvex({
    remarkPlugins: [ enhancedImages ],
}),
```
