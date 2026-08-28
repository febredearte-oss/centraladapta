import { readFileSync, writeFileSync } from "node:fs";

const FILE="public/index.html";
let html=readFileSync(FILE,"utf8");
const marker="shared-state-sync-v1";
if(html.includes(marker)) process.exit(0);

const script=`<script id="${marker}">
(function(){
  const KEY="central_adapta_v40";
  const ACTOR_KEY="central_adapta_declared_actor";
  const ENDPOINT="/api/shared-state";
  const originalSetItem=Storage.prototype.setItem;
  let syncing=false;
  let queue=Promise.resolve();

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

  window.__adaptaDeclaredActor={
    get:()=>sessionStorage.getItem(ACTOR_KEY)||"",
    set:value=>{const clean=String(value||"").trim();if(clean)sessionStorage.setItem(ACTOR_KEY,clean);else sessionStorage.removeItem(ACTOR_KEY)},
    clear:()=>sessionStorage.removeItem(ACTOR_KEY)
  };
})();
</script>`;

if(!html.includes("</body>"))throw new Error("public/index.html sem </body>");
html=html.replace("</body>",script+"\n</body>");
writeFileSync(FILE,html,"utf8");
console.log("Central Adapta: sincronização compartilhada D1 + logs declarados aplicada.");
