import { readFileSync, writeFileSync } from "node:fs";

const FILE="public/index.html";
let html=readFileSync(FILE,"utf8");
const marker="shared-state-sync-v2";
if(html.includes(marker)) process.exit(0);

const script=`<script id="${marker}">
(function(){
  const KEY="central_adapta_v40";
  const ACTOR_KEY="central_adapta_declared_actor";
  const ENDPOINT="/api/shared-state";
  const POLL_MS=5000;
  const originalSetItem=Storage.prototype.setItem;
  let syncing=false;
  let queue=Promise.resolve();
  let lastRemoteRevision=0;
  let pendingRemote=null;
  let polling=false;

  function parse(text){try{return JSON.parse(text)}catch{return null}}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  function diff(before,after,path=[],depth=0,out=[]){
    if(out.length>=150||same(before,after))return out;
    if(depth>=3||Array.isArray(before)||Array.isArray(after)||before===null||after===null||typeof before!=="object"||typeof after!=="object"){
      out.push({path,value:after,remove:after===undefined});return out;
    }
    const keys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
    for(const key of keys){
      if(out.length>=150)break;
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
    let value=sessionStorage.getItem(ACTOR_KEY)||"";
    if(value.trim())return value.trim();
    value=(window.prompt("Quem está registrando esta alteração?\n\nIsso serve apenas para o log da Central — não é login.")||"").trim();
    if(value)sessionStorage.setItem(ACTOR_KEY,value);
    return value;
  }
  function editingNow(){
    const el=document.activeElement;
    if(!el)return false;
    if(el.matches?.('input,textarea,select,[contenteditable="true"]'))return true;
    return Boolean(document.querySelector('.popover.open,.modal.open,[role="dialog"]:not([hidden])'));
  }
  function notify(text){
    try{ if(typeof showToast==="function") return showToast(text); }catch{}
    let el=document.getElementById("central-live-sync-note");
    if(!el){
      el=document.createElement("div");
      el.id="central-live-sync-note";
      el.style.cssText="position:fixed;right:18px;bottom:18px;z-index:99999;max-width:340px;padding:10px 13px;border-radius:10px;background:#0A3426;color:#fff;font:600 12px Montserrat,Arial,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.16)";
      document.body.appendChild(el);
    }
    el.textContent=text;
    clearTimeout(el.__hideTimer);
    el.__hideTimer=setTimeout(()=>el.remove(),3500);
  }
  function replaceState(remote){
    if(!remote||typeof remote!=="object")return;
    try{
      syncing=true;
      const local=parse(localStorage.getItem(KEY)||"null");
      if(local&&!sessionStorage.getItem("central_adapta_pre_live_sync_backup")){
        try{sessionStorage.setItem("central_adapta_pre_live_sync_backup",JSON.stringify(local))}catch{}
      }
      if(typeof state==="object"&&state){
        for(const key of Object.keys(state)) delete state[key];
        Object.assign(state,JSON.parse(JSON.stringify(remote)));
      }
      originalSetItem.call(localStorage,KEY,JSON.stringify(remote));
      try{ if(typeof syncHolidayRecordsToCentral==="function")syncHolidayRecordsToCentral(); }catch{}
      try{ if(typeof refresh==="function")refresh(); else if(typeof renderAll==="function")renderAll(); }catch{}
      try{ window.__adaptaRefreshCalendarToday?.(); }catch{}
    }finally{syncing=false}
  }
  function applyRemote(result,announce=true){
    if(!result?.state||!Number.isFinite(Number(result.revision)))return;
    if(editingNow()){
      pendingRemote=result;
      notify("Outra pessoa atualizou a Central. A tela será atualizada quando você terminar esta edição.");
      return;
    }
    replaceState(result.state);
    lastRemoteRevision=Number(result.revision)||lastRemoteRevision;
    pendingRemote=null;
    window.__adaptaLastRemoteState=result;
    window.dispatchEvent(new CustomEvent("adapta:remote-updated",{detail:result}));
    if(announce){
      const who=String(result.updatedBy||"").replace(/^declared:/,"");
      notify(who?`Atualizado por ${who}.`:"A Central foi atualizada por outra pessoa.");
    }
  }
  async function readRemote(){
    const response=await fetch(ENDPOINT,{cache:"no-store"});
    if(!response.ok)throw new Error("remote_read_failed");
    return response.json();
  }
  async function poll(){
    if(polling||document.hidden)return;
    polling=true;
    try{
      const result=await readRemote();
      const revision=Number(result?.revision||0);
      if(!lastRemoteRevision){
        lastRemoteRevision=revision;
        // D1 é a fonte compartilhada. Na primeira leitura, hidrata também navegadores novos.
        applyRemote(result,false);
      }else if(revision>lastRemoteRevision){
        applyRemote(result,true);
      }
    }catch(error){
      console.warn("Sincronização em tempo quase real indisponível.",error);
    }finally{polling=false}
  }
  async function send(patches,area,declaredBy){
    if(!patches.length||!declaredBy)return;
    const response=await fetch(ENDPOINT,{method:"PATCH",headers:{"content-type":"application/json"},cache:"no-store",body:JSON.stringify({patches,area,declaredBy})});
    if(!response.ok){
      const data=await response.json().catch(()=>({}));
      throw new Error(data.error||"sync_failed");
    }
    return response.json();
  }
  function enqueue(patches,area,declaredBy){
    queue=queue.then(async()=>{
      try{
        syncing=true;
        const result=await send(patches,area,declaredBy);
        if(result?.revision)lastRemoteRevision=Math.max(lastRemoteRevision,Number(result.revision)||0);
        window.__adaptaLastD1Sync=result||null;
        window.dispatchEvent(new CustomEvent("adapta:d1-synced",{detail:result||{}}));
      }catch(error){
        console.error("Falha ao sincronizar alteração da Central no D1",error);
        window.dispatchEvent(new CustomEvent("adapta:d1-sync-error",{detail:{message:String(error?.message||error)}}));
      }finally{syncing=false}
    });
  }

  Storage.prototype.setItem=function(key,value){
    if(this!==localStorage||key!==KEY||syncing)return originalSetItem.call(this,key,value);
    const previous=parse(localStorage.getItem(KEY)||"null");
    const next=parse(value);
    const result=originalSetItem.call(this,key,value);
    if(!previous||!next)return result;
    const patches=diff(previous,next);
    // holidayRecords já possui persistência atômica própria; evita salvar duas vezes a mesma decisão.
    const filtered=patches.filter(p=>!(p.path?.[0]==="holidayRecords"));
    if(filtered.length){
      const declaredBy=actor();
      if(declaredBy)enqueue(filtered,currentArea(),declaredBy);
      else console.warn("Alteração mantida localmente, mas não sincronizada: autoria não informada.");
    }
    return result;
  };

  function tryPending(){
    if(!pendingRemote||editingNow())return;
    const next=pendingRemote;
    pendingRemote=null;
    applyRemote(next,true);
  }
  document.addEventListener("focusout",()=>setTimeout(tryPending,80),true);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)poll()});
  window.addEventListener("adapta:d1-synced",()=>setTimeout(poll,150));

  window.__adaptaDeclaredActor={
    get:()=>sessionStorage.getItem(ACTOR_KEY)||"",
    set:value=>{const clean=String(value||"").trim();if(clean)sessionStorage.setItem(ACTOR_KEY,clean);else sessionStorage.removeItem(ACTOR_KEY)},
    clear:()=>sessionStorage.removeItem(ACTOR_KEY)
  };
  window.__adaptaLiveSync={poll,applyPending:tryPending,getRevision:()=>lastRemoteRevision};

  setTimeout(poll,250);
  setInterval(poll,POLL_MS);
})();
</script>`;

if(!html.includes("</body>"))throw new Error("public/index.html sem </body>");
html=html.replace(/<script id="shared-state-sync-v1">[\s\S]*?<\/script>\s*/g,"");
html=html.replace("</body>",script+"\n</body>");
writeFileSync(FILE,html,"utf8");
console.log("Central Adapta: sincronização multiusuário a cada 5s aplicada.");
