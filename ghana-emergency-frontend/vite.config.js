import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist'),
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'socket.io-client'],
          'vendor-utils': ['axios'],
          
          // Component chunks
          'components-dashboard': [
            'src/components/dashboards/SystemAdminDashboard.jsx',
            'src/components/dashboards/HospitalAdminDashboard.jsx',
            'src/components/dashboards/PoliceAdminDashboard.jsx',
            'src/components/dashboards/FireAdminDashboard.jsx'
          ],
          'components-shared': [
            'src/components/shared/LiveMap.jsx',
            'src/components/shared/DispatchNotification.jsx',
            'src/components/shared/AllDispatchedIncidents.jsx'
          ],
        }
      }
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  }
})
