import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import payload from 'payload'
import type { SanitizedConfig } from 'payload'
import { generateTypes } from 'payload/node'
import { caricaEnv } from './env.mts'

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
caricaEnv(radice)

const configPath = pathToFileURL(path.join(radice, 'payload.config.ts')).toString()
const configModule = await import(configPath)
const config: SanitizedConfig = await configModule.default

await payload.init({
  config,
  disableDBConnect: true,
  disableOnInit: true,
})

await generateTypes(config, { log: true })
console.log(`Tipi scritti in ${config.typescript.outputFile}`)

await payload.destroy()
process.exit(0)
