import { readFileSync, writeFileSync } from "node:fs";

const file = "public/index.html";
let html = readFileSync(file,"utf8");
const marker = "holiday-local-recovery-v2";
if(html.includes(marker)) process.exit(0);

const script = `
<script id="${marker}">
(() => {
  const KEY = "central_adapta_v40";
  const RECOVER_ENDPOINT = "/api/recover-holiday-local";
  const RECORDS_ENDPOINT = "/api/holiday-records";
  let hydrating = false;

  function readLocal(){
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "null");
      return data && typeof data === "object" ? data : null;
    } catch { return null; }
  }
  function records(data){
    return Array.isArray(data?.holidayRecords)
      ? data.holidayRecords.filter(r => r && typeof r.feriado_id === "string")
      : [];
  }
  function applyRemote(result){
    if(!result || !Array.isArray(result.holidayRecords)) return false;
    state.holidayRecords = JSON.parse(JSON.stringify(result.holidayRecords));
    if(Array.isArray(result.holidayCommunicationTasks)) state.holidayCommunicationTasks = JSON.parse(JSON.stringify(result.holidayCommunicationTasks));
    if(Array.isArray(result.holidayContents)) state.holidayContents = JSON.parse(JSON.stringify(result.holidayContents));
    try { localStorage.setItem(KEY,JSON.stringify(state)); } catch {}
    try { syncHolidayRecordsToCentral(); } catch {}
    try { refreshWithoutCalendarRebuild(); } catch { try { renderAll(); } catch {} }
    try { holidayDataHandler?.onDataChanged(JSON.parse(JSON.stringify(state.holidayRecords))); } catch {}
    return true;
  }
  async function hydrateFromServer(){
    if(hydrating) return;
    hydrating = true;
    try {
      const response = await fetch(RECORDS_ENDPOINT,{credentials:"same-origin",cache:"no-store"});
      if(!response.ok) return;
      const result = await response.json();
      applyRemote(result);
      document.getElementById("holiday-local-recovery-banner")?.remove();
    } catch(error) {
      console.warn("Não foi possível hidratar feriados do servidor.",error);
    } finally {
      hydrating = false;
    }
  }
  function ensureBanner(){
    const local = readLocal();
    const found = records(local);
    if(!found.length || document.getElementById("holiday-local-recovery-banner")) return;
    const page = document.getElementById("page-holidays");
    if(!page) return;
    const banner = document.createElement("div");
    banner.id = "holiday-local-recovery-banner";
    banner.style.cssText = "margin:0 0 14px;padding:14px 16px;border:1px solid #0A3426;border-radius:12px;background:#fff;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap";
    const copy = document.createElement("div");
    copy.innerHTML = '<strong style="display:block;color:#0A3426;font-size:13px">Dados locais de feriados encontrados</strong><span style="font-size:12px;color:#59655f">Este navegador tem '+found.length+' registro(s) salvos que ainda não estão no banco central.</span>';
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Recuperar para a Central";
    button.style.cssText = "border:0;border-radius:9px;padding:10px 14px;background:#0A3426;color:#fff;font:700 12px Montserrat,Arial,sans-serif;cursor:pointer";
    const status = document.createElement("span");
    status.style.cssText = "font-size:11px;color:#59655f";
    button.addEventListener("click", async () => {
      button.disabled = true;
      status.textContent = "Recuperando…";
      try {
        const response = await fetch(RECOVER_ENDPOINT, {
          method:"POST",
          headers:{"content-type":"application/json"},
          credentials:"same-origin",
          body:JSON.stringify({state:readLocal()})
        });
        const result = await response.json().catch(()=>({}));
        if(!response.ok) throw new Error(result.error || "Falha na recuperação");
        status.textContent = result.recoveredRecords + " registro(s) recuperado(s) no D1 · revisão " + result.revision;
        button.textContent = "Recuperado";
        button.style.opacity = ".65";
        await hydrateFromServer();
      } catch(error) {
        button.disabled = false;
        status.textContent = "Não foi possível recuperar: " + (error?.message || error);
      }
    });
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;align-items:center;gap:10px;flex-wrap:wrap";
    actions.append(button,status);
    banner.append(copy,actions);
    const head = page.querySelector(".page-head");
    if(head?.nextSibling) page.insertBefore(banner,head.nextSibling); else page.prepend(banner);
  }
  async function boot(){
    await hydrateFromServer();
    ensureBanner();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
  document.addEventListener("click", event => {
    if(event.target?.closest?.('[data-page="holidays"]')) setTimeout(hydrateFromServer,30);
  });
})();
</script>`;

if(!html.includes("</body>")) throw new Error("public/index.html sem </body>");
html = html.replace("</body>", script + "\n</body>");
writeFileSync(file,html);
console.log("Holiday D1 hydration bridge applied.");
