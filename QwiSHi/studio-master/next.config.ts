import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://9000-firebase-studio-1752801687242.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev',
      'https://6000-firebase-studio-1752801687242.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev'
    ],
  },
};

export default nextConfig;
