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

const exactV40 = gunzipSync(Buffer.from(encoded, "base64"));
const actualSha256 = createHash("sha256").update(exactV40).digest("hex");

if (exactV40.length !== EXACT_V40_SIZE) {
  throw new Error(`v40 rejeitada: tamanho ${exactV40.length}, esperado ${EXACT_V40_SIZE}.`);
}

if (actualSha256 !== EXACT_V40_SHA256) {
  throw new Error(`v40 rejeitada: SHA-256 ${actualSha256}, esperado ${EXACT_V40_SHA256}.`);
}

let html = exactV40.toString("utf8");

const oldDesign = `<section class="page" id="page-design">
<div class="page-head"><div><h2>Sistema Visual</h2><p>Este módulo receberá o sistema de design da Adapta.</p></div></div>
<article class="placeholder"><h3>Sistema Visual</h3><p>Área preparada para identidade, tipografia, cores, fotografia, mascotes, composição e motion.</p></article>
</section>`;

const newDesign = `<section class="page" id="page-design">
<div class="visual-system">
  <div class="visual-system-head">
    <div class="visual-system-title-row">
      <img class="visual-brand-icon" src="/brand/adapta-brand-icon-trim.png" alt="Marca Adapta" />
      <div>
        <span class="eyebrow">Identidade Adapta</span>
        <h2>Sistema Visual</h2>
        <p>As assinaturas abaixo são as versões oficiais reunidas na matriz visual da Adapta.</p>
      </div>
    </div>
    <a class="visual-source-link" href="https://canva.link/hsvp6kmkw53tv07" target="_blank" rel="noopener">Abrir matriz no Canva ↗</a>
  </div>

  <div class="visual-brand-rule">
    <span class="visual-brand-rule-index">01</span>
    <div>
      <strong>Escudo + +AD são uma única marca.</strong>
      <p>Os dois elementos permanecem juntos em todas as assinaturas. O que muda é a composição adequada ao espaço disponível.</p>
    </div>
  </div>

  <section class="visual-section visual-family-section">
    <div class="visual-section-title">
      <span class="eyebrow">Assinaturas oficiais</span>
      <h3>Uma marca, diferentes proporções</h3>
      <p>A família abaixo vem diretamente da prancha oficial. Use a composição que melhor ocupa o espaço sem separar os elementos da marca.</p>
    </div>

    <figure class="visual-logo-board">
      <img src="/brand/adapta-logo-board-trim.png" alt="Prancha oficial com as assinaturas de logotipo da Adapta" />
      <figcaption>Matriz oficial de logotipos · Canva</figcaption>
    </figure>

    <div class="visual-signature-scale" aria-label="Ordem de escolha das assinaturas">
      <div class="visual-scale-labels"><span>mais espaço</span><span>menos espaço</span></div>
      <div class="visual-scale-line"></div>
    </div>

    <div class="visual-signature-grid">
      <article class="visual-signature-card preferred">
        <span class="visual-card-number">01</span>
        <h4>Horizontal</h4>
        <p>Versão preferencial quando há largura suficiente. Cabeçalhos, apresentações, faixas e rodapés.</p>
      </article>
      <article class="visual-signature-card">
        <span class="visual-card-number">02</span>
        <h4>Vertical</h4>
        <p>Para áreas mais altas ou estreitas, capas, cartazes, sinalização e composições centralizadas.</p>
      </article>
      <article class="visual-signature-card">
        <span class="visual-card-number">03</span>
        <h4>Compacta</h4>
        <p>Para espaços reduzidos em que as assinaturas maiores perderiam presença ou leitura.</p>
      </article>
      <article class="visual-signature-card">
        <span class="visual-card-number">04</span>
        <h4>Ultra compacta</h4>
        <p>Para os menores usos possíveis, quando nenhuma outra composição mantém boa leitura.</p>
      </article>
    </div>
  </section>

  <section class="visual-section contrast-section">
    <div class="visual-section-title">
      <span class="eyebrow">Segunda decisão</span>
      <h3>Depois, escolha pelo fundo</h3>
      <p>Cada proporção possui a versão correspondente para fundos claros e escuros. Não altere as cores do arquivo manualmente: escolha a versão já preparada na matriz.</p>
    </div>
    <div class="visual-contrast-grid">
      <article class="visual-contrast-card light-card">
        <span class="visual-card-number">A</span>
        <div class="visual-contrast-demo"><span>fundo claro</span></div>
        <div>
          <h4>Versão para fundo claro</h4>
          <p>Use a assinatura correspondente da prancha sempre que a aplicação estiver sobre branco ou outro fundo claro.</p>
        </div>
      </article>
      <article class="visual-contrast-card dark-card">
        <span class="visual-card-number">B</span>
        <div class="visual-contrast-demo"><span>fundo escuro</span></div>
        <div>
          <h4>Versão para fundo escuro</h4>
          <p>Use a assinatura correspondente da prancha sobre verde escuro, preto ou outro fundo de baixa luminosidade.</p>
        </div>
      </article>
    </div>
    <div class="visual-choice-summary">
      <span>1. espaço</span><i>→</i><span>2. fundo</span>
      <p>Primeiro escolha horizontal, vertical, compacta ou ultra compacta. Depois selecione a variante de contraste correspondente.</p>
    </div>
  </section>

  <section class="visual-section palette-section">
    <div class="visual-section-title">
      <span class="eyebrow">Cores da matriz</span>
      <h3>Paleta presente nas assinaturas</h3>
      <p>O módulo passa a usar os tons extraídos diretamente da prancha enviada, em vez da paleta genérica da Central.</p>
    </div>
    <div class="visual-palette">
      <div class="visual-swatch swatch-green"><span>#0C3527</span><small>Verde profundo</small></div>
      <div class="visual-swatch swatch-ink"><span>#252225</span><small>Preto</small></div>
      <div class="visual-swatch swatch-sage"><span>#6D8B7C</span><small>Verde médio</small></div>
      <div class="visual-swatch swatch-mid"><span>#495D54</span><small>Verde fechado</small></div>
      <div class="visual-swatch swatch-light"><span>#8FA89C</span><small>Verde claro</small></div>
    </div>
  </section>

  <section class="visual-section typography-section">
    <div class="visual-section-title">
      <span class="eyebrow">Tipografia principal</span>
      <h3>Montserrat</h3>
      <p>A Montserrat é a tipografia principal do sistema visual da Adapta e organiza títulos, informações, legendas e textos de apoio.</p>
    </div>
    <div class="visual-type-specimen" aria-label="Amostra da tipografia Montserrat">
      <div class="visual-type-hero">Aa Bb Cc<br>0123456789</div>
      <div class="visual-type-weights">
        <div><strong class="weight-800">ExtraBold</strong><small>Títulos e chamadas</small></div>
        <div><strong class="weight-700">Bold</strong><small>Subtítulos e ênfase</small></div>
        <div><strong class="weight-600">SemiBold</strong><small>Informações e navegação</small></div>
        <div><strong class="weight-500">Medium</strong><small>Corpo e apoio</small></div>
      </div>
    </div>
  </section>
</div>
</section>`;

