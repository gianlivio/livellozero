import type { Metadata } from "next";
import { baseSito } from "@/lib/sito";
import { testi } from "@/lib/testi";
import { classiFont, Piede, scriptTema, Testata } from "../_sito/Cornice";

/**
 * Layout radice delle pagine inglesi, sotto /en. Gemello di (it)/layout.tsx:
 * ogni lingua ha la sua radice perche' <html lang> sta qui. Passare da una
 * radice all'altra ricarica la pagina intera: e' previsto.
 */
export const metadata: Metadata = {
  metadataBase: baseSito,
  title: testi("en").titoloSito,
  description: testi("en").descrizioneSito,
  robots: { "max-image-preview": "large" },
  openGraph: { locale: "en_US" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-tema="scuro" suppressHydrationWarning className={classiFont}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <Testata lingua="en" />
        <main>{children}</main>
        <Piede lingua="en" />
      </body>
    </html>
  );
}
