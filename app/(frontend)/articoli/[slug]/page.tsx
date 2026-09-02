import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ARTICOLI,
  articoloPerSlug,
  dataLeggibile,
  nomeCategoria,
} from "@/lib/articoli";

export function generateStaticParams() {
  return ARTICOLI.map((articolo) => ({ slug: articolo.slug }));
}

export async function generateMetadata(
  props: PageProps<"/articoli/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const articolo = articoloPerSlug(slug);
  if (!articolo) notFound();

  return {
    title: `${articolo.titolo} — Livello Zero`,
    description: articolo.sommario,
  };
}

export default async function PaginaArticolo(
  props: PageProps<"/articoli/[slug]">
) {
  const { slug } = await props.params;
  const articolo = articoloPerSlug(slug);
  if (!articolo) notFound();

  const altri = ARTICOLI.filter((a) => a.slug !== articolo.slug).slice(0, 2);

  return (
    <article className="pagina-articolo">
      <Link href={`/${articolo.categoria}`} className="categoria">
        {nomeCategoria(articolo.categoria)}
      </Link>
      <h1>{articolo.titolo}</h1>
      <p className="articolo-meta">
        {dataLeggibile(articolo.data)} — Lettura da {articolo.minuti} minuti
      </p>
      <div
        className="blocco articolo-immagine"
        data-eti="immagine dell'articolo"
      />
      <div className="articolo-corpo">
        {articolo.corpo.map((paragrafo, indice) => (
          <p key={indice}>{paragrafo}</p>
        ))}
      </div>

      {altri.length > 0 && (
        <div className="articolo-continua">
          <h2>Continua a leggere</h2>
          <div className="elenco-pezzi">
            {altri.map((altro) => (
              <div className="pezzo" key={altro.slug}>
                <div
                  className="blocco pezzo-immagine"
                  data-eti="immagine articolo"
                />
                <div className="pezzo-testo">
                  <Link href={`/${altro.categoria}`} className="categoria">
                    {nomeCategoria(altro.categoria)}
                  </Link>
                  <h3>
                    <Link href={`/articoli/${altro.slug}`}>
                      {altro.titolo}
                    </Link>
                  </h3>
                  <p className="sommario">{altro.sommario}</p>
                  <p className="data">{dataLeggibile(altro.data)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
