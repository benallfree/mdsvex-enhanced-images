import camelCase from 'just-camel-case'
import type { Root } from 'mdast'
import { sep } from 'path'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

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

export const enhancedImages: Plugin<[Partial<Config>?], Root> = (config) => {
  const resolvedConfig = {
    resolve: defaultResolverFactory(),
    ...config
  }

  return (tree) => {
    const images = new Map<string, { path: string; id: string }>()
    const image_count = new Map<string, number>()

    visit(tree, 'image', (node, index, parent) => {
      if (parent && typeof index === 'number') {
        let camel = `i${camelCase(node.url)}`
        const count = image_count.get(camel)
        const dupe = images.get(node.url)

        if (count && !dupe) {
          image_count.set(camel, count + 1)
          camel = `${camel}_${count}`
        } else if (!dupe) {
          image_count.set(camel, 1)
        }

        images.set(node.url, {
          path: resolvedConfig.resolve(node.url),
          id: camel
        })

        parent.children[index] = {
          type: 'html',
          value: `<enhanced:img src={${camel}} alt="image"/>`
        }
      }
    })

    let scripts = ''
    images.forEach(
      (x) => (scripts += `import ${x.id} from "${x.path}?enhanced";\n`)
    )

    let is_script = false

    visit(tree, 'html', (node) => {
      if (RE_SCRIPT_START.test(node.value)) {
        is_script = true
        node.value = node.value.replace(
          RE_SCRIPT_START,
          (script) => `${script}\n${scripts}`
        )
      }
    })

    if (!is_script) {
      tree.children.push({
        type: 'html',
        value: `<script>\n${scripts}</script>`
      })
    }
  }
}
