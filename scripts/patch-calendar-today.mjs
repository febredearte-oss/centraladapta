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
        const todayKey=isoDate(new Date());
        const todayCell=document.querySelector(\`#fullCalendar [data-calendar-date="\${todayKey}"]\`);
        if(!todayCell)return;
        todayCell.classList.add("adapta-actual-today");
        const top=todayCell.querySelector(".fc-daygrid-day-top");
        if(top&&!top.querySelector(".adapta-today-label")){
          const label=document.createElement("span");
          label.className="adapta-today-label";
          label.textContent="HOJE";
          top.prepend(label);
        }
        const headerHeight=document.querySelector(".shell-header")?.getBoundingClientRect().height||0;
        const targetY=todayCell.getBoundingClientRect().top+window.scrollY-headerHeight-190;
        window.scrollTo({top:Math.max(0,targetY),behavior:"smooth"});
      });
    });
  }`;

if (!html.includes(openCalendarMarker)) {
  throw new Error("Calendar open-page marker not found; refusing partial today patch.");
}
html = html.replace(openCalendarMarker, openCalendarReplacement);

const todayCss = `<style id="calendar-today-ux-v47">
/* v47 — hoje calculado explicitamente pelo navegador, sem depender da classe interna do FullCalendar */
#fullCalendar .fc-day-other{
  background:#fbfcfb !important;
}
#fullCalendar .fc-day-other .fc-daygrid-day-frame{
  opacity:.24 !important;
}
#fullCalendar .fc-day-other .fc-daygrid-day-number{
  color:rgba(17,17,17,.24) !important;
}
#fullCalendar .fc-daygrid-day.adapta-actual-today{
  background:#edf4f0 !important;
  box-shadow:inset 0 0 0 2px #0A3426 !important;
  position:relative;
  z-index:1;
}
#fullCalendar .fc-daygrid-day.adapta-actual-today .fc-daygrid-day-top{
  justify-content:space-between !important;
  align-items:center !important;
  padding:5px 5px 0 7px !important;
}
#fullCalendar .adapta-today-label{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:19px;
  padding:0 7px;
  border-radius:999px;
  background:#0A3426;
  color:#fff;
  font-family:"Montserrat",Arial,Helvetica,sans-serif;
  font-size:8px;
  line-height:1;
  font-weight:800;
  letter-spacing:.09em;
}
#fullCalendar .fc-daygrid-day.adapta-actual-today .fc-daygrid-day-number{
  background:#0A3426 !important;
  color:#fff !important;
  border-radius:999px !important;
  min-width:26px !important;
  height:26px !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  font-weight:800 !important;
  padding:0 !important;
}
#fullCalendar .fc-today-button,
#fullCalendar .fc-today-button:disabled{
  opacity:1 !important;
  cursor:pointer !important;
  filter:none !important;
}
</style>`;

html = html.replace(/<style id="calendar-today-ux-v46">[\s\S]*?<\/style>/, "");
if (!html.includes('id="calendar-today-ux-v47"')) {
  html = html.replace("</head>", `${todayCss}</head>`);
}

const todayRuntime = `<script id="calendar-today-runtime-v47">
(function(){
  const root=document.getElementById("fullCalendar");
  if(!root)return;

  function todayKey(){
    const now=new Date();
    const y=now.getFullYear();
    const m=String(now.getMonth()+1).padStart(2,"0");
    const d=String(now.getDate()).padStart(2,"0");
    return \`\${y}-\${m}-\${d}\`;
  }

  function markActualToday(){
    root.querySelectorAll(".adapta-actual-today").forEach(cell=>cell.classList.remove("adapta-actual-today"));
    root.querySelectorAll(".adapta-today-label").forEach(label=>label.remove());
    const cell=root.querySelector(\`[data-calendar-date="\${todayKey()}"]\`);
    if(!cell)return null;
    cell.classList.add("adapta-actual-today");
    const top=cell.querySelector(".fc-daygrid-day-top");
    if(top){
      const label=document.createElement("span");
      label.className="adapta-today-label";
      label.textContent="HOJE";
      top.prepend(label);
    }
    return cell;
  }

  function enableTodayButton(){
    const button=root.querySelector(".fc-today-button");
    if(button){
      button.disabled=false;
      button.removeAttribute("disabled");
      button.setAttribute("aria-disabled","false");
    }
  }

  function scrollCurrentDay(){
    const todayCell=markActualToday();
    if(!todayCell)return;
    const headerHeight=document.querySelector(".shell-header")?.getBoundingClientRect().height||0;
    const targetY=todayCell.getBoundingClientRect().top+window.scrollY-headerHeight-190;
    window.scrollTo({top:Math.max(0,targetY),behavior:"smooth"});
  }

  let scheduled=false;
  function refresh(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      markActualToday();
      enableTodayButton();
    });
  }

  const observer=new MutationObserver(refresh);
  observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:["disabled","class"]});
  refresh();

  document.addEventListener("click",event=>{
    if(!event.target.closest("#fullCalendar .fc-today-button"))return;
    requestAnimationFrame(()=>requestAnimationFrame(scrollCurrentDay));
  });
})();
</script>`;

html = html.replace(/<script id="calendar-today-runtime-v46">[\s\S]*?<\/script>/, "");
if (!html.includes('id="calendar-today-runtime-v47"')) {
  html = html.replace("</body>", `${todayRuntime}</body>`);
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta v47: hoje marcado pelo próprio calendário local, dias externos atenuados e foco automático na semana atual.");
