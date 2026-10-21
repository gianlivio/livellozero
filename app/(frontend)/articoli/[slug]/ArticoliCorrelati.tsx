import Link from "next/link";
import { nomeCategoria, type Articolo } from "@/lib/articoli";
import { LINGUA_PREDEFINITA, percorsoArticolo, type Lingua } from "@/lib/lingue";
import { testi } from "@/lib/testi";

/**
 * La colonna appiccicata a destra: dove prima c'era la condivisione, adesso
 * ci sono altre letture. Solo categoria e titolo, niente immagini: deve
 * pesare quanto l'indice a sinistra e non rubargli l'occhio.
 */
export default function ArticoliCorrelati({
  articoli,
  lingua = LINGUA_PREDEFINITA,
}: {
  articoli: Articolo[];
  lingua?: Lingua;
}) {
  const t = testi(lingua);
  return (
    <aside className="articolo-correlati" aria-label={t.altriArticoli}>
      <div className="articolo-correlati-interna">
        <p className="colonna-etichetta">{t.altriArticoli}</p>
        <ul className="articolo-correlati-elenco">
          {articoli.map((articolo) => (
            <li key={articolo.slug}>
              <Link href={percorsoArticolo(articolo.slug, lingua)}>
                <span className="articolo-correlati-categoria">
                  {nomeCategoria(articolo.categoria, lingua)}
                </span>
                <span className="articolo-correlati-titolo">
                  {articolo.titolo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
