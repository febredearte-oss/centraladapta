import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

function replaceOnce(from,to,label){
  if(!html.includes(from))throw new Error(label+" não encontrado.");
  html=html.replace(from,to);
}

replaceOnce(
  '    status:entry.status||"provisório",\n    note:entry.note||"",',
  '    status:entry.status||"provisório",\n    posted:!!entry.posted,\n    postedAt:entry.postedAt||"",\n    note:entry.note||"",',
  'Campos do slot'
);

replaceOnce(
  'function calendarEntryById(id){return state.calendarEntries.find(entry=>entry.id===id)||null}\nfunction setCalendarEntryDate(',
  'function calendarEntryById(id){return state.calendarEntries.find(entry=>entry.id===id)||null}\nfunction setCalendarEntryPosted(entryId,posted){\n  const entry=calendarEntryById(entryId);\n  if(!entry)return false;\n  const next=Boolean(posted);\n  if(Boolean(entry.posted)===next)return false;\n  entry.posted=next;\n  entry.postedAt=next?nowIso():"";\n  entry.updatedAt=nowIso();\n  logActivity({type:"calendar-entry-posted",entryId:entry.id,title:entry.title,posted:next});\n  persist();\n  showToast(next?"“"+entry.title+"” marcado como postado.":"OK removido de “"+entry.title+"”.");\n  return true;\n}\nfunction setCalendarEntryDate(',
  'Função de publicação do slot'
);

replaceOnce(
  '  entry.date=newDate||"";\n  entry.status=newDate',
  '  entry.date=newDate||"";\n  if(!entry.date){\n    entry.posted=false;\n    entry.postedAt="";\n  }\n  entry.status=newDate',
  'Reset do OK ao remover data'
);

replaceOnce(
  '  if(entry.type==="calendar-entry-edit")return',
  '  if(entry.type==="calendar-entry-posted")return entry.actor+" "+(entry.posted?"marcou":"desmarcou")+" “"+entry.title+"” como postado";\n  if(entry.type==="calendar-entry-edit")return',
  'Histórico de slot postado'
);

replaceOnce(
  '        entry.holiday?"adapta-holiday-event":"",\n        entry.origin==="avulso"?"adapta-special-event":""\n      ].filter(Boolean),',
  '        entry.holiday?"adapta-holiday-event":"",\n        entry.origin==="avulso"?"adapta-special-event":"",\n        entry.posted?"adapta-slot-posted":""\n      ].filter(Boolean),',
  'Classe visual de slot postado'
);

replaceOnce(
  '        behavior:entry.behavior||"main",\n        status:entry.status||"provisório"\n      }',
  '        behavior:entry.behavior||"main",\n        status:entry.status||"provisório",\n        posted:!!entry.posted\n      }',
  'Estado posted no FullCalendar'
);

replaceOnce(
  '    eventClick(info){\n      info.jsEvent.preventDefault();\n      if(info.event.extendedProps.sourceType==="entry"){\n        openCalendarEntry(info.event.extendedProps.entryId);\n      }else{\n        openDetails(info.event.extendedProps.postId);\n      }\n    },',
  '    eventDidMount(info){\n      const props=info.event.extendedProps;\n      if(props.sourceType!=="entry"||!props.posted)return;\n      if(info.el.querySelector(".adapta-slot-ok"))return;\n      const badge=document.createElement("span");\n      badge.className="adapta-slot-ok";\n      badge.setAttribute("aria-label","Postado");\n      badge.innerHTML="<i></i><b>OK</b>";\n      info.el.appendChild(badge);\n    },\n    eventClick(info){\n      info.jsEvent.preventDefault();\n      const props=info.event.extendedProps;\n      if(props.sourceType!=="entry"){\n        openDetails(props.postId);\n        return;\n      }\n      const el=info.el;\n      if(el.__adaptaSlotClickTimer){\n        clearTimeout(el.__adaptaSlotClickTimer);\n        el.__adaptaSlotClickTimer=null;\n        setCalendarEntryPosted(props.entryId,!Boolean(props.posted));\n        return;\n      }\n      el.__adaptaSlotClickTimer=setTimeout(()=>{\n        el.__adaptaSlotClickTimer=null;\n        openCalendarEntry(props.entryId);\n      },340);\n    },',
  'Duplo clique do slot'
);

const css = `<style id="adapta-slot-posted-ui">
#fullCalendar .adapta-slot-posted{position:relative!important;padding-right:43px!important}
#fullCalendar .adapta-slot-ok{position:absolute;right:4px;top:50%;transform:translateY(-50%);z-index:3;display:inline-flex;align-items:center;gap:4px;min-height:19px;padding:0 6px;border:1px solid #8AA99B;border-radius:999px;background:#EEF5F0;color:#0A3426!important;font:800 9px/1 "Montserrat",Arial,sans-serif;letter-spacing:.04em;pointer-events:none}
#fullCalendar .adapta-slot-ok i{display:block;width:7px;height:7px;border-radius:50%;background:#169447;box-shadow:0 0 0 2px rgba(22,148,71,.10)}
#fullCalendar .adapta-slot-ok b{color:#0A3426!important;font:inherit}
#fullCalendar .fc-list-event.adapta-slot-posted{padding-right:0!important}
#fullCalendar .fc-list-event.adapta-slot-posted .adapta-slot-ok{position:static;transform:none;margin-left:8px;vertical-align:middle}
</style>`;
html=html.replace("</head>",css+"</head>");

writeFileSync(FILE,html,"utf8");
console.log("Adapta: slots do calendário recebem OK por duplo clique, com estado persistente.");
