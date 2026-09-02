import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import payload from 'payload'
import type { SanitizedConfig } from 'payload'
import { caricaEnv } from './env.mts'

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
caricaEnv(radice)

process.env.PAYLOAD_MIGRATING = 'true'

const configPath = pathToFileURL(path.join(radice, 'payload.config.ts')).toString()
const configModule = await import(configPath)
const config: SanitizedConfig = await configModule.default

await payload.init({
  config,
  disableOnInit: true,
})

await payload.db.migrate()

await payload.destroy()
process.exit(0)
