import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * [categoria] e' un segmento dinamico: si prende qualunque indirizzo di una
 * parola sola, e per quelli che non sono sezioni vere chiama notFound(). Ma
 * notFound() non riesce a finire nell'HTML servito (vedi il commento in
 * app/global-not-found.tsx), quindi qui gli indirizzi sconosciuti di primo
 * livello vengono mandati su una rotta che non esiste: il 404 lo serve il
 * router, che invece sa scriverlo nell'HTML.
 *
 * L'elenco sta scritto qui a mano apposta: il proxy gira fuori dal resto
 * dell'applicazione e importare lib/articoli si tirerebbe dietro Payload.
 * Se aggiungi una sezione, aggiungila anche qui — la verifica se ne accorge,
 * perche' controlla che il menu e le sezioni vere vadano d'accordo.
 */
const PRIMO_LIVELLO = new Set([
  "approfondimenti",
  "recensioni",
  "consigli",
  "riflessioni",
  "classifiche",
  "articoli",
  "cerca",
  "chi-sono",
  "progetto",
  "admin",
  "api",
  "next",
  "_next",
]);

export function proxy(request: NextRequest) {
  const segmenti = request.nextUrl.pathname.split("/").filter(Boolean);

  // Solo gli indirizzi di un segmento solo finiscono in [categoria]: tutto il
  // resto o ha una rotta sua o e' gia' un 404 del router.
  if (segmenti.length !== 1) return NextResponse.next();

  const primo = segmenti[0];
  // Col punto e' un file (logo.png, favicon.ico, sitemap.xml): non si tocca.
  if (primo.includes(".") || PRIMO_LIVELLO.has(primo)) return NextResponse.next();

  // Due segmenti, non uno: un indirizzo di un segmento solo se lo riprenderebbe
  // [categoria], ed e' proprio quello da cui stiamo scappando.
  return NextResponse.rewrite(new URL("/_rotta/inesistente", request.url));
}
