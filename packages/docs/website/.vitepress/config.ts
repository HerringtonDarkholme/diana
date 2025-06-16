import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

const dianaGrammar = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './diana.tmLanguage.json'), 'utf-8')
)

export default defineConfig({
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
