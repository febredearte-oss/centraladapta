import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
const ADAPTA_GREEN = "#0A3426";
const ADAPTA_GREEN_STRONG = "#07271D";

let html = readFileSync(FILE, "utf8");

const constructorMarker = `if(fullCalendarInstance)return true;\n\n  fullCalendarInstance=new FullCalendar.Calendar(target,{\n    themeSystem:"classic",`;

const constructorReplacement = `if(fullCalendarInstance)return true;\n\n  // FullCalendar v7 Classic: toolbar e eventos usam a paleta institucional desde a instanciação.\n  target.style.setProperty("--fc-classic-button", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-classic-button-border", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-classic-button-strong", "${ADAPTA_GREEN_STRONG}");\n  target.style.setProperty("--fc-classic-button-strong-border", "${ADAPTA_GREEN_STRONG}");\n  target.style.setProperty("--fc-classic-button-foreground", "#ffffff");\n  target.style.setProperty("--fc-classic-primary", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-classic-primary-foreground", "#ffffff");\n  target.style.setProperty("--fc-event-bg-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-event-border-color", "${ADAPTA_GREEN}");\n  target.style.setProperty("--fc-event-text-color", "#ffffff");\n\n  fullCalendarInstance=new FullCalendar.Calendar(target,{\n    themeSystem:"classic",\n    eventColor:"${ADAPTA_GREEN}",\n    eventBackgroundColor:"${ADAPTA_GREEN}",\n    eventBorderColor:"${ADAPTA_GREEN}",\n    eventTextColor:"#ffffff",`;

if (!html.includes(constructorMarker)) {
  throw new Error("FullCalendar constructor marker not found; refusing partial calendar patch.");
}
html = html.replace(constructorMarker, constructorReplacement);

const v7PaletteCss = `<style id="calendar-v7-classic-palette">
#fullCalendar{
  --fc-classic-button:${ADAPTA_GREEN};
  --fc-classic-button-border:${ADAPTA_GREEN};
  --fc-classic-button-strong:${ADAPTA_GREEN_STRONG};
  --fc-classic-button-strong-border:${ADAPTA_GREEN_STRONG};
  --fc-classic-button-foreground:#ffffff;
  --fc-classic-primary:${ADAPTA_GREEN};
  --fc-classic-primary-foreground:#ffffff;
  --fc-event-bg-color:${ADAPTA_GREEN};
  --fc-event-border-color:${ADAPTA_GREEN};
  --fc-event-text-color:#ffffff;
}
/* Eventos em bloco: chips verdes com texto branco. */
#fullCalendar .fc-h-event,
#fullCalendar .fc-timegrid-event{
  background-color:${ADAPTA_GREEN} !important;
  border-color:${ADAPTA_GREEN} !important;
}
#fullCalendar .fc-h-event .fc-event-main,
#fullCalendar .fc-timegrid-event .fc-event-main{
  color:#ffffff !important;
}
/* Eventos em lista/ponto: mantém o texto normal e troca apenas o marcador azul. */
#fullCalendar .fc-daygrid-event-dot{
  border-color:${ADAPTA_GREEN} !important;
}
</style>`;

if (!html.includes('id="calendar-v7-classic-palette"')) {
  html = html.replace("</head>", `${v7PaletteCss}</head>`);
}

// Objetos de evento que carreguem cores antigas/default ficam verdes também.
const eventsStart = html.indexOf("function fullCalendarEvents(){");
const eventsEnd = html.indexOf("function desiredCalendarView(){", eventsStart);
if (eventsStart >= 0 && eventsEnd > eventsStart) {
  const beforeEvents = html.slice(0, eventsStart);
  let eventsBlock = html.slice(eventsStart, eventsEnd);
  ["#1f5d46", "#3788d8", "#3b82f6", "rgb(55, 136, 216)"].forEach((oldColor) => {
    eventsBlock = eventsBlock.replaceAll(oldColor, ADAPTA_GREEN);
  });
  const afterEvents = html.slice(eventsEnd);
  html = beforeEvents + eventsBlock + afterEvents;
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: FullCalendar v7 com toolbar, chips e marcadores de evento na paleta verde oficial.");
