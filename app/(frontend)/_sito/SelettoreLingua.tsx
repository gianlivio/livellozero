"use client";

import type { MouseEvent, FocusEvent } from "react";
import type { Lingua } from "@/lib/lingue";

/**
 * Il passaggio all'altra lingua. Porta alla pagina gemella se esiste ed e'
 * indicizzabile, altrimenti alla home dell'altra lingua.
 *
 * La gemella non la calcola: la legge dall'hreflang nella <head>, che la
 * pagina scrive proprio solo in quel caso (vedi lib/indicizzabili.ts). Cosi'
 * selettore e hreflang non possono dire cose diverse. Senza JavaScript resta
 * l'indirizzo scritto dal server, la home dell'altra lingua.
 *
 * Un <a> e non un <Link>: le due lingue hanno layout radice diversi, e il
 * passaggio ricarica comunque la pagina intera.
 */
export default function SelettoreLingua({
  verso,
  home,
  testo,
  etichetta,
  linguaEtichetta,
}: {
  /** La lingua di arrivo. */
  verso: Lingua;
  /** Dove portare se la pagina non ha una gemella. */
  home: string;
  testo: string;
  etichetta: string;
  /** In che lingua e' scritta l'etichetta, per i lettori di schermo. */
  linguaEtichetta: string;
}) {
  // L'hreflang porta l'indirizzo pubblico del sito: se ne tiene solo il
  // percorso, cosi' in locale e nelle anteprime si resta sulla stessa copia.
  function destinazione(): string {
    const gemella = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${verso}"]`
    );
    if (!gemella) return home;
    const url = new URL(gemella.href);
    return url.pathname + url.search;
  }

  // L'indirizzo si aggiorna quando il link sta per servire: al passaggio del
  // mouse o al focus, cosi' anche l'anteprima del browser mostra quello giusto.
  function aggiorna(
    evento: MouseEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>
  ) {
    evento.currentTarget.href = destinazione();
  }

  return (
    <a
      className="selettore-lingua"
      href={home}
      hrefLang={verso}
      lang={linguaEtichetta}
      aria-label={etichetta}
      onMouseEnter={aggiorna}
      onFocus={aggiorna}
      // Anche al clic: la <head> puo' essere cambiata dopo l'ultimo passaggio.
      // Il browser segue l'indirizzo che il link ha dopo questo gestore, quindi
      // funzionano anche cmd/ctrl-clic e il clic centrale.
      onClick={aggiorna}
    >
      {testo}
    </a>
  );
}
