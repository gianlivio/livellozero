import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve a global-not-found.tsx: senza, la 404 non finisce nell'HTML.
  experimental: {
    globalNotFound: true,
  },
  images: {
    // AVIF prima di WebP: a parita' di peso tiene molto meglio le sfumature
    // scure e i cieli degli screenshot, che a 75 in WebP si vedono a scalini.
    // Chi non lo supporta ricade su WebP come prima.
    formats: ["image/avif", "image/webp"],
    // Da Next 16 le qualita' ammesse vanno dichiarate qui, se no /_next/image
    // risponde 400. 75 resta il valore di serie (logo, foto di servizio); 90 e'
    // quello che chiedono copertine e immagini nel corpo.
    qualities: [75, 90],
    // I valori di serie senza 2048 e 3840: nessuna immagine del sito ha un
    // riquadro cosi' largo, e ogni voce in meno e' una variante in meno nello
    // srcset da generare e da verificare. imageSizes resta quello di serie.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pjpcqykbggilmepp.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
