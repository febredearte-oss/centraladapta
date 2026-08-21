import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const EXACT_V40_SHA256 = "070251d0b7db5177262f50ef7b8b023f5d912d450bf18f309daa29855e758c11";
const EXACT_V40_SIZE = 345975;
const LOGO_PAYLOAD = readFileSync("approved/adapta-logos-svg.b64", "utf8").trim();

const parts = readdirSync("source")
  .filter((name) => /^index\.part[0-9]+[a-z]?\.b64$/.test(name))
  .sort();
if (!parts.length) throw new Error("Frontend empacotado não encontrado.");
const encoded = parts.map((name) => readFileSync(`source/${name}`, "utf8").trim()).join("");
const exactV40 = gunzipSync(Buffer.from(encoded, "base64"));
const actualSha256 = createHash("sha256").update(exactV40).digest("hex");
if (exactV40.length !== EXACT_V40_SIZE) throw new Error(`v40 rejeitada: tamanho ${exactV40.length}, esperado ${EXACT_V40_SIZE}.`);
if (actualSha256 !== EXACT_V40_SHA256) throw new Error(`v40 rejeitada: SHA-256 ${actualSha256}, esperado ${EXACT_V40_SHA256}.`);

const logos = JSON.parse(gunzipSync(Buffer.from(LOGO_PAYLOAD, "base64")).toString("utf8"));
const logo = (name, label) => logos[name].replace('<svg ', `<svg class="sv-inline-logo" role="img" aria-label="${label}" `);

let html = exactV40.toString("utf8");
const oldDesign = `<section class="page" id="page-design">
<div class="page-head"><div><h2>Sistema Visual</h2><p>Este módulo receberá o sistema de design da Adapta.</p></div></div>
<article class="placeholder"><h3>Sistema Visual</h3><p>Área preparada para identidade, tipografia, cores, fotografia, mascotes, composição e motion.</p></article>
</section>`;

const items = [
  ["horizontal", "Horizontal", "Versão preferencial para áreas largas, cabeçalhos, apresentações, faixas e assinaturas institucionais."],
  ["vertical", "Vertical", "Para composições mais altas, capas, cartazes e peças centralizadas."],
  ["compacta", "Compacta", "Para espaços reduzidos em que a marca precisa continuar legível e presente."],
  ["ultracompacta", "Ultra compacta", "Para usos mínimos, avatares, cantos de peça e situações com alta restrição de espaço."]
];

const rows = items.map(([slug,title,desc],i) => `
<article class="sv-signature-row">
  <div class="sv-signature-copy"><span class="sv-step">${String(i+1).padStart(2,"0")}</span><h4>${title}</h4><p>${desc}</p></div>
  <div class="sv-variants">
    <div class="sv-variant sv-light"><span class="sv-variant-label">Fundo claro</span><div class="sv-logo-stage">${logo(`${slug}-claro`, `Assinatura ${title} da Adapta para fundo claro`)}</div><div class="sv-downloads"><button type="button" data-logo-download="${slug}-claro" data-logo-name="adapta-${slug}-fundo-claro.svg">Baixar SVG</button></div></div>
    <div class="sv-variant sv-dark"><span class="sv-variant-label">Fundo escuro</span><div class="sv-logo-stage">${logo(`${slug}-escuro`, `Assinatura ${title} da Adapta para fundo escuro`)}</div><div class="sv-downloads"><button type="button" data-logo-download="${slug}-escuro" data-logo-name="adapta-${slug}-fundo-escuro.svg">Baixar SVG</button></div></div>
  </div>
</article>`).join("");

