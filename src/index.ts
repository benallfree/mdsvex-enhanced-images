import type { Root } from 'hast'
import { sep } from 'path'
import type { Plugin } from 'unified'
import { type Test, visit } from 'unist-util-visit'

export type Config = {
  resolve: (path: string) => string
}

function escapeHtmlAttribute(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export const defaultResolverFactory =
  (relativeHandler = (path: string) => `.${sep}${path}`) =>
  (path: string) => {
    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('$') ||
      path.startsWith('@') ||
      path.startsWith(`.${sep}`) ||
      path.startsWith(`..${sep}`)
    ) {
      return path
    } else {
      return relativeHandler(path)
    }
  }

export const enhancedImages: Plugin<[Partial<Config>?], any> = (config) => {
  const resolvedConfig = {
    resolve: defaultResolverFactory(),
    ...config
  }

  return (tree: Root) => {
    // console.error(`***tree in`, JSON.stringify(tree, null, 2))
    visit<any, Test>(tree, 'image', (node, index, parent) => {
      // Ignore images outside of project
      if (node.url.startsWith('http://') || node.url.startsWith('https://')) {
        return;
      }

      const url = resolvedConfig.resolve(node.url)
      node.type = 'html'
      let imgHtml = `<enhanced:img src="${url}"`
      
      if (node.alt !== null) {
        imgHtml += ` alt="${escapeHtmlAttribute(node.alt)}"`
      }
      
      if (node.title !== null && node.title !== undefined && node.title !== '') {
        imgHtml += ` title="${escapeHtmlAttribute(node.title)}"`
      }
      
      imgHtml += ` />`
      
      node.value = imgHtml
    })

    // console.error(`***tree out`, JSON.stringify(tree, null, 2))
  }
}
