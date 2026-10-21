import type { Metadata } from "next";
import { baseSito } from "@/lib/sito";
import { testi } from "@/lib/testi";
import { classiFont, Piede, scriptTema, Testata } from "./Cornice";

export const metadata: Metadata = {
  metadataBase: baseSito,
  title: testi().titoloSito,
  description: testi().descrizioneSito,
  robots: { "max-image-preview": "large" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" data-tema="scuro" suppressHydrationWarning className={classiFont}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <Testata />
        <main>{children}</main>
        <Piede />
      </body>
    </html>
  );
}
