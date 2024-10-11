import type { Root } from 'hast'
import { sep } from 'path'
import type { Plugin } from 'unified'
import { Test, visit } from 'unist-util-visit'

export type Config = {
  resolve: (path: string) => string
}

export const defaultResolverFactory =
  (relativeHandler = (path: string) => `.${sep}${path}`) =>
  (path: string) => {
    if (
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
      const url = resolvedConfig.resolve(node.url)
      node.type = 'html'
      node.value = `<enhanced:img src="${url}" />`
    })

    // console.error(`***tree out`, JSON.stringify(tree, null, 2))
  }
}
