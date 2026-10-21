import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  articoliPerCategoria,
  CATEGORIE,
  categoriaDaPercorso,
  descrizioneCategoria,
} from "@/lib/articoli";
import { inLingua, type Lingua } from "@/lib/lingue";
import { testi } from "@/lib/testi";
import Paginazione from "./Paginazione";
import Pezzo from "./Pezzo";

/** Gli indirizzi delle sezioni in una lingua, per generateStaticParams. */
export function parametriCategorie(lingua: Lingua) {
  return CATEGORIE.map((c) => ({ categoria: inLingua(c.percorso, lingua) }));
}

export function metadatiCategoria(percorso: string, lingua: Lingua): Metadata {
  const info = categoriaDaPercorso(percorso, lingua);
  if (!info) notFound();

  return {
    title: testi(lingua).titoloPagina(inLingua(info.nome, lingua)),
  };
}

export default async function PaginaCategoria({
  lingua,
  percorso,
  pagina,
}: {
  lingua: Lingua;
  /** L'ultimo pezzo dell'indirizzo, come arriva dalla rotta. */
  percorso: string;
  pagina: number;
}) {
  const info = categoriaDaPercorso(percorso, lingua);
  if (!info) notFound();
  const t = testi(lingua);

  const [elenco, descrizione] = await Promise.all([
    articoliPerCategoria(info.chiave, pagina, lingua),
    descrizioneCategoria(info.chiave, lingua),
  ]);

  return (
    <section className="guscio pagina-categoria">
      <h1>{inLingua(info.nome, lingua)}</h1>
      {descrizione && <p className="descrizione">{descrizione}</p>}

      {elenco.articoli.length === 0 ? (
        <p className="vuoto">{t.sezioneVuota}</p>
      ) : (
        <>
          <div className="elenco-pezzi">
            {elenco.articoli.map((articolo) => (
              <Pezzo articolo={articolo} lingua={lingua} key={articolo.slug} />
            ))}
          </div>
          <Paginazione
            elenco={elenco}
            base={`/${inLingua(info.percorso, lingua)}`}
            lingua={lingua}
          />
        </>
      )}
    </section>
  );
}
