import { createElement, Fragment, type ReactNode } from "react";
import { inLingua, LINGUA_PREDEFINITA, type Lingua, type PerLingua } from "./lingue";

/**
 * I testi fissi dell'interfaccia. Quelli con un valore dentro sono funzioni:
 * ogni lingua mette le parole nell'ordine suo.
 *
 * Le funzioni che finiscono nella pagina restituiscono un frammento con gli
 * stessi pezzi che scriverebbe il JSX ("Pagina ", 2, " di ", 5) invece di una
 * stringa sola: React separa i pezzi nell'HTML, e cosi' la pagina resta
 * identica a quando i testi stavano scritti nei componenti.
 */
function pezzi(...parti: ReactNode[]): ReactNode {
  return createElement(Fragment, null, ...parti);
}

const TESTI = {
  it: {
    // titoli e descrizioni della scheda del browser e di Google
    titoloPagina: (titolo: string) => `${titolo} — Livello Zero`,
    titoloSito: "Livello Zero — come nascono i videogiochi",
    descrizioneSito:
      "Approfondimenti, recensioni e consigli sui videogiochi, con attenzione a come vengono progettati e realizzati.",

    // testata e piede
    chiSono: "Chi sono",
    progetto: "Progetto",
    instagram: "Instagram",
    piede: "Livello Zero — progetto editoriale indipendente",
    cambiaTema: "Cambia tema",

    // ricerca
    cerca: "Cerca",
    cercaSegnaposto: "Cerca un articolo",
    cercaEtichetta: "Cerca fra gli articoli",
    cercaIstruzioni:
      "Scrivi una parola nel campo in alto: la cerco nei titoli e nei sommari degli articoli pubblicati.",
    cercaNessuno: (termine: string) =>
      pezzi("Nessun articolo trovato per «", termine, "»."),
    cercaRisultati: (termine: string) => pezzi("Risultati per «", termine, "»."),

    // elenchi
    paginazione: "Pagine dell'elenco",
    piuRecenti: "Più recenti",
    piuVecchi: "Più vecchi",
    statoPagina: (pagina: number, totale: number) =>
      pezzi("Pagina ", pagina, " di ", totale),
    immagineArticolo: "immagine articolo",
    sezioneVuota: "Ancora nessun articolo in questa sezione.",

    // home
    immagineApertura: "immagine di apertura",
    inArrivo: "in arrivo",
    sitoInPartenza: "Il sito sta per partire",
    primiArticoli: "I primi articoli arrivano a breve.",
    ultimiArticoli: "Ultimi articoli",
    altriArticoli: "Altri articoli",
    tempoLettura: (minuti: number) => pezzi("Lettura da ", minuti, " minuti"),
    scrivimi: "Scrivimi",
    sostieni: "Sostieni il progetto",

    // articolo
    home: "Home",
    firma: (nome: string) => pezzi("di ", nome),
    metaArticolo: (data: string, minuti: number) =>
      pezzi(data, " — Lettura da ", minuti, " minuti"),
    indice: "Indice",
    indiceEtichetta: "Indice dell'articolo",
    condividi: "Condividi",
    condividiEtichetta: "Condividi l'articolo",
    copiaLink: "Copia link",
    copiato: "Copiato",
    email: "Email",
    foto: "foto",

    // chi sono e progetto
    chiSonoDescrizione:
      "Chi scrive Livello Zero e perché racconta come nascono i videogiochi.",
    progettoTitolo: "Il progetto",
    progettoDescrizione: "Cos'è Livello Zero e come è nato.",
    offrimiCaffe: "Offrimi un caffè",

    // 404
    nonEsiste: "Questa pagina non esiste",
    nonEsisteRiga:
      "Forse l'articolo è stato spostato, o l'indirizzo è sbagliato.",
    nonEsisteDescrizione:
      "L'indirizzo che hai aperto non corrisponde a nessuna pagina.",
    categorie: "Categorie",
  },
} satisfies PerLingua<object>;

export type Testi = (typeof TESTI)["it"];

export function testi(lingua: Lingua = LINGUA_PREDEFINITA): Testi {
  return inLingua<Testi>(TESTI, lingua);
}
