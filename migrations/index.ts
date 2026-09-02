import * as migration_20260902_131937_iniziale from './20260902_131937_iniziale';
import * as migration_20260902_153945_editor_immagini from './20260902_153945_editor_immagini';

export const migrations = [
  {
    up: migration_20260902_131937_iniziale.up,
    down: migration_20260902_131937_iniziale.down,
    name: '20260902_131937_iniziale',
  },
  {
    up: migration_20260902_153945_editor_immagini.up,
    down: migration_20260902_153945_editor_immagini.down,
    name: '20260902_153945_editor_immagini'
  },
];