const newDesign = `<section class="page" id="page-design">
<div class="sv-manual">
  <div class="page-head sv-head">
    <div><span class="eyebrow">Identidade Adapta</span><h2>Sistema Visual</h2><p>Assinaturas oficiais da marca. Escolha primeiro a proporção adequada ao espaço e depois a versão correspondente ao fundo.</p></div>
  </div>
  <div class="sv-rule">${logo("ultracompacta-claro","Símbolo oficial +AD no escudo")}<div><strong>+AD e o escudo formam uma única marca.</strong><p>Não separar, reconstruir ou recombinar esses elementos. Use sempre uma das assinaturas oficiais abaixo.</p></div></div>
  <section class="sv-section"><div class="sv-section-intro"><span class="eyebrow">Assinaturas oficiais</span><h3>Primeiro: escolha pelo espaço</h3><p>Da versão mais ampla à mais reduzida: horizontal → vertical → compacta → ultra compacta.</p></div>${rows}</section>
  <section class="sv-section sv-type-section"><div class="sv-section-intro"><span class="eyebrow">Tipografia principal</span><h3>Montserrat</h3><p>A Montserrat é a tipografia principal do sistema visual da Adapta. Ela organiza títulos, navegação, informações e corpo de texto.</p></div><div class="sv-type-card"><div class="sv-type-display">Aa Bb Cc<br>0123456789</div><div class="sv-type-weights"><div><strong class="w800">ExtraBold 800</strong><small>Títulos e chamadas</small></div><div><strong class="w700">Bold 700</strong><small>Subtítulos e ênfase</small></div><div><strong class="w600">SemiBold 600</strong><small>Navegação e informação</small></div><div><strong class="w500">Medium 500</strong><small>Corpo de texto e apoio</small></div></div></div></section>
  <section class="sv-section"><div class="sv-section-intro"><span class="eyebrow">Cores das assinaturas</span><h3>Paleta principal</h3><p>Referência lida diretamente dos arquivos oficiais enviados.</p></div><div class="sv-swatches"><div class="sv-swatch"><i style="background:#0A3426"></i><div><strong>Verde escuro</strong><code>#0A3426</code></div></div><div class="sv-swatch"><i style="background:#ABC2A7"></i><div><strong>Verde sálvia</strong><code>#ABC2A7</code></div></div><div class="sv-swatch"><i style="background:#8AA99B"></i><div><strong>Verde médio</strong><code>#8AA99B</code></div></div><div class="sv-swatch"><i style="background:#FFFFFF;border:1px solid #D9DDD6"></i><div><strong>Branco</strong><code>#FFFFFF</code></div></div></div></section>
</div>
</section>`;
if (!html.includes(oldDesign)) throw new Error("Placeholder do Sistema Visual não encontrado; atualização interrompida.");
html = html.replace(oldDesign, newDesign);

const visualCss = `
#page-design{padding-bottom:72px}
#page-design .sv-manual{--sv-green:#0A3426;--sv-sage:#ABC2A7;--sv-mid:#8AA99B;--sv-line:#D9DDD6;--sv-text:#1D2B26;font-family:"Montserrat",Arial,Helvetica,sans-serif;color:var(--sv-text)}
#page-design .sv-head{align-items:flex-end;gap:24px;margin-bottom:24px} #page-design .sv-head h2{font-family:"Montserrat",Arial,Helvetica,sans-serif;font-size:42px;line-height:1;letter-spacing:-.04em;color:var(--sv-green);margin:4px 0 10px} #page-design .sv-head p{max-width:760px;font-size:16px;line-height:1.55;color:#59655f;margin:0}
#page-design .sv-rule{display:grid;grid-template-columns:86px 1fr;gap:18px;align-items:center;padding:20px 22px;margin-bottom:36px;border:1px solid #C9D1CB;border-radius:18px;background:#fff} #page-design .sv-rule .sv-inline-logo{width:72px;height:72px} #page-design .sv-rule strong{display:block;font-size:20px;line-height:1.2;color:var(--sv-green);margin-bottom:5px} #page-design .sv-rule p{margin:0;font-size:14px;line-height:1.5;color:#59655f}
#page-design .sv-section{padding:34px 0;border-top:1px solid var(--sv-line)} #page-design .sv-section-intro{max-width:780px;margin-bottom:22px} #page-design .sv-section-intro h3{font-family:"Montserrat",Arial,Helvetica,sans-serif;font-size:28px;line-height:1.08;letter-spacing:-.025em;color:var(--sv-green);margin:5px 0 8px} #page-design .sv-section-intro p{margin:0;font-size:15px;line-height:1.5;color:#65706b}
#page-design .sv-signature-row{display:grid;grid-template-columns:220px 1fr;gap:16px;padding:18px 0;border-top:1px solid #E6E8E4} #page-design .sv-signature-row:first-of-type{border-top:0} #page-design .sv-signature-copy{padding:12px 8px 0 0} #page-design .sv-step{display:block;font-size:11px;letter-spacing:.12em;font-weight:800;color:var(--sv-mid);margin-bottom:12px} #page-design .sv-signature-copy h4{font-family:"Montserrat",Arial,Helvetica,sans-serif;margin:0 0 7px;font-size:20px;color:var(--sv-green)} #page-design .sv-signature-copy p{margin:0;font-size:13px;line-height:1.5;color:#65706b}
#page-design .sv-variants{display:grid;grid-template-columns:1fr 1fr;gap:12px} #page-design .sv-variant{min-height:246px;border-radius:16px;overflow:hidden;border:1px solid var(--sv-line);display:grid;grid-template-rows:auto 1fr auto} #page-design .sv-light{background:#fff;color:var(--sv-green)} #page-design .sv-dark{background:var(--sv-green);color:#fff;border-color:var(--sv-green)} #page-design .sv-variant-label{display:block;padding:12px 14px 0;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.72} #page-design .sv-logo-stage{display:flex;align-items:center;justify-content:center;padding:16px 22px;min-height:158px} #page-design .sv-logo-stage .sv-inline-logo{display:block;max-width:100%;max-height:140px;width:auto;height:auto}
#page-design .sv-downloads{display:flex;gap:8px;padding:12px 14px;border-top:1px solid rgba(100,110,104,.2)} #page-design .sv-dark .sv-downloads{border-top-color:rgba(255,255,255,.2)} #page-design .sv-downloads button{appearance:none;border:0;display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 12px;border-radius:9px;font-family:"Montserrat",Arial,sans-serif;font-size:11px;font-weight:800;cursor:pointer} #page-design .sv-light .sv-downloads button{background:var(--sv-green);color:#fff} #page-design .sv-dark .sv-downloads button{background:#fff;color:var(--sv-green)}
#page-design .sv-type-card{display:grid;grid-template-columns:1.05fr .95fr;gap:28px;padding:26px;border:1px solid var(--sv-line);border-radius:18px;background:#fff} #page-design .sv-type-display{font-family:"Montserrat",Arial,Helvetica,sans-serif;font-size:60px;line-height:.94;font-weight:800;letter-spacing:-.055em;color:var(--sv-green)} #page-design .sv-type-weights{display:grid;grid-template-columns:1fr 1fr;gap:16px} #page-design .sv-type-weights div{border-top:2px solid #E1E5E1;padding-top:11px} #page-design .sv-type-weights strong{display:block;font-size:16px;color:var(--sv-green);margin-bottom:4px} #page-design .sv-type-weights small{display:block;font-size:11px;line-height:1.35;color:#6B746F} #page-design .w800{font-weight:800} #page-design .w700{font-weight:700} #page-design .w600{font-weight:600} #page-design .w500{font-weight:500}
#page-design .sv-swatches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px} #page-design .sv-swatch{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--sv-line);border-radius:14px;background:#fff} #page-design .sv-swatch i{display:block;width:52px;height:52px;border-radius:12px;flex:0 0 52px} #page-design .sv-swatch strong{display:block;font-size:13px;color:var(--sv-green);margin-bottom:3px} #page-design .sv-swatch code{font-family:"Montserrat",Arial,sans-serif;font-size:11px;color:#6C756F;background:none;padding:0}
@media(max-width:980px){#page-design .sv-signature-row{grid-template-columns:1fr} #page-design .sv-swatches{grid-template-columns:1fr 1fr}} @media(max-width:720px){#page-design .sv-head h2{font-size:34px} #page-design .sv-rule{grid-template-columns:64px 1fr;padding:16px} #page-design .sv-rule .sv-inline-logo{width:56px;height:56px} #page-design .sv-variants,#page-design .sv-type-card{grid-template-columns:1fr} #page-design .sv-type-display{font-size:46px} #page-design .sv-swatches{grid-template-columns:1fr}}
`;

