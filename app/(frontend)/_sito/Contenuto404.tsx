import Link from "next/link";
import { CATEGORIE, percorsoCategoria } from "@/lib/articoli";
import { inLingua, LINGUA_PREDEFINITA, type Lingua } from "@/lib/lingue";
import { testi } from "@/lib/testi";
import CampoRicerca from "./CampoRicerca";

/** Il corpo della pagina 404, condiviso fra not-found e global-not-found. */
export default function Contenuto404({
  lingua = LINGUA_PREDEFINITA,
}: {
  lingua?: Lingua;
}) {
  const t = testi(lingua);
  return (
    <section className="guscio pagina-404">
      <h1>{t.nonEsiste}</h1>
      <p className="pagina-404-riga">{t.nonEsisteRiga}</p>

      {/* Chi arriva qui voleva leggere qualcosa: le cinque categorie e la
          ricerca sono i due modi per trovarlo, e stanno tutti e due sopra la
          piega. */}
      <nav className="pagina-404-categorie" aria-label={t.categorie}>
        {CATEGORIE.map((categoria) => (
          <Link
            href={percorsoCategoria(categoria.chiave, lingua)}
            key={categoria.chiave}
          >
            {inLingua(categoria.nome, lingua)}
          </Link>
        ))}
      </nav>

      <CampoRicerca variante="pagina" lingua={lingua} />
    </section>
  );
}
