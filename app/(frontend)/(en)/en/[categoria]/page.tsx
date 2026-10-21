import type { Metadata } from "next";
import { paginaRichiesta } from "@/lib/articoli";
import PaginaCategoria, {
  metadatiCategoria,
  parametriCategorie,
} from "../../../_sito/PaginaCategoria";

export const revalidate = 3600;

export function generateStaticParams() {
  return parametriCategorie("en");
}

export async function generateMetadata(
  props: PageProps<"/en/[categoria]">
): Promise<Metadata> {
  const { categoria } = await props.params;
  return metadatiCategoria(categoria, "en");
}

export default async function Categoria(props: PageProps<"/en/[categoria]">) {
  const { categoria } = await props.params;
  const parametri = await props.searchParams;
  return (
    <PaginaCategoria
      lingua="en"
      percorso={categoria}
      pagina={paginaRichiesta(parametri.pagina)}
    />
  );
}
