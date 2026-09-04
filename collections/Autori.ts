import type { CollectionConfig } from 'payload'

export const Autori: CollectionConfig = {
  slug: 'autori',
  labels: {
    singular: 'Autore',
    plural: 'Autori',
  },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'email', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      label: 'Nome e cognome',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Breve biografia',
      admin: {
        description: 'Due righe che compaiono in fondo agli articoli.',
      },
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto',
    },
    {
      name: 'instagram',
      type: 'text',
      label: 'Profilo Instagram',
      admin: {
        description: 'Solo il nome utente, senza @',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email pubblica',
    },
  ],
}
