import type { Metadata } from "next";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { haTesto, immagineDa, leggiChiSono } from "@/lib/pagine";

export const metadata: Metadata = {
  title: "Chi sono — Livello Zero",
  description:
    "Chi scrive Livello Zero e perché racconta come nascono i videogiochi.",
};

export default async function ChiSonoPagina() {
  const pagina = await leggiChiSono();
  const foto = immagineDa(pagina.foto);

  return (
    <section className="guscio pagina-chi-sono">
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
                Instagram
              </a>
            )}
            {pagina.email && <a href={`mailto:${pagina.email}`}>Email</a>}
          </div>
        )}
      </div>
    </section>
  );
}
