import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const EXACT_V40_SHA256 = "070251d0b7db5177262f50ef7b8b023f5d912d450bf18f309daa29855e758c11";
const EXACT_V40_SIZE = 345975;

const parts = readdirSync("source")
  .filter((name) => /^index\.part[0-9]+[a-z]?\.b64$/.test(name))
  .sort();

if (!parts.length) throw new Error("Frontend empacotado não encontrado.");

const encoded = parts
  .map((name) => readFileSync(`source/${name}`, "utf8").trim())
  .join("");

const html = gunzipSync(Buffer.from(encoded, "base64"));
const actualSha256 = createHash("sha256").update(html).digest("hex");

if (html.length !== EXACT_V40_SIZE) {
  throw new Error(`v40 rejeitada: tamanho ${html.length}, esperado ${EXACT_V40_SIZE}.`);
}

if (actualSha256 !== EXACT_V40_SHA256) {
  throw new Error(`v40 rejeitada: SHA-256 ${actualSha256}, esperado ${EXACT_V40_SHA256}.`);
}

mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html);
console.log(`Central Adapta: v40 EXATA publicada no build (${html.length} bytes; SHA-256 ${actualSha256}).`);
