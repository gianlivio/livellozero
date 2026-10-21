import PaginaProgetto, { metadatiProgetto } from "../../../_sito/PaginaProgetto";

export function generateMetadata() {
  return metadatiProgetto("en");
}

export default function Progetto() {
  return <PaginaProgetto lingua="en" />;
}
