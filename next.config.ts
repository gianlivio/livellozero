import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
