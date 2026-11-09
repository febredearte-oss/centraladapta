import { readFileSync, writeFileSync } from "node:fs";

const file = "public/index.html";
let html = readFileSync(file,"utf8");
const marker = "holiday-central-state-v4";
if(html.includes(marker)) process.exit(0);

const persistStart = html.indexOf("    function persistHolidayRecord(record){");
const persistEndMarker = "\n    const holidayDataSdk = {";
const persistEnd = persistStart >= 0 ? html.indexOf(persistEndMarker,persistStart) : -1;
if(persistStart < 0 || persistEnd < 0) throw new Error("persistHolidayRecord não encontrado");

const persistReplacement = `    async function persistHolidayRecord(record){
      const declaredBy = String(
        record.log_signer
        || sessionStorage.getItem("central_adapta_declared_actor")
        || sessionStorage.getItem("central_adapta_declared_by")
        || ""
      ).trim();
      if(!declaredBy) return {isOk:false,error:"declared_by_required"};

      try{
        const current = Array.isArray(state.holidayRecords) ? cloneHolidayData(state.holidayRecords) : [];
        const index = current.findIndex(item => item?.feriado_id === record.feriado_id);
        const stored = {...(index >= 0 ? current[index] : {}),...cloneHolidayData(record),log_signer:declaredBy};
        if(index >= 0) current[index] = stored; else current.push(stored);

        const gateway = window.__adaptaCentralState;
        if(!gateway?.write) return {isOk:false,error:"central_state_not_ready"};
        await gateway.write([
          {path:["holidayRecords"],value:current,remove:false}
        ],"Avisos e Feriados",declaredBy);

        const fresh = gateway.getState?.();
        if(fresh && Array.isArray(fresh.holidayRecords)){
          state.holidayRecords = cloneHolidayData(fresh.holidayRecords);
        }
        refreshWithoutCalendarRebuild();
        holidayDataHandler?.onDataChanged(cloneHolidayData(state.holidayRecords));
        return {isOk:true,revision:gateway.getRevision?.()||0};
      }catch(error){
        console.error("Falha ao persistir feriado no estado central",error);
        return {isOk:false,error:String(error?.message||"central_write_failed")};
      }
    }
`;
html = html.slice(0,persistStart) + persistReplacement + html.slice(persistEnd);

const signatureStart = html.indexOf("      // Interceptação de assinatura para decisões importantes");
const optimisticMarker = "      const previousOptimistic = optimistic.get(id) || {};";
const signatureEnd = signatureStart >= 0 ? html.indexOf(optimisticMarker,signatureStart) : -1;
if(signatureStart < 0 || signatureEnd < 0) throw new Error("bloco de assinatura não encontrado");

const signatureReplacement = `      // Autoria declarada: rastreabilidade operacional, sem autenticação.
      const isImportantField = patch.expediente || patch.equipe_interna || patch.email_associados || patch.feed_editorial || patch.instagram || patch.equipe_acolhimento !== undefined || patch.equipe_expedicao !== undefined;
      if(isImportantField && !patch.log_signer){
        let declared = String(sessionStorage.getItem("central_adapta_declared_actor") || sessionStorage.getItem("central_adapta_declared_by") || "").trim();
        if(!declared){
          declared = String(window.prompt("Quem está registrando estas alterações?") || "").trim();
          if(!declared){
            showToast("Informe seu nome para registrar a alteração no histórico.");
            return false;
          }
        }
        sessionStorage.setItem("central_adapta_declared_actor",declared);
        sessionStorage.setItem("central_adapta_declared_by",declared);
        patch = {...patch,log_signer:declared};
      }

`;
html = html.slice(0,signatureStart) + signatureReplacement + html.slice(signatureEnd);

// O D1 segue como fonte única. Este runtime apenas reidrata a interface do módulo
// de feriados quando a tela é aberta, evitando que valores-padrão visuais substituam
// decisões já persistidas.
html = html.replace(/<script id="holiday-d1-persistence-v2">[\s\S]*?<\/script>\s*/g,"");
html = html.replace(/<script id="holiday-central-state-v3">[\s\S]*?<\/script>\s*/g,"");

const runtime = `<script id="${marker}">
(function(){
  const ENDPOINT="/api/holiday-records";
  let hydrating=false;

  function clone(value){return value==null?value:JSON.parse(JSON.stringify(value))}

  function refreshHolidayUi(){
    try{if(typeof syncHolidayRecordsToCentral==="function")syncHolidayRecordsToCentral()}catch{}
    try{if(typeof refreshWithoutCalendarRebuild==="function")refreshWithoutCalendarRebuild();else if(typeof renderAll==="function")renderAll()}catch{}
    try{holidayDataHandler?.onDataChanged?.(clone(state?.holidayRecords||[]))}catch{}
  }

  async function hydrateHolidayUi(){
    if(hydrating)return;
    hydrating=true;
    try{
      const response=await fetch(ENDPOINT,{credentials:"same-origin",cache:"no-store"});
      if(!response.ok)throw new Error("holiday_records_http_"+response.status);
      const result=await response.json();
      if(Array.isArray(result.holidayRecords))state.holidayRecords=clone(result.holidayRecords);
      if(Array.isArray(result.holidayCommunicationTasks))state.holidayCommunicationTasks=clone(result.holidayCommunicationTasks);
      if(Array.isArray(result.holidayContents))state.holidayContents=clone(result.holidayContents);
      refreshHolidayUi();
      window.dispatchEvent(new CustomEvent("adapta:holiday-ui-hydrated",{detail:{revision:result.revision||0}}));
    }catch(error){
      console.warn("Não foi possível reidratar a interface de feriados.",error);
    }finally{
      hydrating=false;
    }
  }

  window.addEventListener("adapta:central-state",()=>{refreshHolidayUi();setTimeout(hydrateHolidayUi,30)});
  window.addEventListener("adapta:central-ready",()=>setTimeout(hydrateHolidayUi,30));
  document.addEventListener("click",event=>{
    if(event.target?.closest?.('[data-page="holidays"]'))setTimeout(hydrateHolidayUi,40);
  });
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden && document.getElementById("page-holidays")?.classList?.contains("active"))setTimeout(hydrateHolidayUi,30);
  });
  window.__adaptaHydrateHolidayUi=hydrateHolidayUi;
})();
</script>`;

if(!html.includes("</body>")) throw new Error("public/index.html sem </body>");
html = html.replace("</body>",runtime+"\n</body>");
writeFileSync(file,html,"utf8");
console.log("Holiday module uses D1 as source of truth and explicitly rehydrates its UI from persisted records.");
