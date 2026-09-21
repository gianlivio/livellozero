import Image from "next/image";
import Link from "next/link";
import { elencoArticoli, nomeCategoria, paginaRichiesta } from "@/lib/articoli";
import { immagineDa, leggiChiSono, primoParagrafo } from "@/lib/pagine";
import Paginazione from "./Paginazione";
import Pezzo from "./Pezzo";

export const revalidate = 3600;

export default async function Home(props: PageProps<"/">) {
  const parametri = await props.searchParams;
  const elenco = await elencoArticoli(paginaRichiesta(parametri.pagina));
  const chiSono = await leggiChiSono();
  const foto = immagineDa(chiSono.foto);
  const paragrafo = primoParagrafo(chiSono.testo);

  // L'apertura e' il primo articolo della prima pagina, e conta nei dieci:
  // dalla seconda in poi non c'e' niente in evidenza e l'elenco li prende tutti.
  const apertura = elenco.pagina === 1 ? elenco.articoli[0] : undefined;
  const pezzi = apertura ? elenco.articoli.slice(1) : elenco.articoli;

  return (
    <>
      {apertura ? (
        <section className="guscio apertura">
          <div className="apertura-testo">
            <Link href={`/${apertura.categoria}`} className="categoria">
              {nomeCategoria(apertura.categoria)}
            </Link>
            <h1>
              <Link href={`/articoli/${apertura.slug}`}>
                {apertura.titolo}
              </Link>
            </h1>
            <p className="sommario">{apertura.sommario}</p>
            <p className="tempo-lettura">
              Lettura da {apertura.minuti} minuti
            </p>
          </div>
          {apertura.copertina ? (
            <div className="apertura-immagine">
              <Image
                src={apertura.copertina.url}
                alt={apertura.copertina.alt}
                fill
                sizes="(max-width: 720px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          ) : (
            <div
              className="blocco apertura-immagine"
              data-eti="immagine di apertura"
            />
          )}
        </section>
      ) : elenco.pagina === 1 ? (
        <section className="guscio sezione-in-arrivo">
          <div className="blocco" data-eti="in arrivo" />
          <h1>Il sito sta per partire</h1>
          <p className="vuoto">I primi articoli arrivano a breve.</p>
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
                {elenco.pagina === 1 ? "Ultimi articoli" : "Altri articoli"}
              </h2>
              <div className="elenco-pezzi">
                {pezzi.map((articolo) => (
                  <Pezzo articolo={articolo} key={articolo.slug} />
                ))}
              </div>
            </>
          )}
          <Paginazione elenco={elenco} base="/" />
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
              sizes="112px"
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
                Instagram
              </a>
            )}
            {chiSono.email && (
              <a href={`mailto:${chiSono.email}`}>Scrivimi</a>
            )}
            <Link href="/progetto">Sostieni il progetto</Link>
          </div>
        </div>
      </section>
    </>
  );
}
