import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

const brokenXml = `var xml='<?xml version="1.0" encoding="UTF-8"?>
'+new XMLSerializer().serializeToString(svg);`;
const fixedXml = `var xml='<?xml version="1.0" encoding="UTF-8"?>\\n'+new XMLSerializer().serializeToString(svg);`;
if (html.includes(brokenXml)) html = html.replace(brokenXml, fixedXml);

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

function replaceRequired(before, after, label){
  if(!html.includes(before)) throw new Error(`${label} esperado não encontrado.`);
  html = html.replace(before, after);
}

replaceRequired(
`  const postItems=allPosts()
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
    }));`,
`  const postItems=allPosts()
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
    });`,
"Bloco unscheduledCalendarItems"
);

replaceRequired(
`    const postUsed=allPosts().filter(post=>{
      const item=state.items[post.id];
      return item.date&&weekKey(item.date)===key&&item.behavior!=="parallel";
    }).length;`,
`    const postUsed=allPosts().filter(post=>{
      const item=state.items?.[post.id];
      return item&&item.date&&weekKey(item.date)===key&&item.behavior!=="parallel";
    }).length;`,
"Bloco renderCalendarProgress"
);

replaceRequired(
`function matchesContentFilters(post){
  const item=state.items[post.id];`,
`function matchesContentFilters(post){
  const item=state.items?.[post.id];
  if(!item)return false;`,
"matchesContentFilters"
);

replaceRequired(
`function sortStage(stage){
  const list=allPosts().filter(post=>state.items[post.id].stage===stage);`,
`function sortStage(stage){
  const list=allPosts().filter(post=>state.items?.[post.id]?.stage===stage);`,
"sortStage"
);

replaceRequired(
`function subtitleFor(post){
  const item=state.items[post.id];
  const parts=[post.base];`,
`function subtitleFor(post){
  const item=state.items?.[post.id];
  const parts=[post.base];
  if(!item)return parts.join(" · ");`,
"subtitleFor"
);

replaceRequired(
`function workflowMeta(post){
  const item=state.items[post.id];`,
`function workflowMeta(post){
  const item=state.items?.[post.id];
  if(!item)return"";`,
"workflowMeta"
);

replaceRequired(
`  allPosts().forEach(post=>counts[state.items[post.id].stage]++);`,
`  allPosts().forEach(post=>{const item=state.items?.[post.id];if(item&&counts[item.stage]!==undefined)counts[item.stage]++});`,
"updateCounts"
);

replaceRequired(
`  const postCount=allPosts().filter(post=>{
    const item=state.items[post.id];
    return item.date&&weekKey(item.date)===key&&item.behavior!=="parallel";
  }).length;`,
`  const postCount=allPosts().filter(post=>{
    const item=state.items?.[post.id];
    return item&&item.date&&weekKey(item.date)===key&&item.behavior!=="parallel";
  }).length;`,
"mainCountInWeek"
);

replaceRequired(
`function fullCalendarEvents(){
  const postEvents=allPosts().flatMap(post=>{
    const item=state.items[post.id];`,
`function fullCalendarEvents(){
  const postEvents=allPosts().flatMap(post=>{
    const item=state.items?.[post.id];
    if(!item)return[];`,
"fullCalendarEvents"
);

// Filtros dessas telas recebem listas vindas de sortStage(), que agora só devolve posts com state.items.
// Ainda assim, proteções diretas evitam regressões se o fluxo mudar futuramente.
html = html.replaceAll(
  `(!currentLineFilter||state.items[post.id].lineId===currentLineFilter)`,
  `(!currentLineFilter||state.items?.[post.id]?.lineId===currentLineFilter)`
);

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: consumidores de posts endurecidos contra registros derivados sem state.items.");
