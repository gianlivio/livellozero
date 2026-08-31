import InterruttoreTema from "./InterruttoreTema";

const articoli = [
  {
    categoria: "Recensione",
    titolo: "Clair Obscur: Expedition 33",
    sommario:
      "Un gioco di ruolo a turni che ha il coraggio di chiedere attenzione, in un anno in cui quasi nessuno la chiede più.",
    data: "14 settembre",
  },
  {
    categoria: "Approfondimento",
    titolo: "Quanto è costato tagliare metà di Cyberpunk 2077",
    sommario:
      "Le funzioni annunciate e mai arrivate, quelle rimosse a sei mesi dall'uscita, e cosa racconta questo sul modo in cui si programma il lavoro in uno studio grande.",
    data: "9 settembre",
  },
  {
    categoria: "Consigli",
    titolo: "Cosa giocare dopo Disco Elysium",
    sommario:
      "Sei titoli per chi è uscito da Revachol e adesso trova tutto il resto un po' silenzioso.",
    data: "3 settembre",
  },
  {
    categoria: "Riflessioni",
    titolo: "L'accesso anticipato ci ha abituati a giocare cose non finite",
    sommario:
      "Comprare un gioco a metà era un'eccezione, poi è diventato un modello di sviluppo. Cosa ci abbiamo guadagnato e cosa no.",
    data: "28 agosto",
  },
  {
    categoria: "Classifiche",
    titolo: "I dieci momenti che hanno definito Resident Evil",
    sommario:
      "Dai cani che saltano dalla finestra al villaggio in cui il tempo si ferma: trent'anni di paura, messi in fila.",
    data: "21 agosto",
  },
];

export default function Home() {
  return (
    <>
      <div className="nastro">
        Bozza grafica — i testi sono di esempio, le immagini vanno al posto
        dei riquadri
      </div>
      <header className="testata">
        <div className="guscio testata-interna">
          <a href="#" className="marchio">
            <span className="marchio-quadrato">
              <span className="marchio-zero">0</span>
            </span>
            <span className="marchio-nome">LIVELLO ZERO</span>
          </a>
          <nav className="navigazione">
            <a href="#">Approfondimenti</a>
            <a href="#">Recensioni</a>
            <a href="#">Consigli</a>
            <a href="#">Riflessioni</a>
            <a href="#">Classifiche</a>
            <a href="#">Chi sono</a>
          </nav>
          <InterruttoreTema />
        </div>
      </header>
      <main>
        <section className="guscio apertura">
          <div className="apertura-testo">
            <p className="categoria">Approfondimento</p>
            <h1>
              Silent Hill 2 e la stanza chiusa a chiave che nessuno doveva
              aprire
            </h1>
            <p className="sommario">
              Un team piccolo, un motore grafico che non reggeva la nebbia e
              una sceneggiatura riscritta tre volte. La storia di come un
              limite tecnico è diventato il linguaggio di un gioco.
            </p>
            <p className="tempo-lettura">Lettura da 12 minuti</p>
          </div>
          <div
            className="blocco apertura-immagine"
            data-eti="immagine di apertura"
          />
        </section>

        <section className="guscio sezione-articoli">
          <h2>Ultimi articoli</h2>
          <div className="elenco-pezzi">
            {articoli.map((articolo) => (
              <article className="pezzo" key={articolo.titolo}>
                <div
                  className="blocco pezzo-immagine"
                  data-eti="immagine articolo"
                />
                <div className="pezzo-testo">
                  <p className="categoria">{articolo.categoria}</p>
                  <h3>
                    <a href="#">{articolo.titolo}</a>
                  </h3>
                  <p className="sommario">{articolo.sommario}</p>
                  <p className="data">{articolo.data}</p>
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
              interessante non è giocarli, ma capire come sono stati
              costruiti. Qui racconto le storie che stanno sotto ai titoli: le
              idee iniziali, i cambi di rotta, le cose che non hanno
              funzionato.
            </p>
            <p>
              Il sito è un progetto indipendente. Se vuoi propormi una
              collaborazione o semplicemente dirmi che ho sbagliato qualcosa,
              scrivimi.
            </p>
            <div className="autore-link">
              <a href="#">Instagram</a>
              <a href="#">Scrivimi</a>
              <a href="#">Sostieni il progetto</a>
            </div>
          </div>
        </section>
      </main>
      <footer className="guscio piede">
        <p>Livello Zero — progetto editoriale indipendente</p>
        <div className="piede-link">
          <a href="#">Instagram</a>
          <a href="#">Contatti</a>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </>
  );
}
