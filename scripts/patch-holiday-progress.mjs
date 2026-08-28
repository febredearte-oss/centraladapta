import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");
const marker = "holiday-persisted-progress-v1";
if (html.includes(marker)) process.exit(0);

const runtime = `
<script id="${marker}">
(() => {
  const host = document.getElementById("feriadosNativeHost");
  if (!host) return;

  let lastSignature = "";
  let applying = false;

  function progressData(){
    const tasks = Array.isArray(state?.holidayCommunicationTasks) ? state.holidayCommunicationTasks : [];
    const ids = [...new Set(tasks.map(task => String(task?.holidayId || "").trim()).filter(Boolean))];
    const records = Array.isArray(state?.holidayRecords) ? state.holidayRecords : [];
    const byId = new Map(records.map(record => [String(record?.feriado_id || "").trim(), record]));

    const decidedIds = ids.filter(id => {
      const record = byId.get(id);
      if (!record) return false;
      const expediente = String(record.expediente || "").trim();
      // Um valor padrão exibido pela interface não conta. Só existe decisão quando há
      // registro persistido para o feriado e o expediente deixou de estar indefinido.
      return expediente !== "" && expediente !== "A definir";
    });

    const total = ids.length;
    const decided = decidedIds.length;
    const percent = total ? Math.round((decided / total) * 100) : 0;
    return { total, decided, percent, decidedIds };
  }

  function apply(){
    if (applying) return;
    const root = host.shadowRoot;
    if (!root) return;

    const data = progressData();
    const signature = data.total + ":" + data.decided + ":" + data.percent;
    const percentNode = root.querySelector(".progress-percent");
    const textNode = root.querySelector(".progress-text");
    const fill = root.querySelector(".progress-fill");
    const ring = root.querySelector(".progress-ring");
    if (!percentNode && !textNode && !fill) return;

    applying = true;
    try {
      if (percentNode && percentNode.textContent !== data.percent + "%") percentNode.textContent = data.percent + "%";
      const text = data.total
        ? data.decided + " de " + data.total + " feriados com decisão registrada"
        : "Nenhum feriado carregado";
      if (textNode && textNode.textContent !== text) textNode.textContent = text;
      if (fill && fill.style.width !== data.percent + "%") fill.style.width = data.percent + "%";
      if (ring) ring.classList.toggle("is-full", data.total > 0 && data.decided === data.total);
      lastSignature = signature;
    } finally {
      applying = false;
    }
  }

  function schedule(){ requestAnimationFrame(apply); }

  // O módulo nativo é montado em Shadow DOM depois do HTML principal.
  const hostObserver = new MutationObserver(schedule);
  hostObserver.observe(host, { childList:true, subtree:true });

  let shadowObserver = null;
  function bindShadow(){
    if (!host.shadowRoot) return false;
    if (!shadowObserver) {
      shadowObserver = new MutationObserver(() => {
        if (!applying) schedule();
      });
      shadowObserver.observe(host.shadowRoot, { childList:true, subtree:true, characterData:true });
    }
    apply();
    return true;
  }

  const bootstrap = setInterval(() => {
    if (bindShadow()) clearInterval(bootstrap);
  }, 100);

  // state.holidayRecords é substituído após save, hidratação D1 e sync remoto.
  // A assinatura evita trabalho de DOM quando nada mudou.
  setInterval(() => {
    const data = progressData();
    const signature = data.total + ":" + data.decided + ":" + data.percent;
    if (signature !== lastSignature) apply();
  }, 500);

  document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });
  document.addEventListener("click", event => {
    if (event.target?.closest?.('[data-page="holidays"]')) setTimeout(schedule, 50);
  });
})();
</script>`;

if (!html.includes("</body>")) throw new Error("public/index.html sem </body>");
html = html.replace("</body>", runtime + "\n</body>");
writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: progresso de feriados deriva apenas de decisões persistidas no D1.");
