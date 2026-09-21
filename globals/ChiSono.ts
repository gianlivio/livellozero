import type { GlobalConfig } from 'payload'
import { editorTesto } from '../editor'
import { rivalidaPagine } from './rivalida'

export const ChiSono: GlobalConfig = {
  slug: 'chi-sono',
  label: 'Chi sono',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [rivalidaPagine],
  },
  fields: [
    {
      name: 'titolo',
      type: 'text',
      required: true,
      defaultValue: 'Chi sono',
      label: 'Titolo',
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto',
    },
    {
      name: 'testo',
      type: 'richText',
      editor: editorTesto,
      label: 'Testo',
    },
    {
      name: 'instagram',
      type: 'text',
      label: 'Profilo Instagram, senza @',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email pubblica',
    },
  ],
}
