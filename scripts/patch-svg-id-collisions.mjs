import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

let count = 0;
html = html.replace(/<svg\b[\s\S]*?<\/svg>/g, (svg) => {
  if (!/class="[^"]*(?:sv-inline-logo|brand-logo)[^"]*"/.test(svg)) return svg;

  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  if (!ids.length) return svg;

  const prefix = `adapta-svg-${++count}`;
  let fixed = svg;
  ids.forEach((id) => {
    const safeId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const next = `${prefix}-${id}`;
    fixed = fixed.replace(new RegExp(`\\bid="${safeId}"`, "g"), `id="${next}"`);
    fixed = fixed.replace(new RegExp(`url\\(#${safeId}\\)`, "g"), `url(#${next})`);
    fixed = fixed.replace(new RegExp(`([xh]link:href|href)="#${safeId}"`, "g"), `$1="#${next}"`);
  });
  return fixed;
});

if (!count) throw new Error("Nenhum SVG oficial da Adapta encontrado para namespace de IDs.");

writeFileSync(FILE, html, "utf8");
console.log(`Adapta: ${count} SVGs oficiais receberam IDs internos exclusivos; máscaras não colidem mais entre variantes.`);
