import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

if (!html.includes('id="page-design"')) throw new Error("Sistema Visual não encontrado.");
if (!html.includes('id="adapta-color-palette"')) throw new Error("Paleta não encontrada; compactação interrompida.");

const css = `<style id="adapta-system-visual-compact">
/* Sistema Visual: densidade maior sem sacrificar leitura. */
#page-design{padding-top:4px!important;padding-bottom:44px!important}
#page-design .sv-head{margin-bottom:14px!important;gap:16px!important}
#page-design .sv-head h2{font-size:32px!important;line-height:1.02!important;margin:2px 0 7px!important}
#page-design .sv-head p{font-size:14px!important;line-height:1.42!important;max-width:700px!important}
#page-design .eyebrow{font-size:10px!important}

#page-design .sv-rule{
  grid-template-columns:58px 1fr!important;
  gap:13px!important;
  padding:13px 15px!important;
  margin-bottom:22px!important;
  border-radius:13px!important;
}
#page-design .sv-rule .sv-inline-logo{width:48px!important;height:48px!important}
#page-design .sv-rule strong{font-size:16px!important;margin-bottom:3px!important}
#page-design .sv-rule p{font-size:13px!important;line-height:1.38!important}

#page-design .sv-section{padding:22px 0!important}
#page-design .sv-section-intro{margin-bottom:14px!important;max-width:720px!important}
#page-design .sv-section-intro h3{font-size:22px!important;margin:3px 0 5px!important}
#page-design .sv-section-intro p{font-size:13px!important;line-height:1.42!important}

#page-design .sv-signature-row{
  grid-template-columns:178px minmax(0,1fr)!important;
  gap:12px!important;
  padding:11px 0!important;
}
#page-design .sv-signature-copy{padding:8px 5px 0 0!important}
#page-design .sv-step{font-size:9px!important;margin-bottom:7px!important}
#page-design .sv-signature-copy h4{font-size:17px!important;margin-bottom:5px!important}
#page-design .sv-signature-copy p{font-size:12px!important;line-height:1.4!important}
#page-design .sv-variants{gap:9px!important}
#page-design .sv-variant{min-height:184px!important;border-radius:12px!important}
#page-design .sv-variant-label{padding:9px 11px 0!important;font-size:9px!important}
#page-design .sv-logo-stage{padding:9px 16px!important;min-height:112px!important}
#page-design .sv-logo-stage .sv-inline-logo{max-height:96px!important;max-width:88%!important}
#page-design .sv-downloads{padding:8px 10px!important}
#page-design .sv-downloads button{min-height:30px!important;padding:0 10px!important;border-radius:7px!important;font-size:10px!important}

/* Paleta compacta */
#page-design .sv-palette-intro{gap:16px!important;align-items:flex-end!important}
#page-design .sv-palette-actions{gap:5px!important}
#page-design .sv-palette-actions button{min-height:31px!important;padding:0 9px!important;border-radius:7px!important;font-size:9px!important}
#page-design .sv-color-grid{gap:9px!important}
#page-design .sv-color-card{border-radius:12px!important}
#page-design .sv-color-sample{height:102px!important;padding:10px!important}
#page-design .sv-color-sample span{font-size:8px!important}
#page-design .sv-color-info{padding:10px!important}
#page-design .sv-color-name{margin-bottom:7px!important;gap:6px!important}
#page-design .sv-color-name strong{font-size:13px!important}
#page-design .sv-color-name span{font-size:8px!important}
#page-design .sv-code-row{min-height:30px!important;grid-template-columns:32px minmax(0,1fr) auto!important;gap:5px!important}
#page-design .sv-code-row span{font-size:8px!important}
#page-design .sv-code-row code{font-size:9px!important}
#page-design .sv-code-row.is-primary code{font-size:11px!important}
#page-design .sv-code-row b{font-size:8px!important}

/* Tipografia sem ocupar uma tela inteira. */
#page-design .sv-type-card{
  grid-template-columns:minmax(0,1fr) 180px!important;
  gap:18px!important;
  padding:18px!important;
  border-radius:13px!important;
}
#page-design .sv-type-display{font-size:44px!important;line-height:.92!important}
#page-design .sv-type-meta{padding-top:9px!important}
#page-design .sv-type-meta strong{font-size:16px!important}
#page-design .sv-type-meta span{font-size:11px!important}

@media(max-width:980px){
  #page-design .sv-signature-row{grid-template-columns:145px minmax(0,1fr)!important}
  #page-design .sv-logo-stage .sv-inline-logo{max-width:94%!important}
}
@media(max-width:760px){
  #page-design .sv-head h2{font-size:28px!important}
  #page-design .sv-signature-row{grid-template-columns:1fr!important;gap:5px!important}
  #page-design .sv-signature-copy{padding-top:4px!important}
  #page-design .sv-variants{grid-template-columns:1fr 1fr!important}
  #page-design .sv-variant{min-height:158px!important}
  #page-design .sv-logo-stage{min-height:92px!important}
  #page-design .sv-logo-stage .sv-inline-logo{max-height:78px!important}
  #page-design .sv-palette-intro{align-items:flex-start!important}
  #page-design .sv-color-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  #page-design .sv-color-sample{height:86px!important}
  #page-design .sv-type-card{grid-template-columns:1fr!important}
  #page-design .sv-type-display{font-size:38px!important}
}
@media(max-width:520px){
  #page-design .sv-variants,#page-design .sv-color-grid{grid-template-columns:1fr!important}
  #page-design .sv-color-sample{height:78px!important}
}
</style>`;

if (!html.includes('id="adapta-system-visual-compact"')) {
  html = html.replace("</head>", `${css}</head>`);
}

writeFileSync(FILE, html, "utf8");
console.log("Adapta: Sistema Visual compactado globalmente.");
