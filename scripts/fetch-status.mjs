import { writeFileSync, mkdirSync } from "fs";

const API_URL ="https://ccm.artesp.sp.gov.br/metroferroviario/api/status/?artesp_only=true";
const API_KEY = process.env.CCM_API;

const OUT_PATH = "public/data/status-linhas.json";
const MANIFEST = "public/data/status-manifest.json";

try {
  console.log("[fetch-status] Buscando API ARTESP...");

  if (!API_KEY) { //
    throw new Error("CCM_API não encontrada.");
  }

  console.log("[fetch-status] CCM_API carregada:", !!API_KEY);

  const res = await fetch(API_URL, {
  headers: {
    Authorization: `Api-Key ${API_KEY.trim()}`
  }
  });
  console.log(API_KEY.length);
  console.log(API_KEY);
  console.log("[fetch-status] HTTP:", res.status);

  if (!res.ok) {
    const body = await res.text();
    console.error("[fetch-status] Resposta da API:");
    console.error(body);
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();

  mkdirSync("public/data", { recursive: true });

  writeFileSync(
    OUT_PATH,
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  writeFileSync(
    MANIFEST,
    JSON.stringify({ t: Date.now() }, null, 2),
    "utf-8"
  );

  console.log(
    `[fetch-status] Salvo em ${OUT_PATH} — ${
      data.meta?.total_linhas ?? "?"
    } linhas`
  );

} catch (err) {
  console.error("[fetch-status] Erro:", err);

  // Mantém o último JSON válido
  process.exit(1);
}