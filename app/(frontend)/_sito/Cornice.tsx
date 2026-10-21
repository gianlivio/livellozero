import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { CATEGORIE, percorsoCategoria } from "@/lib/articoli";
import {
  altraLingua,
  inLingua,
  LINGUA_PREDEFINITA,
  percorsi,
  type Lingua,
} from "@/lib/lingue";
import { testi } from "@/lib/testi";
import CampoRicerca from "./CampoRicerca";
import Marchio from "./Marchio";
import InterruttoreTema from "./InterruttoreTema";
import SelettoreLingua from "./SelettoreLingua";
import "./globals.css";

/**
 * La cornice del sito — font, testata, piede — sta qui e non nel layout
 * perche' serve a piu' radici: il layout di (it) e la global-not-found, che
 * per forza di cose il layout non ce l'ha.
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

export function Testata({
  lingua = LINGUA_PREDEFINITA,
}: {
  lingua?: Lingua;
}) {
  const t = testi(lingua);
  const p = percorsi(lingua);
  return (
    <header className="testata">
      <div className="guscio testata-interna">
        <Link href={p.home} className="marchio">
          <Marchio />
          <span className="marchio-nome">LIVELLO ZERO</span>
        </Link>
        <nav className="navigazione">
          {CATEGORIE.map((categoria) => (
            <Link
              href={percorsoCategoria(categoria.chiave, lingua)}
              key={categoria.chiave}
            >
              {inLingua(categoria.nome, lingua)}
            </Link>
          ))}
          <Link href={p.chiSono}>{t.chiSono}</Link>
        </nav>
        <CampoRicerca lingua={lingua} />
        <SelettoreLingua
          verso={altraLingua(lingua)}
          home={percorsi(altraLingua(lingua)).home}
          testo={t.selettoreLingua}
          etichetta={t.selettoreEtichetta}
          linguaEtichetta={t.selettoreEtichettaLingua}
        />
        <InterruttoreTema etichetta={t.cambiaTema} />
      </div>
    </header>
  );
}

export function Piede({ lingua = LINGUA_PREDEFINITA }: { lingua?: Lingua }) {
  const t = testi(lingua);
  const p = percorsi(lingua);
  return (
    <footer className="guscio piede">
      <p>{t.piede}</p>
      <div className="piede-link">
        <Link href={p.progetto}>{t.progetto}</Link>
        <Link href={p.chiSono}>{t.chiSono}</Link>
        <a href="#">{t.instagram}</a>
      </div>
    </footer>
  );
}
