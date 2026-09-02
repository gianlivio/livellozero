import Link from "next/link";
import { dataLeggibile, nomeCategoria, tuttiGliArticoli } from "@/lib/articoli";

export default function Home() {
  const articoli = tuttiGliArticoli();
  const apertura = articoli[0];
  const elenco = articoli.slice(1, 6);

  return (
    <>
      <section className="guscio apertura">
        <div className="apertura-testo">
          <Link href={`/${apertura.categoria}`} className="categoria">
            {nomeCategoria(apertura.categoria)}
          </Link>
          <h1>
            <Link href={`/articoli/${apertura.slug}`}>{apertura.titolo}</Link>
          </h1>
          <p className="sommario">{apertura.sommario}</p>
          <p className="tempo-lettura">Lettura da {apertura.minuti} minuti</p>
        </div>
        <div
          className="blocco apertura-immagine"
          data-eti="immagine di apertura"
        />
      </section>

      <section className="guscio sezione-articoli">
        <h2>Ultimi articoli</h2>
        <div className="elenco-pezzi">
          {elenco.map((articolo) => (
            <article className="pezzo" key={articolo.slug}>
              <div
                className="blocco pezzo-immagine"
                data-eti="immagine articolo"
              />
              <div className="pezzo-testo">
                <Link href={`/${articolo.categoria}`} className="categoria">
                  {nomeCategoria(articolo.categoria)}
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
      </section>

      <section className="guscio autore">
        <div className="blocco autore-foto" data-eti="foto" />
        <div className="autore-testo">
          <h2>Chi sono</h2>
          <p>
            Scrivo di videogiochi da quando ho capito che la parte più
            interessante non è giocarli, ma capire come sono stati costruiti.
            Qui racconto le storie che stanno sotto ai titoli: le idee
            iniziali, i cambi di rotta, le cose che non hanno funzionato.
          </p>
          <p>
            Il sito è un progetto indipendente. Se vuoi propormi una
            collaborazione o semplicemente dirmi che ho sbagliato qualcosa,
            scrivimi.
          </p>
          <div className="autore-link">
            <a href="#">Instagram</a>
            <a href="#">Scrivimi</a>
            <Link href="/progetto">Sostieni il progetto</Link>
          </div>
        </div>
      </section>
    </>
  );
}
