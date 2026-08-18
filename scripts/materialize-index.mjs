import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { patchApprovedOverview } from "./patch-approved-overview.mjs";

const parts = readdirSync("source")
  .filter((name) => /^index\.part[0-9]+[a-z]?\.b64$/.test(name))
  .sort();

if (!parts.length) throw new Error("Frontend empacotado não encontrado.");

const encoded = parts.map((name) => readFileSync(`source/${name}`, "utf8").trim()).join("");
let html = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");

// Mantém a experiência aprovada da v40 na Visão Geral, preservando os
// recursos operacionais novos abaixo dela e sem trazer dados editoriais
// de volta para o frontend.
html = patchApprovedOverview(html);

// A Central usa refresh() como orquestrador de renderização, mas uma versão
// empacotada anterior perdeu essa função. Mantemos o fallback no build.
const initMarker = "initializeSharedApp();";
if (!html.includes("function refresh(){")) {
  if (!html.includes(initMarker)) throw new Error("Ponto de inicialização do frontend não encontrado.");
  html = html.replace(
    initMarker,
    "function refresh(){\n  refreshWithoutCalendarRebuild();\n}\n\n" + initMarker
  );
}

mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html);
console.log(`Central Adapta: public/index.html materializado (${Buffer.byteLength(html)} bytes).`);
