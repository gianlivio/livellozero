import type { GlobalConfig } from 'payload'
import { editorTesto } from '../editor'
import { rivalidaPagine } from './rivalida'

export const Progetto: GlobalConfig = {
  slug: 'progetto',
  label: 'Il progetto',
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
      defaultValue: 'Il progetto',
      label: 'Titolo',
    },
    {
      name: 'testo',
      type: 'richText',
      editor: editorTesto,
      label: 'Testo',
    },
    {
      name: 'donazioniTesto',
      type: 'textarea',
      label: 'Testo del riquadro donazioni',
    },
    {
      name: 'donazioniLink',
      type: 'text',
      label: 'Link per le donazioni',
    },
  ],
}
