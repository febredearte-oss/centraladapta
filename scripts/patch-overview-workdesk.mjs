import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

const overviewStart = html.indexOf('<section class="page active" id="page-overview">');
const contentsStart = html.indexOf('<section class="page" id="page-contents">', overviewStart);
if (overviewStart < 0 || contentsStart < 0) throw new Error("Bloco da Visão Geral não encontrado.");

const overview = `<section class="page active workdesk-page" id="page-overview">
<div class="workdesk-command">
  <div class="workdesk-title"><h1>Visão geral</h1><span id="overviewTodayLabel"></span></div>
  <div class="workdesk-tools">
    <div class="workdesk-search-wrap"><input id="overviewGlobalSearch" type="search" placeholder="Buscar na Central" autocomplete="off"/><div class="workdesk-search-results" id="overviewSearchResults" hidden></div></div>
    <div class="workdesk-create-wrap"><button class="workdesk-plus" id="overviewCreateButton" type="button" aria-expanded="false">+</button><div class="workdesk-create-menu" id="overviewCreateMenu" hidden><button data-overview-action="contents">Conteúdos</button><button data-overview-action="calendar">Calendário</button><button data-overview-action="line">Nova linha editorial</button><button data-overview-action="holidays">Feriados e avisos</button></div></div>
  </div>
</div>
<div class="workdesk-week" id="overviewWeekStrip"></div>
<div class="workdesk-board" id="overviewDesk">
  <article class="workdesk-card workdesk-focus" data-block="focus" draggable="true"><div class="workdesk-card-head"><span>Agora</span><b>•••</b></div><div class="workdesk-focus-body"><div><h2 id="nextTitle">Nenhum conteúdo em produção</h2><span id="nextMeta"></span></div><button id="nextButton">Abrir</button></div></article>
  <article class="workdesk-card workdesk-signals" data-block="signals" draggable="true"><div class="workdesk-card-head"><span>Sinais</span><b>•••</b></div><div class="workdesk-signal-list" id="overviewSignals"></div></article>
  <article class="workdesk-card workdesk-pinned" id="overviewPinnedCard" data-block="pinned" draggable="true"><div class="workdesk-card-head"><span>Fixados</span><b>•••</b></div><div class="workdesk-mini-list" id="overviewPinned"></div></article>
  <article class="workdesk-card workdesk-upcoming" data-block="upcoming" draggable="true"><div class="workdesk-card-head"><span>Próximos</span><b>•••</b></div><div class="workdesk-mini-list" id="overviewUpcoming"></div></article>
  <article class="workdesk-card workdesk-production" data-block="production" draggable="true"><div class="workdesk-card-head"><span>Em movimento</span><span id="activeCount">0</span><b>•••</b></div><div class="workdesk-mini-list" id="overviewProduction"></div></article>
  <article class="workdesk-card workdesk-holidays" data-block="holidays" draggable="true"><div class="workdesk-card-head"><span>Feriados e avisos</span><span id="holidayOverviewCount">0</span><b>•••</b></div><div class="holiday-overview-list workdesk-mini-list" id="holidayOverviewList"></div></article>
  <article class="workdesk-card workdesk-recent" data-block="recent" draggable="true"><div class="workdesk-card-head"><span>Recentes</span><b>•••</b></div><div class="workdesk-mini-list" id="activityList"></div></article>
</div>
<div class="workdesk-hidden-counts" aria-hidden="true"><span id="countIdeas">0</span><span id="countQueue">0</span><span id="countEditing">0</span><span id="countScheduled">0</span><span id="countPublished">0</span></div>
</section>
`;
html = html.slice(0, overviewStart) + overview + html.slice(contentsStart);

const renderStart = html.indexOf("function renderOverview(){");
const renderEnd = html.indexOf("\nfunction refresh(){", renderStart);
if (renderStart < 0 || renderEnd < 0) throw new Error("renderOverview não encontrado.");

