import Link from "next/link";
import { nomeCategoria, type Articolo } from "@/lib/articoli";

/**
 * La colonna appiccicata a destra: dove prima c'era la condivisione, adesso
 * ci sono altre letture. Solo categoria e titolo, niente immagini: deve
 * pesare quanto l'indice a sinistra e non rubargli l'occhio.
 */
export default function ArticoliCorrelati({
  articoli,
}: {
  articoli: Articolo[];
}) {
  return (
    <aside className="articolo-correlati" aria-label="Altri articoli">
      <div className="articolo-correlati-interna">
        <p className="colonna-etichetta">Altri articoli</p>
        <ul className="articolo-correlati-elenco">
          {articoli.map((articolo) => (
            <li key={articolo.slug}>
              <Link href={`/articoli/${articolo.slug}`}>
                <span className="articolo-correlati-categoria">
                  {nomeCategoria(articolo.categoria)}
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
