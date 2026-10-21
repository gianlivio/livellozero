import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Lo stesso ordine di Next per i file che usiamo: prima .env.local, poi .env.
 * Vince il primo che definisce una variabile, e quello che c'e' gia' in
 * process.env non si tocca. Cosi' .env.local scavalca .env solo in locale
 * (su Vercel non esiste: e' escluso da git).
 */
const FILE = ['.env.local', '.env']

function leggiFile(percorso: string) {
  let contenuto: string
  try {
    contenuto = readFileSync(percorso, 'utf8')
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

export function caricaEnv(radice: string) {
  for (const file of FILE) {
    leggiFile(path.join(radice, file))
  }
}

/** Su che database si sta lavorando: solo l'host, mai utente o password. */
export function mostraDatabase() {
  const grezzo = process.env.DATABASE_URL
  let host: string
  try {
    host = grezzo ? new URL(grezzo).hostname : '(DATABASE_URL non impostata)'
  } catch {
    host = '(DATABASE_URL non valida)'
  }
  const riga = '='.repeat(Math.max(40, host.length + 12))
  console.log(`\n${riga}\n  DATABASE: ${host}\n${riga}\n`)
}
