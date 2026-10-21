/**
 * Verifica il sito pubblicato: chiede le pagine vere a un'installazione vera e
 * controlla che ci sia dentro quello che ci deve essere. Non tocca il codice e
 * non ha bisogno del database: guarda solo l'HTML che arriva.
 *
 *   npm run verifica                                  — controlla la produzione
 *   npm run verifica -- https://<anteprima>.vercel.app  — controlla un'altra copia
 *   SITO=http://localhost:3000 npm run verifica          — lo stesso, da variabile
 *
 * Sitemap, robots e hreflang devono citare sempre il dominio pubblico, anche
 * quando si controlla un'altra copia: DOMINIO=... se e' un altro.
 *
 * Esce con codice 1 se qualcosa non va, cosi' serve anche da controllo
 * automatico dopo un rilascio.
 */

const BASE = (process.argv[2] ?? process.env.SITO ?? "https://livellozero.vercel.app").replace(/\/$/, "");

/** Il dominio che sitemap e robots devono citare, qualunque copia si stia
 *  controllando: anche in locale gli indirizzi sono quelli pubblici. */
const DOMINIO = (process.env.DOMINIO ?? "https://livellozero.games").replace(/\/$/, "");

/** Le cinque sezioni. Tenute qui a mano apposta: se il sito ne mostrasse una
 *  in piu' o in meno il controllo sulla navigazione se ne accorge. */
const CATEGORIE = [
  "approfondimenti",
  "recensioni",
  "consigli",
  "riflessioni",
  "classifiche",
];

/** Le stesse cinque, in inglese, sotto /en. */
const CATEGORIE_EN = ["deep-dives", "reviews", "news", "opinions", "rankings"];

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

/** Una cosa da sapere che non e' un errore: non conta nel resoconto. */
function nota(titolo: string, dettaglio = ""): void {
  console.log(`  nota  ${titolo}${dettaglio ? `  — ${dettaglio}` : ""}`);
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

function slugArticoliEn(html: string): string[] {
  const trovati = html.matchAll(/href="\/en\/articles\/([^"#?]+)"/g);
  return [...new Set([...trovati].map((m) => m[1]))];
}

/** L'HTML senza gli script: quello che si vede anche senza JavaScript. */
function senzaScript(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/g, "");
}

function linguaDi(html: string): string {
  return html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1] ?? "";
}

function noindex(html: string): boolean {
  return /<meta name="robots" content="[^"]*noindex/.test(html);
}

function ogLocale(html: string): string {
  return html.match(/<meta property="og:locale" content="([^"]+)"/)?.[1] ?? "";
}

/** L'href dell'hreflang di quella lingua, o "" se la pagina non ce l'ha. */
function hreflang(html: string, lingua: string): string {
  const tag = [...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/g)]
    .map((m) => m[0])
    .find((t) => t.includes(`hrefLang="${lingua}"`) || t.includes(`hreflang="${lingua}"`));
  return scioglieEntita(tag?.match(/href="([^"]+)"/)?.[1] ?? "");
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

// ---- lingue
sezione("Lingue");

// L'italiano dichiara la sua lingua.
for (const percorso of ["/", "/chi-sono", ...(slug[0] ? [`/articoli/${slug[0]}`] : [])]) {
  const p = await prendi(percorso);
  esito(
    linguaDi(p.html) === "it" && ogLocale(p.html) === "it_IT",
    `${percorso} ha lang="it" e og:locale it_IT`,
    `lang="${linguaDi(p.html)}" og:locale="${ogLocale(p.html)}"`
  );
}

