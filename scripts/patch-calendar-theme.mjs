import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
const ADAPTA_GREEN = "#0A3426";
const ADAPTA_GREEN_STRONG = "#07271D";

let html = readFileSync(FILE, "utf8");

const constructorMarker = `if(fullCalendarInstance)return true;\n\n  fullCalendarInstance=new FullCalendar.Calendar(target,{\n    themeSystem:"classic",`;

const constructorReplacement = `if(fullCalendarInstance)return true;\n\n  // FullCalendar v7 Classic: as variáveis antigas --fc-button-* não controlam mais a toolbar.\n  // A paleta v7 usa --fc-classic-button / --fc-classic-button-strong.\n  target.style.setProperty("--fc-classic-button", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-classic-button-border", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-classic-button-strong", "${ADAPTA_GREEN_STRONG}");\n  target.style.setProperty("--fc-classic-button-strong-border", "${ADAPTA_GREEN_STRONG}");\n  target.style.setProperty("--fc-classic-button-foreground", "#ffffff");\n  target.style.setProperty("--fc-classic-primary", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-classic-primary-foreground", "#ffffff");\n\n  fullCalendarInstance=new FullCalendar.Calendar(target,{\n    themeSystem:"classic",`;

if (!html.includes(constructorMarker)) {
  throw new Error("FullCalendar constructor marker not found; refusing partial calendar patch.");
}
html = html.replace(constructorMarker, constructorReplacement);

// Também troca os valores antigos presentes no CSS do módulo por variáveis oficiais do v7 Classic.
const v7PaletteCss = `<style id="calendar-v7-classic-palette">
#fullCalendar{
  --fc-classic-button:${ADAPTA_GREEN};
  --fc-classic-button-border:${ADAPTA_GREEN};
  --fc-classic-button-strong:${ADAPTA_GREEN_STRONG};
  --fc-classic-button-strong-border:${ADAPTA_GREEN_STRONG};
  --fc-classic-button-foreground:#ffffff;
  --fc-classic-primary:${ADAPTA_GREEN};
  --fc-classic-primary-foreground:#ffffff;
}
</style>`;

if (!html.includes('id="calendar-v7-classic-palette"')) {
  html = html.replace("</head>", `${v7PaletteCss}</head>`);
}

// Objetos de evento que ainda carregam a cor antiga recebem o verde institucional.
const eventsStart = html.indexOf("function fullCalendarEvents(){");
const eventsEnd = html.indexOf("function desiredCalendarView(){", eventsStart);
if (eventsStart >= 0 && eventsEnd > eventsStart) {
  const beforeEvents = html.slice(0, eventsStart);
  const eventsBlock = html.slice(eventsStart, eventsEnd).replaceAll("#1f5d46", ADAPTA_GREEN);
  const afterEvents = html.slice(eventsEnd);
  html = beforeEvents + eventsBlock + afterEvents;
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: FullCalendar v7 Classic usando a paleta verde oficial na toolbar e nos eventos.");
