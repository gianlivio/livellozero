import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve a global-not-found.tsx: senza, la 404 non finisce nell'HTML.
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pjpcqykbggilmepp.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
