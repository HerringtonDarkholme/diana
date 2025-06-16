import { defineConfig } from 'vitepress'
import { createHighlighter } from 'shiki'
import fs from 'fs'
import path from 'path'

export default async () => {
  const dianaGrammar = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './diana.tmLanguage.json'), 'utf-8')
  )
  return defineConfig({
    title: 'Diana',
    description: 'Diana - Configuration Language',
    markdown: {
      languages: [{
        alias: ['diana', 'dna'],
        ...dianaGrammar,
        name: 'diana',
      }]
    }
  })
}
