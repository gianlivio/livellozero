import type { Metadata } from "next";
import { cercaArticoli } from "@/lib/articoli";
import { percorsi, type Lingua } from "@/lib/lingue";
import { testi } from "@/lib/testi";
import Paginazione from "./Paginazione";
import Pezzo from "./Pezzo";

export function metadatiRicerca(lingua: Lingua): Metadata {
  const t = testi(lingua);
  return {
    title: t.titoloPagina(t.cerca),
    // Una pagina di risultati non e' un contenuto del sito: cambia con la query
    // e non ha senso trovarla su un motore di ricerca.
    robots: { index: false, follow: true },
  };
}

/** Il termine che arriva da ?q=, ripulito. */
export function termineRichiesto(valore: string | string[] | undefined): string {
  return ((Array.isArray(valore) ? valore[0] : valore) ?? "").trim();
}

export default async function PaginaRicerca({
  lingua,
  termine,
  pagina,
}: {
  lingua: Lingua;
  termine: string;
  pagina: number;
}) {
  const t = testi(lingua);
  const elenco = await cercaArticoli(termine, pagina, lingua);

  return (
    <section className="guscio pagina-ricerca">
      <h1>{t.cerca}</h1>

      {termine === "" ? (
        <p className="descrizione">{t.cercaIstruzioni}</p>
      ) : elenco.articoli.length === 0 ? (
        <p className="descrizione">{t.cercaNessuno(termine)}</p>
      ) : (
        <>
          <p className="descrizione">{t.cercaRisultati(termine)}</p>
          <div className="elenco-pezzi">
            {elenco.articoli.map((articolo) => (
              <Pezzo articolo={articolo} lingua={lingua} key={articolo.slug} />
            ))}
          </div>
          <Paginazione
            elenco={elenco}
            base={percorsi(lingua).cerca}
            parametri={{ q: termine }}
            lingua={lingua}
          />
        </>
      )}
    </section>
  );
}
