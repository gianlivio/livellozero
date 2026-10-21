import { paginaRichiesta } from "@/lib/articoli";
import PaginaHome, { metadatiHome } from "../../_sito/PaginaHome";

export const revalidate = 3600;

export function generateMetadata() {
  return metadatiHome("en");
}

export default async function Home(props: PageProps<"/en">) {
  const parametri = await props.searchParams;
  return <PaginaHome lingua="en" pagina={paginaRichiesta(parametri.pagina)} />;
}
