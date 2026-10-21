import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { editorTesto } from '../editor'

function generaSlug(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function rivalidaPercorsi(doc: { categoria?: unknown; slug?: unknown } | null | undefined) {
  if (!doc) return
  try {
    console.log('[rivalida] percorso', '/')
    revalidatePath('/')
    console.log('[rivalida] percorso', '/sitemap.xml')
    revalidatePath('/sitemap.xml')
    if (typeof doc.categoria === 'string') {
      console.log('[rivalida] percorso', `/${doc.categoria}`)
      revalidatePath(`/${doc.categoria}`)
    }
    if (typeof doc.slug === 'string') {
      console.log('[rivalida] percorso', `/articoli/${doc.slug}`)
      revalidatePath(`/articoli/${doc.slug}`)
    }
  } catch (errore) {
    // Payload gira fuori da un contesto Next (es. CLI/migrazioni): niente da rigenerare
    console.error('[rivalida] errore', errore)
  }
}

function estraiTesto(nodo: unknown): string {
  if (!nodo || typeof nodo !== 'object') return ''
  const oggetto = nodo as { text?: unknown; children?: unknown }
  let testo = typeof oggetto.text === 'string' ? `${oggetto.text} ` : ''
  if (Array.isArray(oggetto.children)) {
    for (const figlio of oggetto.children) {
      testo += estraiTesto(figlio)
    }
  }
  return testo
}

export const Articoli: CollectionConfig = {
  slug: 'articoli',
  labels: {
    singular: 'Articolo',
    plural: 'Articoli',
  },
  admin: {
    useAsTitle: 'titolo',
    defaultColumns: ['titolo', 'categoria', 'dataPubblicazione', '_status'],
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        rivalidaPercorsi(doc)
        if (
          previousDoc &&
          (previousDoc.categoria !== doc.categoria ||
            previousDoc.slug !== doc.slug)
        ) {
          rivalidaPercorsi(previousDoc)
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        rivalidaPercorsi(doc)
      },
    ],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'titolo',
      localized: true,
      type: 'text',
      required: true,
      label: 'Titolo',
    },
    {
      name: 'slug',
      localized: true,
      type: 'text',
      required: true,
      unique: true,
      label: 'Indirizzo della pagina',
      admin: {
        description:
          'Si genera dal titolo. Cambialo solo se sai cosa stai facendo.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value) return value
            if (data?.titolo) return generaSlug(data.titolo as string)
            return value
          },
        ],
      },
    },
    {
      name: 'categoria',
      type: 'select',
      required: true,
      label: 'Categoria',
      options: [
        { value: 'approfondimenti', label: 'Approfondimenti' },
        { value: 'recensioni', label: 'Recensioni' },
        { value: 'consigli', label: 'Notizie' },
        { value: 'riflessioni', label: 'Riflessioni' },
        { value: 'classifiche', label: 'Classifiche' },
      ],
    },
    {
      name: 'autore',
      type: 'relationship',
      relationTo: 'autori',
      required: true,
      label: 'Autore',
      admin: {
        position: 'sidebar',
      },
    },
    {
      // Non localizzata apposta: e' l'interruttore che decide se la versione
      // inglese esiste per il sito. Senza, "Pubblica modifiche" in italiano
      // pubblicherebbe anche una traduzione inglese lasciata a meta' in bozza.
      name: 'ingleseVisibile',
      type: 'checkbox',
      defaultValue: false,
      label: 'Mostra la versione inglese',
      admin: {
        position: 'sidebar',
        description:
          'Accendila solo quando la traduzione inglese è completa e pubblicata.',
      },
    },
    {
      name: 'sommario',
      localized: true,
      type: 'textarea',
      required: true,
      maxLength: 300,
      label: 'Sommario',
      admin: {
        description: 'Due righe che compaiono in home e su Google.',
      },
    },
    {
      name: 'titoloGoogle',
      localized: true,
      type: 'text',
      maxLength: 60,
      label: 'Titolo per Google',
      admin: {
        description:
          'Facoltativo, massimo 60 caratteri, usato così com\'è. Se vuoto, Google mostra il Titolo seguito da " — Livello Zero".',
      },
    },
    {
      name: 'descrizioneGoogle',
      localized: true,
      type: 'textarea',
      maxLength: 160,
      label: 'Descrizione per Google',
      admin: {
        description:
          'Facoltativa, ideale tra 140 e 155 caratteri. Se vuota, Google mostra il Sommario.',
      },
    },
    {
      name: 'copertina',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Immagine di copertina',
    },
    {
      name: 'corpo',
      localized: true,
      type: 'richText',
      required: true,
      label: "Testo dell'articolo",
      editor: editorTesto,
    },
    {
      name: 'dataPubblicazione',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: 'Data di pubblicazione',
      admin: {
        date: {
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'minuti',
      localized: true,
      type: 'number',
      label: 'Minuti di lettura',
      admin: {
        description: 'Lascia vuoto e lo calcolo io dal testo.',
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            if (value) return value
            const corpo = siblingData?.corpo as { root?: unknown } | undefined
            const testo = corpo?.root ? estraiTesto(corpo.root) : ''
            const parole = testo.split(/\s+/).filter(Boolean).length
            return Math.max(1, Math.round(parole / 200))
          },
        ],
      },
    },
  ],
}
