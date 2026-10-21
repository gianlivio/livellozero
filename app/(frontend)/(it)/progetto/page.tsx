import PaginaProgetto, { metadatiProgetto } from "../../_sito/PaginaProgetto";

export const metadata = metadatiProgetto("it");

export default function Progetto() {
  return <PaginaProgetto lingua="it" />;
}
