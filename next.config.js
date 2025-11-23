// ============================================
// THE CONCLAVE REALM - Next.js 14 Configuration (Modern)
// /next.config.js
// LUXURY PERFORMANCE + SECURITY
// ============================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================
  // CORE SETTINGS
  // ============================================
  reactStrictMode: true,
  
  // SWC Minification (faster than Terser)
  swcMinify: true,
  
  // Turbopack for dev (Next.js 14 feature)
  // Remove if using Next.js 13
  ...(process.env.NODE_ENV === 'development' && {
    // Enable Turbopack for faster dev builds
    experimental: {
      turbo: {},
    },
  }),
  
  // ============================================
  // COMPILER OPTIMIZATIONS
  // ============================================
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    
    // Emotion support (if using)
    // emotion: true,
    
    // Styled-components support (if using)
    // styledComponents: true,
  },
  
  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  images: {
    // Allowed image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
    ],
    
    // Modern formats
    formats: ['image/avif', 'image/webp'],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes for optimization
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    
    // Disable static imports in production (optional)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // ============================================
  // ENVIRONMENT VARIABLES (Public)
  // ============================================
  env: {
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_ENABLE_PARTICLES: process.env.NEXT_PUBLIC_ENABLE_PARTICLES,
    NEXT_PUBLIC_ENABLE_SOUNDS: process.env.NEXT_PUBLIC_ENABLE_SOUNDS,
    NEXT_PUBLIC_ENABLE_ANIMATIONS: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS,
  },
  
  // ============================================
  // SECURITY HEADERS
  // ============================================
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://cdn.discordapp.com https://media.discordapp.net",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://discord.com https://vitals.vercel-insights.com",
              "media-src 'self' blob: data:",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // API routes with CORS
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_SITE_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: [
              'X-CSRF-Token',
              'X-Requested-With',
              'Accept',
              'Accept-Version',
              'Content-Length',
              'Content-MD5',
              'Content-Type',
              'Date',
              'X-Api-Version',
              'Authorization',
            ].join(', '),
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/Assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/Assets/Fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // E-books - no cache (track downloads)
        source: '/Assets/E-Books/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // ============================================
  // REDIRECTS
  // ============================================
  async redirects() {
    return [
      {
        source: '/discord',
        destination: process.env.DISCORD_INVITE_LINK || 'https://discord.gg/pbTnTxqS38',
        permanent: false,
      },
      {
        source: '/join',
        destination: '/gateway',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/chambers/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/gateway',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/gateway',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/throne-room',
        permanent: true,
      },
      {
        source: '/mod',
        destination: '/sanctum',
        permanent: true,
      },
    ];
  },
  
  // ============================================
  // REWRITES (Proxy routes)
  // ============================================
  async rewrites() {
    return [
      // Discord API proxy (optional - use if needed)
      // {
      //   source: '/discord-api/:path*',
      //   destination: 'https://discord.com/api/:path*',
      // },
    ];
  },
  
  // ============================================
  // WEBPACK CONFIGURATION
  // ============================================
  webpack: (config, { isServer, dev }) => {
    // Fix for packages that depend on Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }
    
    // Audio files loader
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/audio/[name].[hash][ext]',
      },
    });
    
    // Video files loader
    config.module.rules.push({
      test: /\.(mp4|webm|ogv)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/video/[name].[hash][ext]',
      },
    });
    
    // EPUB/PDF files
    config.module.rules.push({
      test: /\.(epub|pdf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/ebooks/[name].[hash][ext]',
      },
    });
    
    // SVG as React components (optional)
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    // Bundle analyzer (dev only)
    if (!dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // ============================================
  // OUTPUT CONFIGURATION
  // ============================================
  output: 'standalone', // For Docker deployment
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Generate ETags for caching
  generateEtags: true,
  
  // Compress responses
  compress: true,
  
  // ============================================
  // PAGE EXTENSIONS
  // ============================================
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  
  // ============================================
  // EXPERIMENTAL FEATURES (Next.js 14)
  // ============================================
  experimental: {
    // Server Actions
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', ''),
      ].filter(Boolean),
    },
    
    // Optimize CSS
    optimizeCss: true,
    
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@/components/ui',
      '@/components/pathways',
    ],
    
    // Memory optimization
    workerThreads: false,
    cpus: 1,
    
  },
  
  // ============================================
  // TYPESCRIPT (if using)
  // ============================================
  typescript: {
    // Ignore type errors during build (not recommended)
    // ignoreBuildErrors: false,
  },
  
  // ============================================
  // ESLint (if using)
  // ============================================
  eslint: {
    // Ignore ESLint errors during build (not recommended)
    // ignoreDuringBuilds: false,
    
    // Directories to lint
    dirs: ['src', 'pages', 'components', 'lib', 'hooks'],
  },
  
  // ============================================
  // STATIC EXPORT (if needed)
  // ============================================
  // output: 'export', // Uncomment for static export
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  
  // ============================================
  // LOGGING
  // ============================================
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

module.exports = nextConfig;