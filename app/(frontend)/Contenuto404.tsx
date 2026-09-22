import Link from "next/link";
import { CATEGORIE } from "@/lib/articoli";
import CampoRicerca from "./CampoRicerca";

/** Il corpo della pagina 404, condiviso fra not-found e global-not-found. */
export default function Contenuto404() {
  return (
    <section className="guscio pagina-404">
      <h1>Questa pagina non esiste</h1>
      <p className="pagina-404-riga">
        Forse l&apos;articolo è stato spostato, o l&apos;indirizzo è sbagliato.
      </p>

      {/* Chi arriva qui voleva leggere qualcosa: le cinque categorie e la
          ricerca sono i due modi per trovarlo, e stanno tutti e due sopra la
          piega. */}
      <nav className="pagina-404-categorie" aria-label="Categorie">
        {CATEGORIE.map((categoria) => (
          <Link href={`/${categoria.chiave}`} key={categoria.chiave}>
            {categoria.nome}
          </Link>
        ))}
      </nav>

      <CampoRicerca variante="pagina" />
    </section>
  );
}
