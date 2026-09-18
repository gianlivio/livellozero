import Image from "next/image";
import Link from "next/link";
import { type Articolo, dataLeggibile, nomeCategoria } from "@/lib/articoli";

/**
 * Una riga di elenco. E' la stessa in home, categoria, ricerca e in fondo a un
 * articolo: tenerla in un posto solo evita che i quattro elenchi prendano
 * strade diverse a ogni ritocco.
 */
export default function Pezzo({ articolo }: { articolo: Articolo }) {
  return (
    <article className="pezzo">
      {articolo.copertina ? (
        <div className="pezzo-immagine">
          <Image
            src={articolo.copertina.url}
            alt={articolo.copertina.alt}
            fill
            sizes="168px"
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : (
        <div className="blocco pezzo-immagine" data-eti="immagine articolo" />
      )}
      <div className="pezzo-testo">
        <Link href={`/${articolo.categoria}`} className="categoria">
          {nomeCategoria(articolo.categoria)}
        </Link>
        <h3>
          <Link href={`/articoli/${articolo.slug}`}>{articolo.titolo}</Link>
        </h3>
        <p className="sommario">{articolo.sommario}</p>
        <p className="data">{dataLeggibile(articolo.data)}</p>
      </div>
    </article>
  );
}
