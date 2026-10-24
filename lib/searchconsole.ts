import { createSign } from "node:crypto";
import { unstable_cache } from "next/cache";

/**
 * I dati di Google Search Console per il riquadro del pannello.
 *
 * Niente googleapis: per due chiamate basta firmare un JWT con la chiave
 * dell'account di servizio e scambiarlo con un token d'accesso.
 */

/** Prima la proprieta' di dominio; se l'account non la vede, quella per prefisso. */
const PROPRIETA = ["sc-domain:livellozero.games", "https://livellozero.games/"];

/** Search Console e' indietro di 2-3 giorni: i periodi a giorni finiscono tre
 *  giorni fa, se no gli ultimi giorni sarebbero vuoti e i 28 giorni
 *  diventerebbero 25. */
const RITARDO = 3;

/** Search Console conserva 16 mesi di dati: oltre non si puo' chiedere. */
const MESI_CONSERVATI = 16;

/** Le date si scelgono e si mostrano in ora italiana. Google ragiona in ora
 *  del Pacifico: le date della richiesta e le ore della risposta sono li'. */
const FUSO_ITALIA = "Europe/Rome";
const FUSO_GOOGLE = "America/Los_Angeles";

// ---------------------------------------------------------------- periodi

export type Periodo =
  | "24o"
  | "7g"
  | "28g"
  | "3m"
  | "6m"
  | "12m"
  | "16m"
  | "personalizzato";

/** Le voci del selettore, nell'ordine dell'interfaccia di Search Console. */
export const PERIODI: { valore: Periodo; nome: string }[] = [
  { valore: "24o", nome: "Ultime 24 ore" },
  { valore: "7g", nome: "Ultimi 7 giorni" },
  { valore: "28g", nome: "Ultimi 28 giorni" },
  { valore: "3m", nome: "Ultimi 3 mesi" },
  { valore: "6m", nome: "Ultimi 6 mesi" },
  { valore: "12m", nome: "Ultimi 12 mesi" },
  { valore: "16m", nome: "Ultimi 16 mesi" },
  { valore: "personalizzato", nome: "Personalizzato" },
];

export const PERIODO_PREDEFINITO: Periodo = "28g";

/**
 * Un periodo pronto per l'API. A giorni: date di inizio e fine comprese. A
 * ore: un intervallo di istanti, [inizio, fine), che l'API copre chiedendo
 * i giorni del Pacifico in cui cade.
 */
export type Intervallo =
  | { tipo: "giorni"; dal: string; al: string }
  | { tipo: "ore"; inizio: string; fine: string };

/** Un giorno (AAAA-MM-GG) cosi' com'e' in quel fuso in quell'istante. */
function giornoIn(fuso: string, istante: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(istante);
}

function scomponi(giorno: string): [number, number, number] {
  const [a, m, g] = giorno.split("-").map(Number);
  return [a, m, g];
}

function aggiungiGiorni(giorno: string, quanti: number): string {
  const [a, m, g] = scomponi(giorno);
  return new Date(Date.UTC(a, m - 1, g + quanti)).toISOString().slice(0, 10);
}

/** Lo stesso giorno N mesi prima; se quel mese e' piu' corto, il suo ultimo. */
function togliMesi(giorno: string, quanti: number): string {
  const [a, m, g] = scomponi(giorno);
  const primo = new Date(Date.UTC(a, m - 1 - quanti, 1));
  const ultimo = new Date(
    Date.UTC(primo.getUTCFullYear(), primo.getUTCMonth() + 1, 0)
  ).getUTCDate();
  return new Date(
    Date.UTC(primo.getUTCFullYear(), primo.getUTCMonth(), Math.min(g, ultimo))
  )
    .toISOString()
    .slice(0, 10);
}

/** Vero se e' una data AAAA-MM-GG che esiste davvero (niente 31 febbraio). */
function dataValida(giorno: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(giorno)) return false;
  return aggiungiGiorni(giorno, 0) === giorno;
}

/** La fine dei periodi a giorni: tre giorni fa, in UTC (lo stesso conto di
 *  prima del selettore, perche' i 28 giorni restino identici). */
