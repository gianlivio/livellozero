"use client";

import { useEffect } from "react";

export default function InterruttoreTema() {
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
      aria-label="Cambia tema"
    >
      ◐
    </button>
  );
}
