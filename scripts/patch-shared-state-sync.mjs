import { readFileSync, writeFileSync } from "node:fs";

const FILE="public/index.html";
let html=readFileSync(FILE,"utf8");
const marker="shared-state-sync-v3";
if(html.includes(marker)) process.exit(0);

const script=`<script id="${marker}">
(function(){
  const KEY="central_adapta_v40";
  const ACTOR_KEY="central_adapta_declared_actor";
  const ENDPOINT="/api/shared-state";
  const POLL_MS=5000;
  const BACKUP_KEY="central_adapta_pre_live_sync_backup";
  const RESTORED_KEY="central_adapta_backup_restored_v3";
  const originalSetItem=Storage.prototype.setItem;
  let syncing=false;
  let queue=Promise.resolve();
  let lastRemoteRevision=0;
  let lastRemoteState=null;
  let pendingRemote=null;
  let polling=false;

  function clone(value){return value==null?value:JSON.parse(JSON.stringify(value))}
  function parse(text){try{return JSON.parse(text)}catch{return null}}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  function diff(before,after,path=[],depth=0,out=[]){
    if(out.length>=200||same(before,after))return out;
    if(depth>=4||Array.isArray(before)||Array.isArray(after)||before===null||after===null||typeof before!=="object"||typeof after!=="object"){
      out.push({path,value:after,remove:after===undefined});return out;
    }
    const keys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
    for(const key of keys){
      if(out.length>=200)break;
      if(!(key in (after||{})))out.push({path:[...path,key],remove:true});
      else diff(before?.[key],after?.[key],[...path,key],depth+1,out);
    }
    return out;
  }
  function applyPatch(target,path,value,remove){
    if(!Array.isArray(path)||!path.length)return;
    let cursor=target;
    for(let i=0;i<path.length-1;i++){
      const key=path[i];
      if(cursor[key]==null||typeof cursor[key]!=="object")cursor[key]=typeof path[i+1]==="number"?[]:{};
      cursor=cursor[key];
    }
    const leaf=path[path.length-1];
    if(remove){
      if(Array.isArray(cursor)&&typeof leaf==="number")cursor.splice(leaf,1);
      else delete cursor[leaf];
    }else cursor[leaf]=clone(value);
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
    value=(window.prompt("Quem está registrando esta alteração?\\n\\nIsso serve apenas para o log da Central — não é login.")||"").trim();
    if(value)sessionStorage.setItem(ACTOR_KEY,value);
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
  function commitLocal(next){
    try{
      syncing=true;
      if(typeof state==="object"&&state){for(const key of Object.keys(state))delete state[key];Object.assign(state,clone(next))}
      originalSetItem.call(localStorage,KEY,JSON.stringify(next));
      try{if(typeof syncHolidayRecordsToCentral==="function")syncHolidayRecordsToCentral()}catch{}
      try{if(typeof refresh==="function")refresh();else if(typeof renderAll==="function")renderAll()}catch{}
      try{window.__adaptaRefreshCalendarToday?.()}catch{}
    }finally{syncing=false}
  }
  function restoreBackupIfNeeded(){
    if(sessionStorage.getItem(RESTORED_KEY))return;
    const backup=parse(sessionStorage.getItem(BACKUP_KEY)||"null");
    const current=parse(localStorage.getItem(KEY)||"null");
    if(!backup||!current||same(backup,current))return;
    commitLocal(backup);
    sessionStorage.setItem(RESTORED_KEY,"1");
    notify("Recuperei os dados locais que existiam antes da sincronização. Eles não foram enviados automaticamente ao banco.",6500);
  }
  function applyRemoteDelta(result,announce=true){
    if(!result?.state||!Number.isFinite(Number(result.revision)))return;
    if(editingNow()){
      pendingRemote=result;
      notify("Outra pessoa atualizou a Central. Vou aplicar quando você terminar esta edição.");
      return;
    }
    const local=parse(localStorage.getItem(KEY)||"null");
    if(!local){
      commitLocal(result.state);
    }else if(lastRemoteState){
      const patches=diff(lastRemoteState,result.state);
      const next=clone(local);
      for(const patch of patches)applyPatch(next,patch.path,patch.value,Boolean(patch.remove));
      if(patches.length)commitLocal(next);
    }
    lastRemoteRevision=Number(result.revision)||lastRemoteRevision;
    lastRemoteState=clone(result.state);
    pendingRemote=null;
    window.__adaptaLastRemoteState=result;
    window.dispatchEvent(new CustomEvent("adapta:remote-updated",{detail:result}));
    if(announce){
      const who=String(result.updatedBy||"").replace(/^declared:/,"");
      notify(who ? ("Atualizado por " + who + ".") : "A Central foi atualizada por outra pessoa.");
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
        const local=parse(localStorage.getItem(KEY)||"null");
        lastRemoteRevision=revision;
        lastRemoteState=clone(result.state);
        if(!local&&result?.state)commitLocal(result.state);
      }else if(revision>lastRemoteRevision){
        applyRemoteDelta(result,true);
      }
    }catch(error){console.warn("Sincronização em tempo quase real indisponível.",error)}
    finally{polling=false}
  }
  async function send(patches,area,declaredBy){
    if(!patches.length||!declaredBy)return;
    const response=await fetch(ENDPOINT,{method:"PATCH",headers:{"content-type":"application/json"},cache:"no-store",body:JSON.stringify({patches,area,declaredBy})});
    if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||"sync_failed")}
    return response.json();
  }
  function enqueue(patches,area,declaredBy){
    queue=queue.then(async()=>{
      try{
        syncing=true;
        const result=await send(patches,area,declaredBy);
        const fresh=await readRemote().catch(()=>null);
        if(fresh?.state){lastRemoteRevision=Number(fresh.revision||0);lastRemoteState=clone(fresh.state)}
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
    const filtered=patches.filter(p=>!(p.path?.[0]==="holidayRecords"));
    if(filtered.length){
      const declaredBy=actor();
      if(declaredBy)enqueue(filtered,currentArea(),declaredBy);
      else console.warn("Alteração mantida localmente, mas não sincronizada: autoria não informada.");
    }
    return result;
  };

  function tryPending(){if(!pendingRemote||editingNow())return;const next=pendingRemote;pendingRemote=null;applyRemoteDelta(next,true)}
  document.addEventListener("focusout",()=>setTimeout(tryPending,80),true);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)poll()});

  window.__adaptaDeclaredActor={
    get:()=>sessionStorage.getItem(ACTOR_KEY)||"",
    set:value=>{const clean=String(value||"").trim();if(clean)sessionStorage.setItem(ACTOR_KEY,clean);else sessionStorage.removeItem(ACTOR_KEY)},
    clear:()=>sessionStorage.removeItem(ACTOR_KEY)
  };
  window.__adaptaLiveSync={poll,applyPending:tryPending,getRevision:()=>lastRemoteRevision};

  restoreBackupIfNeeded();
  setTimeout(poll,250);
  setInterval(poll,POLL_MS);
})();
</script>`;

if(!html.includes("</body>"))throw new Error("public/index.html sem </body>");
html=html.replace(/<script id="shared-state-sync-v[12]">[\s\S]*?<\/script>\s*/g,"");
html=html.replace("</body>",script+"\n</body>");
writeFileSync(FILE,html,"utf8");
console.log("Central Adapta: sync v3 preserva legado local e aplica apenas deltas remotos.");
