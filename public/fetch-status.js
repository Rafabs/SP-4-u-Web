import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const API_URL = 'https://ccm.artesp.sp.gov.br/metroferroviario/api/status/';
const OUT_PATH = 'public/data/status-linhas.json';
const MANIFEST_PATH = 'public/data/status-manifest.json';
const REQUEST_TIMEOUT_MS = 15000;

const FALLBACK_STATUS = Object.freeze({
  meta: {
    source: 'fallback',
    timestamp: new Date().toISOString(),
  },
  empresas: [],
});

function ensureOutputDir() {
  mkdirSync(dirname(OUT_PATH), { recursive: true });
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function writeManifest() {
  writeJson(MANIFEST_PATH, { t: Date.now() });
}

function countLines(data) {
  return data.empresas?.reduce((total, empresa) => total + (empresa.linhas?.length ?? 0), 0) ?? 0;
}

async function fetchStatus() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function persistStatus(data) {
  ensureOutputDir();
  writeJson(OUT_PATH, data);
  writeManifest();
}

try {
  console.log('[fetch-status] Buscando API ARTESP...');

  const data = await fetchStatus();
  persistStatus(data);

  const totalLines = data.meta?.total_linhas ?? (countLines(data) || '?');
  console.log(`[fetch-status] Salvo em ${OUT_PATH} - ${totalLines} linhas`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error('[fetch-status] Erro:', message);
  // Fallback mínimo para manter o build previsível quando a API estiver indisponível.
  persistStatus(FALLBACK_STATUS);
  process.exitCode = 0;
}