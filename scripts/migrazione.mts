import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import payload from 'payload'
import type { SanitizedConfig } from 'payload'
import { caricaEnv } from './env.mts'

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
caricaEnv(radice)

const nomeMigrazione = process.argv[2]
if (!nomeMigrazione) {
  console.error('Uso: npm run migrazione:crea -- <nome-migrazione>')
  process.exit(1)
}

process.env.PAYLOAD_MIGRATING = 'true'

const configPath = pathToFileURL(path.join(radice, 'payload.config.ts')).toString()
const configModule = await import(configPath)
const config: SanitizedConfig = await configModule.default

await payload.init({
  config,
  disableDBConnect: true,
  disableOnInit: true,
})

await payload.db.createMigration({
  payload,
  migrationName: nomeMigrazione,
  forceAcceptWarning: true,
  skipEmpty: false,
})

await payload.destroy()
process.exit(0)
