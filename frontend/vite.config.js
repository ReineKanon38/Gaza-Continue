import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('react-router') || id.includes('history')) {
            return 'router';
          }

          if (
            id.includes('chart.js') ||
            id.includes('react-chartjs-2')
          ) {
            return 'charts';
          }

          if (id.includes('react-bootstrap') || id.includes('bootstrap')) {
            return 'bootstrap';
          }

          if (id.includes('react-icons')) {
            return 'icons';
          }

          return 'vendor';
        }
      }
    }
  }
})
