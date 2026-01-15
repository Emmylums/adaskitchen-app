import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Increase the limit for asset inlining (default is 4096 = 4kb)
    // This prevents small PNGs from being converted to base64
    assetsInlineLimit: 0, // Set to 0 to disable inlining completely
    
    // Optimize for Vercel deployment
    rollupOptions: {
      output: {
        // Better asset naming for debugging
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop()
          // Keep original names for images for easier debugging
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
            return `assets/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        // Split chunks better
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Ensure assets are served correctly
  base: './',
  // Optimize for production
  esbuild: {
    drop: ['console', 'debugger'],
  }
})