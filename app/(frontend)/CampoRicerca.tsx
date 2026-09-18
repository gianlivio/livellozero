"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Lente: cerchio e manico, nello stesso tratto delle icone di condivisione. */
function IconaLente() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="7.1" cy="7.1" r="4.3" />
      <path d="m10.3 10.3 2.9 2.9" />
    </svg>
  );
}

/**
 * La lente sta sempre nella testata; il campo si apre solo quando serve. Il
 * campo e il pulsante sono due elementi affiancati e non uno dentro l'altro
 * perche' su schermo stretto prendono due righe diverse (il pulsante resta in
 * alto, il campo scende sotto la navigazione): li tiene insieme l'attributo
 * form del pulsante.
 *
 * In pagina (la 404) il campo e' gia' aperto e non si richiude: li' la ricerca
 * e' la ragione per cui si sta guardando quel pezzo di pagina, non una cosa da
 * scoprire.
 */
export default function CampoRicerca({
  variante = "testata",
}: {
  variante?: "testata" | "pagina";
}) {
  const router = useRouter();
  const inPagina = variante === "pagina";
  const [apertoInTestata, setApertoInTestata] = useState(false);
  const [testo, setTesto] = useState("");
  const campo = useRef<HTMLInputElement>(null);

  const aperto = inPagina || apertoInTestata;

  function setAperto(valore: boolean) {
    if (!inPagina) setApertoInTestata(valore);
  }

  useEffect(() => {
    // Il cursore va nel campo quando e' l'utente ad averlo appena aperto. In
    // pagina il campo c'e' gia' all'arrivo: prendergli il fuoco lo porterebbe
    // a meta' pagina senza che abbia chiesto niente.
    if (apertoInTestata) campo.current?.focus();
  }, [apertoInTestata]);

  function invia(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const termine = testo.trim();
    // Non c'e' niente da cercare: in testata il campo si richiude, in pagina
    // resta dov'e' e si riprende il cursore, perche' e' li' che si deve
    // scrivere e non ha altro posto dove andare.
    if (!termine) {
      if (inPagina) campo.current?.focus();
      else setAperto(false);
      return;
    }
    setAperto(false);
    router.push(`/cerca?q=${encodeURIComponent(termine)}`);
  }

  return (
    <>
      <form
        id="ricerca"
        className="ricerca"
        role="search"
        data-aperto={aperto}
        data-variante={variante}
        onSubmit={invia}
      >
        <input
          ref={campo}
          type="search"
          name="q"
          value={testo}
          onChange={(evento) => setTesto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Escape") setAperto(false);
          }}
          placeholder="Cerca un articolo"
          aria-label="Cerca fra gli articoli"
        />
      </form>
      <button
        type={aperto ? "submit" : "button"}
        form="ricerca"
        className="ricerca-lente"
        aria-label={aperto ? "Cerca" : "Apri la ricerca"}
        aria-expanded={inPagina ? undefined : aperto}
        aria-controls={inPagina ? undefined : "ricerca"}
        onClick={aperto ? undefined : () => setAperto(true)}
      >
        <IconaLente />
      </button>
    </>
  );
}
