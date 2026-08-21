import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const FILE = "public/index.html";
const LOGO_PAYLOAD = readFileSync("approved/adapta-logos-svg.b64", "utf8").trim();
const logos = JSON.parse(gunzipSync(Buffer.from(LOGO_PAYLOAD, "base64")).toString("utf8"));

const withClass = (name, className) => {
  const svg = logos[name];
  if (!svg) throw new Error(`Logo oficial não encontrado: ${name}`);
  return svg.replace(
    "<svg ",
    `<svg class="brand-logo ${className}" aria-hidden="true" focusable="false" `
  );
};

let html = readFileSync(FILE, "utf8");

const oldBrand = `<div class="brand"><div class="brand-mark">A</div><strong>Central Adapta</strong></div>`;
const newBrand = `<div class="brand brand-official" aria-label="Central Adapta">
  ${withClass("horizontal-claro", "brand-logo-horizontal")}
  ${withClass("compacta-claro", "brand-logo-compacta")}
  ${withClass("ultracompacta-claro", "brand-logo-ultracompacta")}
  <strong class="brand-context">Central</strong>
</div>`;

if (!html.includes(oldBrand)) {
  throw new Error("Marca genérica do cabeçalho não encontrada; atualização interrompida.");
}
html = html.replace(oldBrand, newBrand);

const css = `<style id="adapta-responsive-header-brand">
/* Cabeçalho da Central — assinaturas oficiais responsivas da Adapta. */
.shell-header .brand-official{
  display:flex;
  align-items:center;
  gap:9px;
  flex:none;
  min-width:0;
}
.shell-header .brand-official .brand-logo{
  display:none;
  flex:none;
  width:auto;
  height:auto;
  max-width:none;
  overflow:visible;
}
.shell-header .brand-official .brand-logo-horizontal{
  display:block;
  width:150px;
  max-height:38px;
}
.shell-header .brand-official .brand-context{
  display:block;
  font-family:"Montserrat",Arial,sans-serif;
  font-size:11px;
  line-height:1;
  font-weight:700;
  color:#0A3426;
  white-space:nowrap;
}
@media(max-width:1180px){
  .shell-header .brand-official .brand-logo-horizontal{display:none}
  .shell-header .brand-official .brand-logo-compacta{
    display:block;
    height:38px;
    max-width:76px;
  }
}
@media(max-width:760px){
  .shell-header .brand-official .brand-logo-compacta{display:none}
  .shell-header .brand-official .brand-logo-ultracompacta{
    display:block;
    width:36px;
    height:36px;
  }
  .shell-header .brand-official .brand-context{display:none}
}
</style>`;

if (!html.includes('id="adapta-responsive-header-brand"')) {
  html = html.replace("</head>", `${css}</head>`);
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: cabeçalho usando logotipos oficiais responsivos (horizontal → compacta → ultra compacta)." );
