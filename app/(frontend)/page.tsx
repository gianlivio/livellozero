import Image from "next/image";
import Link from "next/link";
import {
  elencoArticoli,
  nomeCategoria,
  paginaRichiesta,
  percorsoCategoria,
} from "@/lib/articoli";
import { percorsi, percorsoArticolo } from "@/lib/lingue";
import { immagineDa, leggiChiSono, primoParagrafo } from "@/lib/pagine";
import { baseSito } from "@/lib/sito";
import { testi } from "@/lib/testi";
import Paginazione from "./Paginazione";
import Pezzo from "./Pezzo";

export const revalidate = 3600;

export default async function Home(props: PageProps<"/">) {
  const t = testi();
  const p = percorsi();
  const parametri = await props.searchParams;
  const elenco = await elencoArticoli(paginaRichiesta(parametri.pagina));
  const chiSono = await leggiChiSono();
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
              href={percorsoCategoria(apertura.categoria)}
              className="categoria"
            >
              {nomeCategoria(apertura.categoria)}
            </Link>
            <h1>
              <Link href={percorsoArticolo(apertura.slug)}>
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
                  <Pezzo articolo={articolo} key={articolo.slug} />
                ))}
              </div>
            </>
          )}
          <Paginazione elenco={elenco} base={p.home} />
        </section>
      )}

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
    </>
  );
}
