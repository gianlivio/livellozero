import type { Metadata } from "next";
import { baseSito } from "@/lib/sito";
import { testi } from "@/lib/testi";
import { classiFont, Piede, scriptTema, Testata } from "../_sito/Cornice";

/**
 * Layout radice delle pagine italiane. Ogni lingua ha la sua radice perche'
 * <html lang> sta qui, e un layout non sa in che indirizzo si trova.
 */
export const metadata: Metadata = {
  metadataBase: baseSito,
  title: testi("it").titoloSito,
  description: testi("it").descrizioneSito,
  robots: { "max-image-preview": "large" },
  openGraph: { locale: "it_IT" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" data-tema="scuro" suppressHydrationWarning className={classiFont}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <Testata lingua="it" />
        <main>{children}</main>
        <Piede lingua="it" />
      </body>
    </html>
  );
}