const renderOverview = `function renderOverview(){
  updateCounts();
  const queue=sortStage("queue"), editing=sortStage("editing"), scheduled=sortStage("scheduled"), ideas=sortStage("ideas");
  const active=[...editing,...queue,...scheduled];
  const noDate=scheduled.find(post=>!state.items[post.id].date);
  const next=noDate||editing[0]||queue[0]||scheduled[0]||null;
  const today=new Date(); today.setHours(12,0,0,0); const todayIso=isoDate(today);
  const PIN_KEY="adapta-overview-pins", ORDER_KEY="adapta-workdesk-order";
  const readJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(error){return fallback}};
  const writeJson=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(error){}};
  const pins=()=>readJson(PIN_KEY,[]).filter(id=>postById(id));
  const isPinned=id=>pins().includes(id);
  const setPinned=(id,on)=>{const values=pins().filter(value=>value!==id);if(on)values.unshift(id);writeJson(PIN_KEY,values.slice(0,12));renderOverview();};

  document.getElementById("overviewTodayLabel").textContent=new Intl.DateTimeFormat("pt-BR",{weekday:"short",day:"2-digit",month:"short"}).format(today).replace(/\\./g,"").toUpperCase();
  const title=document.getElementById("nextTitle"), meta=document.getElementById("nextMeta"), action=document.getElementById("nextButton");
  if(next){const item=state.items[next.id];title.textContent=next.title;meta.textContent=[STAGE_LABELS[item.stage],item.lineId?lineName(item.lineId):"",item.date?formatDate(item.date):""].filter(Boolean).join(" · ");action.textContent="Abrir";action.onclick=()=>openContent(next.id)}
  else{title.textContent=ideas.length?"Banco pronto para começar":"Tudo limpo por aqui";meta.textContent=ideas.length?ideas.length+" ideias disponíveis":"";action.textContent=ideas.length?"Ver conteúdos":"Calendário";action.onclick=()=>ideas.length?(openPage("contents"),switchView("ideas")):openPage("calendar")}

  const datedPosts=scheduled.filter(post=>state.items[post.id].date), datedEntries=(state.calendarEntries||[]).filter(entry=>entry.date);
  const week=document.getElementById("overviewWeekStrip");
  week.innerHTML=Array.from({length:7},(_,index)=>{const date=new Date(today);date.setDate(today.getDate()+index);const key=isoDate(date);const count=datedPosts.filter(post=>state.items[post.id].date===key).length+datedEntries.filter(entry=>entry.date===key).length;const weekday=new Intl.DateTimeFormat("pt-BR",{weekday:"short"}).format(date).replace(/\\./g,"").slice(0,3).toUpperCase();return '<button class="workdesk-day '+(index===0?'is-today':'')+'" data-workdesk-date="'+key+'"><span>'+weekday+'</span><strong>'+String(date.getDate()).padStart(2,"0")+'</strong><i class="'+(count?'has-items':'')+'">'+(count||"")+'</i></button>'}).join("");
  week.querySelectorAll("[data-workdesk-date]").forEach(button=>button.onclick=()=>{openPage("calendar");requestAnimationFrame(()=>fullCalendarInstance?.gotoDate(button.dataset.workdeskDate))});

  const signals=[];
  if(noDate)signals.push({label:"Sem data",title:noDate.title,run:()=>openContent(noDate.id)});
  if(editing[0])signals.push({label:"Em edição",title:editing[0].title,run:()=>openContent(editing[0].id)});
  if(queue[0])signals.push({label:"Na fila",title:queue[0].title,run:()=>openContent(queue[0].id)});
  const holidayPending=(state.holidayCommunicationTasks||[]).filter(task=>task.date>=todayIso&&!['concluido','dispensado'].includes(task.status));
  if(holidayPending.length)signals.push({label:"Avisos",title:holidayPending.length+" pendência"+(holidayPending.length===1?"":"s"),run:()=>openPage("holidays")});
  const signalHost=document.getElementById("overviewSignals");
  signalHost.innerHTML=signals.length?signals.slice(0,4).map((s,i)=>'<button class="workdesk-signal" data-signal="'+i+'"><span>'+escapeHtml(s.label)+'</span><strong>'+escapeHtml(s.title)+'</strong></button>').join(""):'<div class="workdesk-zero">Sem sinais</div>';
  signalHost.querySelectorAll("[data-signal]").forEach(button=>button.onclick=()=>signals[Number(button.dataset.signal)]?.run());

  const pinned=pins(), pinnedCard=document.getElementById("overviewPinnedCard"), pinnedHost=document.getElementById("overviewPinned");
  pinnedCard.hidden=!pinned.length;
  if(pinned.length)pinnedHost.innerHTML=pinned.map(id=>{const post=postById(id),item=state.items[id];return '<div class="workdesk-row"><button class="workdesk-row-main" data-open="'+id+'"><strong>'+escapeHtml(post.title)+'</strong><span>'+escapeHtml(STAGE_LABELS[item.stage])+(item.date?' · '+formatDate(item.date):'')+'</span></button><button class="workdesk-pin is-pinned" data-pin="'+id+'">●</button></div>'}).join("");

  const postRows=scheduled.filter(post=>state.items[post.id].date>=todayIso).map(post=>({kind:"post",id:post.id,date:state.items[post.id].date,title:post.title,meta:state.items[post.id].lineId?lineName(state.items[post.id].lineId):"Conteúdo"}));
  const entryRows=(state.calendarEntries||[]).filter(entry=>entry.date>=todayIso).map(entry=>({kind:"entry",id:entry.id,date:entry.date,title:entry.title,meta:entry.holiday?"Feriado":entry.lineId?lineName(entry.lineId):"Calendário"}));
  const upcoming=[...postRows,...entryRows].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,7), upcomingHost=document.getElementById("overviewUpcoming");
  upcomingHost.innerHTML=upcoming.length?upcoming.map((row,i)=>'<button class="workdesk-upcoming-row" data-upcoming="'+i+'"><span class="workdesk-date">'+formatDate(row.date).slice(0,5)+'</span><span><strong>'+escapeHtml(row.title)+'</strong><small>'+escapeHtml(row.meta||"")+'</small></span></button>').join(""):'<div class="workdesk-zero">Sem próximos itens</div>';
  upcomingHost.querySelectorAll("[data-upcoming]").forEach(button=>button.onclick=()=>{const row=upcoming[Number(button.dataset.upcoming)];if(row.kind==="post")openContent(row.id);else{openPage("calendar");requestAnimationFrame(()=>fullCalendarInstance?.gotoDate(row.date))}});

  document.getElementById("activeCount").textContent=String(active.length);
  const production=document.getElementById("overviewProduction");
  production.innerHTML=active.length?active.slice(0,7).map(post=>{const item=state.items[post.id];return '<div class="workdesk-row"><button class="workdesk-row-main" data-open="'+post.id+'"><strong>'+escapeHtml(post.title)+'</strong><span>'+escapeHtml(STAGE_LABELS[item.stage])+(item.date?' · '+formatDate(item.date):'')+'</span></button><button class="workdesk-pin '+(isPinned(post.id)?'is-pinned':'')+'" data-pin="'+post.id+'">'+(isPinned(post.id)?'●':'○')+'</button></div>'}).join(""):'<div class="workdesk-zero">Nada em movimento</div>';

  const recent=state.activity.slice(0,7);document.getElementById("activityList").innerHTML=recent.length?recent.map(entry=>'<div class="workdesk-activity"><strong>'+escapeHtml(describeActivity(entry))+'</strong><span>'+formatDateTime(entry.at)+'</span></div>').join(""):'<div class="workdesk-zero">Sem movimentações</div>';
  renderHolidayOverview();

  document.querySelectorAll('#page-overview [data-open]').forEach(button=>button.onclick=()=>openContent(button.dataset.open));
  document.querySelectorAll('#page-overview [data-pin]').forEach(button=>button.onclick=event=>{event.stopPropagation();setPinned(button.dataset.pin,!isPinned(button.dataset.pin))});

  const search=document.getElementById("overviewGlobalSearch"), results=document.getElementById("overviewSearchResults");
  if(!search.dataset.bound){search.dataset.bound="1";search.addEventListener("input",()=>{const q=search.value.trim().toLocaleLowerCase("pt-BR");if(q.length<2){results.hidden=true;return}const posts=allPosts().filter(post=>post.title.toLocaleLowerCase("pt-BR").includes(q)||(post.base||"").toLocaleLowerCase("pt-BR").includes(q)).slice(0,6).map(post=>({kind:"post",id:post.id,title:post.title,meta:STAGE_LABELS[state.items[post.id].stage]}));const lines=(state.lines||[]).filter(line=>line.name.toLocaleLowerCase("pt-BR").includes(q)).slice(0,3).map(line=>({kind:"line",id:line.id,title:line.name,meta:"Linha editorial"}));const found=[...posts,...lines].slice(0,8);results.innerHTML=found.length?found.map((row,i)=>'<button data-result="'+i+'"><strong>'+escapeHtml(row.title)+'</strong><span>'+escapeHtml(row.meta)+'</span></button>').join(""):'<div class="workdesk-zero">Nenhum resultado</div>';results.hidden=false;results.querySelectorAll("[data-result]").forEach(button=>button.onclick=()=>{const row=found[Number(button.dataset.result)];results.hidden=true;search.value="";row.kind==="post"?openContent(row.id):openPage("lines")})});search.addEventListener("keydown",event=>{if(event.key==="Escape"){search.value="";results.hidden=true}})}

  const plus=document.getElementById("overviewCreateButton"), menu=document.getElementById("overviewCreateMenu");
  if(!plus.dataset.bound){plus.dataset.bound="1";plus.onclick=()=>{menu.hidden=!menu.hidden;plus.setAttribute("aria-expanded",String(!menu.hidden))};menu.querySelectorAll("[data-overview-action]").forEach(button=>button.onclick=()=>{menu.hidden=true;plus.setAttribute("aria-expanded","false");const action=button.dataset.overviewAction;if(action==="contents"){openPage("contents");switchView("ideas")}if(action==="calendar")openPage("calendar");if(action==="line"){openPage("lines");setTimeout(()=>openLineEditor(),0)}if(action==="holidays")openPage("holidays")})}

  const desk=document.getElementById("overviewDesk"), savedOrder=readJson(ORDER_KEY,[]);savedOrder.forEach(name=>{const card=desk.querySelector('[data-block="'+name+'"]');if(card)desk.appendChild(card)});let dragging=null;desk.querySelectorAll('.workdesk-card[data-block]').forEach(card=>{card.ondragstart=event=>{dragging=card;card.classList.add('is-dragging');event.dataTransfer.effectAllowed='move'};card.ondragend=()=>{card.classList.remove('is-dragging');dragging=null;writeJson(ORDER_KEY,[...desk.querySelectorAll('.workdesk-card[data-block]')].map(item=>item.dataset.block))};card.ondragover=event=>{event.preventDefault();if(!dragging||dragging===card)return;const box=card.getBoundingClientRect();desk.insertBefore(dragging,event.clientY>box.top+box.height/2?card.nextSibling:card)}});
}`;
html = html.slice(0, renderStart) + renderOverview + html.slice(renderEnd);

