import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import CampoRicerca from "./CampoRicerca";
import Marchio from "./Marchio";
import InterruttoreTema from "./InterruttoreTema";
import "./globals.css";

/**
 * La cornice del sito — font, testata, piede — sta qui e non nel layout
 * perche' serve a due radici diverse: il layout di (frontend) e la
 * global-not-found, che per forza di cose il layout non ce l'ha.
 */

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

export const classiFont = `${archivo.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`;

export const scriptTema = `(function () {
  try {
    var tema = localStorage.getItem("tema");
    if (tema === "chiaro" || tema === "scuro") {
      document.documentElement.dataset.tema = tema;
    }
  } catch (e) {}
})();`;

export function Testata() {
  return (
    <header className="testata">
      <div className="guscio testata-interna">
        <Link href="/" className="marchio">
          <Marchio />
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
        <CampoRicerca />
        <InterruttoreTema />
      </div>
    </header>
  );
}

export function Piede() {
  return (
    <footer className="guscio piede">
      <p>Livello Zero — progetto editoriale indipendente</p>
      <div className="piede-link">
        <Link href="/progetto">Progetto</Link>
        <Link href="/chi-sono">Chi sono</Link>
        <a href="#">Instagram</a>
      </div>
    </footer>
  );
}
