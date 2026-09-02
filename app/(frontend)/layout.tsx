import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import InterruttoreTema from "./InterruttoreTema";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Livello Zero — come nascono i videogiochi",
  description:
    "Approfondimenti, recensioni e consigli sui videogiochi, con attenzione a come vengono progettati e realizzati.",
};

const scriptTema = `(function () {
  try {
    var tema = localStorage.getItem("tema");
    if (tema === "chiaro" || tema === "scuro") {
      document.documentElement.dataset.tema = tema;
    }
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      data-tema="scuro"
      suppressHydrationWarning
      className={`${archivo.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <div className="nastro">
          Bozza grafica — i testi sono di esempio, le immagini vanno al posto
          dei riquadri
        </div>
        <header className="testata">
          <div className="guscio testata-interna">
            <Link href="/" className="marchio">
              <span className="marchio-quadrato">
                <span className="marchio-zero">0</span>
              </span>
              <span className="marchio-nome">LIVELLO ZERO</span>
            </Link>
            <nav className="navigazione">
              <Link href="/approfondimenti">Approfondimenti</Link>
              <Link href="/recensioni">Recensioni</Link>
              <Link href="/consigli">Consigli</Link>
              <Link href="/riflessioni">Riflessioni</Link>
              <Link href="/classifiche">Classifiche</Link>
              <Link href="/chi-sono">Chi sono</Link>
            </nav>
            <InterruttoreTema />
          </div>
        </header>
        <main>{children}</main>
        <footer className="guscio piede">
          <p>Livello Zero — progetto editoriale indipendente</p>
          <div className="piede-link">
            <Link href="/progetto">Progetto</Link>
            <Link href="/chi-sono">Chi sono</Link>
            <a href="#">Instagram</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
