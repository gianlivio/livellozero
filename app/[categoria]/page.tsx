import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  articoliPerCategoria,
  CATEGORIE,
  dataLeggibile,
} from "@/lib/articoli";

export function generateStaticParams() {
  return CATEGORIE.map((c) => ({ categoria: c.chiave }));
}

export async function generateMetadata(
  props: PageProps<"/[categoria]">
): Promise<Metadata> {
  const { categoria } = await props.params;
  const info = CATEGORIE.find((c) => c.chiave === categoria);
  if (!info) notFound();

  return {
    title: `${info.nome} — Livello Zero`,
  };
}

export default async function PaginaCategoria(
  props: PageProps<"/[categoria]">
) {
  const { categoria } = await props.params;
  const info = CATEGORIE.find((c) => c.chiave === categoria);
  if (!info) notFound();

  const articoli = articoliPerCategoria(info.chiave);

  return (
    <section className="guscio pagina-categoria">
      <h1>{info.nome}</h1>
      <p className="descrizione">{info.descrizione}</p>

      {articoli.length === 0 ? (
        <p className="vuoto">Ancora nessun articolo in questa sezione.</p>
      ) : (
        <div className="elenco-pezzi">
          {articoli.map((articolo) => (
            <article className="pezzo" key={articolo.slug}>
              <div
                className="blocco pezzo-immagine"
                data-eti="immagine articolo"
              />
              <div className="pezzo-testo">
                <Link href={`/${articolo.categoria}`} className="categoria">
                  {info.nome}
                </Link>
                <h3>
                  <Link href={`/articoli/${articolo.slug}`}>
                    {articolo.titolo}
                  </Link>
                </h3>
                <p className="sommario">{articolo.sommario}</p>
                <p className="data">{dataLeggibile(articolo.data)}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
