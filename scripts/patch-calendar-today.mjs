import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

const openCalendarMarker = `if(page==="calendar"){
    renderCalendar();
    requestAnimationFrame(()=>fullCalendarInstance?.updateSize());
  }`;

const openCalendarReplacement = `if(page==="calendar"){
    renderCalendar();
    requestAnimationFrame(()=>{
      if(!fullCalendarInstance)return;
      fullCalendarInstance.today();
      fullCalendarInstance.updateSize();
      requestAnimationFrame(()=>{
        const todayCell=document.querySelector("#fullCalendar .fc-day-today");
        if(!todayCell)return;
        const headerHeight=document.querySelector(".shell-header")?.getBoundingClientRect().height||0;
        const targetY=todayCell.getBoundingClientRect().top+window.scrollY-headerHeight-110;
        window.scrollTo({top:Math.max(0,targetY),behavior:"smooth"});
      });
    });
  }`;

if (!html.includes(openCalendarMarker)) {
  throw new Error("Calendar open-page marker not found; refusing partial today patch.");
}
html = html.replace(openCalendarMarker, openCalendarReplacement);

const todayCss = `<style id="calendar-today-ux-v46">
/* v46 — leitura inequívoca de hoje e redução visual dos dias de outro mês */
#fullCalendar .fc-day-other{
  background:#fafbfa !important;
}
#fullCalendar .fc-day-other .fc-daygrid-day-frame{
  opacity:.34 !important;
}
#fullCalendar .fc-day-other .fc-daygrid-day-number{
  color:rgba(17,17,17,.30) !important;
}
#fullCalendar .fc-daygrid-day.fc-day-today{
  background:rgba(10,52,38,.075) !important;
  box-shadow:inset 0 0 0 2px #0A3426 !important;
}
#fullCalendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-top{
  justify-content:space-between !important;
  align-items:center !important;
  padding-left:6px;
}
#fullCalendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-top::before{
  content:"HOJE";
  display:inline-flex;
  align-items:center;
  min-height:18px;
  padding:0 6px;
  border-radius:999px;
  background:#0A3426;
  color:#fff;
  font-family:"Montserrat",Arial,Helvetica,sans-serif;
  font-size:8px;
  font-weight:800;
  letter-spacing:.08em;
}
#fullCalendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-number{
  background:#0A3426 !important;
  color:#fff !important;
  border-radius:999px !important;
  min-width:24px !important;
  height:24px !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  font-weight:800 !important;
}
#fullCalendar .fc-today-button,
#fullCalendar .fc-today-button:disabled{
  opacity:1 !important;
  cursor:pointer !important;
}
</style>`;

if (!html.includes('id="calendar-today-ux-v46"')) {
  html = html.replace("</head>", `${todayCss}</head>`);
}

const todayRuntime = `<script id="calendar-today-runtime-v46">
(function(){
  const root=document.getElementById("fullCalendar");
  if(!root)return;

  function enableTodayButton(){
    const button=root.querySelector(".fc-today-button");
    if(!button||!button.disabled)return;
    button.disabled=false;
    button.removeAttribute("disabled");
    button.setAttribute("aria-disabled","false");
  }

  function scrollCurrentDay(){
    const todayCell=root.querySelector(".fc-day-today");
    if(!todayCell)return;
    const headerHeight=document.querySelector(".shell-header")?.getBoundingClientRect().height||0;
    const targetY=todayCell.getBoundingClientRect().top+window.scrollY-headerHeight-110;
    window.scrollTo({top:Math.max(0,targetY),behavior:"smooth"});
  }

  const observer=new MutationObserver(enableTodayButton);
  observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:["disabled"]});
  enableTodayButton();

  document.addEventListener("click",event=>{
    if(!event.target.closest("#fullCalendar .fc-today-button"))return;
    requestAnimationFrame(()=>requestAnimationFrame(scrollCurrentDay));
  });
})();
</script>`;

if (!html.includes('id="calendar-today-runtime-v46"')) {
  html = html.replace("</body>", `${todayRuntime}</body>`);
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta v46: hoje destacado, dias externos atenuados, calendário abre no dia atual e botão Hoje permanece utilizável.");
