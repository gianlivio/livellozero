"use client";

import { useEffect, useRef } from "react";

/**
 * Quanto manca alla fine della lettura. Misura il corpo dell'articolo, non la
 * pagina: copertina, firma dell'autore e "continua a leggere" non sono roba da
 * leggere, e contarli farebbe arrivare la barra in fondo troppo presto.
 */
export default function BarraLettura() {
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const corpo = document.querySelector<HTMLElement>(".articolo-corpo");
    const testata = document.querySelector<HTMLElement>(".testata");
    const elemento = barra.current;
    if (!corpo || !elemento) return;

    let inCoda = false;

    const misura = () => {
      inCoda = false;
      // La testata e' appiccicata in alto e cambia altezza da stretto a largo:
      // la barra le si siede sotto qualunque altezza abbia.
      const altezzaTestata = testata?.offsetHeight ?? 0;
      elemento.style.top = `${altezzaTestata}px`;

      const riquadro = corpo.getBoundingClientRect();
      const cima = riquadro.top + window.scrollY;
      // Zero quando il corpo arriva sotto la testata, uno quando la sua ultima
      // riga tocca il fondo della finestra.
      const inizio = cima - altezzaTestata;
      const corsa = cima + riquadro.height - window.innerHeight - inizio;
      const avanzamento =
        corsa > 0
          ? Math.min(1, Math.max(0, (window.scrollY - inizio) / corsa))
          : 0;

      // scaleX invece della larghezza: cambiare una trasformazione non rifa'
      // l'impaginazione, e a ogni fotogramma la differenza si sente.
      elemento.style.transform = `scaleX(${avanzamento})`;
    };

    // Lo scorrimento arriva a raffica, anche piu' volte per fotogramma. Invece
    // di misurare a ogni colpo si segna che c'e' da rifare il conto e lo si fa
    // una volta sola, quando il browser sta per disegnare.
    const programma = () => {
      if (inCoda) return;
      inCoda = true;
      requestAnimationFrame(misura);
    };

    misura();
    window.addEventListener("scroll", programma, { passive: true });
    window.addEventListener("resize", programma);
    return () => {
      window.removeEventListener("scroll", programma);
      window.removeEventListener("resize", programma);
    };
  }, []);

  return <div ref={barra} className="barra-lettura" aria-hidden="true" />;
}
