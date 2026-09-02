import type { CollectionConfig } from 'payload'

export const Utenti: CollectionConfig = {
  slug: 'utenti',
  labels: {
    singular: 'Utente',
    plural: 'Utenti',
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      label: 'Nome',
    },
  ],
}
