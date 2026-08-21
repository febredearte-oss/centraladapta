import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

if (!html.includes('id="adapta-hideable-sidebar"')) {
  throw new Error("Sidebar final não encontrada; acabamento interrompido.");
}
if (!html.includes('id="adapta-workdesk-overview"')) {
  throw new Error("Visão Geral workdesk não encontrada; acabamento interrompido.");
}

const css = `<style id="adapta-open-layout-polish">
/* Estado aberto: a navegação vira parte da moldura, não um painel concorrendo com o conteúdo. */
:root{--sidebar-width:218px!important}
body{--main-pad-left:24px!important}
body.sidebar-closed{--main-pad-left:68px!important}

.app-sidebar{
  padding:16px 12px 14px!important;
  box-shadow:5px 0 22px rgba(18,43,31,.028)!important;
}
.app-sidebar .brand-official{
  min-height:50px!important;
  padding:0 42px 14px 6px!important;
  margin-bottom:10px!important;
}
.app-sidebar .brand-official .brand-logo-horizontal{
  width:138px!important;
  max-height:36px!important;
}
.app-sidebar .main-nav{gap:2px!important}
.app-sidebar .main-nav>button,
.app-sidebar .sidebar-nav-group>.sidebar-calendar-main{
  min-height:40px!important;
}
.app-sidebar .sidebar-subnav-level1{margin-left:27px!important}
.app-sidebar .user-select{min-height:38px!important}

/* O controle fica visualmente dentro do topo da sidebar enquanto ela está aberta. */
.sidebar-toggle{
  top:20px!important;
  left:calc(var(--sidebar-width) - 45px)!important;
  width:32px!important;
  height:32px!important;
  border-color:transparent!important;
  border-radius:9px!important;
  background:transparent!important;
  box-shadow:none!important;
}
.sidebar-toggle:hover{background:#edf2ee!important}
.sidebar-toggle span{width:15px!important}
body.sidebar-closed .sidebar-toggle{
  top:14px!important;
  left:14px!important;
  width:40px!important;
  height:40px!important;
  border-color:#dfe4df!important;
  background:#fff!important;
  box-shadow:0 6px 18px rgba(18,43,31,.08)!important;
}

.shell-main{
  max-width:1520px!important;
  padding-right:24px!important;
}

/* Topo da Visão Geral: uma linha única e estável. */
#page-overview{padding-top:14px!important}
#page-overview .workdesk-command{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(320px,474px)!important;
  align-items:center!important;
  gap:22px!important;
  margin:0 0 14px!important;
  min-height:54px;
}
#page-overview .workdesk-title{
  display:flex!important;
  align-items:baseline!important;
  gap:12px!important;
  min-width:0;
}
#page-overview .workdesk-title h1{
  font-size:30px!important;
  line-height:1!important;
  white-space:nowrap;
}
#page-overview .workdesk-tools{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) 50px!important;
  gap:10px!important;
  align-items:center!important;
}
#page-overview .workdesk-search-wrap{min-width:0!important}
#page-overview #overviewGlobalSearch{height:50px!important}
#page-overview .workdesk-plus{width:50px!important;height:50px!important}
#page-overview .workdesk-week{margin-bottom:14px!important}

/* Primeira dobra: Agora continua dominante sem criar um vazio gigante em Sinais. */
#page-overview .workdesk-board{
  gap:14px!important;
  align-items:start!important;
}
#page-overview .workdesk-focus,
#page-overview .workdesk-signals{
  min-height:176px!important;
  height:176px!important;
  align-self:start!important;
}
#page-overview .workdesk-focus-body{
  min-height:124px!important;
  padding:22px 28px!important;
}
#page-overview .workdesk-focus-body h2{
  font-size:30px!important;
  line-height:1.06!important;
  margin-bottom:10px!important;
}
#page-overview .workdesk-signals .workdesk-signal-list{
  padding:14px 16px!important;
  display:flex!important;
  flex-direction:column!important;
  gap:7px!important;
}
#page-overview .workdesk-signals .workdesk-signal{
  width:100%!important;
  min-height:54px!important;
  padding:9px 12px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:14px!important;
  text-align:left!important;
}
#page-overview .workdesk-signals .workdesk-signal span{
  flex:0 0 auto!important;
  margin:0!important;
}
#page-overview .workdesk-signals .workdesk-signal strong{
  margin:0!important;
  text-align:right!important;
}
#page-overview .workdesk-card-head{min-height:50px!important}

@media(max-width:1100px){
  :root{--sidebar-width:206px!important}
  .app-sidebar .brand-official .brand-logo-horizontal{width:128px!important}
  #page-overview .workdesk-command{grid-template-columns:1fr!important;gap:12px!important}
  #page-overview .workdesk-tools{max-width:none!important}
}
@media(max-width:840px){
  :root{--sidebar-width:236px!important}
  body,body.sidebar-closed{--main-pad-left:58px!important}
  .app-sidebar{width:min(82vw,270px)!important}
  .sidebar-toggle,
  body.sidebar-closed .sidebar-toggle{top:14px!important;left:14px!important;width:40px!important;height:40px!important;border-color:#dfe4df!important;background:#fff!important;box-shadow:0 6px 18px rgba(18,43,31,.08)!important}
  body.sidebar-mobile-open .sidebar-toggle{left:min(calc(82vw - 48px),222px)!important;top:18px!important;width:34px!important;height:34px!important;border-color:transparent!important;background:transparent!important;box-shadow:none!important}
  #page-overview .workdesk-title h1{font-size:27px!important}
  #page-overview .workdesk-focus,
  #page-overview .workdesk-signals{height:auto!important;min-height:150px!important}
}
</style>`;

if (!html.includes('id="adapta-open-layout-polish"')) {
  html = html.replace("</head>", `${css}</head>`);
}

writeFileSync(FILE, html, "utf8");
console.log("Adapta: estado aberto refinado — sidebar mais leve, toggle integrado e primeira dobra equilibrada.");
