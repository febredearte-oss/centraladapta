import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
const ADAPTA_GREEN = "#0A3426";
const ADAPTA_GREEN_HOVER = "#123F31";
const ADAPTA_GREEN_ACTIVE = "#07271D";

let html = readFileSync(FILE, "utf8");

const constructorMarker = `if(fullCalendarInstance)return true;\n\n  fullCalendarInstance=new FullCalendar.Calendar(target,{\n    themeSystem:"classic",`;

const constructorReplacement = `if(fullCalendarInstance)return true;\n\n  // Tema institucional aplicado na própria raiz do FullCalendar.\n  // Assim os controles já nascem verdes mesmo com o CSS externo do componente.\n  target.style.setProperty("--fc-button-text-color", "#ffffff");\n  target.style.setProperty("--fc-button-bg-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-button-border-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-button-hover-bg-color", "${ADAPTA_GREEN_HOVER}");\n  target.style.setProperty("--fc-button-hover-border-color", "${ADAPTA_GREEN_HOVER}");\n  target.style.setProperty("--fc-button-active-bg-color", "${ADAPTA_GREEN_ACTIVE}");\n  target.style.setProperty("--fc-button-active-border-color", "${ADAPTA_GREEN_ACTIVE}");\n  target.style.setProperty("--fc-event-bg-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-event-border-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-event-text-color", "#ffffff");\n\n  fullCalendarInstance=new FullCalendar.Calendar(target,{\n    themeSystem:"classic",\n    eventColor:"${ADAPTA_GREEN}",\n    eventBackgroundColor:"${ADAPTA_GREEN}",\n    eventBorderColor:"${ADAPTA_GREEN}",\n    eventTextColor:"#ffffff",`;

if (!html.includes(constructorMarker)) {
  throw new Error("FullCalendar constructor marker not found; refusing partial calendar patch.");
}
html = html.replace(constructorMarker, constructorReplacement);

// Atualiza também as cores declaradas diretamente nos objetos de evento,
// que têm precedência sobre a cor global do calendário.
const eventsStart = html.indexOf("function fullCalendarEvents(){");
const eventsEnd = html.indexOf("function desiredCalendarView(){", eventsStart);
if (eventsStart < 0 || eventsEnd < 0) {
  throw new Error("FullCalendar event factory not found; refusing partial calendar patch.");
}
const beforeEvents = html.slice(0, eventsStart);
const eventsBlock = html.slice(eventsStart, eventsEnd).replaceAll("#1f5d46", ADAPTA_GREEN);
const afterEvents = html.slice(eventsEnd);
html = beforeEvents + eventsBlock + afterEvents;

// Mantém a paleta interna do módulo coerente com os arquivos oficiais da marca.
const calendarCssStart = html.indexOf("/* Calendário — FullCalendar oficial */");
const calendarCssEnd = html.indexOf("/* Linhas editoriais */", calendarCssStart);
if (calendarCssStart >= 0 && calendarCssEnd > calendarCssStart) {
  const beforeCss = html.slice(0, calendarCssStart);
  const calendarCss = html.slice(calendarCssStart, calendarCssEnd).replaceAll("#1f5d46", ADAPTA_GREEN);
  const afterCss = html.slice(calendarCssEnd);
  html = beforeCss + calendarCss + afterCss;
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: FullCalendar configurado internamente com o verde institucional.");
