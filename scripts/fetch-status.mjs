import { writeFileSync, mkdirSync } from "fs";

const API_URL = "https://ccm.artesp.sp.gov.br/metroferroviario/api/status/";
const OUT_PATH = "public/data/status-linhas.json";

try {
  console.log("[fetch-status] Buscando API ARTESP...");
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  mkdirSync("public/data", { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log(`[fetch-status] Salvo em ${OUT_PATH} — ${data.meta?.total_linhas ?? "?"} linhas`);
} catch (err) {
  console.error("[fetch-status] Erro:", err.message);
  mkdirSync("public/data", { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify({ empresas: [] }), "utf-8");
  process.exit(0);
}