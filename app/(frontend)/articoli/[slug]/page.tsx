import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import {
  articoloPerSlug,
  dataLeggibile,
  nomeCategoria,
  tuttiGliArticoli,
} from "@/lib/articoli";

const convertitori: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    if (typeof node.value !== "object" || node.value === null) return null;
    const media = node.value as {
      url?: string;
      alt?: string;
      width?: number;
      height?: number;
    };
    const didascalia = (node.fields as { didascalia?: string } | undefined)
      ?.didascalia;
    if (!media.url) return null;

    return (
      <figure className="articolo-figura">
        <Image
          src={media.url}
          alt={media.alt ?? ""}
          width={media.width ?? 1600}
          height={media.height ?? 900}
          sizes="(max-width: 720px) 100vw, 720px"
          style={{ width: "100%", height: "auto" }}
        />
        {didascalia && (
          <figcaption className="articolo-didascalia">
            {didascalia}
          </figcaption>
        )}
      </figure>
    );
  },
});

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
    openGraph: {
      title: `${articolo.titolo} — Livello Zero`,
      description: articolo.sommario,
      ...(articolo.copertina
        ? {
            images: [
              {
                url: articolo.copertina.url,
                alt: articolo.copertina.alt,
              },
            ],
          }
        : {}),
    },
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
      <p className="articolo-autore">di Cristian Mazzini</p>
      <p className="articolo-meta">
        {dataLeggibile(articolo.data)} — Lettura da {articolo.minuti} minuti
      </p>
      <RichText
        className="articolo-corpo"
        data={articolo.corpo}
        converters={convertitori}
      />

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
