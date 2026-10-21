import Link from "next/link";
import type { Elenco } from "@/lib/articoli";
import { LINGUA_PREDEFINITA, type Lingua } from "@/lib/lingue";
import { testi } from "@/lib/testi";

type Props = {
  elenco: Elenco;
  /** Il percorso della pagina impaginata, senza querystring: "/", "/recensioni". */
  base: string;
  /** Quel che va tenuto nell'indirizzo oltre alla pagina, come la q della ricerca. */
  parametri?: Record<string, string>;
  lingua?: Lingua;
};

/** La prima pagina e' l'indirizzo nudo: /recensioni, non /recensioni?pagina=1. */
function indirizzo(
  base: string,
  parametri: Record<string, string>,
  pagina: number
): string {
  const query = new URLSearchParams(parametri);
  if (pagina > 1) query.set("pagina", String(pagina));
  const stringa = query.toString();
  return stringa ? `${base}?${stringa}` : base;
}

/**
 * Gli articoli sono ordinati dal piu' recente, quindi la pagina precedente
 * porta ai piu' recenti e la successiva ai piu' vecchi. Il capo dell'elenco
 * resta al suo posto ma spento, cosi' i tre elementi non ballano di pagina in
 * pagina.
 */
export default function Paginazione({
  elenco,
  base,
  parametri = {},
  lingua = LINGUA_PREDEFINITA,
}: Props) {
  if (elenco.pagineTotali <= 1) return null;
  const t = testi(lingua);

  return (
    <nav className="paginazione" aria-label={t.paginazione}>
      {elenco.haPrecedente ? (
        <Link
          className="paginazione-salto"
          href={indirizzo(base, parametri, elenco.pagina - 1)}
          rel="prev"
        >
          {t.piuRecenti}
        </Link>
      ) : (
        <span className="paginazione-salto" aria-disabled="true">
          {t.piuRecenti}
        </span>
      )}

      <span className="paginazione-stato">
        {t.statoPagina(elenco.pagina, elenco.pagineTotali)}
      </span>

      {elenco.haSuccessiva ? (
        <Link
          className="paginazione-salto"
          href={indirizzo(base, parametri, elenco.pagina + 1)}
          rel="next"
        >
          {t.piuVecchi}
        </Link>
      ) : (
        <span className="paginazione-salto" aria-disabled="true">
          {t.piuVecchi}
        </span>
      )}
    </nav>
  );
}
