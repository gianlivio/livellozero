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
 * Se aggiungi una sezione, aggiungila anche qui, in tutte e due le lingue —
 * la verifica se ne accorge, perche' controlla che il menu e le sezioni vere
 * vadano d'accordo.
 *
 * In inglese lo stesso problema sta un livello piu' giu': /en/[categoria]
 * prende qualunque /en/<parola>. Lo stesso rimedio, con in piu' l'intestazione
 * x-lingua: la 404 la scrive global-not-found, che cosi' sa di doverla
 * scrivere in inglese.
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
  "en",
  "admin",
  "api",
  "next",
  "_next",
]);

/** Il secondo livello sotto /en: le cinque sezioni e le pagine fisse. */
const SECONDO_LIVELLO_EN = new Set([
  "deep-dives",
  "reviews",
  "news",
  "opinions",
  "rankings",
  "articles",
  "search",
  "about",
  "project",
]);

function versoIl404(request: NextRequest, lingua?: "en") {
  const intestazioni = new Headers(request.headers);
  if (lingua) intestazioni.set("x-lingua", lingua);
  return NextResponse.rewrite(new URL("/_rotta/inesistente", request.url), {
    request: { headers: intestazioni },
  });
}

export function proxy(request: NextRequest) {
  const segmenti = request.nextUrl.pathname.split("/").filter(Boolean);

  if (segmenti[0] === "en" && segmenti.length >= 2) {
    // /en/<parola>: se non e' una sezione o una pagina inglese, 404 in inglese.
    if (segmenti.length === 2) {
      const secondo = segmenti[1];
      if (secondo.includes(".") || SECONDO_LIVELLO_EN.has(secondo)) {
        return NextResponse.next();
      }
      return versoIl404(request, "en");
    }
    // Piu' in basso esiste solo /en/articles/<slug>. Tutto il resto sarebbe
    // un 404 del router, ma in italiano: lo si manda alla 404 inglese.
    if (segmenti.length === 3 && segmenti[1] === "articles") {
      return NextResponse.next();
    }
    return versoIl404(request, "en");
  }

  // Solo gli indirizzi di un segmento solo finiscono in [categoria]: tutto il
  // resto o ha una rotta sua o e' gia' un 404 del router.
  if (segmenti.length !== 1) return NextResponse.next();

  const primo = segmenti[0];
  // Col punto e' un file (logo.png, favicon.ico, sitemap.xml): non si tocca.
  if (primo.includes(".") || PRIMO_LIVELLO.has(primo)) return NextResponse.next();

  // Due segmenti, non uno: un indirizzo di un segmento solo se lo riprenderebbe
  // [categoria], ed e' proprio quello da cui stiamo scappando.
  return versoIl404(request);
}
