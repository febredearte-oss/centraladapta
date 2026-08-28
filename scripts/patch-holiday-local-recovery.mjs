import { readFileSync, writeFileSync } from "node:fs";

const file = "public/index.html";
let html = readFileSync(file,"utf8");
const marker = "holiday-central-state-v3";
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

// Remove a hidratação exclusiva de feriados: o estado inteiro passa a ser carregado pelo gateway central.
html = html.replace(/<script id="holiday-d1-persistence-v2">[\s\S]*?<\/script>\s*/g,"");
const runtime = `<script id="${marker}">window.addEventListener("adapta:central-state",()=>{try{refreshWithoutCalendarRebuild()}catch{};try{holidayDataHandler?.onDataChanged(JSON.parse(JSON.stringify(state.holidayRecords||[])))}catch{}});</script>`;

if(!html.includes("</body>")) throw new Error("public/index.html sem </body>");
html = html.replace("</body>",runtime+"\n</body>");
writeFileSync(file,html,"utf8");
console.log("Holiday module routed through the unified Central state gateway.");
