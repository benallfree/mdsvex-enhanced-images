import { describe, expect, test } from 'bun:test'
import { compile } from 'mdsvex'
import { enhancedImages } from './index'

const _compile = (markdown: string) =>
  compile(markdown, {
    rehypePlugins: [enhancedImages]
  })

describe('enhancedImages plugin', () => {
  test('transforms image nodes to enhanced:img', async () => {
    const markdown = '![Alt text](image.jpg)'
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain('<enhanced:img')
    expect(compiled?.code).toContain(`from "./image.jpg?enhanced"`)
  })

  test(`path aliases are preserved`, async () => {
    const markdown = '![Alt text]($images/image.jpg)'
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain(`from "$images/image.jpg?enhanced"`)
  })

  test(`relative paths are preserved`, async () => {
    const markdown = '![Alt text](../image.jpg)'
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain(`from "../image.jpg?enhanced"`)
  })

  test(`handles frontmatter`, async () => {
    const markdown = `---
title: How.This.Blog.Developed
description: How.This.Blog.Developed
date: '2024-7-22'
categories:
  - sveltekit
  - optimization
published: true
---

## Contents

## General

![Alt text](image.jpg)
- 
- Built using SvelteKit`
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain(
      'export const metadata = {"title":"How.This.Blog.Developed","description":"How.This.Blog.Developed","date":"2024-7-22","categories":["sveltekit","optimization"],"published":true}'
    )
    expect(compiled?.code).toContain('<enhanced:img')
  })
})
