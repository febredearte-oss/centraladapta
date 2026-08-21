import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

html = html.replace(
  "Versão preferencial para áreas largas, cabeçalhos, apresentações, faixas e assinaturas institucionais.",
  "Para áreas largas, cabeçalhos, apresentações, faixas e assinaturas institucionais."
);

html = html.replace(
  "A Montserrat é a tipografia principal do sistema visual da Adapta. Ela organiza títulos, navegação, informações e corpo de texto.",
  "Montserrat é a tipografia principal da Adapta."
);

/* Remove somente os dois trechos marcados na revisão visual. */
html = html.replace('<h2>Sistema Visual</h2>', '');
html = html.replace('<strong>+AD e o escudo formam uma única marca.</strong>', '');

const weightsBlock = `<div class="sv-type-weights"><div><strong class="w800">ExtraBold 800</strong><small>Títulos e chamadas</small></div><div><strong class="w700">Bold 700</strong><small>Subtítulos e ênfase</small></div><div><strong class="w600">SemiBold 600</strong><small>Navegação e informação</small></div><div><strong class="w500">Medium 500</strong><small>Corpo de texto e apoio</small></div></div>`;
const typeMeta = `<div class="sv-type-meta"><strong>Montserrat</strong><span>Tipografia principal</span></div>`;
if (html.includes(weightsBlock)) html = html.replace(weightsBlock, typeMeta);

const colorsSection = `<section class="sv-section"><div class="sv-section-intro"><span class="eyebrow">Cores das assinaturas</span><h3>Paleta principal</h3><p>Referência lida diretamente dos arquivos oficiais enviados.</p></div><div class="sv-swatches"><div class="sv-swatch"><i style="background:#0A3426"></i><div><strong>Verde escuro</strong><code>#0A3426</code></div></div><div class="sv-swatch"><i style="background:#ABC2A7"></i><div><strong>Verde sálvia</strong><code>#ABC2A7</code></div></div><div class="sv-swatch"><i style="background:#8AA99B"></i><div><strong>Verde médio</strong><code>#8AA99B</code></div></div><div class="sv-swatch"><i style="background:#FFFFFF;border:1px solid #D9DDD6"></i><div><strong>Branco</strong><code>#FFFFFF</code></div></div></div></section>`;
if (html.includes(colorsSection)) html = html.replace(colorsSection, "");

const cleanupCss = `<style id="system-visual-cleanup">
#page-design .sv-type-card{grid-template-columns:minmax(0,1fr) 220px;align-items:end}
#page-design .sv-type-meta{display:flex;flex-direction:column;gap:4px;padding-top:12px;border-top:2px solid #E1E5E1}
#page-design .sv-type-meta strong{font-family:"Montserrat",Arial,sans-serif;font-size:20px;color:#0A3426}
#page-design .sv-type-meta span{font-size:13px;color:#6B746F}
#page-design .sv-signature-copy p{font-size:14px;line-height:1.5}
#page-design .sv-variant-label{font-size:12px}
@media(max-width:720px){#page-design .sv-type-card{grid-template-columns:1fr}}
</style>`;
if (!html.includes('id="system-visual-cleanup"')) html = html.replace("</head>", `${cleanupCss}</head>`);

writeFileSync(FILE, html, "utf8");
console.log("Adapta: Sistema Visual reduzido às regras já definidas (assinaturas, fundo e Montserrat).");
