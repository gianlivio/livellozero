import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Immagine',
    plural: 'Immagini',
  },
  admin: {
    useAsTitle: 'titolo',
    defaultColumns: ['titolo', 'alt', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'titolo',
      type: 'text',
      label: 'Titolo',
      admin: {
        description: "Serve a ritrovare l'immagine nell'archivio.",
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Testo alternativo',
      admin: {
        description:
          "Descrivi l'immagine per chi non può vederla. Serve anche a Google.",
      },
    },
  ],
  upload: {
    imageSizes: [
      {
        name: 'card',
        width: 640,
        height: 400,
        position: 'centre',
      },
      {
        name: 'apertura',
        width: 1280,
        height: 720,
        position: 'centre',
      },
    ],
  },
}
