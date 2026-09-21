import { revalidatePath } from 'next/cache'

/**
 * Le pagine che leggono i due global. Salvare dal pannello le rigenera
 * subito, invece di lasciarle ferme fino alla scadenza della cache.
 */
export function rivalidaPagine() {
  try {
    revalidatePath('/')
    revalidatePath('/chi-sono')
    revalidatePath('/progetto')
  } catch {
    // Payload gira fuori da un contesto Next (es. CLI/migrazioni): niente da rigenerare
  }
}
