import { paginaRichiesta } from "@/lib/articoli";
import PaginaHome, { metadatiHome } from "../_sito/PaginaHome";

export const revalidate = 3600;

export function generateMetadata() {
  return metadatiHome("it");
}

export default async function Home(props: PageProps<"/">) {
  const parametri = await props.searchParams;
  return <PaginaHome lingua="it" pagina={paginaRichiesta(parametri.pagina)} />;
}
