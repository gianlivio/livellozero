import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import {
  articoliCorrelati,
  articoloPerSlug,
  dataLeggibile,
  nomeCategoria,
  tuttiGliArticoli,
} from "@/lib/articoli";
import { ancoraTitolo, titoliArticolo } from "@/lib/indice";
import { urlArticolo } from "@/lib/sito";
import ArticoliCorrelati from "./ArticoliCorrelati";
import BarraLettura from "./BarraLettura";
import Condivisione from "./Condivisione";
import IndiceArticolo from "./IndiceArticolo";

const convertitori: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // Come il converter di serie, ma gli h2 prendono l'id della loro ancora:
  // sono le sezioni a cui punta l'indice a lato.
  heading: ({ node, nodesToJSX, parent, childIndex }) => {
    const Tag = node.tag;
    return (
      <Tag id={node.tag === "h2" ? ancoraTitolo(parent, childIndex) : undefined}>
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    );
  },
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

  const altri = await articoliCorrelati(articolo, 4);
  const voci = titoliArticolo(articolo.corpo);
  const url = urlArticolo(articolo.slug);

  return (
    <article className="pagina-articolo">
      <BarraLettura />
      <IndiceArticolo voci={voci} />
      {altri.length > 0 && <ArticoliCorrelati articoli={altri} />}
      <Link href={`/${articolo.categoria}`} className="categoria">
        {nomeCategoria(articolo.categoria)}
      </Link>
      {articolo.copertina && (
        <div className="articolo-immagine">
          <Image
            src={articolo.copertina.url}
            alt={articolo.copertina.alt}
            width={articolo.copertina.larghezza ?? 1600}
            height={articolo.copertina.altezza ?? 900}
            sizes="(max-width: 720px) 100vw, 720px"
            style={{ width: "100%", height: "auto" }}
            preload
          />
        </div>
      )}
      <h1>{articolo.titolo}</h1>
      {articolo.autore && (
        <p className="articolo-autore">di {articolo.autore.nome}</p>
      )}
      <p className="articolo-meta">
        {dataLeggibile(articolo.data)} — Lettura da {articolo.minuti} minuti
      </p>
      <RichText
        className="articolo-corpo"
        data={articolo.corpo}
        converters={convertitori}
      />

      <Condivisione url={url} titolo={articolo.titolo} />

      {articolo.autore && (
        <aside className="articolo-firma">
          {articolo.autore.foto ? (
            <div className="articolo-firma-foto">
              <Image
                src={articolo.autore.foto.ritratto ?? articolo.autore.foto.url}
                alt={articolo.autore.foto.alt}
                fill
                sizes="120px"
                style={{ objectFit: "cover", objectPosition: "top" }}
              />
            </div>
          ) : (
            <div className="blocco articolo-firma-foto" data-eti="foto" />
          )}
          <div>
            <h2>{articolo.autore.nome}</h2>
            {articolo.autore.bio && <p>{articolo.autore.bio}</p>}
            {(articolo.autore.instagram || articolo.autore.email) && (
              <div className="articolo-firma-contatti">
                {articolo.autore.instagram && (
                  <a
                    href={`https://instagram.com/${articolo.autore.instagram}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Instagram
                  </a>
                )}
                {articolo.autore.email && (
                  <a href={`mailto:${articolo.autore.email}`}>Email</a>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

    </article>
  );
}
