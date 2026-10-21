import type { Metadata } from "next";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getPayload } from "payload";
import config from "@/payload.config";
import { percorsi } from "@/lib/lingue";
import { haTesto, immagineDa, leggiChiSono } from "@/lib/pagine";
import { baseSito } from "@/lib/sito";
import { testi } from "@/lib/testi";

export const metadata: Metadata = {
  title: testi().titoloPagina(testi().chiSono),
  description: testi().chiSonoDescrizione,
};

export default async function ChiSonoPagina() {
  const t = testi();
  const pagina = await leggiChiSono();
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
    })
  ).docs[0];
  const fotoAutore = autore ? immagineDa(autore.foto) : null;

  const datiStrutturati = autore && {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: new URL(percorsi().chiSono, baseSito).toString(),
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
        <h1>{pagina.titolo}</h1>
        {haTesto(pagina.testo) && <RichText data={pagina.testo!} />}
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
