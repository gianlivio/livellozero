import type { Metadata } from "next";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { convertitoriTesto } from "./convertitori";
import { getPayload } from "payload";
import config from "@/payload.config";
import { NOINDEX, paginaFissaIndicizzabile } from "@/lib/indicizzabili";
import { percorsi, type Lingua } from "@/lib/lingue";
import { haTesto, immagineDa, leggiChiSono } from "@/lib/pagine";
import { alternati, baseSito } from "@/lib/sito";
import { testi } from "@/lib/testi";

/** Noindex e hreflang: le regole stanno in lib/indicizzabili.ts. */
export async function metadatiChiSono(lingua: Lingua): Promise<Metadata> {
  const t = testi(lingua);
  const [it, en] = await Promise.all([
    paginaFissaIndicizzabile("chiSono", "it"),
    paginaFissaIndicizzabile("chiSono", "en"),
  ]);
  const qui = lingua === "it" ? it : en;
  return {
    title: t.titoloPagina(t.chiSono),
    description: t.chiSonoDescrizione,
    ...(!qui && NOINDEX),
    alternates: alternati({
      it: it ? percorsi("it").chiSono : null,
      en: en ? percorsi("en").chiSono : null,
    }),
  };
}

export default async function PaginaChiSono({ lingua }: { lingua: Lingua }) {
  const t = testi(lingua);
  const pagina = await leggiChiSono(lingua);
  const foto = immagineDa(pagina.foto);

  // Per i dati strutturati: il global non ha il nome di chi scrive, l'autore
  // si'. Oggi ce n'e' uno solo; se diventassero di piu', vale il primo creato.
  const payload = await getPayload({ config: await config });
  const autore = (
    await payload.find({
      collection: "autori",
      sort: "createdAt",
      depth: 1,
      limit: 1,
      locale: lingua,
      fallbackLocale: false,
    })
  ).docs[0];
  const fotoAutore = autore ? immagineDa(autore.foto) : null;

  const datiStrutturati = autore && {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    inLanguage: lingua,
    url: new URL(percorsi(lingua).chiSono, baseSito).toString(),
    mainEntity: {
      "@type": "Person",
      name: autore.nome,
      ...(fotoAutore
        ? { image: new URL(fotoAutore.url!, baseSito).toString() }
        : {}),
      ...(autore.bio ? { description: autore.bio } : {}),
    },
  };

  return (
    <section className="guscio pagina-chi-sono">
      {datiStrutturati && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(datiStrutturati).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {foto && (
        <div className="chi-sono-foto">
          <Image
            src={foto.url!}
            alt={foto.alt ?? ""}
            width={foto.width ?? 400}
            height={foto.height ?? 400}
            sizes="(max-width: 760px) calc(100vw - 56px), 160px"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
      <div>
        {/* Il titolo del pannello solo con il testo nella stessa lingua:
            senza, arriva il valore predefinito del campo, che e' in italiano. */}
        <h1>{haTesto(pagina.testo) ? pagina.titolo : t.chiSono}</h1>
        {haTesto(pagina.testo) ? (
          <RichText data={pagina.testo!} converters={convertitoriTesto(lingua)} />
        ) : (
          <p>{t.paginaVuota}</p>
        )}
        {(pagina.instagram || pagina.email) && (
          <div className="chi-sono-contatti">
            {pagina.instagram && (
              <a
                href={`https://instagram.com/${pagina.instagram}`}
                rel="noreferrer"
                target="_blank"
              >
                {t.instagram}
              </a>
            )}
            {pagina.email && <a href={`mailto:${pagina.email}`}>{t.email}</a>}
          </div>
        )}
      </div>
    </section>
  );
}
