import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
     // @ts-expect-error - React Compiler is experimental and types might be outdated
     reactCompiler: true,
     optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion', '@radix-ui/react-icons', 'recharts'],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
