import { writeFileSync, mkdirSync } from "fs";

const TOKEN = process.env.SPTRANS_TOKEN;
const BASE_API = "https://api.olhovivo.sptrans.com.br/v2.1";
const OUT_PATH = "public/data/olhovivo-frota.json";

try {
  console.log("[olhovivo] Autenticando...");
  const authRes = await fetch(`${BASE_API}/Login/Autenticar?token=${TOKEN}`, { method: "POST" });
  const cookie = authRes.headers.get("set-cookie") ?? "";

  console.log("[olhovivo] Coletando empresas e posições...");
  const [empRes, posRes] = await Promise.all([
    fetch(`${BASE_API}/Empresa`, { headers: { Cookie: cookie } }),
    fetch(`${BASE_API}/Posicao`, { headers: { Cookie: cookie } })
  ]);

  const empData = await empRes.json();
  const posData = await posRes.json();

  const busPorArea = {};
  let totalGeralBus = 0;

  // Processa contagem de ônibus
  if (posData && posData.l) {
    posData.l.forEach(linha => {
      linha.vs?.forEach(veiculo => {
        totalGeralBus++;
        const prefixo = String(veiculo.p);
        const areaId = prefixo.charAt(0); 
        busPorArea[areaId] = (busPorArea[areaId] || 0) + 1;
      });
    });
  }

  // Monta áreas unificadas
  const areas = (empData.e ?? []).map(area => ({
    area: area.a,
    qtdOnibus: busPorArea[area.a] || 0,
    empresas: (area.e ?? []).map(e => ({ codigo: e.c, nome: e.n }))
  }));

  mkdirSync("public/data", { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify({
    horario: empData.hr,
    totalOnibus: totalGeralBus,
    areas,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log(`[olhovivo] Sucesso: ${totalGeralBus} ônibus rastreados.`);
} catch (err) {
  console.error("Erro no fetch:", err.message);
}