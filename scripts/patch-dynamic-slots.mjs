import { readFileSync, writeFileSync } from "node:fs";

const FILE="public/index.html";
let html=readFileSync(FILE,"utf8");

const css=`<style id="adapta-dynamic-slots-v2">
#fullCalendar [role="gridcell"]{position:relative}
#fullCalendar .adapta-empty-slot{display:flex;align-items:center;justify-content:center;min-height:24px;margin:4px 5px;padding:3px 7px;border:1px dashed rgba(10,52,38,.35);border-radius:7px;background:rgba(237,244,240,.55);color:#557167;font:800 8px/1.1 "Montserrat",Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;pointer-events:none}
#fullCalendar .adapta-empty-slot::before{content:"";width:5px;height:5px;margin-right:5px;border:1px solid currentColor;border-radius:50%;opacity:.75}
</style>`;

html=html.replace(/<style id="adapta-dynamic-slots-v\d+">[\s\S]*?<\/style>/g,"");
html=html.replace("</head>",css+"</head>");

const runtime=`<script id="adapta-dynamic-slots-runtime-v2">
(function(){
  const DEFAULT_DAYS=[1,3,5];
  const root=document.getElementById('fullCalendar');
  if(!root)return;

  let rendering=false;
  let queued=false;
  let lastTotal=null;
  let observer=null;

  function parseIsoDate(value){
    if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(value||'')))return null;
    const [y,m,d]=String(value).split('-').map(Number);
    return new Date(Date.UTC(y,m-1,d,12));
  }
  function iso(date){return date.toISOString().slice(0,10)}
  function localState(){
    try{return JSON.parse(localStorage.getItem('central_adapta_v40')||'null')||{}}catch{return{}}
  }
  function config(){
    const state=localState();
    const settings=state.settings||{};
    const official=parseIsoDate(window.__adaptaOfficialDate);
    const start=parseIsoDate(settings.planningStart)||official;
    if(!start)return null;
    const year=start.getUTCFullYear();
    const end=parseIsoDate(settings.planningEnd)||new Date(Date.UTC(year,11,31,12));
    const rawDays=Array.isArray(settings.preferredDays)&&settings.preferredDays.length?settings.preferredDays:DEFAULT_DAYS;
    const days=[...new Set(rawDays.map(Number))].filter(day=>day>=0&&day<=6).sort();
    return{start,end,days};
  }
  function expectedDates(){
    const cfg=config();
    if(!cfg)return[];
    const out=[];
    for(let d=new Date(cfg.start);d<=cfg.end;d.setUTCDate(d.getUTCDate()+1)){
      if(cfg.days.includes(d.getUTCDay()))out.push(iso(d));
    }
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
    if(lastTotal===total)return;
    lastTotal=total;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      const text=node.nodeValue||'';
      if(/\\b72\\b/i.test(text)&&/slot/i.test(text))node.nodeValue=text.replace(/\\b72\\b/g,String(total));
    }
    document.querySelectorAll('[data-slot-total]').forEach(el=>el.textContent=String(total));
  }
  function observe(){
    if(!observer)return;
    observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['data-date','class']});
  }
  function render(){
    if(rendering)return;
    rendering=true;
    observer?.disconnect();
    try{
      const expected=expectedDates();
      const expectedSet=new Set(expected);
      const occupied=occupiedDates();

      root.querySelectorAll('.adapta-empty-slot').forEach(el=>{
        const date=el.dataset.expectedDate||'';
        if(!expectedSet.has(date)||occupied.has(date))el.remove();
      });

      root.querySelectorAll('[role="gridcell"][data-date]').forEach(cell=>{
        const date=cell.getAttribute('data-date')||'';
        const existing=cell.querySelector('.adapta-empty-slot');
        const shouldShow=expectedSet.has(date)&&!occupied.has(date);
        if(!shouldShow){existing?.remove();return}
        if(existing)return;
        const frame=cell.querySelector('.fc-daygrid-day-frame')||cell;
        const slot=document.createElement('div');
        slot.className='adapta-empty-slot';
        slot.dataset.expectedDate=date;
        slot.textContent='Slot vazio';
        frame.appendChild(slot);
      });

      updateDisplayedTotals(expected.length);
      const cfg=config();
      window.__adaptaSlotPlan={
        total:expected.length,
        expectedDates:expected,
        preferredDays:cfg?.days||DEFAULT_DAYS,
        planningStart:cfg?iso(cfg.start):null,
        planningEnd:cfg?iso(cfg.end):null,
        refresh:render
      };
    }finally{
      rendering=false;
      observe();
    }
  }
  function schedule(){
    if(queued||rendering)return;
    queued=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{queued=false;render()}));
  }

  observer=new MutationObserver(mutations=>{
    const external=mutations.some(m=>{
      const target=m.target instanceof Element?m.target:m.target?.parentElement;
      if(target?.closest?.('.adapta-empty-slot'))return false;
      const added=[...(m.addedNodes||[])];
      const removed=[...(m.removedNodes||[])];
      if(added.length||removed.length){
        const onlySlots=[...added,...removed].every(node=>node.nodeType===1&&node.classList?.contains('adapta-empty-slot'));
        if(onlySlots)return false;
      }
      return true;
    });
    if(external)schedule();
  });
  observe();

  document.addEventListener('adapta:central-state',schedule);
  document.addEventListener('adapta:remote-updated',schedule);
  document.addEventListener('adapta:central-ready',schedule);
  window.addEventListener('storage',event=>{if(event.key==='central_adapta_v40')schedule()});
  setInterval(schedule,5000);
  schedule();
})();
</script>`;

html=html.replace(/<script id="adapta-dynamic-slots-runtime-v\d+">[\s\S]*?<\/script>/g,"");
html=html.replace("</body>",runtime+"</body>");

writeFileSync(FILE,html,"utf8");
console.log("Central Adapta: slots dinâmicos v2 sem loop de MutationObserver.");