const css = `<style id="adapta-workdesk-overview">
#page-overview{padding-top:8px;padding-bottom:72px;font-family:"Montserrat",Arial,sans-serif}.workdesk-command{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:6px 0 18px}.workdesk-title{display:flex;align-items:baseline;gap:12px}.workdesk-title h1{margin:0;font-size:28px;letter-spacing:-.035em;color:#0A3426}.workdesk-title span{font-size:10px;font-weight:800;letter-spacing:.08em;color:#849087}.workdesk-tools{display:flex;gap:8px}.workdesk-search-wrap,.workdesk-create-wrap{position:relative}.workdesk-search-wrap input{width:min(32vw,330px);height:40px;padding:0 14px;border:1px solid #dbe2dc;border-radius:11px;background:#fff;font:600 13px "Montserrat",Arial}.workdesk-plus{width:40px;height:40px;border:0;border-radius:11px;background:#0A3426;color:#fff;font-size:25px;cursor:pointer}.workdesk-search-results,.workdesk-create-menu{position:absolute;top:46px;right:0;z-index:40;width:330px;padding:6px;border:1px solid #dfe4df;border-radius:12px;background:#fff;box-shadow:0 18px 45px rgba(20,42,31,.14)}.workdesk-create-menu{width:190px}.workdesk-search-results button,.workdesk-create-menu button{width:100%;display:flex;justify-content:space-between;gap:12px;padding:10px;border:0;border-radius:8px;background:transparent;text-align:left;font:600 12px "Montserrat",Arial;color:#2b3933;cursor:pointer}.workdesk-search-results button:hover,.workdesk-create-menu button:hover{background:#f1f4f1}.workdesk-search-results span{font-size:10px;color:#7b857f}
.workdesk-week{display:grid;grid-template-columns:repeat(7,1fr);border:1px solid #dde3de;border-radius:14px;overflow:hidden;background:#fff;margin-bottom:14px}.workdesk-day{position:relative;min-height:70px;padding:11px;border:0;border-right:1px solid #e8ece8;background:#fff;color:#6b756f;text-align:left;cursor:pointer}.workdesk-day:last-child{border-right:0}.workdesk-day.is-today{background:#eaf1ec;color:#0A3426}.workdesk-day span{display:block;font-size:9px;font-weight:800}.workdesk-day strong{display:block;margin-top:5px;font-size:22px}.workdesk-day i{position:absolute;right:9px;bottom:9px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;display:grid;place-items:center;font-style:normal;font-size:9px;font-weight:800;color:#fff}.workdesk-day i.has-items{background:#0A3426}
.workdesk-board{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-flow:dense;gap:12px;align-items:start}.workdesk-card{min-width:0;border:1px solid #dfe4df;border-radius:15px;background:#fff;overflow:hidden;box-shadow:0 4px 16px rgba(20,42,31,.025)}.workdesk-card.is-dragging{opacity:.5}.workdesk-card-head{height:42px;display:flex;align-items:center;gap:8px;padding:0 14px;border-bottom:1px solid #edf0ed;color:#66716b;font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.workdesk-card-head>span:nth-child(2){margin-left:auto;color:#0A3426}.workdesk-card-head b{margin-left:auto;color:#a2aaa5;cursor:grab}.workdesk-focus{grid-column:span 7;min-height:184px;background:#0A3426;border-color:#0A3426;color:#fff}.workdesk-focus .workdesk-card-head{border-bottom-color:rgba(255,255,255,.12);color:#b9c9c0}.workdesk-focus-body{min-height:141px;display:flex;align-items:flex-end;justify-content:space-between;gap:20px;padding:22px}.workdesk-focus h2{margin:0 0 8px;font-size:27px;line-height:1.08;letter-spacing:-.035em;color:#fff}.workdesk-focus-body span{font-size:11px;color:#bdd0c5}.workdesk-focus-body button{height:38px;padding:0 15px;border:0;border-radius:10px;background:#fff;color:#0A3426;font:750 11px "Montserrat",Arial;cursor:pointer}.workdesk-signals{grid-column:span 5;min-height:184px}.workdesk-pinned,.workdesk-holidays,.workdesk-recent{grid-column:span 5}.workdesk-upcoming,.workdesk-production{grid-column:span 7}.workdesk-card[hidden]{display:none!important}
.workdesk-signal-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px}.workdesk-signal{min-height:55px;padding:10px;border:1px solid #e3e8e4;border-radius:10px;background:#f9faf9;text-align:left;cursor:pointer}.workdesk-signal span{display:block;margin-bottom:5px;font-size:9px;font-weight:800;text-transform:uppercase;color:#7d8881}.workdesk-signal strong{display:-webkit-box;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:11px;color:#22312a}.workdesk-mini-list{padding:4px 12px 10px}.workdesk-row{display:flex;align-items:center;gap:7px;border-bottom:1px solid #edf0ed}.workdesk-row-main,.workdesk-upcoming-row{min-width:0;flex:1;padding:10px 2px;border:0;background:transparent;text-align:left;cursor:pointer}.workdesk-row-main{display:flex;flex-direction:column;gap:3px}.workdesk-row-main strong,.workdesk-upcoming-row strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:#27352f}.workdesk-row-main span,.workdesk-upcoming-row small{font-size:9px;color:#7a857e}.workdesk-pin{width:26px;height:26px;border:0;border-radius:8px;background:transparent;color:#a8b0ab;cursor:pointer}.workdesk-pin.is-pinned{color:#0A3426}.workdesk-upcoming-row{width:100%;display:grid;grid-template-columns:42px 1fr;align-items:center;border-bottom:1px solid #edf0ed}.workdesk-date{font-size:10px!important;font-weight:800!important;color:#0A3426!important}.workdesk-upcoming-row>span:last-child{min-width:0}.workdesk-activity{padding:10px 2px;border-bottom:1px solid #edf0ed}.workdesk-activity strong{display:block;font-size:10.5px;line-height:1.35;color:#2c3933}.workdesk-activity span{display:block;margin-top:4px;font-size:9px;color:#8a938e}.workdesk-zero{padding:16px 2px;font-size:11px;color:#8a938e}#page-overview .holiday-overview-row{display:flex;gap:8px;padding:10px 2px;border-bottom:1px solid #edf0ed}#page-overview .holiday-overview-row>div{min-width:0;flex:1}#page-overview .holiday-overview-row strong{display:block;font-size:10.5px;color:#2c3933}#page-overview .holiday-overview-row span{display:block;font-size:9px;color:#7c8680}#page-overview .holiday-overview-row .link-button{border:0;background:transparent;color:#0A3426;font-size:9px;font-weight:750}.workdesk-hidden-counts{display:none!important}
@media(max-width:1050px){.workdesk-focus{grid-column:1/-1}.workdesk-signals,.workdesk-pinned,.workdesk-upcoming,.workdesk-production,.workdesk-holidays,.workdesk-recent{grid-column:span 6}}@media(max-width:760px){.workdesk-week{overflow-x:auto;grid-template-columns:repeat(7,minmax(72px,1fr))}.workdesk-card{grid-column:1/-1!important}.workdesk-focus-body{align-items:flex-start;flex-direction:column}.workdesk-search-wrap input{width:min(55vw,300px)}}@media(max-width:520px){.workdesk-command{align-items:flex-start;flex-direction:column}.workdesk-tools{width:100%}.workdesk-search-wrap{flex:1}.workdesk-search-wrap input{width:100%}}
</style>`;
html = html.replace("</head>", `${css}</head>`);

writeFileSync(FILE, html, "utf8");
console.log("Adapta: Visão Geral convertida em mesa de trabalho modular.");
