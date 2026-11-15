import type { GlobalConfig } from 'payload'
import { rivalidaHome } from './rivalida'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Pagina principale',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [rivalidaHome],
  },
  fields: [
    {
      name: 'titoloGoogle',
      localized: true,
      type: 'text',
      maxLength: 60,
      label: 'Titolo per Google',
      admin: {
        description:
          'Facoltativo, massimo 60 caratteri. Se vuoto resta il titolo attuale.',
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
          'Facoltativa, ideale tra 140 e 155 caratteri. Se vuota resta la descrizione attuale.',
      },
    },
  ],
}
