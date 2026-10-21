import type { Metadata } from "next";
import PaginaArticolo, {
  metadatiArticolo,
  parametriArticoli,
} from "../../../../_sito/PaginaArticolo";

export function generateStaticParams() {
  return parametriArticoli("en");
}

export async function generateMetadata(
  props: PageProps<"/en/articles/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  return metadatiArticolo(slug, "en");
}

export default async function Articolo(
  props: PageProps<"/en/articles/[slug]">
) {
  const { slug } = await props.params;
  return <PaginaArticolo lingua="en" slug={slug} />;
}
