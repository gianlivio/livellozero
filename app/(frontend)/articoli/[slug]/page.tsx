import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import {
  articoloPerSlug,
  dataLeggibile,
  nomeCategoria,
  tuttiGliArticoli,
} from "@/lib/articoli";

export async function generateStaticParams() {
  const articoli = await tuttiGliArticoli();
  return articoli.map((articolo) => ({ slug: articolo.slug }));
}

export async function generateMetadata(
  props: PageProps<"/articoli/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const articolo = await articoloPerSlug(slug);
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
  const articolo = await articoloPerSlug(slug);
  if (!articolo) notFound();

  const tutti = await tuttiGliArticoli();
  const altri = tutti.filter((a) => a.slug !== articolo.slug).slice(0, 2);

  return (
    <article className="pagina-articolo">
      <Link href={`/${articolo.categoria}`} className="categoria">
        {nomeCategoria(articolo.categoria)}
      </Link>
      <h1>{articolo.titolo}</h1>
      <p className="articolo-meta">
        {dataLeggibile(articolo.data)} — Lettura da {articolo.minuti} minuti
      </p>
      {articolo.copertina ? (
        <div className="articolo-immagine">
          <Image
            src={articolo.copertina.url}
            alt={articolo.copertina.alt}
            fill
            sizes="(max-width: 720px) 100vw, 720px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      ) : (
        <div
          className="blocco articolo-immagine"
          data-eti="immagine dell'articolo"
        />
      )}
      <RichText className="articolo-corpo" data={articolo.corpo} />

      {altri.length > 0 && (
        <div className="articolo-continua">
          <h2>Continua a leggere</h2>
          <div className="elenco-pezzi">
            {altri.map((altro) => (
              <div className="pezzo" key={altro.slug}>
                {altro.copertina ? (
                  <div className="pezzo-immagine">
                    <Image
                      src={altro.copertina.url}
                      alt={altro.copertina.alt}
                      fill
                      sizes="168px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div
                    className="blocco pezzo-immagine"
                    data-eti="immagine articolo"
                  />
                )}
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
