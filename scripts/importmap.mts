import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import payload, { generateImportMap } from 'payload'
import type { SanitizedConfig } from 'payload'
import { caricaEnv } from './env.mts'

// `npx payload generate:importmap` non funziona su Node 26: la CLI carica
// payload.config.ts con require(), ma @payloadcms/richtext-lexical ha top-level
// await e Node rifiuta (ERR_REQUIRE_ASYNC_MODULE). Qui il config arriva con
// import(), quindi la generazione va a buon fine.
// Senza import map aggiornata ogni componente admin o feature lexical aggiunta
// viene ignorata in silenzio: nessun errore in build, nessuno in console.

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

await generateImportMap(config, { force: true, log: true })

await payload.destroy()
process.exit(0)
