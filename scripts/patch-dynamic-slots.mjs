import { readFileSync, writeFileSync } from "node:fs";

const FILE="public/index.html";
let html=readFileSync(FILE,"utf8");

const css=`<style id="adapta-dynamic-slots-v1">
#fullCalendar [role="gridcell"]{position:relative}
#fullCalendar .adapta-empty-slot{display:flex;align-items:center;justify-content:center;min-height:24px;margin:4px 5px;padding:3px 7px;border:1px dashed rgba(10,52,38,.35);border-radius:7px;background:rgba(237,244,240,.55);color:#557167;font:800 8px/1.1 "Montserrat",Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;pointer-events:none}
#fullCalendar .adapta-empty-slot::before{content:"";width:5px;height:5px;margin-right:5px;border:1px solid currentColor;border-radius:50%;opacity:.75}
</style>`;
if(!html.includes('id="adapta-dynamic-slots-v1"'))html=html.replace("</head>",css+"</head>");

const runtime=`<script id="adapta-dynamic-slots-runtime-v1">
(function(){
  const DEFAULT_DAYS=[1,3,5]; // seg, qua, sex
  const root=document.getElementById('fullCalendar');
  if(!root)return;
  let rendering=false;

  function parseIsoDate(value){
    if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(value||'')))return null;
    const [y,m,d]=String(value).split('-').map(Number);
    return new Date(Date.UTC(y,m-1,d,12));
  }
  function iso(date){return date.toISOString().slice(0,10)}
  function localState(){
    try{return JSON.parse(localStorage.getItem('central_adapta_v40')||'null')||{}}catch(error){return{}}
  }
  function config(){
    const state=localState();
    const settings=state.settings||{};
    const start=parseIsoDate(settings.planningStart)||parseIsoDate(window.__adaptaOfficialDate)||new Date(Date.UTC(new Date().getUTCFullYear(),0,1,12));
    const year=start.getUTCFullYear();
    const end=parseIsoDate(settings.planningEnd)||new Date(Date.UTC(year,11,31,12));
    const days=Array.isArray(settings.preferredDays)&&settings.preferredDays.length?settings.preferredDays.map(Number):DEFAULT_DAYS;
    return{start,end,days:[...new Set(days)].filter(day=>day>=0&&day<=6).sort()};
  }
  function expectedDates(){
    const {start,end,days}=config();
    const out=[];
    for(let d=new Date(start);d<=end;d.setUTCDate(d.getUTCDate()+1))if(days.includes(d.getUTCDay()))out.push(iso(d));
    return out;
  }
  function occupiedDates(){
    const set=new Set();
    const events=typeof fullCalendarInstance?.getEvents==='function'?fullCalendarInstance.getEvents():[];
    for(const event of events){
      const props=event.extendedProps||{};
      if(props.holiday)continue;
      if((props.behavior||'main')!=='main')continue;
      const key=(event.startStr||'').slice(0,10);
      if(key)set.add(key);
    }
    return set;
  }
  function updateDisplayedTotals(total){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const text=node.nodeValue||'';
      if(/\\b72\\b/i.test(text)&&/slot/i.test(text))node.nodeValue=text.replace(/\\b72\\b/g,String(total));
    }
    document.querySelectorAll('[data-slot-total]').forEach(el=>el.textContent=String(total));
  }
  function render(){
    if(rendering)return; rendering=true;
    try{
      const expected=expectedDates();
      const expectedSet=new Set(expected);
      const occupied=occupiedDates();
      root.querySelectorAll('.adapta-empty-slot').forEach(el=>el.remove());
      root.querySelectorAll('[role="gridcell"][data-date]').forEach(cell=>{
        const date=cell.getAttribute('data-date')||'';
        if(!expectedSet.has(date)||occupied.has(date))return;
        const frame=cell.querySelector('.fc-daygrid-day-frame')||cell;
        const slot=document.createElement('div');
        slot.className='adapta-empty-slot';
        slot.dataset.expectedDate=date;
        slot.textContent='Slot vazio';
        frame.appendChild(slot);
      });
      updateDisplayedTotals(expected.length);
      window.__adaptaSlotPlan={
        total:expected.length,
        expectedDates:expected,
        preferredDays:config().days,
        planningStart:iso(config().start),
        planningEnd:iso(config().end),
        refresh:render
      };
    }finally{rendering=false}
  }
  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{queued=false;render()}))}
  const observer=new MutationObserver(()=>{if(!rendering)schedule()});
  observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['data-date','class']});
  document.addEventListener('adapta:state-updated',schedule);
  window.addEventListener('storage',event=>{if(event.key==='central_adapta_v40')schedule()});
  setInterval(schedule,3000);
  schedule();
})();
</script>`;
if(!html.includes('id="adapta-dynamic-slots-runtime-v1"'))html=html.replace("</body>",runtime+"</body>");

writeFileSync(FILE,html,"utf8");
console.log("Central Adapta: slots dinâmicos por período e placeholders seg/qua/sex aplicados.");
