import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function normalizeApiBase(value: string | undefined) {
  const raw = value?.trim() || '';
  if (!raw) return '';

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('VITE_API_BASE must be a valid HTTPS API origin, such as https://api.example.com.');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_API_BASE must be an HTTPS origin only, without credentials, path, query, or fragment.');
  }
  return url.origin;
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiBase = normalizeApiBase(env.VITE_API_BASE);
  if (command === 'build' && mode === 'production' && !apiBase) {
    throw new Error('VITE_API_BASE is required for production builds. Set it to your HTTPS backend origin in Vercel project settings.');
  }

  return {
    plugins: [react()],
    base: '/',
    define: {
      'import.meta.env.VITE_API_BASE': JSON.stringify(apiBase),
    },
    server: { port: 5173 },
  };
});
