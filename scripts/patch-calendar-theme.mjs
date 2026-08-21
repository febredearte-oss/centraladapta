import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
const ADAPTA_GREEN = "#0A3426";
const ADAPTA_GREEN_HOVER = "#123F31";
const ADAPTA_GREEN_ACTIVE = "#07271D";
const DISABLED = "#7C8380";

let html = readFileSync(FILE, "utf8");

const constructorMarker = `if(fullCalendarInstance)return true;\n\n  fullCalendarInstance=new FullCalendar.Calendar(target,{\n    themeSystem:"classic",`;

const constructorReplacement = `if(fullCalendarInstance)return true;\n\n  // Tema institucional aplicado na própria raiz do FullCalendar.\n  target.style.setProperty("--fc-button-text-color", "#ffffff");\n  target.style.setProperty("--fc-button-bg-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-button-border-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-button-hover-bg-color", "${ADAPTA_GREEN_HOVER}");\n  target.style.setProperty("--fc-button-hover-border-color", "${ADAPTA_GREEN_HOVER}");\n  target.style.setProperty("--fc-button-active-bg-color", "${ADAPTA_GREEN_ACTIVE}");\n  target.style.setProperty("--fc-button-active-border-color", "${ADAPTA_GREEN_ACTIVE}");\n  target.style.setProperty("--fc-classic-button-background", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-classic-button-border", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-classic-button-text", "#ffffff");\n  target.style.setProperty("--fc-classic-button-hover-background", "${ADAPTA_GREEN_HOVER}");\n  target.style.setProperty("--fc-classic-button-hover-border", "${ADAPTA_GREEN_HOVER}");\n  target.style.setProperty("--fc-classic-button-active-background", "${ADAPTA_GREEN_ACTIVE}");\n  target.style.setProperty("--fc-classic-button-active-border", "${ADAPTA_GREEN_ACTIVE}");\n  target.style.setProperty("--fc-event-bg-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-event-border-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-event-text-color", "#ffffff");\n\n  fullCalendarInstance=new FullCalendar.Calendar(target,{\n    themeSystem:"classic",\n    eventColor:"${ADAPTA_GREEN}",\n    eventBackgroundColor:"${ADAPTA_GREEN}",\n    eventBorderColor:"${ADAPTA_GREEN}",\n    eventTextColor:"#ffffff",`;

if (!html.includes(constructorMarker)) {
  throw new Error("FullCalendar constructor marker not found; refusing partial calendar patch.");
}
html = html.replace(constructorMarker, constructorReplacement);

// Atualiza também as cores declaradas diretamente nos objetos de evento.
const eventsStart = html.indexOf("function fullCalendarEvents(){");
const eventsEnd = html.indexOf("function desiredCalendarView(){", eventsStart);
if (eventsStart < 0 || eventsEnd < 0) {
  throw new Error("FullCalendar event factory not found; refusing partial calendar patch.");
}
const beforeEvents = html.slice(0, eventsStart);
const eventsBlock = html.slice(eventsStart, eventsEnd).replaceAll("#1f5d46", ADAPTA_GREEN);
const afterEvents = html.slice(eventsEnd);
html = beforeEvents + eventsBlock + afterEvents;

// Mantém a paleta interna do módulo coerente com os arquivos oficiais da marca.
const calendarCssStart = html.indexOf("/* Calendário — FullCalendar oficial */");
const calendarCssEnd = html.indexOf("/* Linhas editoriais */", calendarCssStart);
if (calendarCssStart >= 0 && calendarCssEnd > calendarCssStart) {
  const beforeCss = html.slice(0, calendarCssStart);
  const calendarCss = html.slice(calendarCssStart, calendarCssEnd).replaceAll("#1f5d46", ADAPTA_GREEN);
  const afterCss = html.slice(calendarCssEnd);
  html = beforeCss + calendarCss + afterCss;
}

// A toolbar do tema Classic é montada depois. Esta regra entra no fim do HEAD,
// depois dos estilos externos, e atinge especificamente os botões circulados.
const toolbarCss = `<style id="calendar-toolbar-adapta-final">
#fullCalendar .fc-header-toolbar button,
#fullCalendar .fc-toolbar button,
#fullCalendar button.fc-button{
  background:${ADAPTA_GREEN} !important;
  background-color:${ADAPTA_GREEN} !important;
  background-image:none !important;
  border-color:${ADAPTA_GREEN} !important;
  color:#fff !important;
  box-shadow:none !important;
}
#fullCalendar .fc-header-toolbar button:hover:not(:disabled),
#fullCalendar .fc-toolbar button:hover:not(:disabled),
#fullCalendar button.fc-button:hover:not(:disabled){
  background:${ADAPTA_GREEN_HOVER} !important;
  background-color:${ADAPTA_GREEN_HOVER} !important;
  border-color:${ADAPTA_GREEN_HOVER} !important;
}
#fullCalendar .fc-header-toolbar button.fc-button-active,
#fullCalendar .fc-toolbar button.fc-button-active,
#fullCalendar button.fc-button.fc-button-active{
  background:${ADAPTA_GREEN_ACTIVE} !important;
  background-color:${ADAPTA_GREEN_ACTIVE} !important;
  border-color:${ADAPTA_GREEN_ACTIVE} !important;
}
#fullCalendar .fc-header-toolbar button:disabled,
#fullCalendar .fc-toolbar button:disabled{
  background:${DISABLED} !important;
  background-color:${DISABLED} !important;
  border-color:${DISABLED} !important;
  color:#fff !important;
  opacity:.82 !important;
}
</style>`;

if (!html.includes('id="calendar-toolbar-adapta-final"')) {
  html = html.replace("</head>", `${toolbarCss}</head>`);
}

// Garante a cor no elemento renderizado pelo FullCalendar, inclusive após troca de mês/view.
const toolbarRuntime = `<script id="calendar-toolbar-adapta-runtime">
(function(){
  var GREEN='${ADAPTA_GREEN}', HOVER='${ADAPTA_GREEN_HOVER}', ACTIVE='${ADAPTA_GREEN_ACTIVE}', DISABLED='${DISABLED}';
  function base(button){return button.disabled?DISABLED:(button.classList.contains('fc-button-active')?ACTIVE:GREEN);}
  function paint(button,color){
    button.style.setProperty('background',color,'important');
    button.style.setProperty('background-color',color,'important');
    button.style.setProperty('background-image','none','important');
    button.style.setProperty('border-color',color,'important');
    button.style.setProperty('color','#fff','important');
    button.style.setProperty('box-shadow','none','important');
  }
  function apply(){
    var calendar=document.getElementById('fullCalendar');
    if(!calendar)return;
    calendar.querySelectorAll('.fc-header-toolbar button,.fc-toolbar button,button.fc-button').forEach(function(button){
      paint(button,base(button));
      if(button.dataset.adaptaToolbar==='1')return;
      button.dataset.adaptaToolbar='1';
      button.addEventListener('mouseenter',function(){if(!button.disabled)paint(button,HOVER);});
      button.addEventListener('mouseleave',function(){paint(button,base(button));});
      button.addEventListener('click',function(){requestAnimationFrame(apply);});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','disabled']});
  window.addEventListener('load',apply);
  setTimeout(apply,250);setTimeout(apply,1000);
})();
</script>`;

if (!html.includes('id="calendar-toolbar-adapta-runtime"')) {
  html = html.replace("</body>", `${toolbarRuntime}</body>`);
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: FullCalendar interno + toolbar renderizada em verde institucional.");
