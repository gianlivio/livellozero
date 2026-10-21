import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  articoliPerCategoria,
  CATEGORIE,
  categoriaDaPercorso,
  descrizioneCategoria,
  percorsoCategoria,
} from "@/lib/articoli";
import { sezioneIndicizzabile, NOINDEX } from "@/lib/indicizzabili";
import { inLingua, type Lingua } from "@/lib/lingue";
import { alternati } from "@/lib/sito";
import { testi } from "@/lib/testi";
import Paginazione from "./Paginazione";
import Pezzo from "./Pezzo";

/** Gli indirizzi delle sezioni in una lingua, per generateStaticParams. */
export function parametriCategorie(lingua: Lingua) {
  return CATEGORIE.map((c) => ({ categoria: inLingua(c.percorso, lingua) }));
}

/** Noindex e hreflang: le regole stanno in lib/indicizzabili.ts. */
export async function metadatiCategoria(
  percorso: string,
  lingua: Lingua
): Promise<Metadata> {
  const info = categoriaDaPercorso(percorso, lingua);
  if (!info) notFound();

  const [it, en] = await Promise.all([
    sezioneIndicizzabile(info.chiave, "it"),
    sezioneIndicizzabile(info.chiave, "en"),
  ]);
  const qui = lingua === "it" ? it : en;

  return {
    title: testi(lingua).titoloPagina(inLingua(info.nome, lingua)),
    ...(!qui && NOINDEX),
    alternates: alternati({
      it: it ? percorsoCategoria(info.chiave, "it") : null,
      en: en ? percorsoCategoria(info.chiave, "en") : null,
    }),
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
