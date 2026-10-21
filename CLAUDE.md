@AGENTS.md

## Trappole note

1. Niente `npx payload`: su Node 26 dà `ERR_REQUIRE_ASYNC_MODULE`. Usare `npm run migrazione:crea`, `migrazione:applica`, `tipi:genera`, `importmap:genera`.
2. `patches/payload+3.88.0.patch` non va rimossa.
3. La import map si rigenera in build: senza, i componenti del pannello e le feature lexical spariscono in silenzio.
4. `push: false` nell'adapter Postgres: `next dev` non deve scrivere sul database.
5. `prodMigrations` è attivo: le migrazioni partono da sole al deploy su Vercel.
6. In locale il database è il branch Neon "sviluppo", tramite `.env.local`; la produzione non si tocca dal Mac. Le immagini (Vercel Blob) invece sono condivise con la produzione.
7. `addRandomSuffix` è spento sul plugin Blob: il ritaglio dal pannello fallisce sui file già esistenti.
8. `STORAGE_VERCEL_BLOB_BASE_URL` è indispensabile.
9. `experimental.globalNotFound` è attivo: ricontrollarlo a ogni aggiornamento di Next.
10. `proxy.ts` ha l'elenco delle sezioni scritto a mano.
11. I formati immagine `card` e `apertura` in `collections/Media.ts` non sono usati.
12. Le migrazioni generate fanno domande interattive: rispondere sempre "+ create column", mai "rename".
13. I salvataggi fatti fuori da Next (script) non rigenerano le pagine: serve ripubblicare dal pannello o un deploy.
14. Dopo ogni deploy: `npm run verifica`.
