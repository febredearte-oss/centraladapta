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
    <div>
      <span class="eyebrow">Identidade Adapta</span>
      <h2>Sistema Visual</h2>
      <p>O guia começa pelas assinaturas oficiais da marca e pela regra mais simples para escolher a versão certa em cada aplicação.</p>
    </div>
    <a class="visual-source-link" href="https://canva.link/hsvp6kmkw53tv07" target="_blank" rel="noopener">Abrir arquivos oficiais ↗</a>
  </div>

  <div class="visual-brand-rule">
    <span class="visual-brand-rule-index">01</span>
    <div>
      <strong>Escudo + +AD são uma única marca.</strong>
      <p>Os dois elementos não devem ser separados, recombinados ou usados como assinaturas independentes.</p>
    </div>
  </div>

  <section class="visual-section">
    <div class="visual-section-title">
      <span class="eyebrow">Primeira decisão</span>
      <h3>Escolha pela proporção do espaço</h3>
      <p>Quanto espaço a aplicação oferece? A assinatura muda de proporção para preservar presença e leitura.</p>
    </div>

    <div class="visual-signature-scale" aria-label="Ordem de escolha das assinaturas">
      <div class="visual-scale-labels"><span>mais espaço</span><span>menos espaço</span></div>
      <div class="visual-scale-line"></div>
    </div>

    <div class="visual-signature-grid">
      <article class="visual-signature-card preferred">
        <span class="visual-card-number">01</span>
        <div class="visual-proportion horizontal"><span></span></div>
        <h4>Horizontal</h4>
        <p>Versão preferencial quando há largura suficiente. Indicada para cabeçalhos, apresentações, faixas e rodapés.</p>
      </article>
      <article class="visual-signature-card">
        <span class="visual-card-number">02</span>
        <div class="visual-proportion vertical"><span></span></div>
        <h4>Vertical</h4>
        <p>Para áreas mais altas ou estreitas, capas, cartazes, sinalização e composições centralizadas.</p>
      </article>
      <article class="visual-signature-card">
        <span class="visual-card-number">03</span>
        <div class="visual-proportion compact"><span></span></div>
        <h4>Compacta</h4>
        <p>Para espaços reduzidos em que a assinatura horizontal ou vertical perderia presença ou legibilidade.</p>
      </article>
      <article class="visual-signature-card">
        <span class="visual-card-number">04</span>
        <div class="visual-proportion ultra"><span></span></div>
        <h4>Ultra compacta</h4>
        <p>Para os menores usos possíveis, quando nenhuma outra versão mantém boa leitura.</p>
      </article>
    </div>
  </section>

  <section class="visual-section contrast-section">
    <div class="visual-section-title">
      <span class="eyebrow">Segunda decisão</span>
      <h3>Depois, escolha pelo fundo</h3>
      <p>Cada proporção possui a versão correspondente para fundo claro e para fundo escuro.</p>
    </div>
    <div class="visual-contrast-grid">
      <article class="visual-contrast-card light-card">
        <span class="visual-card-number">A</span>
        <div class="visual-contrast-demo"><strong>FUNDO<br>CLARO</strong></div>
        <div>
          <h4>Versão para fundo claro</h4>
          <p>Use sobre branco, bege ou outros fundos suficientemente claros para preservar o contraste previsto.</p>
        </div>
      </article>
      <article class="visual-contrast-card dark-card">
        <span class="visual-card-number">B</span>
        <div class="visual-contrast-demo"><strong>FUNDO<br>ESCURO</strong></div>
        <div>
          <h4>Versão para fundo escuro</h4>
          <p>Use sobre preto ou outros fundos escuros. A versão oficial já ajusta a leitura da mesma assinatura.</p>
        </div>
      </article>
    </div>
    <div class="visual-choice-summary">
      <span>1. espaço</span><i>→</i><span>2. fundo</span>
      <p>Escolha horizontal, vertical, compacta ou ultra compacta. Depois selecione a variante clara ou escura correspondente.</p>
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
/* Sistema Visual — início do manual */
#page-design{padding-bottom:80px}
.visual-system{font-family:'Montserrat',Arial,sans-serif;max-width:1240px;margin:0 auto}
.visual-system h2,.visual-system h3,.visual-system h4,.visual-system p{margin-top:0}
.visual-system-head{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;margin-bottom:28px}
.visual-system-head h2{font-size:42px;line-height:1;letter-spacing:-.035em;margin:4px 0 10px}
.visual-system-head p{max-width:720px;color:var(--muted);font-size:16px}
.visual-source-link{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;border:1px solid var(--line);border-radius:12px;background:var(--paper);color:var(--ink);font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap}
.visual-source-link:hover{border-color:var(--green);color:var(--green)}
.visual-brand-rule{display:grid;grid-template-columns:56px 1fr;gap:20px;padding:24px 26px;background:var(--green-dark);color:#fff;border-radius:18px;margin-bottom:38px}
.visual-brand-rule-index{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(255,255,255,.38);border-radius:50%;font-size:12px;font-weight:800}
.visual-brand-rule strong{display:block;font-size:20px;letter-spacing:-.02em;margin-bottom:4px}
.visual-brand-rule p{margin:0;color:rgba(255,255,255,.72);font-size:14px}
.visual-section{padding:34px 0;border-top:1px solid var(--line)}
.visual-section-title{max-width:760px;margin-bottom:24px}
.visual-section-title h3{font-size:28px;line-height:1.05;letter-spacing:-.025em;margin:5px 0 9px}
.visual-section-title p{color:var(--muted);font-size:15px}
.visual-signature-scale{margin:4px 0 14px}
.visual-scale-labels{display:flex;justify-content:space-between;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.visual-scale-line{height:2px;background:linear-gradient(90deg,var(--green) 0%,var(--green) 72%,var(--line) 100%);margin-top:8px}
.visual-signature-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.visual-signature-card{position:relative;min-height:286px;padding:20px;border:1px solid var(--line);border-radius:16px;background:var(--paper);display:flex;flex-direction:column}
.visual-signature-card.preferred{border-color:rgba(31,93,70,.45);box-shadow:inset 0 0 0 1px rgba(31,93,70,.08)}
.visual-card-number{font-size:11px;font-weight:800;color:var(--muted);letter-spacing:.08em}
.visual-proportion{height:82px;display:flex;align-items:center;margin:17px 0 18px}
.visual-proportion span{display:block;background:var(--green);border-radius:5px;opacity:.92}
.visual-proportion.horizontal span{width:92%;height:27px}
.visual-proportion.vertical span{width:44%;height:68px}
.visual-proportion.compact span{width:54%;height:48px}
.visual-proportion.ultra span{width:34%;height:34px}
.visual-signature-card h4{font-size:18px;letter-spacing:-.015em;margin-bottom:8px}
.visual-signature-card p{font-size:13px;color:var(--muted);line-height:1.48;margin:0}
.visual-contrast-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.visual-contrast-card{position:relative;min-height:330px;border-radius:18px;padding:22px;display:grid;grid-template-rows:1fr auto;overflow:hidden}
.visual-contrast-card.light-card{background:#f0eee6;color:#17231d;border:1px solid #dedbd2}
.visual-contrast-card.dark-card{background:#18241e;color:#fff;border:1px solid #18241e}
.visual-contrast-demo{display:flex;align-items:center;justify-content:center;min-height:178px}
.visual-contrast-demo strong{font-size:38px;line-height:.88;letter-spacing:-.05em;text-align:center}
.visual-contrast-card h4{font-size:18px;margin-bottom:6px}
.visual-contrast-card p{font-size:13px;line-height:1.5;margin:0;max-width:440px;opacity:.72}
.visual-choice-summary{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px;padding:16px 18px;border:1px solid var(--line);border-radius:14px;background:var(--soft)}
.visual-choice-summary span{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--green)}
.visual-choice-summary i{font-style:normal;color:var(--muted)}
.visual-choice-summary p{margin:0 0 0 auto;color:var(--muted);font-size:13px;max-width:650px}
.typography-section{padding-bottom:10px}
.visual-type-specimen{display:grid;grid-template-columns:1.05fr .95fr;gap:26px;padding:26px;border:1px solid var(--line);border-radius:18px;background:var(--paper)}
.visual-type-hero{font-family:'Montserrat',Arial,sans-serif;font-size:58px;line-height:.92;font-weight:800;letter-spacing:-.055em}
.visual-type-weights{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.visual-type-weights div{padding-top:12px;border-top:2px solid var(--line)}
.visual-type-weights strong{display:block;font-family:'Montserrat',Arial,sans-serif;font-size:20px;margin-bottom:4px}
.visual-type-weights small{display:block;color:var(--muted);font-size:11px}
.weight-800{font-weight:800}.weight-700{font-weight:700}.weight-600{font-weight:600}.weight-500{font-weight:500}
@media(max-width:1000px){.visual-signature-grid{grid-template-columns:1fr 1fr}.visual-system-head{align-items:flex-start;flex-direction:column}.visual-choice-summary p{margin-left:0;width:100%}}
@media(max-width:720px){#page-design{padding-left:16px;padding-right:16px}.visual-signature-grid,.visual-contrast-grid,.visual-type-specimen{grid-template-columns:1fr}.visual-type-weights{grid-template-columns:1fr 1fr}.visual-system-head h2{font-size:34px}.visual-type-hero{font-size:46px}.visual-brand-rule{grid-template-columns:44px 1fr;padding:20px}.visual-contrast-card{min-height:290px}}
`;

if (!html.includes("</style>")) throw new Error("Bloco de estilos da Central não encontrado.");
html = html.replace("</style>", `${visualCss}</style>`);

mkdirSync("public", { recursive: true });
writeFileSync("public/index.html", html, "utf8");
const outputSha256 = createHash("sha256").update(html).digest("hex");
console.log(`Central Adapta: base v40 validada (${EXACT_V40_SIZE} bytes; SHA-256 ${actualSha256}) + Sistema Visual aplicado (SHA-256 ${outputSha256}).`);