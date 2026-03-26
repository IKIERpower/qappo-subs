/**
 * Post-build script: patches .open-next/worker.js
 * to add a `scheduled()` handler for Cloudflare Cron Triggers.
 *
 * Cloudflare cron calls scheduled(), which internally
 * calls our /api/cron/check-renewals route via the fetch handler.
 */
import { readFileSync, writeFileSync } from 'fs';

const WORKER_PATH = '.open-next/worker.js';

try {
  let code = readFileSync(WORKER_PATH, 'utf-8');

  // The scheduled handler code to inject
  const scheduledHandler = `
// --- CRON SCHEDULED HANDLER (injected by patch-worker.mjs) ---
`;

  // Pattern 1: export { varName as default }
  const pattern1 = /export\s*\{\s*(\w+)\s+as\s+default\s*\}/;
  // Pattern 2: export default varName;
  const pattern2 = /export\s+default\s+(\w+)\s*;?\s*$/m;

  let match = code.match(pattern1);
  if (match) {
    const varName = match[1];
    const patch = `
${scheduledHandler}
const __origHandler = ${varName};
const __patchedHandler = {
  fetch: __origHandler.fetch ? __origHandler.fetch.bind(__origHandler) : __origHandler.bind ? __origHandler.bind(null) : __origHandler,
  async scheduled(controller, env, ctx) {
    console.log('[CRON] scheduled() triggered, calling /api/cron/check-renewals...');
    try {
      const request = new Request('http://localhost/api/cron/check-renewals');
      const fetchFn = __origHandler.fetch ? __origHandler.fetch.bind(__origHandler) : __origHandler;
      const response = await fetchFn(request, env, ctx);
      const body = await response.text();
      console.log('[CRON] Status:', response.status, 'Body:', body.substring(0, 500));
    } catch (error) {
      console.error('[CRON] Error:', error);
    }
  }
};
export { __patchedHandler as default }`;
    code = code.replace(pattern1, patch);
    writeFileSync(WORKER_PATH, code);
    console.log('✅ Patched worker.js with scheduled handler (pattern: export { X as default })');
    process.exit(0);
  }

  match = code.match(pattern2);
  if (match) {
    const varName = match[1];
    const patch = `
${scheduledHandler}
${varName}.scheduled = async function(controller, env, ctx) {
  console.log('[CRON] scheduled() triggered, calling /api/cron/check-renewals...');
  try {
    const request = new Request('http://localhost/api/cron/check-renewals');
    const response = await ${varName}.fetch(request, env, ctx);
    const body = await response.text();
    console.log('[CRON] Status:', response.status, 'Body:', body.substring(0, 500));
  } catch (error) {
    console.error('[CRON] Error:', error);
  }
};
export default ${varName};`;
    code = code.replace(pattern2, patch);
    writeFileSync(WORKER_PATH, code);
    console.log('✅ Patched worker.js with scheduled handler (pattern: export default X)');
    process.exit(0);
  }

  // Pattern 3: just append if no match (fallback)
  code += `
${scheduledHandler}
if (typeof globalThis.__worker !== 'undefined' && globalThis.__worker.fetch) {
  globalThis.__worker.scheduled = async function(controller, env, ctx) {
    console.log('[CRON] scheduled() triggered (fallback)...');
    const request = new Request('http://localhost/api/cron/check-renewals');
    const response = await globalThis.__worker.fetch(request, env, ctx);
    console.log('[CRON] Status:', response.status);
  };
}
`;
  writeFileSync(WORKER_PATH, code);
  console.log('⚠️ Patched worker.js with scheduled handler (fallback pattern)');
  process.exit(0);

} catch (error) {
  console.error('❌ Failed to patch worker.js:', error.message);
  process.exit(1);
}

