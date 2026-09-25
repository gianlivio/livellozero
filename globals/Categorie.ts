import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * Le chiavi sono le stesse di collections/Articoli.ts e di CATEGORIE in
 * lib/articoli.ts. Qui non si aggiungono ne' tolgono categorie: le cinque
 * righe nascono nella migrazione e dal pannello si cambia solo il testo.
 */
const opzioni = [
  { value: 'approfondimenti', label: 'Approfondimenti' },
  { value: 'recensioni', label: 'Recensioni' },
  { value: 'consigli', label: 'Notizie' },
  { value: 'riflessioni', label: 'Riflessioni' },
  { value: 'classifiche', label: 'Classifiche' },
]

function rivalidaCategorie() {
  try {
    for (const { value } of opzioni) {
      revalidatePath(`/${value}`)
    }
  } catch {
    // Payload gira fuori da un contesto Next (es. CLI/migrazioni): niente da rigenerare
  }
}

export const Categorie: GlobalConfig = {
  slug: 'categorie',
  label: 'Categorie',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [rivalidaCategorie],
  },
  fields: [
    {
      name: 'voci',
      type: 'array',
      label: 'Categorie',
      labels: {
        singular: 'Categoria',
        plural: 'Categorie',
      },
      minRows: opzioni.length,
      maxRows: opzioni.length,
      admin: {
        description:
          'Il testo che compare sotto il titolo nella pagina di ogni categoria. Vuoto, non compare niente.',
      },
      fields: [
        {
          name: 'chiave',
          type: 'select',
          required: true,
          label: 'Categoria',
          options: opzioni,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'descrizione',
          type: 'textarea',
          label: 'Descrizione',
        },
      ],
    },
  ],
}
