/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Optimized images never change at the same URL, so cache them for 31
    // days instead of Next's 60-second default. Stops browsers re-checking
    // every image on every visit and Vercel re-encoding them constantly.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
