import { describe, expect, test } from 'bun:test'
import { compile } from 'mdsvex'
import { enhancedImages } from './index'

const _compile = (markdown: string) =>
  compile(markdown, {
    remarkPlugins: [enhancedImages]
  })

describe('enhancedImages plugin', () => {
  test('transforms image nodes to enhanced:img', async () => {
    const markdown = '![Alt text](image.jpg)'
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain('<enhanced:img')
    expect(compiled?.code).toContain(`"./image.jpg"`)
    expect(compiled?.code).toContain(`alt="Alt text"`)
  })

  test(`path aliases are preserved`, async () => {
    const markdown = '![Alt text]($images/image.jpg)'
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain(`"$images/image.jpg"`)
    expect(compiled?.code).toContain(`alt="Alt text"`)
  })

  test(`relative paths are preserved`, async () => {
    const markdown = '![Alt text](../image.jpg)'
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain(`"../image.jpg"`)
    expect(compiled?.code).toContain(`alt="Alt text"`)
  })

  test('handles empty alt text', async () => {
    const markdown = '![](image.jpg)'
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain('<enhanced:img')
    expect(compiled?.code).toContain(`"./image.jpg"`)
    expect(compiled?.code.includes('alt')).toBe(false)
  })

  test('handles dangerous alt text', async () => {
    const markdown = '!["><script>alert("XSS")</script>](image.jpg)'
    const compiled = await _compile(markdown)

    expect(compiled?.code).toContain('<enhanced:img')
    expect(compiled?.code).toContain(`"./image.jpg"`)
    expect(compiled?.code).toContain(
      `alt="&quot;&gt;&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"`
    )
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
    expect(compiled?.code).toContain('./image.jpg')
    expect(compiled?.code).toContain(`alt="Alt text"`)
  })

  test('skips processing for HTTP/HTTPS image URLs', async () => {
    let markdown = '![External image](https://example.com/image.jpg)'
    let compiled = await _compile(markdown)
    
    expect(compiled?.code.includes('<enhanced:img')).toBe(false)
    
    expect(compiled?.code).toContain('<img')
    expect(compiled?.code).toContain('src="https://example.com/image.jpg"')
    expect(compiled?.code).toContain('alt="External image"')
    
    markdown = '![Another image](http://example.com/photo.png)'
    compiled = await _compile(markdown)
    
    expect(compiled?.code.includes('<enhanced:img')).toBe(false)
    
    expect(compiled?.code).toContain('<img')
    expect(compiled?.code).toContain('src="http://example.com/photo.png"')
    expect(compiled?.code).toContain('alt="Another image"')
  })
})