function fineAGiorni(adesso: Date): string {
  return giorno(new Date(adesso.getTime() - RITARDO * 86_400_000));
}

/** I primi giorni dei periodi a mesi: dal giorno dopo lo stesso giorno di N
 *  mesi prima della fine. */
function inizioAMesi(fine: string, mesi: number): string {
  return aggiungiGiorni(togliMesi(fine, mesi), 1);
}

/**
 * Le date che il Personalizzato accetta: fino a oggi in Italia, e non prima
 * dell'inizio di "Ultimi 16 mesi", cosi' le due voci hanno lo stesso confine.
 */
export function limitiPersonalizzato(adesso = new Date()) {
  return {
    minimo: inizioAMesi(fineAGiorni(adesso), MESI_CONSERVATI),
    massimo: giornoIn(FUSO_ITALIA, adesso),
  };
}

const dataLeggibile = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Da quel che arriva dall'indirizzo del pannello al periodo da chiedere. Un
 * periodo sconosciuto vale come quello predefinito; un Personalizzato con
 * date sbagliate torna con il motivo, e l'API non si chiama.
 */
export function risolviPeriodo(
  periodo: string | undefined,
  dal: string | undefined,
  al: string | undefined,
  adesso = new Date()
): { periodo: Periodo; intervallo: Intervallo } | { periodo: Periodo; errore: string } {
  const scelto =
    PERIODI.find((p) => p.valore === periodo)?.valore ?? PERIODO_PREDEFINITO;

  if (scelto === "24o") {
    // Le 24 ore che finiscono all'inizio dell'ora attuale: le ultime ore
    // possono essere ancora vuote, Google le pubblica con qualche ora di ritardo.
    const fine = new Date(adesso);
    fine.setUTCMinutes(0, 0, 0);
    const inizio = new Date(fine.getTime() - 24 * 3_600_000);
    return {
      periodo: scelto,
      intervallo: { tipo: "ore", inizio: inizio.toISOString(), fine: fine.toISOString() },
    };
  }

  if (scelto === "personalizzato") {
    const { minimo, massimo } = limitiPersonalizzato(adesso);
    if (!dal || !al) {
      return { periodo: scelto, errore: "Scegli la data di inizio e quella di fine." };
    }
    if (!dataValida(dal) || !dataValida(al)) {
      return { periodo: scelto, errore: "Una delle due date non è valida." };
    }
    if (dal > massimo || al > massimo) {
      return { periodo: scelto, errore: "Le date non possono essere nel futuro." };
    }
    if (dal < minimo) {
      return {
        periodo: scelto,
        errore: `Search Console conserva i dati degli ultimi ${MESI_CONSERVATI} mesi: la data di inizio non può essere prima del ${dataLeggibile.format(new Date(`${minimo}T00:00:00Z`))}.`,
      };
    }
    if (dal > al) {
      return { periodo: scelto, errore: "La data di inizio è dopo quella di fine." };
    }
    return { periodo: scelto, intervallo: { tipo: "giorni", dal, al } };
  }

  const fineGiorno = fineAGiorni(adesso);
  const inizioGiorno = {
    "7g": aggiungiGiorni(fineGiorno, -6),
    "28g": aggiungiGiorni(fineGiorno, -27),
    "3m": inizioAMesi(fineGiorno, 3),
    "6m": inizioAMesi(fineGiorno, 6),
    "12m": inizioAMesi(fineGiorno, 12),
    "16m": inizioAMesi(fineGiorno, MESI_CONSERVATI),
  }[scelto];
  return {
    periodo: scelto,
    intervallo: { tipo: "giorni", dal: inizioGiorno, al: fineGiorno },
  };
}

export type Ricerca = {
  testo: string;
  click: number;
  impressioni: number;
  posizione: number;
};

export type DatiSearchConsole = {
  click: number;
  impressioni: number;
  /** Fra 0 e 1. */
  ctr: number;
  posizione: number;
  ricerche: Ricerca[];
  /** L'intervallo davvero chiesto a Google. */
  intervallo: Intervallo;
  /** Dati che Google sta ancora elaborando e che possono cambiare (le ore). */
  provvisori: boolean;
  proprieta: string;
};

