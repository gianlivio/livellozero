import * as migration_20260902_131937_iniziale from './20260902_131937_iniziale';
import * as migration_20260902_153945_editor_immagini from './20260902_153945_editor_immagini';
import * as migration_20260904_101958_autori_e_anteprima from './20260904_101958_autori_e_anteprima';
import * as migration_20260911_125754_formato_ritratto from './20260911_125754_formato_ritratto';
import * as migration_20260921_165038_pagine_editabili from './20260921_165038_pagine_editabili';

export const migrations = [
  {
    up: migration_20260902_131937_iniziale.up,
    down: migration_20260902_131937_iniziale.down,
    name: '20260902_131937_iniziale',
  },
  {
    up: migration_20260902_153945_editor_immagini.up,
    down: migration_20260902_153945_editor_immagini.down,
    name: '20260902_153945_editor_immagini',
  },
  {
    up: migration_20260904_101958_autori_e_anteprima.up,
    down: migration_20260904_101958_autori_e_anteprima.down,
    name: '20260904_101958_autori_e_anteprima',
  },
  {
    up: migration_20260911_125754_formato_ritratto.up,
    down: migration_20260911_125754_formato_ritratto.down,
    name: '20260911_125754_formato_ritratto',
  },
  {
    up: migration_20260921_165038_pagine_editabili.up,
    down: migration_20260921_165038_pagine_editabili.down,
    name: '20260921_165038_pagine_editabili'
  },
];
