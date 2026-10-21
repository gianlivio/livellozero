import type { Metadata } from "next";
import { cercaArticoli, paginaRichiesta } from "@/lib/articoli";
import { percorsi } from "@/lib/lingue";
import { testi } from "@/lib/testi";
import Paginazione from "../Paginazione";
import Pezzo from "../Pezzo";

export const metadata: Metadata = {
  title: testi().titoloPagina(testi().cerca),
  // Una pagina di risultati non e' un contenuto del sito: cambia con la query
  // e non ha senso trovarla su un motore di ricerca.
  robots: { index: false, follow: true },
};

function primoValore(valore: string | string[] | undefined): string {
  return (Array.isArray(valore) ? valore[0] : valore) ?? "";
}

export default async function PaginaRicerca(props: PageProps<"/cerca">) {
  const t = testi();
  const parametri = await props.searchParams;
  const termine = primoValore(parametri.q).trim();
  const elenco = await cercaArticoli(termine, paginaRichiesta(parametri.pagina));

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
              <Pezzo articolo={articolo} key={articolo.slug} />
            ))}
          </div>
          <Paginazione
            elenco={elenco}
            base={percorsi().cerca}
            parametri={{ q: termine }}
          />
        </>
      )}
    </section>
  );
}
