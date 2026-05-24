// vite.config.ts - OPTIMIZED FOR VERCEL HOBBY PLAN
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    build: {
      // ✅ Enable minification for smaller bundles
      minify: 'esbuild',
      
      // ✅ Disable source maps in production (reduces size by 30-50%)
      sourcemap: false,
      
      // ✅ Optimize chunks to reduce initial bundle
      rollupOptions: {
        output: {
          // Split large libraries into separate chunks
          manualChunks: (id) => {
            // Vendor libraries
            if (id.includes('node_modules')) {
              // Split Radix UI components
              if (id.includes('@radix-ui')) {
                return 'radix-ui';
              }
              
              // Split chart library
              if (id.includes('recharts')) {
                return 'recharts';
              }
              
              // Split form libraries
              if (id.includes('react-hook-form') || id.includes('zod')) {
                return 'forms';
              }
              
              // Everything else goes to vendor
              return 'vendor';
            }
          },
          
          // Optimize async chunks
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: '[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          
          // Use IIFE format (slightly smaller than UMD)
          format: 'es',
        },
        
        // Optimize external dependencies
        external: [],
        
        // Tree-shake unused code
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
          propertyReadSideEffects: false,
        },
      },
      
      // ✅ Reduce CSS size
      cssMinify: true,
      cssCodeSplit: true,
      
      // ✅ Set appropriate chunk size targets
      // Default is 500KB, lower = more files but less per-function
      chunkSizeWarningLimit: 1000,
      
      // ✅ Enable compression
      commonjsOptions: {
        transformMixedEsModules: true,
        ignoreDynamicRequires: true,
      },
      
      // ✅ Target modern JS (smaller output)
      target: 'esnext',
      
      // ✅ Reduce report verbosity
      reportCompressed: false,
    },
    
    // Optimization at dev time
    optimizeDeps: {
      // Pre-bundle heavy dependencies
      include: [
        'react',
        'react-dom',
        '@tanstack/react-router',
        '@tanstack/react-query',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
      ],
      
      // Exclude large deps that don't need pre-bundling
      exclude: ['@tanstack/react-start'],
    },
  },
});
