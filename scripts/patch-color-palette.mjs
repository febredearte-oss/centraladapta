import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

if (!html.includes('id="page-design"')) throw new Error("Sistema Visual não encontrado.");
if (!html.includes('class="sv-section sv-type-section"')) throw new Error("Seção de tipografia não encontrada.");
if (html.includes('id="adapta-color-palette"')) throw new Error("Paleta já inserida; evitando duplicação.");

const paletteSection = `<section class="sv-section sv-palette-section" id="adapta-color-palette">
  <div class="sv-section-intro sv-palette-intro">
    <div>
      <span class="eyebrow">Cores básicas</span>
      <h3>Paleta Adapta</h3>
      <p>Clique em uma amostra para copiar o HEX. Os outros códigos também podem ser copiados individualmente.</p>
    </div>
    <div class="sv-palette-actions" aria-label="Copiar paleta em outros formatos">
      <button type="button" data-palette-copy="txt">Copiar TXT</button>
      <button type="button" data-palette-copy="css">Copiar CSS</button>
      <button type="button" data-palette-copy="json">Copiar JSON</button>
      <button type="button" data-palette-copy="scss">Copiar SCSS</button>
      <button type="button" data-palette-download="txt">Baixar .txt</button>
    </div>
  </div>

  <div class="sv-color-grid">
    <article class="sv-color-card" data-color-name="Verde Adapta" data-hex="#0A3426" data-rgb="rgb(10, 52, 38)" data-hsl="hsl(160, 68%, 12%)" style="--sample:#0A3426;--sample-ink:#FFFFFF">
      <button class="sv-color-sample" type="button" data-copy-value="#0A3426" aria-label="Copiar HEX #0A3426"><span>Clique para copiar</span></button>
      <div class="sv-color-info">
        <div class="sv-color-name"><strong>Verde Adapta</strong><span>Base escura</span></div>
        <button class="sv-code-row is-primary" type="button" data-copy-value="#0A3426"><span>HEX</span><code>#0A3426</code><b>Copiar</b></button>
        <button class="sv-code-row" type="button" data-copy-value="rgb(10, 52, 38)"><span>RGB</span><code>10, 52, 38</code><b>Copiar</b></button>
        <button class="sv-code-row" type="button" data-copy-value="hsl(160, 68%, 12%)"><span>HSL</span><code>160, 68%, 12%</code><b>Copiar</b></button>
      </div>
    </article>

    <article class="sv-color-card" data-color-name="Sálvia" data-hex="#ABC2A7" data-rgb="rgb(171, 194, 167)" data-hsl="hsl(111, 18%, 71%)" style="--sample:#ABC2A7;--sample-ink:#0A3426">
      <button class="sv-color-sample" type="button" data-copy-value="#ABC2A7" aria-label="Copiar HEX #ABC2A7"><span>Clique para copiar</span></button>
      <div class="sv-color-info">
        <div class="sv-color-name"><strong>Sálvia</strong><span>Verde claro</span></div>
        <button class="sv-code-row is-primary" type="button" data-copy-value="#ABC2A7"><span>HEX</span><code>#ABC2A7</code><b>Copiar</b></button>
        <button class="sv-code-row" type="button" data-copy-value="rgb(171, 194, 167)"><span>RGB</span><code>171, 194, 167</code><b>Copiar</b></button>
        <button class="sv-code-row" type="button" data-copy-value="hsl(111, 18%, 71%)"><span>HSL</span><code>111, 18%, 71%</code><b>Copiar</b></button>
      </div>
    </article>

    <article class="sv-color-card" data-color-name="Verde médio" data-hex="#8AA99B" data-rgb="rgb(138, 169, 155)" data-hsl="hsl(153, 15%, 60%)" style="--sample:#8AA99B;--sample-ink:#0A3426">
      <button class="sv-color-sample" type="button" data-copy-value="#8AA99B" aria-label="Copiar HEX #8AA99B"><span>Clique para copiar</span></button>
      <div class="sv-color-info">
        <div class="sv-color-name"><strong>Verde médio</strong><span>Tom intermediário</span></div>
        <button class="sv-code-row is-primary" type="button" data-copy-value="#8AA99B"><span>HEX</span><code>#8AA99B</code><b>Copiar</b></button>
        <button class="sv-code-row" type="button" data-copy-value="rgb(138, 169, 155)"><span>RGB</span><code>138, 169, 155</code><b>Copiar</b></button>
        <button class="sv-code-row" type="button" data-copy-value="hsl(153, 15%, 60%)"><span>HSL</span><code>153, 15%, 60%</code><b>Copiar</b></button>
      </div>
    </article>

    <article class="sv-color-card" data-color-name="Branco" data-hex="#FFFFFF" data-rgb="rgb(255, 255, 255)" data-hsl="hsl(0, 0%, 100%)" style="--sample:#FFFFFF;--sample-ink:#0A3426">
      <button class="sv-color-sample sv-color-sample-white" type="button" data-copy-value="#FFFFFF" aria-label="Copiar HEX #FFFFFF"><span>Clique para copiar</span></button>
      <div class="sv-color-info">
        <div class="sv-color-name"><strong>Branco</strong><span>Base clara</span></div>
        <button class="sv-code-row is-primary" type="button" data-copy-value="#FFFFFF"><span>HEX</span><code>#FFFFFF</code><b>Copiar</b></button>
        <button class="sv-code-row" type="button" data-copy-value="rgb(255, 255, 255)"><span>RGB</span><code>255, 255, 255</code><b>Copiar</b></button>
        <button class="sv-code-row" type="button" data-copy-value="hsl(0, 0%, 100%)"><span>HSL</span><code>0, 0%, 100%</code><b>Copiar</b></button>
      </div>
    </article>
  </div>
  <div class="sv-copy-toast" id="svCopyToast" role="status" aria-live="polite"></div>
</section>`;

