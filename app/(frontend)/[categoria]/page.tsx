import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articoliPerCategoria, CATEGORIE, paginaRichiesta } from "@/lib/articoli";
import Paginazione from "../Paginazione";
import Pezzo from "../Pezzo";

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIE.map((c) => ({ categoria: c.chiave }));
}

export async function generateMetadata(
  props: PageProps<"/[categoria]">
): Promise<Metadata> {
  const { categoria } = await props.params;
  const info = CATEGORIE.find((c) => c.chiave === categoria);
  if (!info) notFound();

  return {
    title: `${info.nome} — Livello Zero`,
  };
}

export default async function PaginaCategoria(
  props: PageProps<"/[categoria]">
) {
  const { categoria } = await props.params;
  const info = CATEGORIE.find((c) => c.chiave === categoria);
  if (!info) notFound();

  const parametri = await props.searchParams;
  const elenco = await articoliPerCategoria(
    info.chiave,
    paginaRichiesta(parametri.pagina)
  );

  return (
    <section className="guscio pagina-categoria">
      <h1>{info.nome}</h1>
      <p className="descrizione">{info.descrizione}</p>

      {elenco.articoli.length === 0 ? (
        <p className="vuoto">Ancora nessun articolo in questa sezione.</p>
      ) : (
        <>
          <div className="elenco-pezzi">
            {elenco.articoli.map((articolo) => (
              <Pezzo articolo={articolo} key={articolo.slug} />
            ))}
          </div>
          <Paginazione elenco={elenco} base={`/${info.chiave}`} />
        </>
      )}
    </section>
  );
}
