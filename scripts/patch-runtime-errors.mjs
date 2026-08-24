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
// Protege todas as chamadas remanescentes sem alterar o comportamento quando existem.
html = html.replaceAll(
  "fullCalendarInstance?.updateSize()",
  '(typeof fullCalendarInstance?.updateSize==="function"?fullCalendarInstance.updateSize():undefined)'
);
html = html.replaceAll(
  "fullCalendarInstance?.rerenderEvents()",
  '(typeof fullCalendarInstance?.rerenderEvents==="function"?fullCalendarInstance.rerenderEvents():undefined)'
);

// Só substitui chamadas em linhas independentes para não duplicar guardas já inseridas.
html = html.replaceAll(
  "  fullCalendarInstance.updateSize();",
  '  if(typeof fullCalendarInstance.updateSize==="function")fullCalendarInstance.updateSize();'
);
html = html.replaceAll(
  "  fullCalendarInstance.rerenderEvents();",
  '  if(typeof fullCalendarInstance.rerenderEvents==="function")fullCalendarInstance.rerenderEvents();'
);

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: erros de runtime corrigidos (SVG download + compatibilidade FullCalendar 7).");
