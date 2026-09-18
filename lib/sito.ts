/**
 * Base pubblica del sito: una sola fonte per i metadati (metadataBase) e per
 * gli url assoluti che servono altrove, come quelli dei link di condivisione.
 */
export const baseSito = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://livellozero.vercel.app"
);

export function urlArticolo(slug: string): string {
  return new URL(`/articoli/${slug}`, baseSito).toString();
}
