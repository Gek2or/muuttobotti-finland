import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/moving-jarvenpää",
        destination: "/moving-jarvenpaa",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
