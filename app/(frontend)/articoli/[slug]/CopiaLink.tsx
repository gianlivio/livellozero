"use client";

import { useEffect, useState } from "react";
import { IconaFatto, IconaLink } from "./icone";

export default function CopiaLink({ url }: { url: string }) {
  const [copiato, setCopiato] = useState(false);

  useEffect(() => {
    if (!copiato) return;
    const attesa = setTimeout(() => setCopiato(false), 2000);
    return () => clearTimeout(attesa);
  }, [copiato]);

  async function copia() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiato(true);
    } catch {
      // Appunti non disponibili (permesso negato, o pagina non sicura): il
      // pulsante resta com'e' invece di annunciare una copia mai avvenuta.
    }
  }

  return (
    <button type="button" className="condivisione-voce" onClick={copia}>
      {copiato ? <IconaFatto /> : <IconaLink />}
      <span>{copiato ? "Copiato" : "Copia link"}</span>
    </button>
  );
}
