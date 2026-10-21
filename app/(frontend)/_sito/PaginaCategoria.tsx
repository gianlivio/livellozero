import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  articoliPerCategoria,
  CATEGORIE,
  categoriaDaPercorso,
  descrizioneCategoria,
  percorsoCategoria,
} from "@/lib/articoli";
import { inLingua, type Lingua } from "@/lib/lingue";
import { testi } from "@/lib/testi";
import Paginazione from "./Paginazione";
import Pezzo from "./Pezzo";

/** Gli indirizzi delle sezioni in una lingua, per generateStaticParams. */
export function parametriCategorie(lingua: Lingua) {
  return CATEGORIE.map((c) => ({ categoria: inLingua(c.percorso, lingua) }));
}

/**
 * In una lingua diversa dall'italiano una pagina senza contenuto resta
 * raggiungibile ma fuori dai motori di ricerca. In italiano no: e' il sito
 * principale, e una sezione momentaneamente vuota non va tolta da Google.
 */
export async function metadatiCategoria(
  percorso: string,
  lingua: Lingua
): Promise<Metadata> {
  const info = categoriaDaPercorso(percorso, lingua);
  if (!info) notFound();

  const vuota =
    lingua !== "it" &&
    (await articoliPerCategoria(info.chiave, 1, lingua)).articoli.length === 0;

  return {
    title: testi(lingua).titoloPagina(inLingua(info.nome, lingua)),
    ...(vuota && { robots: { index: false, follow: true } }),
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
            base={percorsoCategoria(info.chiave, lingua)}
            lingua={lingua}
          />
        </>
      )}
    </section>
  );
}