type Credenziali = { client_email: string; private_key: string };

type Riga = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

function leggiCredenziali(): Credenziali {
  const grezzo = process.env.GSC_CREDENTIALS;
  if (!grezzo) throw new Error("GSC_CREDENTIALS non impostata");
  const json = JSON.parse(Buffer.from(grezzo, "base64").toString("utf8"));
  if (!json.client_email || !json.private_key) {
    throw new Error("GSC_CREDENTIALS non e' un account di servizio");
  }
  return json;
}

function base64url(dati: string | Buffer): string {
  return Buffer.from(dati).toString("base64url");
}

async function tokenAccesso(credenziali: Credenziali): Promise<string> {
  const adesso = Math.floor(Date.now() / 1000);
  const intestazione = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const contenuto = base64url(
    JSON.stringify({
      iss: credenziali.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: adesso,
      exp: adesso + 3600,
    })
  );
  const firma = createSign("RSA-SHA256")
    .update(`${intestazione}.${contenuto}`)
    .sign(credenziali.private_key, "base64url");

  const risposta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${intestazione}.${contenuto}.${firma}`,
    }),
    cache: "no-store",
  });
  if (!risposta.ok) {
    throw new Error(`token: ${risposta.status} ${await risposta.text()}`);
  }
  return (await risposta.json()).access_token;
}

class ErroreApi extends Error {
  constructor(
    readonly stato: number,
    messaggio: string
  ) {
    super(messaggio);
  }
}

async function interroga(
  token: string,
  proprieta: string,
  corpo: Record<string, unknown>
): Promise<Riga[]> {
  const risposta = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(proprieta)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(corpo),
      cache: "no-store",
    }
  );
  if (!risposta.ok) {
    throw new ErroreApi(
      risposta.status,
      `${proprieta}: ${risposta.status} ${await risposta.text()}`
    );
  }
  return (await risposta.json()).rows ?? [];
}

function giorno(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/** Le prime dieci ricerche per impressioni. L'API ordina per click: per
 *  avere quelle con piu' impressioni si prendono tutte e si riordinano qui. */
function primeDieci(righe: Ricerca[]): Ricerca[] {
  return righe
    .sort((a, b) => b.impressioni - a.impressioni || b.click - a.click)
    .slice(0, 10);
}

/**
 * Somma righe orarie in un totale. La posizione media di Google e' una media
 * per impressione: sommando le ore si pesa ciascuna con le sue impressioni.
 */
function somma(righe: Riga[]) {
  const click = righe.reduce((t, r) => t + r.clicks, 0);
  const impressioni = righe.reduce((t, r) => t + r.impressions, 0);
  const posizione = impressioni
    ? righe.reduce((t, r) => t + r.position * r.impressions, 0) / impressioni
    : 0;
  return { click, impressioni, ctr: impressioni ? click / impressioni : 0, posizione };
}

/** Un periodo a giorni: due query, totali e ricerche, con dati definitivi. */
async function perGiorni(
  token: string,
  proprieta: string,
  dal: string,
  al: string
) {
  const periodo = { startDate: dal, endDate: al };
  const [totali, perRicerca] = await Promise.all([
    interroga(token, proprieta, periodo),
    // Per un sito di queste dimensioni mille righe sono tutte.
    interroga(token, proprieta, { ...periodo, dimensions: ["query"], rowLimit: 1000 }),
  ]);
  const totale = totali[0];
  return {
    click: totale?.clicks ?? 0,
    impressioni: totale?.impressions ?? 0,
    ctr: totale?.ctr ?? 0,
    posizione: totale?.position ?? 0,
    ricerche: primeDieci(
      perRicerca.map((riga) => ({
        testo: riga.keys?.[0] ?? "",
        click: riga.clicks,
        impressioni: riga.impressions,
        posizione: riga.position,
      }))
    ),
    provvisori: false,
  };
}

/**
 * Le 24 ore. L'API non accetta un intervallo di ore: si chiedono i giorni del
 * Pacifico in cui cade, divisi per ora (dataState hourly_all, dimensione hour,
 * fino a 10 giorni indietro), e si tengono le ore dentro l'intervallo. Sono
 * dati provvisori: Google li sta ancora elaborando.
 */
async function perOre(
  token: string,
  proprieta: string,
  inizio: string,
  fine: string
) {
  const da = new Date(inizio);
  const a = new Date(fine);
  const periodo = {
    startDate: giornoIn(FUSO_GOOGLE, da),
    endDate: giornoIn(FUSO_GOOGLE, a),
    dataState: "hourly_all",
  };
  const dentro = (riga: Riga) => {
    const ora = new Date(riga.keys?.[0] ?? "");
    return ora >= da && ora < a;
  };
  const [orarie, orariePerRicerca] = await Promise.all([
    interroga(token, proprieta, { ...periodo, dimensions: ["hour"] }),
    interroga(token, proprieta, {
      ...periodo,
      dimensions: ["hour", "query"],
      rowLimit: 25000,
    }),
  ]);

  const perTesto = new Map<string, Riga[]>();
  for (const riga of orariePerRicerca.filter(dentro)) {
    const testo = riga.keys?.[1] ?? "";
    perTesto.set(testo, [...(perTesto.get(testo) ?? []), riga]);
  }

  return {
    ...somma(orarie.filter(dentro)),
    ricerche: primeDieci(
      [...perTesto].map(([testo, righe]) => {
        const { click, impressioni, posizione } = somma(righe);
        return { testo, click, impressioni, posizione };
      })
    ),
    provvisori: true,
  };
}

/** La chiamata vera, senza cache e senza rete di sicurezza: se qualcosa va
 *  storto lancia. Esportata per poterla provare da riga di comando; senza
 *  argomenti chiede gli ultimi 28 giorni, come prima del selettore. */
export async function interrogaSearchConsole(
  intervallo: Intervallo = (
    risolviPeriodo(PERIODO_PREDEFINITO, undefined, undefined) as {
      intervallo: Intervallo;
    }
  ).intervallo
): Promise<DatiSearchConsole> {
  const token = await tokenAccesso(leggiCredenziali());

  let ultimoErrore: unknown;
  for (const proprieta of PROPRIETA) {
    try {
      const dati =
        intervallo.tipo === "ore"
          ? await perOre(token, proprieta, intervallo.inizio, intervallo.fine)
          : await perGiorni(token, proprieta, intervallo.dal, intervallo.al);
      return { ...dati, intervallo, proprieta };
    } catch (errore) {
      // Solo "non hai accesso a questa proprieta'" fa passare alla prossima;
      // qualunque altro errore vale anche per l'altra forma.
      if (!(errore instanceof ErroreApi) || ![403, 404].includes(errore.stato)) {
        throw errore;
      }
      ultimoErrore = errore;
    }
  }
  throw ultimoErrore;
}

/**
 * Una voce di cache per ogni intervallo: unstable_cache mette gli argomenti
 * nella chiave. A giorni sei ore, perche' i dati di Google cambiano una volta
 * al giorno e con giorni di ritardo. Le 24 ore al massimo un'ora: l'intervallo
 * cambia a ogni ora, e con lui la chiave.
 * L'errore lancia dentro la cache, cosi' non ci resta: al prossimo giro si
 * riprova invece di tenere "non disponibili" fino alla scadenza.
 */
const aGiorni = unstable_cache(interrogaSearchConsole, ["search-console", "giorni"], {
  revalidate: 6 * 60 * 60,
});
const aOre = unstable_cache(interrogaSearchConsole, ["search-console", "ore"], {
  revalidate: 60 * 60,
});

export async function datiSearchConsole(
  intervallo: Intervallo
): Promise<DatiSearchConsole | null> {
  try {
    return await (intervallo.tipo === "ore" ? aOre : aGiorni)(intervallo);
  } catch (errore) {
    console.error("Search Console non disponibile:", errore);
    return null;
  }
}
