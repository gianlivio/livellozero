import { paginaRichiesta } from "@/lib/articoli";
import PaginaRicerca, {
  metadatiRicerca,
  termineRichiesto,
} from "../../../_sito/PaginaRicerca";

export const metadata = metadatiRicerca("en");

export default async function Cerca(props: PageProps<"/en/search">) {
  const parametri = await props.searchParams;
  return (
    <PaginaRicerca
      lingua="en"
      termine={termineRichiesto(parametri.q)}
      pagina={paginaRichiesta(parametri.pagina)}
    />
  );
}
