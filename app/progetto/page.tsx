import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Il progetto — Livello Zero",
  description: "Cos'è Livello Zero e come è nato.",
};

export default function Progetto() {
  return (
    <section className="guscio pagina-progetto">
      <h1>Il progetto</h1>
      <div className="progetto-corpo">
        <p>
          Livello Zero è nato come uno spazio per raccontare i videogiochi
          da un angolo che, mi sembrava, veniva raccontato poco: non il voto,
          non l&apos;hype della vigilia, ma il processo che porta un&apos;idea a
          diventare un gioco giocabile, con tutti i compromessi che questo
          comporta.
        </p>
        <p>
          Il nome viene proprio da qui: il livello zero è quello che non
          gioca nessuno, la fase grezza fatta di prototipi, riquadri
          segnaposto e meccaniche non ancora rifinite. È il momento più
          interessante da studiare, perché è quello in cui si vedono le
          decisioni prese, prima che tutto venga levigato per il pubblico.
        </p>
        <p>
          Il sito è un progetto indipendente, senza redazione, senza
          pubblicità invasiva e senza obblighi editoriali verso publisher o
          sviluppatori. Ogni articolo nasce da una curiosità personale, e
          resta pubblicato così com&apos;è, senza revisioni retroattive per
          restare in linea con l&apos;attualità.
        </p>
        <p>
          Se questo modo di raccontare i videogiochi ti è utile o ti piace,
          il modo più semplice per sostenerlo è leggerlo, condividerlo, o
          lasciare un contributo qui sotto.
        </p>
      </div>

      <div className="progetto-sostegno">
        <h2>Sostieni il progetto</h2>
        <p>
          Livello Zero non ha sponsor né pubblicità a schermo intero. Un
          caffè ogni tanto aiuta a tenere le luci accese e a scrivere con
          più calma.
        </p>
        <a href="#" className="pulsante-accento">
          Offrimi un caffè
        </a>
      </div>
    </section>
  );
}
