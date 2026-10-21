import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  elencoArticoli,
  nomeCategoria,
  percorsoCategoria,
} from "@/lib/articoli";
import { homeIndicizzabile, NOINDEX } from "@/lib/indicizzabili";
import { percorsi, percorsoArticolo, type Lingua } from "@/lib/lingue";
import { haTesto, immagineDa, leggiChiSono, primoParagrafo } from "@/lib/pagine";
import { alternati, baseSito } from "@/lib/sito";
import { testi } from "@/lib/testi";
import Paginazione from "./Paginazione";
import Pezzo from "./Pezzo";

/** Noindex e hreflang: le regole stanno in lib/indicizzabili.ts. */
export async function metadatiHome(lingua: Lingua): Promise<Metadata> {
  const [it, en] = await Promise.all([
    homeIndicizzabile("it"),
    homeIndicizzabile("en"),
  ]);
  const qui = lingua === "it" ? it : en;
  return {
    ...(!qui && NOINDEX),
    alternates: alternati({
      it: it ? percorsi("it").home : null,
      en: en ? percorsi("en").home : null,
    }),
  };
}

/** La home in una lingua. La rotta le passa il numero di pagina gia' letto. */
export default async function PaginaHome({
  lingua,
  pagina,
}: {
  lingua: Lingua;
  pagina: number;
}) {
  const t = testi(lingua);
  const p = percorsi(lingua);
  const elenco = await elencoArticoli(pagina, lingua);
  const chiSono = await leggiChiSono(lingua);
  const foto = immagineDa(chiSono.foto);
  const paragrafo = primoParagrafo(chiSono.testo);

  // L'apertura e' il primo articolo della prima pagina, e conta nei dieci:
  // dalla seconda in poi non c'e' niente in evidenza e l'elenco li prende tutti.
  const apertura = elenco.pagina === 1 ? elenco.articoli[0] : undefined;
  const pezzi = apertura ? elenco.articoli.slice(1) : elenco.articoli;

  const urlHome = new URL(p.home, baseSito).toString();
  const datiStrutturati = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Livello Zero",
      url: urlHome,
      inLanguage: lingua,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Livello Zero",
      url: urlHome,
      logo: new URL("/logo.png", baseSito).toString(),
    },
  ];

  return (
    <>
      {datiStrutturati.map((dati) => (
        <script
          key={dati["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(dati).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      {apertura ? (
        <section className="guscio apertura">
          <div className="apertura-testo">
            <Link
              href={percorsoCategoria(apertura.categoria, lingua)}
              className="categoria"
            >
              {nomeCategoria(apertura.categoria, lingua)}
            </Link>
            <h1>
              <Link href={percorsoArticolo(apertura.slug, lingua)}>
                {apertura.titolo}
              </Link>
            </h1>
            <p className="sommario">{apertura.sommario}</p>
            <p className="tempo-lettura">{t.tempoLettura(apertura.minuti)}</p>
          </div>
          {apertura.copertina ? (
            <div className="apertura-immagine">
              <Image
                src={apertura.copertina.url}
                alt={apertura.copertina.alt}
                width={apertura.copertina.larghezza ?? 1600}
                height={apertura.copertina.altezza ?? 900}
                sizes="(max-width: 760px) calc(100vw - 56px), (max-width: 1240px) calc(47.5vw - 47.5px), 542px"
                quality={90}
                style={{ width: "100%", height: "auto" }}
                preload
              />
            </div>
          ) : (
            <div
              className="blocco apertura-immagine"
              data-eti={t.immagineApertura}
            />
          )}
        </section>
      ) : elenco.pagina === 1 ? (
        <section className="guscio sezione-in-arrivo">
          <div className="blocco" data-eti={t.inArrivo} />
          <h1>{t.sitoInPartenza}</h1>
          <p className="vuoto">{t.primiArticoli}</p>
        </section>
      ) : null}

      {/* L'impaginazione sta fuori dall'elenco, non dentro: se una pagina
          avesse la sola apertura e nessun pezzo sotto, chiudere tutto dentro
          l'elenco toglierebbe anche il modo di arrivare alla pagina dopo. */}
      {(pezzi.length > 0 || elenco.pagineTotali > 1) && (
        <section className="guscio sezione-articoli">
          {pezzi.length > 0 && (
            <>
              <h2>
                {elenco.pagina === 1 ? t.ultimiArticoli : t.altriArticoli}
              </h2>
              <div className="elenco-pezzi">
                {pezzi.map((articolo) => (
                  <Pezzo articolo={articolo} lingua={lingua} key={articolo.slug} />
                ))}
              </div>
            </>
          )}
          <Paginazione elenco={elenco} base={p.home} lingua={lingua} />
        </section>
      )}

      {/* Il riquadro sull'autore solo se Chi sono ha un testo in questa
          lingua: senza, il titolo arriverebbe dal valore predefinito del
          campo, che e' in italiano ("Chi sono"). */}
      {haTesto(chiSono.testo) && (
        <section className="guscio autore">
          {foto && (
            <div className="autore-foto">
              <Image
                src={foto.url!}
                alt={foto.alt ?? ""}
                width={foto.width ?? 400}
                height={foto.height ?? 400}
                sizes="(max-width: 760px) calc(100vw - 56px), 112px"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}
          <div className="autore-testo">
            <h2>{chiSono.titolo}</h2>
            {paragrafo && <p>{paragrafo}</p>}
            <div className="autore-link">
              {chiSono.instagram && (
                <a
                  href={`https://instagram.com/${chiSono.instagram}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {t.instagram}
                </a>
              )}
              {chiSono.email && (
                <a href={`mailto:${chiSono.email}`}>{t.scrivimi}</a>
              )}
              <Link href={p.progetto}>{t.sostieni}</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
