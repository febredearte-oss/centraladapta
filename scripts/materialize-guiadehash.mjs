import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = new URL("../source/guiadehash/", import.meta.url);
const outDir = new URL("../public/guiadehash/", import.meta.url);

const parts = [];
for (let i = 1; i <= 4; i++) {
  parts.push(await readFile(new URL(`html.part${String(i).padStart(2, "0")}`, source), "utf8"));
}
await writeFile(new URL("../public/guiadehash.html", import.meta.url), parts.join(""), "utf8");

await mkdir(new URL("assets/", outDir), { recursive: true });
for (let i = 1; i <= 6; i++) {
  const b64 = (await readFile(new URL(`assets/${i}.b64`, source), "utf8")).trim();
  await writeFile(new URL(`assets/${i}.webp`, outDir), Buffer.from(b64, "base64"));
}

console.log("Materialized /guiadehash");
