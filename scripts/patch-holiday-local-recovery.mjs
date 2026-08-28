import { readFileSync, writeFileSync } from "node:fs";

const file = "public/index.html";
let html = readFileSync(file,"utf8");
const marker = "holiday-d1-persistence-v2";
if(html.includes(marker)) process.exit(0);

const persistStart = html.indexOf("    function persistHolidayRecord(record){");
const persistEndMarker = "\n    const holidayDataSdk = {";
const persistEnd = persistStart >= 0 ? html.indexOf(persistEndMarker,persistStart) : -1;
if(persistStart < 0 || persistEnd < 0) throw new Error("persistHolidayRecord não encontrado");

const persistReplacement = `    async function persistHolidayRecord(record){
      const declaredBy = String(
        record.log_signer
        || sessionStorage.getItem("central_adapta_declared_by")
        || ""
      ).trim();
      if(!declaredBy) return {isOk:false,error:"declared_by_required"};

      try{
        const response = await fetch("/api/holiday-record",{
          method:"PUT",
          headers:{"content-type":"application/json"},
          credentials:"same-origin",
          body:JSON.stringify({record,declaredBy})
        });
        const result = await response.json().catch(()=>({}));
        if(!response.ok) return {isOk:false,error:result.error||"save_failed",result};

        sessionStorage.setItem("central_adapta_declared_by",declaredBy);
        state.holidayRecords = Array.isArray(result.holidayRecords)
          ? cloneHolidayData(result.holidayRecords)
          : state.holidayRecords;
        localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
        refreshWithoutCalendarRebuild();
        holidayDataHandler?.onDataChanged(cloneHolidayData(state.holidayRecords));
        return {isOk:true,revision:result.revision,loggedChanges:result.loggedChanges};
      }catch(error){
        console.error("Falha ao persistir feriado no D1",error);
        return {isOk:false,error:"network_error"};
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
        let declared = String(sessionStorage.getItem("central_adapta_declared_by") || "").trim();
        if(!declared){
          declared = String(window.prompt("Quem está registrando estas alterações?") || "").trim();
          if(!declared){
            showToast("Informe seu nome para registrar a alteração no histórico.");
            return false;
          }
          sessionStorage.setItem("central_adapta_declared_by",declared);
        }
        patch = {...patch,log_signer:declared};
      }

`;
html = html.slice(0,signatureStart) + signatureReplacement + html.slice(signatureEnd);

const runtime = `
<script id="${marker}">
(() => {
  const KEY="central_adapta_v40";
  let hydrating=false;
  async function hydrateHolidayRecords(){
    if(hydrating) return;
    hydrating=true;
    try{
      const response=await fetch("/api/holiday-records",{cache:"no-store",credentials:"same-origin"});
      if(!response.ok) return;
      const result=await response.json();
      if(!Array.isArray(result.holidayRecords)) return;
      state.holidayRecords=JSON.parse(JSON.stringify(result.holidayRecords));
      if(Array.isArray(result.holidayCommunicationTasks)) state.holidayCommunicationTasks=JSON.parse(JSON.stringify(result.holidayCommunicationTasks));
      if(Array.isArray(result.holidayContents)) state.holidayContents=JSON.parse(JSON.stringify(result.holidayContents));
      try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}
      try{refreshWithoutCalendarRebuild();}catch{}
      try{holidayDataHandler?.onDataChanged(JSON.parse(JSON.stringify(state.holidayRecords)));}catch{}
    }catch(error){ console.warn("Não foi possível sincronizar feriados do D1.",error); }
    finally{hydrating=false;}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",hydrateHolidayRecords,{once:true});
  else hydrateHolidayRecords();
  document.addEventListener("click",event=>{
    if(event.target?.closest?.('[data-page="holidays"]')) setTimeout(hydrateHolidayRecords,30);
  });
})();
</script>`;

if(!html.includes("</body>")) throw new Error("public/index.html sem </body>");
html = html.replace("</body>",runtime+"\n</body>");
writeFileSync(file,html);
console.log("Holiday D1 persistence + declared audit logging applied.");
