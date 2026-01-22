/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'bcrypt', 'jsonwebtoken' ],
  },
};

export default nextConfig;
