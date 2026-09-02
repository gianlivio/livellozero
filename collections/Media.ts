import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Immagine',
    plural: 'Immagini',
  },
  access: {
    read: () => true,
  },
  fields: [
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
