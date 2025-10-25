await import('./src/env.js');

const shouldAnalyzeBundles = process.env.ANALYZE === 'true';

/** @type {import('next').NextConfig} */
let nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Referrer-Policy',
                        value: 'no-referrer-when-downgrade',
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                ],
            },
            {
                source: '/embed/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: 'frame-ancestors *',
                    },
                ],
            },
        ];
    },
    output: 'standalone',
    turbopack: {
        // Turbopack configuration
        // Turbopack automatically handles Node.js module exclusions on the client side
    },
};

if (shouldAnalyzeBundles) {
    console.log('📦📦📦 ANALYZING BUNDLES 📦📦📦');
    const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
        enabled: true,
    });
    nextConfig = withBundleAnalyzer(nextConfig);
}

export default nextConfig;
