import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
     optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion', '@radix-ui/react-icons', 'recharts'],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
