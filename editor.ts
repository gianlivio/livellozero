import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/**
 * L'editor del corpo degli articoli, usato anche dalle pagine ferme. Sta qui
 * in un posto solo perche' "stesso editor degli articoli" resti vero: due
 * copie prenderebbero strade diverse senza che nessuno se ne accorga.
 */
export const editorTesto = lexicalEditor({
  features: [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
    BlockquoteFeature(),
    // Il collegamento interno propone solo gli articoli; l'URL personalizzato resta.
    LinkFeature({ enabledCollections: ['articoli'] }),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'didascalia',
              type: 'text',
              label: 'Didascalia',
            },
          ],
        },
      },
    }),
    InlineToolbarFeature(),
    FixedToolbarFeature(),
  ],
})