const calendarCss = `
/* Calendário — substituir azul padrão do FullCalendar pelo verde Adapta */
#page-calendar .fc .fc-button-primary{background:#0A3426!important;border-color:#0A3426!important;color:#fff!important;box-shadow:none!important}
#page-calendar .fc .fc-button-primary:hover{background:#123F31!important;border-color:#123F31!important}
#page-calendar .fc .fc-button-primary:not(:disabled).fc-button-active,#page-calendar .fc .fc-button-primary:not(:disabled):active{background:#07271D!important;border-color:#07271D!important}
#page-calendar .fc .fc-button-primary:focus{box-shadow:0 0 0 3px rgba(10,52,38,.16)!important}
#page-calendar .fc .fc-button-primary:disabled{background:#7C8380!important;border-color:#7C8380!important;opacity:.78!important}
#page-calendar .fc .fc-event,#page-calendar .fc .fc-daygrid-event,#page-calendar .fc .fc-timegrid-event{background:#0A3426!important;border-color:#0A3426!important;color:#fff!important}
#page-calendar .fc .fc-event:hover,#page-calendar .fc .fc-daygrid-event:hover{background:#123F31!important;border-color:#123F31!important}
#page-calendar .fc .fc-event-main,#page-calendar .fc .fc-event-title,#page-calendar .fc .fc-event-time{color:#fff!important}
`;
html = html.replace("</style>", `${visualCss}${calendarCss}</style>`);

const downloadJs = `<script>(function(){document.addEventListener('click',function(e){var b=e.target.closest('[data-logo-download]');if(!b)return;var card=b.closest('.sv-variant');var svg=card&&card.querySelector('svg');if(!svg)return;var xml='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(svg);var blob=new Blob([xml],{type:'image/svg+xml;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=b.getAttribute('data-logo-name')||'adapta-logo.svg';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},100);});})();</script>`;
html = html.replace("</body>", `${downloadJs}</body>`);
mkdirSync("public", { recursive:true });
writeFileSync("public/index.html", html, "utf8");
const outputSha256 = createHash("sha256").update(html).digest("hex");
console.log(`Central Adapta: base v40 validada (${EXACT_V40_SIZE} bytes; SHA-256 ${actualSha256}) + Sistema Visual oficial aplicado + calendário verde (SHA-256 ${outputSha256}).`);
