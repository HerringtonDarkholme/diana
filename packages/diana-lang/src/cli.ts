import { readFileSync } from 'fs'
import { compile } from './compiler'
import { tokenize } from './tokenizer'
import { parse } from './parser'

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: diana-cli <input-file.diana> [output-file.json]')
    process.exit(1)
  }

  const inputFile = args[0]
  const outputFile = args[1]

  try {
    const dianaCode = readFileSync(inputFile, 'utf-8')
    const tokens = tokenize(dianaCode)
    const ast = parse(tokens)
    const jsonOutput = compile(ast)

    if (outputFile) {
      // For now, just print to console. Later, write to file if needed.
      console.log(JSON.stringify(jsonOutput, null, 2))
    } else {
      console.log(JSON.stringify(jsonOutput, null, 2))
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

main()
