import PaginaProgetto, { metadatiProgetto } from "../../_sito/PaginaProgetto";

export function generateMetadata() {
  return metadatiProgetto("it");
}

export default function Progetto() {
  return <PaginaProgetto lingua="it" />;
}
