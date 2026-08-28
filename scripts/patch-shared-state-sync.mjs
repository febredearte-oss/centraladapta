import { readFileSync, writeFileSync } from "node:fs";

const FILE="public/index.html";
let html=readFileSync(FILE,"utf8");
const marker="central-state-architecture-v4";
if(html.includes(marker)) process.exit(0);

const script=`<script id="${marker}">
(function(){
  const KEY="central_adapta_v40";
  const ACTOR_KEY="central_adapta_declared_actor";
  const LEGACY_ACTOR_KEY="central_adapta_declared_by";
  const ENDPOINT="/api/shared-state";
  const POLL_MS=3000;
  const originalSetItem=Storage.prototype.setItem;
  let applyingServer=false;
  let bootstrapped=false;
  let queue=Promise.resolve();
  let lastRevision=0;
  let serverState=null;
  let pendingRemote=null;
  let polling=false;

  function clone(value){return value==null?value:JSON.parse(JSON.stringify(value))}
  function parse(text){try{return JSON.parse(text)}catch{return null}}
  function canonical(value,path=[]){
    if(Array.isArray(value))return value.map((item,index)=>canonical(item,[...path,index]));
    if(!value||typeof value!=="object")return value;
    const out={};
    for(const [key,item] of Object.entries(value)){
      if(path[0]==="holidayContents"&&key==="generatedAt")continue;
      if(path[0]==="calendarEntries"&&key==="updatedAt"&&String(value.id||"").startsWith("feriado-"))continue;
      out[key]=canonical(item,[...path,key]);
    }
    return out;
  }
  function same(a,b,path=[]){return JSON.stringify(canonical(a,path))===JSON.stringify(canonical(b,path))}
  function diff(before,after,path=[],depth=0,out=[]){
    if(out.length>=300||same(before,after,path))return out;
    if(depth>=5||Array.isArray(before)||Array.isArray(after)||before===null||after===null||typeof before!=="object"||typeof after!=="object"){
      out.push({path,value:after,remove:after===undefined});return out;
    }
    const keys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
    for(const key of keys){
      if(out.length>=300)break;
      if(!(key in (after||{})))out.push({path:[...path,key],remove:true});
      else diff(before?.[key],after?.[key],[...path,key],depth+1,out);
    }
    return out;
  }
  function currentArea(){
    const active=document.querySelector('.page.active,[id^="page-"]:not([hidden])');
    const title=active?.querySelector('h1,h2,.page-title')?.textContent?.trim();
    if(title)return title.slice(0,120);
    return (active?.id||"Central").replace(/^page-/,"").slice(0,120);
  }
  function actor(){
    let value=(sessionStorage.getItem(ACTOR_KEY)||sessionStorage.getItem(LEGACY_ACTOR_KEY)||"").trim();
    if(value){sessionStorage.setItem(ACTOR_KEY,value);sessionStorage.setItem(LEGACY_ACTOR_KEY,value);return value}
    value=(window.prompt("Quem está registrando esta alteração?\\n\\nIsso serve apenas para o log da Central — não é login.")||"").trim();
    if(value){sessionStorage.setItem(ACTOR_KEY,value);sessionStorage.setItem(LEGACY_ACTOR_KEY,value)}
    return value;
  }
  function editingNow(){
    const el=document.activeElement;
    if(el?.matches?.('input,textarea,select,[contenteditable="true"]'))return true;
    return Boolean(document.querySelector('.popover.open,.modal.open,[role="dialog"]:not([hidden])'));
  }
  function notify(text,ms=4200){
    try{if(typeof showToast==="function")return showToast(text)}catch{}
    let el=document.getElementById("central-live-sync-note");
    if(!el){
      el=document.createElement("div");el.id="central-live-sync-note";
      el.style.cssText="position:fixed;right:18px;bottom:18px;z-index:99999;max-width:360px;padding:10px 13px;border-radius:10px;background:#0A3426;color:#fff;font:600 12px Montserrat,Arial,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.16)";
      document.body.appendChild(el);
    }
    el.textContent=text;clearTimeout(el.__hideTimer);el.__hideTimer=setTimeout(()=>el.remove(),ms);
  }
  function refreshUi(){
    try{if(typeof syncHolidayRecordsToCentral==="function")syncHolidayRecordsToCentral()}catch{}
    try{if(typeof refresh==="function")refresh();else if(typeof renderAll==="function")renderAll()}catch{}
    try{window.__adaptaRefreshCalendarToday?.()}catch{}
    try{holidayDataHandler?.onDataChanged?.(clone(state?.holidayRecords||[]))}catch{}
  }
  function applyServer(result,announce=false){
    if(!result?.state||!Number.isFinite(Number(result.revision)))return false;
    applyingServer=true;
    try{
      const next=clone(result.state);
      if(typeof state==="object"&&state){for(const key of Object.keys(state))delete state[key];Object.assign(state,next)}
      originalSetItem.call(localStorage,KEY,JSON.stringify(next));
      serverState=clone(next);
      lastRevision=Number(result.revision)||0;
      window.__adaptaLastRemoteState=result;
      refreshUi();
    }finally{applyingServer=false}
    pendingRemote=null;
    window.dispatchEvent(new CustomEvent("adapta:central-state",{detail:result}));
    window.dispatchEvent(new CustomEvent("adapta:remote-updated",{detail:result}));
    if(announce){
      const who=String(result.updatedBy||"").replace(/^declared:/,"");
      notify(who?("Central atualizada por "+who+"."):"A Central foi atualizada.");
    }
    return true;
  }
  async function readRemote(){
    const response=await fetch(ENDPOINT,{cache:"no-store",credentials:"same-origin"});
    if(!response.ok)throw new Error("central_read_failed");
    return response.json();
  }
  async function send(patches,area,declaredBy){
    const response=await fetch(ENDPOINT,{method:"PATCH",headers:{"content-type":"application/json"},cache:"no-store",credentials:"same-origin",body:JSON.stringify({patches,area,declaredBy})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||"central_write_failed");
    return data;
  }
  function enqueue(patches,area,declaredBy){
    queue=queue.then(async()=>{
      try{
        const result=await send(patches,area,declaredBy);
        const fresh=await readRemote();
        applyServer(fresh,false);
        window.__adaptaLastD1Sync=result||null;
        window.dispatchEvent(new CustomEvent("adapta:d1-synced",{detail:result||{}}));
      }catch(error){
        console.error("Falha ao salvar alteração central no D1",error);
        if(serverState) applyServer({state:serverState,revision:lastRevision,updatedBy:"rollback"},false);
        notify("A alteração não foi salva no banco central. A tela voltou ao último estado confirmado.",6500);
        window.dispatchEvent(new CustomEvent("adapta:d1-sync-error",{detail:{message:String(error?.message||error)}}));
      }
    });
    return queue;
  }
  async function bootstrap(){
    try{
      const remote=await readRemote();
      applyServer(remote,false);
      bootstrapped=true;
      document.documentElement.dataset.centralState="ready";
      window.dispatchEvent(new CustomEvent("adapta:central-ready",{detail:remote}));
    }catch(error){
      console.error("Não foi possível carregar o estado central do D1",error);
      document.documentElement.dataset.centralState="offline";
      notify("Não consegui carregar o banco central. Evite editar até a conexão voltar.",6500);
    }
  }
  async function poll(){
    if(polling||document.hidden||!bootstrapped)return;
    polling=true;
    try{
      const remote=await readRemote();
      const revision=Number(remote?.revision||0);
      if(revision>lastRevision){
        if(editingNow()){
          pendingRemote=remote;
          notify("Outra pessoa atualizou a Central. A atualização entra assim que você terminar esta edição.");
        }else applyServer(remote,true);
      }
    }catch(error){console.warn("Atualização central temporariamente indisponível",error)}
    finally{polling=false}
  }
  function tryPending(){if(!pendingRemote||editingNow())return;const next=pendingRemote;pendingRemote=null;applyServer(next,true)}

  Storage.prototype.setItem=function(key,value){
    if(this!==localStorage||key!==KEY||applyingServer)return originalSetItem.call(this,key,value);
    const previous=parse(localStorage.getItem(KEY)||"null")||serverState;
    const next=parse(value);
    const result=originalSetItem.call(this,key,value);
    if(!bootstrapped||!previous||!next)return result;
    const patches=diff(previous,next);
    if(!patches.length)return result;
    const declaredBy=actor();
    if(!declaredBy){
      if(serverState)applyServer({state:serverState,revision:lastRevision,updatedBy:"cancelled"},false);
      notify("Alteração cancelada: informe seu nome para registrar no histórico.");
      return result;
    }
    enqueue(patches,currentArea(),declaredBy);
    return result;
  };

  document.addEventListener("focusout",()=>setTimeout(tryPending,80),true);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)poll()});
  window.__adaptaDeclaredActor={
    get:()=>sessionStorage.getItem(ACTOR_KEY)||sessionStorage.getItem(LEGACY_ACTOR_KEY)||"",
    set:value=>{const clean=String(value||"").trim();if(clean){sessionStorage.setItem(ACTOR_KEY,clean);sessionStorage.setItem(LEGACY_ACTOR_KEY,clean)}else{sessionStorage.removeItem(ACTOR_KEY);sessionStorage.removeItem(LEGACY_ACTOR_KEY)}},
    clear:()=>{sessionStorage.removeItem(ACTOR_KEY);sessionStorage.removeItem(LEGACY_ACTOR_KEY)}
  };
  window.__adaptaCentralState={
    read:readRemote,
    poll,
    applyServer,
    getRevision:()=>lastRevision,
    getState:()=>clone(serverState),
    canonical:value=>canonical(value),
    write:async(patches,area=currentArea(),declaredBy=actor())=>{if(!declaredBy)throw new Error("declared_by_required");await enqueue(patches,area,declaredBy);return window.__adaptaLastRemoteState},
    ready:()=>bootstrapped
  };
  window.__adaptaLiveSync=window.__adaptaCentralState;

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootstrap,{once:true});else bootstrap();
  setInterval(poll,POLL_MS);
})();
</script>`;

if(!html.includes("</body>"))throw new Error("public/index.html sem </body>");
html=html.replace(/<script id="shared-state-sync-v[123]">[\s\S]*?<\/script>\s*/g,"");
html=html.replace(/<script id="central-state-architecture-v4">[\s\S]*?<\/script>\s*/g,"");
html=html.replace("</body>",script+"\n</body>");
writeFileSync(FILE,html,"utf8");
console.log("Central Adapta: D1 é a fonte única; timestamps derivados de renderização não geram alterações operacionais.");