html = html.replace('<section class="sv-section sv-type-section">', `${paletteSection}\n<section class="sv-section sv-type-section">`);

const css = `<style id="adapta-palette-ui">
#page-design .sv-palette-intro{max-width:none;display:flex;align-items:flex-end;justify-content:space-between;gap:24px}
#page-design .sv-palette-intro>div:first-child{max-width:700px}
#page-design .sv-palette-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}
#page-design .sv-palette-actions button{appearance:none;border:1px solid #D9DDD6;background:#fff;color:#0A3426;min-height:36px;padding:0 11px;border-radius:9px;font:700 11px/1 "Montserrat",Arial,sans-serif;cursor:pointer;transition:.15s ease}
#page-design .sv-palette-actions button:hover{background:#EEF3EF;border-color:#BFCBC3}
#page-design .sv-color-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
#page-design .sv-color-card{min-width:0;border:1px solid #D9DDD6;border-radius:16px;overflow:hidden;background:#fff}
#page-design .sv-color-sample{appearance:none;border:0;border-bottom:1px solid rgba(20,45,34,.10);width:100%;height:154px;background:var(--sample);color:var(--sample-ink);display:flex;align-items:flex-end;justify-content:flex-start;padding:14px;cursor:pointer;text-align:left}
#page-design .sv-color-sample-white{box-shadow:inset 0 0 0 1px #EEF0EC}
#page-design .sv-color-sample span{opacity:0;font:750 10px/1 "Montserrat",Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;transition:opacity .15s ease}
#page-design .sv-color-sample:hover span,#page-design .sv-color-sample:focus-visible span{opacity:.72}
#page-design .sv-color-info{padding:14px}
#page-design .sv-color-name{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:12px}
#page-design .sv-color-name strong{font-size:16px;color:#0A3426}
#page-design .sv-color-name span{font-size:10px;color:#7A847E;text-align:right}
#page-design .sv-code-row{appearance:none;width:100%;border:0;border-top:1px solid #EEF0EC;background:transparent;min-height:36px;display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:8px;padding:0;color:#58635D;text-align:left;cursor:pointer}
#page-design .sv-code-row:first-of-type{border-top:0}
#page-design .sv-code-row span{font-size:9px;font-weight:800;letter-spacing:.08em;color:#86908A}
#page-design .sv-code-row code{font:650 11px/1.2 "Montserrat",Arial,sans-serif;background:none;padding:0;color:#26342E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#page-design .sv-code-row b{font-size:9px;color:#0A3426;opacity:0;transition:opacity .15s ease}
#page-design .sv-code-row:hover b,#page-design .sv-code-row:focus-visible b{opacity:1}
#page-design .sv-code-row.is-primary code{font-size:13px;font-weight:800;color:#0A3426}
#page-design .sv-copy-toast{position:fixed;right:22px;bottom:22px;z-index:200;pointer-events:none;transform:translateY(10px);opacity:0;background:#0A3426;color:#fff;padding:10px 13px;border-radius:10px;font:750 11px/1 "Montserrat",Arial,sans-serif;box-shadow:0 10px 28px rgba(10,52,38,.18);transition:.18s ease}
#page-design .sv-copy-toast.is-visible{opacity:1;transform:translateY(0)}
@media(max-width:1100px){#page-design .sv-color-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){#page-design .sv-palette-intro{align-items:flex-start;flex-direction:column}#page-design .sv-palette-actions{justify-content:flex-start}#page-design .sv-color-grid{grid-template-columns:1fr}#page-design .sv-color-sample{height:128px}}
</style>`;
html = html.replace("</head>", `${css}</head>`);

