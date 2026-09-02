import { readFileSync } from 'node:fs'
import path from 'node:path'

export function caricaEnv(radice: string) {
  let contenuto: string
  try {
    contenuto = readFileSync(path.join(radice, '.env'), 'utf8')
  } catch {
    return
  }
  for (const rigaGrezza of contenuto.split('\n')) {
    const riga = rigaGrezza.trim()
    if (!riga || riga.startsWith('#')) continue
    const indice = riga.indexOf('=')
    if (indice === -1) continue
    const chiave = riga.slice(0, indice).trim()
    let valore = riga.slice(indice + 1).trim()
    if (
      (valore.startsWith('"') && valore.endsWith('"')) ||
      (valore.startsWith("'") && valore.endsWith("'"))
    ) {
      valore = valore.slice(1, -1)
    }
    if (process.env[chiave] === undefined) {
      process.env[chiave] = valore
    }
  }
}
