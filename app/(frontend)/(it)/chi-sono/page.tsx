import PaginaChiSono, { metadatiChiSono } from "../../_sito/PaginaChiSono";

export function generateMetadata() {
  return metadatiChiSono("it");
}

export default function ChiSono() {
  return <PaginaChiSono lingua="it" />;
}
