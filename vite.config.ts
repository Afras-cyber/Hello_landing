
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const buildTimestamp = Date.now();

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      isDev && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ['@supabase/supabase-js', '@supabase/postgrest-js'],
    },
    define: {
      // Fix for CommonJS/ESM compatibility
      global: 'globalThis',
      __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    build: {
      // Extreme code splitting for minimal initial bundle
      rollupOptions: {
        output: {
          manualChunks: {
            // Ultra-minimal vendor chunk
            vendor: ['react', 'react-dom'],
            // Everything else in separate chunks
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-slot'],
            charts: ['recharts'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            supabase: ['@supabase/supabase-js'],
            query: ['@tanstack/react-query'],
            utils: ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
            icons: ['lucide-react']
          },
          // Optimize chunk naming with timestamps for cache busting
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'vendor') return `v-${buildTimestamp}.[hash].js`;
            return `[name]-${buildTimestamp}.[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return `s-${buildTimestamp}.[hash].css`;
            }
            return `a/[name]-${buildTimestamp}.[hash][extname]`;
          },
          entryFileNames: `[name]-${buildTimestamp}.[hash].js`,
        }
      },
      // Ultra-aggressive optimization
      target: 'esnext',
      minify: 'esbuild',
      // Force very small chunks
      chunkSizeWarningLimit: 200,
      // Disable compression reporting for speed
      reportCompressedSize: false,
      // Additional optimizations
      cssCodeSplit: true,
      sourcemap: false,
      // Reduce CSS
      cssMinify: 'esbuild'
    },
    // Fix for recharts/lodash module resolution issues
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@supabase/supabase-js',
        '@supabase/postgrest-js',
        // Force pre-bundling of lodash modules to fix recharts imports
        'lodash/get',
        'lodash/isString',
        'lodash/isNaN',
        'lodash/isNumber',
        'lodash/isArray',
        'lodash/isObject',
        'lodash/isFunction',
        'lodash/isUndefined',
        'lodash/isNull'
      ],
      exclude: [
        // Exclude everything else from initial bundle
        '@tanstack/react-query',
        'react-router-dom',
        'lucide-react',
        '@radix-ui/react-dialog',
        '@radix-ui/react-tabs'
      ],
      esbuildOptions: {
        // Handle CommonJS to ESM conversion
        target: 'esnext',
        format: 'esm'
      }
    },
    base: '/',
  };
});
