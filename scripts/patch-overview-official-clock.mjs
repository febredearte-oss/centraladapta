import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

const oldLine = '  const today=new Date(); today.setHours(12,0,0,0); const todayIso=isoDate(today);';
const newBlock = `  const todayIso=window.__adaptaOfficialDate||null;
  if(!todayIso){
    const label=document.getElementById("overviewTodayLabel");
    if(label)label.textContent="DATA OFICIAL…";
    const week=document.getElementById("overviewWeekStrip");
    if(week)week.innerHTML="";
    if(!window.__adaptaOverviewClockLoading){
      window.__adaptaOverviewClockLoading=fetch("/api/central-clock",{cache:"no-store"})
        .then(response=>response.ok?response.json():Promise.reject(new Error("clock_unavailable")))
        .then(clock=>{
          window.__adaptaOfficialDate=clock.date;
          window.__adaptaOverviewClockLoading=null;
          renderOverview();
          return clock.date;
        })
        .catch(error=>{
          window.__adaptaOverviewClockLoading=null;
          console.error("Relógio oficial da Visão geral indisponível",error);
          if(label)label.textContent="DATA INDISPONÍVEL";
          return null;
        });
    }
    return;
  }
  const [todayYear,todayMonth,todayDay]=todayIso.split("-").map(Number);
  const today=new Date(todayYear,todayMonth-1,todayDay,12,0,0,0);`;

if(!html.includes(oldLine)) throw new Error("Fonte local de data da Visão geral não encontrada.");
html=html.replace(oldLine,newBlock);

writeFileSync(FILE,html,"utf8");
console.log("Central Adapta: Visão geral usa exclusivamente /api/central-clock.");
