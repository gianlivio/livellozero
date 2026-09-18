"use client";

import { useEffect, useState } from "react";
import type { VoceIndice } from "@/lib/indice";

/** Quanto sotto il bordo alto della finestra un titolo conta come "raggiunto".
    Poco piu' della testata appiccicata, cosi' non si attiva mentre e' coperto. */
const SOGLIA = 140;

export default function IndiceArticolo({ voci }: { voci: VoceIndice[] }) {
  const [corrente, setCorrente] = useState("");

  useEffect(() => {
    const sezioni = voci
      .map((voce) => document.getElementById(voce.id))
      .filter((nodo): nodo is HTMLElement => nodo !== null);
    if (sezioni.length === 0) return;

    // La voce corrente e' l'ultimo titolo che ha superato la soglia. Basta
    // ricalcolarlo quando un titolo attraversa quella riga: e' esattamente
    // quando l'osservatore scatta, quindi niente ascolto dello scorrimento.
    const aggiorna = () => {
      const superati = sezioni.filter(
        (sezione) => sezione.getBoundingClientRect().top <= SOGLIA
      );
      setCorrente(superati[superati.length - 1]?.id ?? "");
    };

    const osservatore = new IntersectionObserver(aggiorna, {
      rootMargin: `-${SOGLIA}px 0px 0px 0px`,
    });
    sezioni.forEach((sezione) => osservatore.observe(sezione));
    return () => osservatore.disconnect();
  }, [voci]);

  return (
    <nav className="articolo-indice" aria-label="Indice dell'articolo">
      <ul className="articolo-indice-elenco">
        {voci.map((voce) => (
          <li key={voce.id}>
            <a
              href={`#${voce.id}`}
              aria-current={voce.id === corrente ? "true" : undefined}
            >
              {voce.testo}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
