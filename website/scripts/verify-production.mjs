import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

// Exercise the actual standalone server; never load local credentials or send mail.
const origin = 'http://127.0.0.1:8791';
const env = { ...process.env, PORT: '8791', HOST: '127.0.0.1', NODE_ENV: 'production', PUBLIC_LAUNCH: 'false', SITE_URL: origin, SMTP_PASS: '', GOOGLE_MAPS_BROWSER_KEY: '', GOOGLE_MAPS_SERVER_KEY: '', VERIFY_UNCONFIGURED_COVERAGE: 'true' };
const server = spawn(process.execPath, ['server.mjs'], { env, stdio: 'inherit' });
let exited = false;
server.once('exit', () => { exited = true; });
server.once('error', () => { exited = true; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (exited) throw new Error('Production server exited before becoming ready.');
    try { ready = (await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(800) })).ok; } catch { /* Still starting. */ }
    if (ready) break;
    await delay(500);
  }
  if (!ready) throw new Error('Production server health check timed out.');
  const checks = spawn(process.execPath, ['scripts/verify-http.mjs'], { env: { ...env, BASE_URL: origin }, stdio: 'inherit' });
  const code = await new Promise((resolve, reject) => { checks.once('error', reject); checks.once('exit', resolve); });
  if (code !== 0) throw new Error(`Production HTTP checks failed (${code}).`);
} finally {
  if (!exited) {
    server.kill('SIGTERM');
    await Promise.race([new Promise(resolve => server.once('exit', resolve)), delay(3000)]);
    if (!exited) server.kill('SIGKILL');
  }
}
