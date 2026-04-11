import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devPort = Number(env.VITE_DEV_SERVER_PORT || 5173);
  const backendOrigin = env.VITE_BACKEND_ORIGIN || 'http://localhost:5000';
  const apiProxyPath = env.VITE_API_PROXY_PATH || '/api';
  const uploadsProxyPath = env.VITE_UPLOADS_PROXY_PATH || '/uploads';

  return {
    plugins: [react()],
    server: {
      port: devPort,
      proxy: {
        [apiProxyPath]: {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        [uploadsProxyPath]: {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            animations: ['framer-motion'],
            charts: ['recharts'],
          },
        },
      },
    },
  };
});
