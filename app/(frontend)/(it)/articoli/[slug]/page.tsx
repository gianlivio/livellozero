import type { Metadata } from "next";
import PaginaArticolo, {
  metadatiArticolo,
  parametriArticoli,
} from "../../../_sito/PaginaArticolo";

export function generateStaticParams() {
  return parametriArticoli("it");
}

export async function generateMetadata(
  props: PageProps<"/articoli/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  return metadatiArticolo(slug, "it");
}

export default async function Articolo(props: PageProps<"/articoli/[slug]">) {
  const { slug } = await props.params;
  return <PaginaArticolo lingua="it" slug={slug} />;
}
