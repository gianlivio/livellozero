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
import Pezzo from "../../Pezzo";
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

  const altri = await articoliCorrelati(articolo);
  const voci = titoliArticolo(articolo.corpo);
  const url = urlArticolo(articolo.slug);

  return (
    <article className="pagina-articolo">
      <BarraLettura />
      {/* Sotto le tre sezioni l'indice non aiuta: si abbraccia gia' a occhio. */}
      {voci.length >= 3 && <IndiceArticolo voci={voci} />}
      <Condivisione url={url} titolo={articolo.titolo} variante="lato" />
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

      {/* Sotto i 1250px la colonna a lato sparisce e la condivisione ricompare
          qui, in orizzontale, in chiusura di lettura. */}
      <Condivisione url={url} titolo={articolo.titolo} variante="fondo" />

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

      {altri.length > 0 && (
        <div className="articolo-continua">
          <h2>Continua a leggere</h2>
          <div className="elenco-pezzi">
            {altri.map((altro) => (
              <Pezzo articolo={altro} key={altro.slug} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
