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
        const todayCell=document.querySelector(\`#fullCalendar [role="gridcell"][data-date="\${todayKey}"]\`);
        if(!todayCell)return;
        todayCell.classList.add("adapta-actual-today");
        const top=todayCell.firstElementChild;
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

if (html.includes("  fullCalendarInstance.rerenderEvents();")) {
  html = html.replace(
    "  fullCalendarInstance.rerenderEvents();",
    "  if(typeof fullCalendarInstance.rerenderEvents===\"function\")fullCalendarInstance.rerenderEvents();"
  );
}

const todayCss = `<style id="calendar-today-ux-v48">
/* v48 — compatível com a estrutura real do FullCalendar 7 */
#fullCalendar [role="gridcell"].adapta-other-month{
  background:#fbfcfb !important;
}
#fullCalendar [role="gridcell"].adapta-other-month > *{
  opacity:.24 !important;
}
#fullCalendar [role="gridcell"].adapta-actual-today{
  background:#edf4f0 !important;
  box-shadow:inset 0 0 0 2px #0A3426 !important;
  position:relative;
  z-index:1;
}
#fullCalendar [role="gridcell"].adapta-actual-today > :first-child{
  display:flex !important;
  align-items:center !important;
  justify-content:space-between !important;
  gap:6px !important;
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
  flex:0 0 auto;
}
#fullCalendar [role="gridcell"].adapta-actual-today [role="link"]{
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
  flex:0 0 26px;
}
</style>`;

html = html.replace(/<style id="calendar-today-ux-v4[67]">[\s\S]*?<\/style>/, "");
if (!html.includes('id="calendar-today-ux-v48"')) {
  html = html.replace("</head>", `${todayCss}</head>`);
}

const todayRuntime = `<script id="calendar-today-runtime-v48">
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

  function visibleMonthKey(){
    const counts=new Map();
    root.querySelectorAll('[role="gridcell"][data-date]').forEach(cell=>{
      const key=(cell.getAttribute("data-date")||"").slice(0,7);
      if(!key)return;
      counts.set(key,(counts.get(key)||0)+1);
    });
    let best="";
    let bestCount=-1;
    counts.forEach((count,key)=>{
      if(count>bestCount){best=key;bestCount=count;}
    });
    return best;
  }

  function markOtherMonths(){
    const current=visibleMonthKey();
    root.querySelectorAll('[role="gridcell"][data-date]').forEach(cell=>{
      const date=cell.getAttribute("data-date")||"";
      cell.classList.toggle("adapta-other-month",!!current&&!date.startsWith(current));
    });
  }

  function markActualToday(){
    root.querySelectorAll(".adapta-actual-today").forEach(cell=>cell.classList.remove("adapta-actual-today"));
    root.querySelectorAll(".adapta-today-label").forEach(label=>label.remove());
    const cell=root.querySelector('[role="gridcell"][aria-current="date"]') || root.querySelector(\`[role="gridcell"][data-date="\${todayKey()}"]\`);
    if(!cell)return null;
    cell.classList.add("adapta-actual-today");
    const top=cell.firstElementChild;
    if(top){
      const label=document.createElement("span");
      label.className="adapta-today-label";
      label.textContent="HOJE";
      top.prepend(label);
    }
    return cell;
  }

  function todayButton(){
    return [...root.querySelectorAll("button")].find(button=>button.textContent.trim().toLowerCase()==="hoje")||null;
  }

  function enableTodayButton(){
    const button=todayButton();
    if(!button)return;
    button.disabled=false;
    button.removeAttribute("disabled");
    button.setAttribute("aria-disabled","false");
    button.style.opacity="1";
    button.style.cursor="pointer";
  }

  function refresh(){
    markOtherMonths();
    markActualToday();
    enableTodayButton();
  }

  function scrollCurrentDay(){
    const todayCell=markActualToday();
    if(!todayCell)return;
    const headerHeight=document.querySelector(".shell-header")?.getBoundingClientRect().height||0;
    const targetY=todayCell.getBoundingClientRect().top+window.scrollY-headerHeight-190;
    window.scrollTo({top:Math.max(0,targetY),behavior:"smooth"});
  }

  requestAnimationFrame(()=>requestAnimationFrame(refresh));
  root.addEventListener("click",()=>{
    requestAnimationFrame(()=>requestAnimationFrame(refresh));
  },true);
  document.addEventListener("click",event=>{
    const button=todayButton();
    if(!button||!button.contains(event.target))return;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      refresh();
      scrollCurrentDay();
    }));
  });
})();
</script>`;

html = html.replace(/<script id="calendar-today-runtime-v4[67]">[\s\S]*?<\/script>/, "");
if (!html.includes('id="calendar-today-runtime-v48"')) {
  html = html.replace("</body>", `${todayRuntime}</body>`);
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta v48: hoje e dias de outro mês corrigidos para o DOM real do FullCalendar 7; rerenderEvents protegido.");
