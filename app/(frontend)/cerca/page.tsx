import type { Metadata } from "next";
import { cercaArticoli, paginaRichiesta } from "@/lib/articoli";
import Paginazione from "../Paginazione";
import Pezzo from "../Pezzo";

export const metadata: Metadata = {
  title: "Cerca — Livello Zero",
  // Una pagina di risultati non e' un contenuto del sito: cambia con la query
  // e non ha senso trovarla su un motore di ricerca.
  robots: { index: false, follow: true },
};

function primoValore(valore: string | string[] | undefined): string {
  return (Array.isArray(valore) ? valore[0] : valore) ?? "";
}

export default async function PaginaRicerca(props: PageProps<"/cerca">) {
  const parametri = await props.searchParams;
  const termine = primoValore(parametri.q).trim();
  const elenco = await cercaArticoli(termine, paginaRichiesta(parametri.pagina));

  return (
    <section className="guscio pagina-ricerca">
      <h1>Cerca</h1>

      {termine === "" ? (
        <p className="descrizione">
          Scrivi una parola nel campo in alto: la cerco nei titoli e nei
          sommari degli articoli pubblicati.
        </p>
      ) : elenco.articoli.length === 0 ? (
        <p className="descrizione">
          Nessun articolo trovato per «{termine}».
        </p>
      ) : (
        <>
          <p className="descrizione">Risultati per «{termine}».</p>
          <div className="elenco-pezzi">
            {elenco.articoli.map((articolo) => (
              <Pezzo articolo={articolo} key={articolo.slug} />
            ))}
          </div>
          <Paginazione elenco={elenco} base="/cerca" parametri={{ q: termine }} />
        </>
      )}
    </section>
  );
}
