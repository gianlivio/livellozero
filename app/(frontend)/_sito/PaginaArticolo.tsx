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
  percorsoCategoria,
  tuttiGliArticoli,
} from "@/lib/articoli";
import { ancoraTitolo, titoliArticolo } from "@/lib/indice";
import { percorsi, type Lingua } from "@/lib/lingue";
import { baseSito, urlArticolo } from "@/lib/sito";
import { testi } from "@/lib/testi";
import ArticoliCorrelati from "./articolo/ArticoliCorrelati";
import BarraLettura from "./articolo/BarraLettura";
import Condivisione from "./articolo/Condivisione";
import IndiceArticolo from "./articolo/IndiceArticolo";

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
          sizes="(max-width: 760px) calc(100vw - 48px), 824px"
          quality={90}
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

/** Gli slug degli articoli pubblicati in una lingua, per generateStaticParams. */
export async function parametriArticoli(lingua: Lingua) {
  const articoli = await tuttiGliArticoli(lingua);
  return articoli.map((articolo) => ({ slug: articolo.slug }));
}

export async function metadatiArticolo(
  slug: string,
  lingua: Lingua
): Promise<Metadata> {
  const articolo = await articoloPerSlug(slug, lingua);
  if (!articolo) notFound();

  const titolo =
    articolo.titoloGoogle?.trim() ||
    testi(lingua).titoloPagina(articolo.titolo);
  const descrizione = articolo.descrizioneGoogle?.trim() || articolo.sommario;

  return {
    title: titolo,
    description: descrizione,
    openGraph: {
      title: titolo,
      description: descrizione,
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

export default async function PaginaArticolo({
  lingua,
  slug,
}: {
  lingua: Lingua;
  slug: string;
}) {
  const articolo = await articoloPerSlug(slug, lingua);
  if (!articolo) notFound();

  const t = testi(lingua);
  const p = percorsi(lingua);
  const altri = await articoliCorrelati(articolo, 4, lingua);
  const voci = titoliArticolo(articolo.corpo);
  const url = urlArticolo(articolo.slug, lingua);

  // Dati strutturati per Google. Niente dateModified: Articolo non ha un
  // campo di aggiornamento.
  const datiStrutturati = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articolo.titolo,
    description: articolo.sommario,
    ...(articolo.copertina
      ? { image: new URL(articolo.copertina.url, baseSito).toString() }
      : {}),
    datePublished: articolo.dataISO,
    ...(articolo.autore
      ? {
          author: {
            "@type": "Person",
            name: articolo.autore.nome,
            url: new URL(p.chiSono, baseSito).toString(),
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Livello Zero",
      logo: new URL("/logo.png", baseSito).toString(),
    },
    mainEntityOfPage: url,
  };

  const briciole = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.home,
        item: new URL(p.home, baseSito).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: nomeCategoria(articolo.categoria, lingua),
        item: new URL(
          percorsoCategoria(articolo.categoria, lingua),
          baseSito
        ).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: articolo.titolo,
        item: url,
      },
    ],
  };

  return (
    <article className="pagina-articolo">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datiStrutturati).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(briciole).replace(/</g, "\\u003c"),
        }}
      />
      <BarraLettura />
      <IndiceArticolo voci={voci} />
      {altri.length > 0 && (
        <ArticoliCorrelati articoli={altri} lingua={lingua} />
      )}
      <Link
        href={percorsoCategoria(articolo.categoria, lingua)}
        className="categoria"
      >
        {nomeCategoria(articolo.categoria, lingua)}
      </Link>
      {articolo.copertina && (
        <div className="articolo-immagine">
          <Image
            src={articolo.copertina.url}
            alt={articolo.copertina.alt}
            width={articolo.copertina.larghezza ?? 1600}
            height={articolo.copertina.altezza ?? 900}
            sizes="(max-width: 760px) calc(100vw - 48px), 824px"
            quality={90}
            style={{ width: "100%", height: "auto" }}
            preload
          />
        </div>
      )}
      <h1>{articolo.titolo}</h1>
      {articolo.autore && (
        <p className="articolo-autore">{t.firma(articolo.autore.nome)}</p>
      )}
      <p className="articolo-meta">
        {t.metaArticolo(dataLeggibile(articolo.data, lingua), articolo.minuti)}
      </p>
      <RichText
        className="articolo-corpo"
        data={articolo.corpo}
        converters={convertitori}
      />

      <Condivisione url={url} titolo={articolo.titolo} lingua={lingua} />

      {articolo.autore && (
        <aside className="articolo-firma">
          {articolo.autore.foto ? (
            <div className="articolo-firma-foto">
              <Image
                src={articolo.autore.foto.url}
                alt={articolo.autore.foto.alt}
                fill
                sizes="(max-width: 760px) calc(100vw - 48px), 120px"
                style={{ objectFit: "cover", objectPosition: "top" }}
              />
            </div>
          ) : (
            <div className="blocco articolo-firma-foto" data-eti={t.foto} />
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
                    {t.instagram}
                  </a>
                )}
                {articolo.autore.email && (
                  <a href={`mailto:${articolo.autore.email}`}>{t.email}</a>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

    </article>
  );
}
