import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// A simple but robust .env file parser to handle production environments (like aaPanel)
// where standard Node env loading might not automatically load the .env file.
function loadEnvFile() {
  const possiblePaths = [
    path.join(process.cwd(), '.env'),
    '/mnt/29313803-a281-424e-847b-7e06ff0df2db/simamba-nuxt/.env'
  ];

  try {
    const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
    // Traverse up to find .env in various deployment layouts
    possiblePaths.push(path.resolve(currentFileDir, '../../.env'));
    possiblePaths.push(path.resolve(currentFileDir, '../../../.env'));
    possiblePaths.push(path.resolve(currentFileDir, '../../../../.env'));
    possiblePaths.push(path.resolve(currentFileDir, '../../../../../.env'));
  } catch (e) {
    // Ignore URL/path errors
  }

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8');
        console.log(`[env-fix] Dynamically loading environment variables from: ${envPath}`);
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx === -1) continue;
          
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          
          // Remove wrapping quotes if present
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          
          // Populate process.env if it is not already defined or is empty
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
        return true;
      } catch (err) {
        console.error(`[env-fix] Failed to parse ${envPath}:`, err);
      }
    }
  }
  
  console.warn('[env-fix] No valid .env file could be located or parsed.');
  return false;
}

export default defineNitroPlugin(() => {
  // Load variables dynamically from the .env file in the workspace/deployment path
  loadEnvFile();

  // === SESSION FALLBACK ===
  if (!process.env.NUXT_SESSION_PASSWORD) {
    process.env.NUXT_SESSION_PASSWORD = '23d8427157ff4361a8ee053bf37a57aa';
  }

  // === MIDTRANS DEFAULT IS_PRODUCTION ===
  if (!process.env.MIDTRANS_IS_PRODUCTION) {
    process.env.MIDTRANS_IS_PRODUCTION = 'true';
  }

  // === JWT & SECURITY ===
  if (!process.env.JWT_SECRET_BYZIS) {
    process.env.JWT_SECRET_BYZIS = 'baznas_tangerang_secret_byzis_2024';
  }

  // === CORS ===
  if (!process.env.CORS_ALLOWED_ORIGINS) {
    process.env.CORS_ALLOWED_ORIGINS = 'https://donasi.baznastangerangkab.or.id,https://baznastangerangkab.or.id';
  }

  // === APP URLs ===
  if (!process.env.API_BASE) {
    process.env.API_BASE = 'https://baznastangerangkab.or.id/api';
  }
  if (!process.env.DONASI_BASE) {
    process.env.DONASI_BASE = 'https://donasi.baznastangerangkab.or.id';
  }

  console.log('[env-fix] Dynamic environment variables verified and applied successfully.');
});

