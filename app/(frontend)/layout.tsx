import type { Metadata } from "next";
import { baseSito } from "@/lib/sito";
import { classiFont, Piede, scriptTema, Testata } from "./Cornice";

export const metadata: Metadata = {
  metadataBase: baseSito,
  title: "Livello Zero — come nascono i videogiochi",
  description:
    "Approfondimenti, recensioni e consigli sui videogiochi, con attenzione a come vengono progettati e realizzati.",
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
