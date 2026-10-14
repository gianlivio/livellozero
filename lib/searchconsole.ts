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

const GIORNI = 28;

/** Search Console e' indietro di 2-3 giorni: il periodo finisce tre giorni fa,
 *  se no gli ultimi giorni sarebbero vuoti e i 28 giorni diventerebbero 25. */
const RITARDO = 3;

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
  dal: string;
  al: string;
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

/** La chiamata vera, senza cache e senza rete di sicurezza: se qualcosa va
 *  storto lancia. Esportata per poterla provare da riga di comando. */
export async function interrogaSearchConsole(): Promise<DatiSearchConsole> {
  const token = await tokenAccesso(leggiCredenziali());

  const fine = new Date(Date.now() - RITARDO * 86_400_000);
  const inizio = new Date(fine.getTime() - (GIORNI - 1) * 86_400_000);
  const periodo = { startDate: giorno(inizio), endDate: giorno(fine) };

  let ultimoErrore: unknown;
  for (const proprieta of PROPRIETA) {
    try {
      const [totali, perRicerca] = await Promise.all([
        interroga(token, proprieta, periodo),
        // L'API ordina per click: per avere le prime per impressioni si
        // prendono tutte e si riordinano qui. Per un sito di queste
        // dimensioni mille righe sono tutte.
        interroga(token, proprieta, {
          ...periodo,
          dimensions: ["query"],
          rowLimit: 1000,
        }),
      ]);

      const totale = totali[0];
      return {
        click: totale?.clicks ?? 0,
        impressioni: totale?.impressions ?? 0,
        ctr: totale?.ctr ?? 0,
        posizione: totale?.position ?? 0,
        ricerche: perRicerca
          .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)
          .slice(0, 10)
          .map((riga) => ({
            testo: riga.keys?.[0] ?? "",
            click: riga.clicks,
            impressioni: riga.impressions,
            posizione: riga.position,
          })),
        dal: periodo.startDate,
        al: periodo.endDate,
        proprieta,
      };
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

/** Sei ore: i dati di Google cambiano una volta al giorno, e con giorni di
 *  ritardo. L'errore lancia dentro la cache, cosi' non ci resta: al prossimo
 *  giro si riprova invece di tenere "non disponibili" per sei ore. */
const inCache = unstable_cache(interrogaSearchConsole, ["search-console"], {
  revalidate: 6 * 60 * 60,
});

export async function datiSearchConsole(): Promise<DatiSearchConsole | null> {
  try {
    return await inCache();
  } catch (errore) {
    console.error("Search Console non disponibile:", errore);
    return null;
  }
}
