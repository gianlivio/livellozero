"use client";

import { useEffect } from "react";

/** L'etichetta arriva dal server gia' nella lingua della pagina: il
 *  dizionario non viaggia fino al browser. */
export default function InterruttoreTema({ etichetta }: { etichetta: string }) {
  useEffect(() => {
    const salvato = localStorage.getItem("tema");
    if (salvato === "chiaro" || salvato === "scuro") {
      document.documentElement.dataset.tema = salvato;
    }
  }, []);

  function cambia() {
    const attuale =
      document.documentElement.dataset.tema === "chiaro" ? "chiaro" : "scuro";
    const nuovo = attuale === "scuro" ? "chiaro" : "scuro";
    document.documentElement.dataset.tema = nuovo;
    localStorage.setItem("tema", nuovo);
  }

  return (
    <button
      type="button"
      className="interruttore-tema"
      onClick={cambia}
      aria-label={etichetta}
    >
      ◐
    </button>
  );
}
