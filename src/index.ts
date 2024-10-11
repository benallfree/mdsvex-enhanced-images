import { keys, map } from '@s-libs/micro-dash'
import type { Element, Node, Root } from 'hast'
import type {} from 'mdast'
import { sep } from 'path'
import type { Plugin } from 'unified'
import { Test, visit } from 'unist-util-visit'

const RE_SCRIPT_START =
  /<script(?:\s+?[a-zA-z]+(=(?:["']){0,1}[a-zA-Z0-9]+(?:["']){0,1}){0,1})*\s*?>/i

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

function isImage(node: any): node is Element {
  return node.tagName === 'img'
}

function isScript(node: any): node is Element {
  return node.tagName === 'script'
}

export const enhancedImages: Plugin<[Partial<Config>?], any> = (config) => {
  const resolvedConfig = {
    resolve: defaultResolverFactory(),
    ...config
  }

  return (tree: Root) => {
    let c = 0
    const images: { [_: string]: { path: string; id: string } } = {}

    console.log(`***tree in`, JSON.stringify(tree, null, 2))
    visit<Node, Test>(tree, 'element', (node, index, parent) => {
      // console.log(`***node in`, { node, index, parent })
      if (isImage(node)) {
        const url = node.properties?.src as string
        if (url) {
          let id = `i${c++}`

          const path = resolvedConfig.resolve(url)

          images[url] = {
            path,
            id
          }

          node.tagName = 'enhanced:img'
          node.properties = {
            ...node.properties,
            src: `{${id}}`
          }
        }
        // console.log(`***node out`, { node })
      }
    })

    if (keys(images).length > 0) {
      const imports = map(
        images,
        (v) => `import ${v.id} from "${v.path}?enhanced";`
      ).join(`\n`)

      let foundScript = false
      visit<Node, Test>(tree, 'element', (node) => {
        if (isScript(node)) {
          foundScript = true

          // Prepend imports to the script content
          node.children.unshift({
            type: 'text',
            value: imports
          })
          return false
        }
      })

      console.log(`***foundScript`, { foundScript })
      if (!foundScript) {
        let yamlTagIndex = tree.children.findIndex(
          (child: any) => child.type === 'yaml'
        )
        console.log(`***yamlTagIndex`, { yamlTagIndex })
        if (yamlTagIndex === -1) {
          yamlTagIndex = 0
        }
        tree.children.splice(yamlTagIndex, 0, {
          type: 'element',
          tagName: 'script',
          properties: {},
          children: [
            {
              type: 'text',
              value: imports
            }
          ]
        })
      }
    }

    console.log(`***tree out`, JSON.stringify(tree, null, 2))
  }
}
