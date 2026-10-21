import { paginaRichiesta } from "@/lib/articoli";
import PaginaRicerca, {
  metadatiRicerca,
  termineRichiesto,
} from "../../_sito/PaginaRicerca";

export const metadata = metadatiRicerca("it");

export default async function Cerca(props: PageProps<"/cerca">) {
  const parametri = await props.searchParams;
  return (
    <PaginaRicerca
      lingua="it"
      termine={termineRichiesto(parametri.q)}
      pagina={paginaRichiesta(parametri.pagina)}
    />
  );
}
