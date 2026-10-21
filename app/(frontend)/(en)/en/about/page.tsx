import PaginaChiSono, { metadatiChiSono } from "../../../_sito/PaginaChiSono";

export function generateMetadata() {
  return metadatiChiSono("en");
}

export default function ChiSono() {
  return <PaginaChiSono lingua="en" />;
}
