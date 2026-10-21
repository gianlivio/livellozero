import type { Metadata } from "next";
import { headers } from "next/headers";
import type { Lingua } from "@/lib/lingue";
import { baseSito } from "@/lib/sito";
import { testi } from "@/lib/testi";
import Contenuto404 from "./(frontend)/_sito/Contenuto404";
import { classiFont, Piede, scriptTema, Testata } from "./(frontend)/_sito/Cornice";

/**
 * Il sito ha piu' radici — (it), (en) e (payload) — e con piu' layout di
 * radice Next non sa dentro quale comporre la 404: senza questo file la
 * risposta arriva col corpo vuoto, e la pagina esiste solo nel payload RSC,
 * cioe' solo per chi ha JavaScript. Qui il documento se lo scrive per intero
 * da solo, layout compreso: e' la via che i documenti di Next indicano proprio
 * per il caso dei layout di radice multipli.
 *
 * La lingua la dice proxy.ts con l'intestazione x-lingua, quando manda qui un
 * indirizzo inglese che non esiste. Senza intestazione e' italiano.
 */
async function linguaRichiesta(): Promise<Lingua> {
  return (await headers()).get("x-lingua") === "en" ? "en" : "it";
}

export async function generateMetadata(): Promise<Metadata> {
  const t = testi(await linguaRichiesta());
  return {
    metadataBase: baseSito,
    title: t.titoloPagina(t.nonEsiste),
    description: t.nonEsisteDescrizione,
  };
}

export default async function GlobalNotFound() {
  const lingua = await linguaRichiesta();
  return (
    <html lang={lingua} data-tema="scuro" suppressHydrationWarning className={classiFont}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <Testata lingua={lingua} />
        <main>
          <Contenuto404 lingua={lingua} />
        </main>
        <Piede lingua={lingua} />
      </body>
    </html>
  );
}
