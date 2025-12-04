
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/sermon': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/translate': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/live': {
          target: 'ws://127.0.0.1:8000',
          ws: true,
        },
      },
      // Handle SPA client-side routing - serve index.html for all non-file routes
      historyApiFallback: true,
    },
  });