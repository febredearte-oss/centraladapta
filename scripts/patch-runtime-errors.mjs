import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

// Corrige o JS inline de download de SVG: dentro do HTML gerado havia uma quebra
// de linha literal dentro de uma string entre aspas simples, causando SyntaxError.
const brokenXml = `var xml='<?xml version="1.0" encoding="UTF-8"?>
'+new XMLSerializer().serializeToString(svg);`;
const fixedXml = `var xml='<?xml version="1.0" encoding="UTF-8"?>\\n'+new XMLSerializer().serializeToString(svg);`;
if (html.includes(brokenXml)) {
  html = html.replace(brokenXml, fixedXml);
}

// FullCalendar 7 não expõe updateSize/rerenderEvents nesta implementação.
html = html.replaceAll(
  "fullCalendarInstance?.updateSize()",
  '(typeof fullCalendarInstance?.updateSize==="function"?fullCalendarInstance.updateSize():undefined)'
);
html = html.replaceAll(
  "fullCalendarInstance?.rerenderEvents()",
  '(typeof fullCalendarInstance?.rerenderEvents==="function"?fullCalendarInstance.rerenderEvents():undefined)'
);
html = html.replaceAll(
  "  fullCalendarInstance.updateSize();",
  '  if(typeof fullCalendarInstance.updateSize==="function")fullCalendarInstance.updateSize();'
);
html = html.replaceAll(
  "  fullCalendarInstance.rerenderEvents();",
  '  if(typeof fullCalendarInstance.rerenderEvents==="function")fullCalendarInstance.rerenderEvents();'
);

// Alguns posts derivados podem existir em allPosts() antes de ganharem entrada em state.items.
// O calendário deve ignorá-los na fila de não agendados em vez de quebrar a página inteira.
const unsafePosts = `  const postItems=allPosts()
    .filter(post=>{
      const item=state.items[post.id];
      return!item.date&&item.stage!=="published";
    })
    .map(post=>({
      sourceType:"post",
      sourceId:post.id,
      title:post.title,
      lineId:state.items[post.id].lineId||"",
      meta:STAGE_LABELS[state.items[post.id].stage],
      sort:stageOrder[state.items[post.id].stage]??4,
      targetMonth:null
    }));`;
const safePosts = `  const postItems=allPosts()
    .filter(post=>{
      const item=state.items?.[post.id];
      return item&&!item.date&&item.stage!=="published";
    })
    .map(post=>{
      const item=state.items[post.id];
      return{
        sourceType:"post",
        sourceId:post.id,
        title:post.title,
        lineId:item.lineId||"",
        meta:STAGE_LABELS[item.stage],
        sort:stageOrder[item.stage]??4,
        targetMonth:null
      };
    });`;
if (!html.includes(unsafePosts)) throw new Error("Bloco unscheduledCalendarItems esperado não encontrado.");
html = html.replace(unsafePosts, safePosts);

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: runtime seguro (FullCalendar + posts sem state.items).");
