import { reactRouter } from '@react-router/dev/vite';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Make local .env files available to server loaders without exposing secrets in client defines.
  for (const key of [
    'SITE_URL',
    'PUBLIC_LAUNCH',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'GOOGLE_MAPS_BROWSER_KEY',
    'GOOGLE_MAPS_SERVER_KEY',
  ]) {
    if (process.env[key] === undefined && env[key] !== undefined)
      process.env[key] = env[key];
  }
  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
        // Resolve CSS entrypoints as files in both client and SSR environments.
        tailwindcss: fileURLToPath(
          new URL('./node_modules/tailwindcss/index.css', import.meta.url),
        ),
        'tw-animate-css': fileURLToPath(
          new URL(
            './node_modules/tw-animate-css/dist/tw-animate.css',
            import.meta.url,
          ),
        ),
        'shadcn/tailwind.css': fileURLToPath(
          new URL('./node_modules/shadcn/dist/tailwind.css', import.meta.url),
        ),
      },
    },
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(
        process.env.SITE_URL || env.SITE_URL || 'https://bulkaway.com',
      ),
    },
    plugins: [reactRouter()],
  };
});