const js = `<script id="adapta-palette-runtime">
(function(){
  var root=document.getElementById('adapta-color-palette');
  if(!root)return;
  var toast=document.getElementById('svCopyToast');
  var timer=null;
  function show(message){if(!toast)return;toast.textContent=message;toast.classList.add('is-visible');clearTimeout(timer);timer=setTimeout(function(){toast.classList.remove('is-visible')},1400)}
  function fallbackCopy(value){var area=document.createElement('textarea');area.value=value;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove()}
  function copy(value,label){var done=function(){show(label||('Copiado: '+value))};if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(value).then(done).catch(function(){fallbackCopy(value);done()})}else{fallbackCopy(value);done()}}
  function colors(){return Array.from(root.querySelectorAll('.sv-color-card')).map(function(card){return {name:card.dataset.colorName,hex:card.dataset.hex,rgb:card.dataset.rgb,hsl:card.dataset.hsl}})}
  function slug(name){return name.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
  function payload(format){var c=colors();if(format==='css')return ':root {\\n'+c.map(function(x){return '  --adapta-'+slug(x.name)+': '+x.hex+';'}).join('\\n')+'\\n}';if(format==='scss')return c.map(function(x){return '$adapta-'+slug(x.name)+': '+x.hex+';'}).join('\\n');if(format==='json')return JSON.stringify(Object.fromEntries(c.map(function(x){return [slug(x.name),{hex:x.hex,rgb:x.rgb,hsl:x.hsl}]})),null,2);return 'PALETA ADAPTA\\n\\n'+c.map(function(x){return x.name+'\\nHEX: '+x.hex+'\\nRGB: '+x.rgb+'\\nHSL: '+x.hsl}).join('\\n\\n')}
  root.addEventListener('click',function(event){var single=event.target.closest('[data-copy-value]');if(single){copy(single.dataset.copyValue);return}var all=event.target.closest('[data-palette-copy]');if(all){var format=all.dataset.paletteCopy;copy(payload(format),'Paleta copiada em '+format.toUpperCase());return}var download=event.target.closest('[data-palette-download]');if(download){var text=payload('txt');var blob=new Blob([text],{type:'text/plain;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='paleta-adapta.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},0);show('paleta-adapta.txt criado')}})
})();
</script>`;
html = html.replace("</body>", `${js}</body>`);

writeFileSync(FILE, html, "utf8");
console.log("Adapta: paleta HTML interativa com cópia individual e exportação TXT/CSS/JSON/SCSS.");
