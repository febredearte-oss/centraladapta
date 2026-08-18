import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const parts = readdirSync("approved")
  .filter((name) => /^v40\.part\d+\.b64$/.test(name))
  .sort();

if (!parts.length) throw new Error("Snapshot v40 aprovada não encontrado.");

const encoded = parts.map((name) => readFileSync(`approved/${name}`, "utf8").trim()).join("");
const html = gunzipSync(Buffer.from(encoded, "base64"));

mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html);
console.log(`Central Adapta: v40 aprovada materializada (${html.length} bytes).`);
