import { readFileSync, writeFileSync } from "node:fs";

const path = "public/index.html";
let html = readFileSync(path, "utf8");

const css = `<style id="adapta-fullcalendar-toolbar-theme">
/* Aplicado depois dos estilos externos do FullCalendar Classic. */
#fullCalendar{
  --fc-button-bg-color:#0A3426 !important;
  --fc-button-border-color:#0A3426 !important;
  --fc-button-text-color:#ffffff !important;
  --fc-button-hover-bg-color:#123F31 !important;
  --fc-button-hover-border-color:#123F31 !important;
  --fc-button-active-bg-color:#07271D !important;
  --fc-button-active-border-color:#07271D !important;
  --fc-classic-button-background:#0A3426 !important;
  --fc-classic-button-border:#0A3426 !important;
  --fc-classic-button-text:#ffffff !important;
  --fc-classic-button-hover-background:#123F31 !important;
  --fc-classic-button-hover-border:#123F31 !important;
  --fc-classic-button-active-background:#07271D !important;
  --fc-classic-button-active-border:#07271D !important;
}
#fullCalendar .fc-header-toolbar button,
#fullCalendar .fc-toolbar button,
#fullCalendar button.fc-button{
  background-color:#0A3426 !important;
  background-image:none !important;
  border-color:#0A3426 !important;
  color:#ffffff !important;
  box-shadow:none !important;
}
#fullCalendar .fc-header-toolbar button:hover:not(:disabled),
#fullCalendar .fc-toolbar button:hover:not(:disabled),
#fullCalendar button.fc-button:hover:not(:disabled){
  background-color:#123F31 !important;
  border-color:#123F31 !important;
}
#fullCalendar .fc-header-toolbar button.fc-button-active,
#fullCalendar .fc-toolbar button.fc-button-active,
#fullCalendar button.fc-button.fc-button-active{
  background-color:#07271D !important;
  border-color:#07271D !important;
}
#fullCalendar .fc-header-toolbar button:disabled,
#fullCalendar .fc-toolbar button:disabled{
  background-color:#7C8380 !important;
  border-color:#7C8380 !important;
  color:#ffffff !important;
  opacity:.82 !important;
}
</style>`;

const js = `<script id="adapta-fullcalendar-toolbar-runtime">
(function(){
  const GREEN='#0A3426';
  const HOVER='#123F31';
  const ACTIVE='#07271D';
  const DISABLED='#7C8380';

  function baseColor(button){
    if(button.disabled) return DISABLED;
    return button.classList.contains('fc-button-active') ? ACTIVE : GREEN;
  }

  function paint(button, color){
    button.style.setProperty('background-color', color, 'important');
    button.style.setProperty('background-image', 'none', 'important');
    button.style.setProperty('border-color', color, 'important');
    button.style.setProperty('color', '#ffffff', 'important');
    button.style.setProperty('box-shadow', 'none', 'important');
  }

  function applyToolbarTheme(){
    const calendar=document.getElementById('fullCalendar');
    if(!calendar) return;
    calendar.style.setProperty('--fc-button-bg-color',GREEN,'important');
    calendar.style.setProperty('--fc-button-border-color',GREEN,'important');
    calendar.style.setProperty('--fc-button-hover-bg-color',HOVER,'important');
    calendar.style.setProperty('--fc-button-hover-border-color',HOVER,'important');
    calendar.style.setProperty('--fc-button-active-bg-color',ACTIVE,'important');
    calendar.style.setProperty('--fc-button-active-border-color',ACTIVE,'important');

    calendar.querySelectorAll('.fc-toolbar button, .fc-header-toolbar button, button.fc-button').forEach(function(button){
      paint(button, baseColor(button));
      if(button.dataset.adaptaToolbarBound==='1') return;
      button.dataset.adaptaToolbarBound='1';
      button.addEventListener('mouseenter',function(){ if(!button.disabled) paint(button,HOVER); });
      button.addEventListener('mouseleave',function(){ paint(button,baseColor(button)); });
      button.addEventListener('click',function(){ requestAnimationFrame(applyToolbarTheme); });
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyToolbarTheme);
  else applyToolbarTheme();

  const observer=new MutationObserver(applyToolbarTheme);
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled']});
  window.addEventListener('load',applyToolbarTheme);
  setTimeout(applyToolbarTheme,250);
  setTimeout(applyToolbarTheme,1000);
})();
</script>`;

if (!html.includes('id="adapta-fullcalendar-toolbar-theme"')) {
  html = html.replace("</head>", `${css}</head>`);
}
if (!html.includes('id="adapta-fullcalendar-toolbar-runtime"')) {
  html = html.replace("</body>", `${js}</body>`);
}

writeFileSync(path, html, "utf8");
console.log("Central Adapta: toolbar do FullCalendar forçada para verde institucional.");