if (!html.includes(oldDesign)) {
  throw new Error("Placeholder do Sistema Visual não encontrado; atualização interrompida para não alterar outra área da Central.");
}
html = html.replace(oldDesign, newDesign);

const visualCss = `
/* Sistema Visual — início do manual, baseado na matriz oficial Canva */
#page-design{padding-bottom:80px}
.visual-system{--adapta-green:#0C3527;--adapta-ink:#252225;--adapta-sage:#6D8B7C;--adapta-mid:#495D54;--adapta-light:#8FA89C;font-family:'Montserrat',Arial,sans-serif;max-width:1240px;margin:0 auto;color:var(--adapta-ink)}
.visual-system h2,.visual-system h3,.visual-system h4,.visual-system p{margin-top:0}
.visual-system .eyebrow{color:var(--adapta-green)}
.visual-system-head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:28px}
.visual-system-title-row{display:flex;align-items:center;gap:20px}
.visual-brand-icon{width:78px;height:78px;object-fit:contain;flex:0 0 auto}
.visual-system-head h2{font-size:42px;line-height:1;letter-spacing:-.035em;margin:4px 0 10px;color:var(--adapta-ink)}
.visual-system-head p{max-width:720px;color:#62645f;font-size:16px}
.visual-source-link{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border:1px solid rgba(12,53,39,.24);border-radius:12px;background:#fff;color:var(--adapta-green);font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap}
.visual-source-link:hover{border-color:var(--adapta-green);background:#f5f7f5}
.visual-brand-rule{display:grid;grid-template-columns:56px 1fr;gap:20px;padding:24px 26px;background:var(--adapta-green);color:#fff;border-radius:18px;margin-bottom:38px}
.visual-brand-rule-index{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(255,255,255,.38);border-radius:50%;font-size:12px;font-weight:800}
.visual-brand-rule strong{display:block;font-size:20px;letter-spacing:-.02em;margin-bottom:4px}
.visual-brand-rule p{margin:0;color:rgba(255,255,255,.74);font-size:14px}
.visual-section{padding:34px 0;border-top:1px solid rgba(37,34,37,.13)}
.visual-section-title{max-width:760px;margin-bottom:24px}
.visual-section-title h3{font-size:28px;line-height:1.05;letter-spacing:-.025em;margin:5px 0 9px;color:var(--adapta-ink)}
.visual-section-title p{color:#666862;font-size:15px}
.visual-logo-board{margin:0 0 26px;padding:24px;border:1px solid rgba(37,34,37,.12);border-radius:18px;background:#fff;overflow:hidden}
.visual-logo-board img{display:block;width:100%;max-width:980px;height:auto;margin:0 auto;object-fit:contain}
.visual-logo-board figcaption{margin-top:14px;text-align:right;color:#777973;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.visual-signature-scale{margin:4px 0 14px}
.visual-scale-labels{display:flex;justify-content:space-between;color:#73756f;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.visual-scale-line{height:2px;background:linear-gradient(90deg,var(--adapta-green) 0%,var(--adapta-sage) 70%,rgba(37,34,37,.12) 100%);margin-top:8px}
.visual-signature-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.visual-signature-card{position:relative;min-height:150px;padding:20px;border:1px solid rgba(37,34,37,.13);border-radius:16px;background:#fff;display:flex;flex-direction:column}
.visual-signature-card.preferred{border-color:rgba(12,53,39,.48);box-shadow:inset 0 0 0 1px rgba(12,53,39,.08)}
.visual-card-number{font-size:11px;font-weight:800;color:var(--adapta-sage);letter-spacing:.08em}
.visual-signature-card h4{font-size:18px;letter-spacing:-.015em;margin:20px 0 8px;color:var(--adapta-green)}
.visual-signature-card p{font-size:13px;color:#686a65;line-height:1.48;margin:0}
.visual-contrast-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.visual-contrast-card{position:relative;min-height:290px;border-radius:18px;padding:22px;display:grid;grid-template-rows:1fr auto;overflow:hidden}
.visual-contrast-card.light-card{background:#fff;color:var(--adapta-ink);border:1px solid rgba(37,34,37,.14)}
.visual-contrast-card.dark-card{background:var(--adapta-green);color:#fff;border:1px solid var(--adapta-green)}
.visual-contrast-demo{display:flex;align-items:center;justify-content:center;min-height:145px}
.visual-contrast-demo span{font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;border:1px solid currentColor;border-radius:999px;padding:9px 14px;opacity:.72}
.visual-contrast-card h4{font-size:18px;margin-bottom:6px}
.visual-contrast-card p{font-size:13px;line-height:1.5;margin:0;max-width:440px;opacity:.72}
.visual-choice-summary{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px;padding:16px 18px;border:1px solid rgba(37,34,37,.13);border-radius:14px;background:#f7f8f6}
.visual-choice-summary span{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--adapta-green)}
.visual-choice-summary i{font-style:normal;color:var(--adapta-sage)}
.visual-choice-summary p{margin:0 0 0 auto;color:#676963;font-size:13px;max-width:650px}
.visual-palette{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
.visual-swatch{min-height:150px;padding:16px;border-radius:15px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid rgba(37,34,37,.1)}
.visual-swatch span{font-size:13px;font-weight:800;letter-spacing:.04em}.visual-swatch small{font-size:11px;margin-top:4px;opacity:.72}
.swatch-green{background:#0C3527;color:#fff}.swatch-ink{background:#252225;color:#fff}.swatch-sage{background:#6D8B7C;color:#fff}.swatch-mid{background:#495D54;color:#fff}.swatch-light{background:#8FA89C;color:#0B0E0B}
.typography-section{padding-bottom:10px}
.visual-type-specimen{display:grid;grid-template-columns:1.05fr .95fr;gap:26px;padding:26px;border:1px solid rgba(37,34,37,.13);border-radius:18px;background:#fff}
.visual-type-hero{font-family:'Montserrat',Arial,sans-serif;font-size:58px;line-height:.92;font-weight:800;letter-spacing:-.055em;color:var(--adapta-green)}
.visual-type-weights{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.visual-type-weights div{padding-top:12px;border-top:2px solid rgba(37,34,37,.15)}
.visual-type-weights strong{display:block;font-family:'Montserrat',Arial,sans-serif;font-size:20px;margin-bottom:4px;color:var(--adapta-ink)}
.visual-type-weights small{display:block;color:#73756f;font-size:11px}
.weight-800{font-weight:800}.weight-700{font-weight:700}.weight-600{font-weight:600}.weight-500{font-weight:500}
@media(max-width:1000px){.visual-signature-grid{grid-template-columns:1fr 1fr}.visual-system-head{align-items:flex-start;flex-direction:column}.visual-choice-summary p{margin-left:0;width:100%}.visual-palette{grid-template-columns:repeat(3,1fr)}}
@media(max-width:720px){#page-design{padding-left:16px;padding-right:16px}.visual-system-title-row{align-items:flex-start}.visual-brand-icon{width:58px;height:58px}.visual-signature-grid,.visual-contrast-grid,.visual-type-specimen{grid-template-columns:1fr}.visual-type-weights{grid-template-columns:1fr 1fr}.visual-palette{grid-template-columns:1fr 1fr}.visual-system-head h2{font-size:34px}.visual-type-hero{font-size:46px}.visual-brand-rule{grid-template-columns:44px 1fr;padding:20px}.visual-contrast-card{min-height:250px}.visual-logo-board{padding:12px}}
`;

if (!html.includes("</style>")) throw new Error("Bloco de estilos da Central não encontrado.");
html = html.replace("</style>", `${visualCss}</style>`);

mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html, "utf8");
const outputSha256 = createHash("sha256").update(html).digest("hex");
console.log(`Central Adapta: base v40 validada (${EXACT_V40_SIZE} bytes; SHA-256 ${actualSha256}) + Sistema Visual oficial aplicado (SHA-256 ${outputSha256}).`);