// Le pagine inglesi rispondono tutte, in inglese. Home e sezioni sono in
// noindex se e solo se non hanno articoli; la ricerca lo e' sempre.
const pagineEn = ["/en", ...CATEGORIE_EN.map((c) => `/en/${c}`), "/en/about", "/en/project", "/en/search"];
const enIndicizzabili: string[] = [];
const slugEn = new Set<string>();
let homeEn = "";
for (const percorso of pagineEn) {
  const p = await prendi(percorso);
  if (percorso === "/en") homeEn = p.html;
  const elencati = slugArticoliEn(p.html);
  elencati.forEach((s) => slugEn.add(s));
  const ni = noindex(p.html);
  if (!ni) enIndicizzabili.push(percorso);
  esito(
    p.stato === 200 && linguaDi(p.html) === "en" && ogLocale(p.html) === "en_US",
    `${percorso} risponde 200 in inglese`,
    `stato ${p.stato}, lang="${linguaDi(p.html)}", og:locale="${ogLocale(p.html)}"`
  );
  if (percorso === "/en/search") {
    esito(ni, `${percorso} e' in noindex`);
  } else if (percorso === "/en" || CATEGORIE_EN.some((c) => percorso === `/en/${c}`)) {
    esito(
      ni === (elencati.length === 0),
      `${percorso}: noindex solo se senza articoli`,
      `${elencati.length} articoli, ${ni ? "noindex" : "indicizzabile"}`
    );
  } else {
    nota(`${percorso} e' ${ni ? "in noindex (nessun testo inglese)" : "indicizzabile"}`);
  }
}
const menuEn = fra(homeEn, /<nav\b[^>]*class="[^"]*navigazione/, "</nav>");
const sezioniNelMenuEn = CATEGORIE_EN.filter((c) => menuEn.includes(`href="/en/${c}"`));
esito(
  sezioniNelMenuEn.length === CATEGORIE_EN.length,
  "il menu inglese ha le cinque sezioni inglesi",
  `${sezioniNelMenuEn.length} su ${CATEGORIE_EN.length}`
);

for (const s of slugEn) {
  const p = await prendi(`/en/articles/${s}`);
  esito(
    p.stato === 200 && linguaDi(p.html) === "en" && !noindex(p.html),
    `/en/articles/${s} risponde 200, in inglese, indicizzabile`,
    `stato ${p.stato}, lang="${linguaDi(p.html)}"`
  );
}
if (slugEn.size === 0) nota("nessun articolo inglese pubblicato: niente da controllare");

// Il selettore di lingua c'e' in tutte e due le testate. Senza JavaScript
// porta alla home dell'altra lingua; la gemella la sceglie nel browser.
for (const [percorso, html, attesa] of [["/", home.html, "/en"], ["/en", homeEn, "/"]] as const) {
  const selettore = fra(html, /<a\b[^>]*class="selettore-lingua"/, "</a>");
  const href = selettore.match(/href="([^"]+)"/)?.[1] ?? "";
  esito(selettore !== "" && href === attesa, `${percorso}: selettore di lingua verso ${attesa}`, selettore ? `href="${href}"` : "manca");
}

// hreflang reciproco: se una pagina dichiara la gemella, la gemella risponde,
// e' indicizzabile, dichiara a sua volta la prima, e x-default e' l'italiano.
const pagineIt = ["/", ...CATEGORIE.map((c) => `/${c}`), "/chi-sono", "/progetto", ...slug.map((s) => `/articoli/${s}`)];
let coppie = 0;
const conGemellaIt = new Set<string>();
for (const percorso of pagineIt) {
  const it = await prendi(percorso);
  const versoEn = hreflang(it.html, "en");
  if (!versoEn) continue;
  coppie++;
  const percorsoEn = new URL(versoEn).pathname;
  conGemellaIt.add(percorsoEn);
  const en = await prendi(percorsoEn);
  const ritorno = hreflang(en.html, "it");
  const problemi = [
    new URL(versoEn).origin !== DOMINIO && `dominio ${new URL(versoEn).origin}`,
    en.stato !== 200 && `la gemella risponde ${en.stato}`,
    noindex(en.html) && "la gemella e' in noindex",
    (!ritorno || new URL(ritorno).pathname !== percorso) && "la gemella non rimanda indietro",
    hreflang(it.html, "x-default") !== hreflang(it.html, "it") && "x-default non e' l'italiano",
    hreflang(en.html, "x-default") !== ritorno && "x-default della gemella non e' l'italiano",
  ].filter(Boolean);
  esito(problemi.length === 0, `hreflang ${percorso} <-> ${percorsoEn}`, problemi.join(", "));
}
if (coppie === 0) nota("nessuna pagina italiana ha una gemella inglese");
// E al contrario: ogni pagina inglese indicizzabile ha la sua gemella italiana.
const senzaGemella = [...enIndicizzabili, ...[...slugEn].map((s) => `/en/articles/${s}`)].filter(
  (p) => !conGemellaIt.has(p)
);
esito(
  senzaGemella.length === 0,
  "ogni pagina inglese indicizzabile e' gemella di una pagina italiana",
  senzaGemella.join(", ")
);

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

