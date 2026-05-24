import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  console.log(`Vite mode: ${mode}, serving: ${process.env.SERVING}`)
  const isServe = process.env.SERVING || false
  return {
    server: { host: '0.0.0.0' },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
    },
    build: {
      emptyOutDir: true,
      manifest: true,
      rollupOptions: {
        input: {
          hc2: path.resolve(__dirname, 'src/hc2.js'),
          'hc-tailwind': path.resolve(__dirname, 'src/assets/css/hc-tailwind.css'),
          'hc-common': path.resolve(__dirname, 'src/assets/css/hc-common.scss'),
        },
        output: isServe ? {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'hc-tailwind.css') {
              return 'assets/hc-tailwind.css'
            }
            if (assetInfo.name === 'hc-common.css') {
              return 'assets/hc-common.css'
            }
            return 'assets/[name].[ext]'
          }
        } : {}
      },
    },    
  }
})
