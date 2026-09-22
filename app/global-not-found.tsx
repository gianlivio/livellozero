import type { Metadata } from "next";
import { baseSito } from "@/lib/sito";
import Contenuto404 from "./(frontend)/Contenuto404";
import { classiFont, Piede, scriptTema, Testata } from "./(frontend)/Cornice";

/**
 * Il sito ha due radici — (frontend) e (payload) — e con due layout di radice
 * Next non sa dentro quale comporre la 404: senza questo file la risposta
 * arriva col corpo vuoto, e la pagina esiste solo nel payload RSC, cioe' solo
 * per chi ha JavaScript. Qui il documento se lo scrive per intero da solo,
 * layout compreso: e' la via che i documenti di Next indicano proprio per il
 * caso dei layout di radice multipli.
 */

export const metadata: Metadata = {
  metadataBase: baseSito,
  title: "Questa pagina non esiste — Livello Zero",
  description: "L'indirizzo che hai aperto non corrisponde a nessuna pagina.",
};

export default function GlobalNotFound() {
  return (
    <html lang="it" data-tema="scuro" suppressHydrationWarning className={classiFont}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <Testata />
        <main>
          <Contenuto404 />
        </main>
        <Piede />
      </body>
    </html>
  );
}