const persaEn = await prendi("/en/this-page-does-not-exist-42");
esito(persaEn.stato === 404, "un indirizzo inglese inesistente risponde 404", `stato ${persaEn.stato}`);
esito(
  linguaDi(persaEn.html) === "en" && /This page doesn(&#x27;|')t exist/.test(senzaScript(persaEn.html)),
  "la 404 inglese e' in inglese, nell'HTML anche senza JavaScript",
  `lang="${linguaDi(persaEn.html)}"`
);

// Un articolo che non esiste risponde 404, ma Next manda l'HTML senza
// contenuto (notFound() dentro una pagina, con piu' layout radice): limite
// noto, segnalato e non contato come errore.
for (const percorso of ["/articoli/non-esiste-di-sicuro-42", "/en/articles/does-not-exist-42"]) {
  const p = await prendi(percorso);
  esito(p.stato === 404, `${percorso} risponde 404`, `stato ${p.stato}`);
  if (!/non esiste|doesn(&#x27;|')t exist/.test(senzaScript(p.html))) {
    nota(`${percorso}: la 404 non ha contenuto senza JavaScript`, "limite noto di Next");
  }
}

// ---- sitemap e robots
sezione("Sitemap e robots");
const mappa = await prendi("/sitemap.xml");
esito(mappa.stato === 200, "/sitemap.xml risponde 200", mappa.errore ?? `stato ${mappa.stato}`);
const indirizzi = [...mappa.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const fuoriDominio = indirizzi.filter((u) => new URL(u).origin !== DOMINIO);
esito(
  indirizzi.length > 0 && fuoriDominio.length === 0,
  `la sitemap usa solo ${DOMINIO}`,
  fuoriDominio.length ? fuoriDominio.slice(0, 3).join(", ") : `${indirizzi.length} indirizzi`
);
const percorsi = new Set(indirizzi.map((u) => new URL(u).pathname));
const attesi = ["/", ...CATEGORIE.map((c) => `/${c}`), "/chi-sono", "/progetto", ...slug.map((s) => `/articoli/${s}`)];
const assenti = attesi.filter((p) => !percorsi.has(p));
esito(assenti.length === 0, "la sitemap contiene home, categorie, pagine e articoli", assenti.length ? `mancano: ${assenti.join(", ")}` : `${attesi.length} su ${attesi.length}`);
const vietati = indirizzi.filter((u) => /\/(cerca|admin|search)(\/|$)|\?/.test(u));
esito(vietati.length === 0, "la sitemap non contiene ricerca, /admin o querystring", vietati.join(", "));

// In inglese: dentro tutte e sole le pagine indicizzabili, e ciascuna con la
// gemella italiana dichiarata (xhtml:link hreflang="it").
const enAttesi = [...enIndicizzabili, ...[...slugEn].map((s) => `/en/articles/${s}`)];
const enAssenti = enAttesi.filter((p) => !percorsi.has(p));
esito(enAssenti.length === 0, "la sitemap contiene le pagine inglesi indicizzabili", enAssenti.length ? `mancano: ${enAssenti.join(", ")}` : `${enAttesi.length} pagine`);
const enInMappa = [...percorsi].filter((p) => p === "/en" || p.startsWith("/en/"));
const enDiTroppo: string[] = [];
for (const p of enInMappa.filter((p) => !enAttesi.includes(p))) {
  const r = await prendi(p);
  if (r.stato !== 200 || noindex(r.html)) enDiTroppo.push(p);
}
esito(enDiTroppo.length === 0, "la sitemap non contiene pagine inglesi in noindex o rotte", enDiTroppo.join(", "));
const voci = [...mappa.html.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
const enSenzaGemella = voci
  .filter((v) => /<loc>[^<]*\/en(\/|<)/.test(v))
  .filter((v) => !/hreflang="it"/.test(v))
  .map((v) => v.match(/<loc>([^<]+)/)?.[1]);
esito(enSenzaGemella.length === 0, "nella sitemap ogni pagina inglese dichiara la gemella italiana", enSenzaGemella.join(", "));

const robot = await prendi("/robots.txt");
esito(robot.stato === 200, "/robots.txt risponde 200", robot.errore ?? `stato ${robot.stato}`);
const divieti = ["/admin", "/api", "/cerca", "/en/search"].filter((p) => !robot.html.includes(`Disallow: ${p}`));
esito(divieti.length === 0, "robots.txt vieta /admin, /api, /cerca e /en/search", divieti.length ? `mancano: ${divieti.join(", ")}` : "");
esito(
  robot.html.includes(`Sitemap: ${DOMINIO}/sitemap.xml`),
  "robots.txt indica la sitemap sul dominio giusto",
  robot.html.match(/Sitemap: .*/)?.[0] ?? "nessuna riga Sitemap"
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
