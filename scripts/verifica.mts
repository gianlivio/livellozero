/**
 * Verifica il sito pubblicato: chiede le pagine vere a un'installazione vera e
 * controlla che ci sia dentro quello che ci deve essere. Non tocca il codice e
 * non ha bisogno del database: guarda solo l'HTML che arriva.
 *
 *   npm run verifica                          — controlla la produzione
 *   SITO=http://localhost:3000 npm run verifica  — controlla un'altra copia
 *
 * Esce con codice 1 se qualcosa non va, cosi' serve anche da controllo
 * automatico dopo un rilascio.
 */

const BASE = (process.env.SITO ?? "https://livellozero.vercel.app").replace(/\/$/, "");

/** Le cinque sezioni. Tenute qui a mano apposta: se il sito ne mostrasse una
 *  in piu' o in meno il controllo sulla navigazione se ne accorge. */
const CATEGORIE = [
  "approfondimenti",
  "recensioni",
  "consigli",
  "riflessioni",
  "classifiche",
];

/** Quante richieste in volo insieme quando si controllano le immagini. */
const PARALLELE = 8;

// ---------------------------------------------------------------- resoconto

let passati = 0;
let falliti = 0;

function esito(ok: boolean, titolo: string, dettaglio = ""): void {
  if (ok) passati++;
  else falliti++;
  const segno = ok ? "  ok  " : " ROTTO";
  console.log(`${segno}  ${titolo}${dettaglio ? `  — ${dettaglio}` : ""}`);
}

function sezione(titolo: string): void {
  console.log(`\n── ${titolo} ${"─".repeat(Math.max(0, 58 - titolo.length))}`);
}

// ------------------------------------------------------------------ rete

type Risposta = { stato: number; html: string; url: string; errore?: string };

async function prendi(percorso: string): Promise<Risposta> {
  const url = percorso.startsWith("http") ? percorso : `${BASE}${percorso}`;
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "verifica-livellozero" },
    });
    return { stato: r.status, html: await r.text(), url };
  } catch (e) {
    return { stato: 0, html: "", url, errore: (e as Error).message };
  }
}

/** Per le immagini basta lo stato: il corpo si butta senza scaricarlo tutto. */
async function stato(url: string): Promise<number> {
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "verifica-livellozero" },
    });
    await r.body?.cancel();
    return r.status;
  } catch {
    return 0;
  }
}

async function aCoppie<T, R>(
  elementi: T[],
  quante: number,
  lavoro: (e: T) => Promise<R>
): Promise<R[]> {
  const risultati: R[] = new Array(elementi.length);
  let prossimo = 0;
  await Promise.all(
    Array.from({ length: Math.min(quante, elementi.length) }, async () => {
      while (prossimo < elementi.length) {
        const i = prossimo++;
        risultati[i] = await lavoro(elementi[i]);
      }
    })
  );
  return risultati;
}

// ------------------------------------------------------------- lettura HTML

/** Il ritaglio fra due marcatori, per cercare dentro un pezzo solo di pagina. */
function fra(html: string, da: RegExp, a: string): string {
  const inizio = html.search(da);
  if (inizio === -1) return "";
  const fine = html.indexOf(a, inizio);
  return html.slice(inizio, fine === -1 ? html.length : fine);
}

function slugArticoli(html: string): string[] {
  const trovati = html.matchAll(/href="\/articoli\/([^"#?]+)"/g);
  return [...new Set([...trovati].map((m) => m[1]))];
}

/** Ogni indirizzo d'immagine citato nella pagina: src e tutte le voci di
 *  srcset, che next/image riempie di varianti a larghezze diverse. */
function immagini(html: string): string[] {
  const urls: string[] = [];
  for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
    const src = tag[0].match(/\bsrc="([^"]+)"/);
    if (src) urls.push(src[1]);
    const srcset = tag[0].match(/\bsrcset="([^"]+)"/);
    if (srcset) {
      for (const voce of srcset[1].split(",")) {
        const indirizzo = voce.trim().split(/\s+/)[0];
        if (indirizzo) urls.push(indirizzo);
      }
    }
  }
  return urls.map(scioglieEntita);
}

function scioglieEntita(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function assoluto(url: string): string {
  return url.startsWith("http") ? url : `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** L'immagine originale dietro a /_next/image?url=…: se il media di partenza
 *  non c'e' piu', l'ottimizzatore lo nasconde e conviene chiederlo diretto. */
function originale(url: string): string | null {
  const m = url.match(/[?&]url=([^&]+)/);
  if (!m) return null;
  const grezzo = decodeURIComponent(m[1]);
  return grezzo.startsWith("http") || grezzo.startsWith("/") ? grezzo : null;
}

// ------------------------------------------------------------------- prove

const daControllare = new Set<string>();
function raccogliImmagini(html: string): void {
  for (const u of immagini(html)) {
    daControllare.add(assoluto(u));
    const o = originale(u);
    if (o) daControllare.add(assoluto(o));
  }
}

console.log(`Verifica di ${BASE}`);

// ---- home
sezione("Home");
const home = await prendi("/");
esito(home.stato === 200, "home risponde 200", home.errore ?? `stato ${home.stato}`);
const slugHome = slugArticoli(home.html);
esito(slugHome.length > 0, "home contiene almeno un articolo", `${slugHome.length} link ad articoli`);
raccogliImmagini(home.html);

// ---- il marchio nella testata
sezione("Marchio");
const testata = fra(home.html, /<header\b/, "</header>");
esito(testata !== "", "la testata c'e'");
// Il componente Marchio non mette classi: si riconosce dal file a cui punta,
// che next/image nasconde dentro il parametro url= gia' codificato.
const imgMarchio = [...testata.matchAll(/<img\b[^>]*>/g)]
  .map((tag) => tag[0])
  .find((tag) => /logo\.png/i.test(scioglieEntita(tag)));
esito(
  imgMarchio !== undefined,
  "il logo nella testata c'e'",
  imgMarchio ? "" : "nessuna <img> che punti a logo.png"
);
if (imgMarchio) {
  for (const u of immagini(imgMarchio)) {
    daControllare.add(assoluto(u));
    const o = originale(u);
    if (o) daControllare.add(assoluto(o));
  }
}
const statoPng = await stato(`${BASE}/logo.png`);
esito(statoPng === 200, "/logo.png raggiungibile", `stato ${statoPng}`);

// ---- categorie
sezione("Categorie");
const navigazione = fra(home.html, /<nav\b[^>]*class="[^"]*navigazione/, "</nav>");
for (const categoria of CATEGORIE) {
  const p = await prendi(`/${categoria}`);
  esito(p.stato === 200, `/${categoria} risponde 200`, p.errore ?? `stato ${p.stato}`);
  raccogliImmagini(p.html);
  for (const s of slugArticoli(p.html)) slugHome.push(s);
}
const nelMenu = [...navigazione.matchAll(/href="\/([a-z-]+)"/g)].map((m) => m[1]);
const sconosciute = nelMenu.filter(
  (c) => !CATEGORIE.includes(c) && !["chi-sono", "progetto", "cerca"].includes(c)
);
esito(sconosciute.length === 0, "nessuna sezione nel menu fuori dall'elenco", sconosciute.join(", "));

// ---- articoli
sezione("Articoli");
const slug = [...new Set(slugHome)];
esito(slug.length > 0, "trovati articoli da controllare", `${slug.length} articoli`);

let conIndice = 0;
for (const s of slug) {
  const p = await prendi(`/articoli/${s}`);
  if (p.stato !== 200) {
    esito(false, `/articoli/${s} risponde 200`, p.errore ?? `stato ${p.stato}`);
    continue;
  }
  raccogliImmagini(p.html);

  const corpo = /class="[^"]*articolo-corpo/.test(p.html);
  const condivisione = /class="[^"]*condivisione/.test(p.html);
  // L'indice compare solo da tre sezioni in su: sotto non serve a niente.
  const sezioni = [...p.html.matchAll(/<h2\s+id="/g)].length;
  const indice = /class="[^"]*articolo-indice/.test(p.html);
  const indiceDovuto = sezioni >= 3;
  if (indice) conIndice++;

  const mancanti = [
    !corpo && "corpo",
    !condivisione && "condivisione",
    indiceDovuto && !indice && `indice (${sezioni} sezioni)`,
  ].filter(Boolean);

  esito(
    mancanti.length === 0,
    `/articoli/${s}`,
    mancanti.length ? `manca: ${mancanti.join(", ")}` : `${sezioni} sezioni, indice ${indice ? "si" : "no (sotto soglia)"}`
  );
}
esito(conIndice > 0, "almeno un articolo mostra l'indice a lato", `${conIndice} su ${slug.length}`);

// ---- ricerca
sezione("Ricerca");
const trovata = await prendi("/cerca?q=kingdom");
esito(trovata.stato === 200, "/cerca?q=kingdom risponde 200", `stato ${trovata.stato}`);
esito(
  /Risultati per/.test(trovata.html) && slugArticoli(trovata.html).length > 0,
  "/cerca?q=kingdom trova risultati",
  `${slugArticoli(trovata.html).length} articoli`
);
raccogliImmagini(trovata.html);

const vuota = await prendi("/cerca?q=zzzz");
esito(vuota.stato === 200, "/cerca?q=zzzz risponde 200", `stato ${vuota.stato}`);
esito(/Nessun articolo trovato/.test(vuota.html), "/cerca?q=zzzz dice che non trova nulla");

// ---- paginazione
sezione("Paginazione");
for (const percorso of ["/?pagina=2", "/cerca?q=kingdom&pagina=2", ...CATEGORIE.map((c) => `/${c}?pagina=2`)]) {
  const p = await prendi(percorso);
  esito(p.stato === 200, `${percorso} risponde senza errori`, p.errore ?? `stato ${p.stato}`);
  raccogliImmagini(p.html);
}

// ---- pagine ferme
sezione("Pagine");
for (const percorso of ["/chi-sono", "/progetto"]) {
  const p = await prendi(percorso);
  esito(p.stato === 200, `${percorso} risponde 200`, p.errore ?? `stato ${p.stato}`);
  raccogliImmagini(p.html);
}

// ---- 404
sezione("Pagina inesistente");
const persa = await prendi("/questa-pagina-non-esiste-di-sicuro-42");
esito(persa.stato === 404, "un indirizzo inesistente risponde 404", `stato ${persa.stato}`);
const categorieIn404 = CATEGORIE.filter((c) => persa.html.includes(`href="/${c}"`));
esito(
  categorieIn404.length === CATEGORIE.length,
  "la 404 mostra le categorie",
  `${categorieIn404.length} su ${CATEGORIE.length}`
);

// ---- pannello
sezione("Pannello");
const admin = await prendi("/admin");
esito(admin.stato === 200, "/admin risponde 200", admin.errore ?? `stato ${admin.stato}`);

// ---- immagini
sezione("Immagini");
const lista = [...daControllare];
console.log(`  ..    ${lista.length} indirizzi da controllare`);
const stati = await aCoppie(lista, PARALLELE, stato);
const rotte = lista.filter((_, i) => stati[i] !== 200);
esito(rotte.length === 0, "tutte le immagini rispondono 200", `${rotte.length} rotte su ${lista.length}`);
for (const [i, u] of lista.entries()) {
  if (stati[i] !== 200) console.log(`        ${stati[i] || "errore"}  ${u}`);
}

// ---------------------------------------------------------------- chiusura

console.log(`\n${"─".repeat(62)}`);
console.log(`${passati} a posto, ${falliti} da sistemare`);
process.exit(falliti > 0 ? 1 : 0);
