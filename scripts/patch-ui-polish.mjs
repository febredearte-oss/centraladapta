import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

const css = `<style id="adapta-ui-polish-v1">
/* Acabamento geral — mantém estrutura e lógica da v40. */
body,
button,
input,
select,
textarea{
  font-family:"Montserrat",Arial,Helvetica,sans-serif;
}

/* Tipografia: corpo confortável; 11–12px ficam só para metadados. */
body{font-size:14px}
.page-head p,
.routine-focus p,
.line-card p,
.calendar-progress .progress-copy span{
  font-size:13px;
  line-height:1.55;
}
.main-nav button{font-size:12px}
.user-select{font-size:12px}
.primary-button,.secondary-button,.danger-button{font-size:12px}
.eyebrow{font-size:10px;letter-spacing:.09em}

/* Calendário — integração visual com a Central. */
.calendar-shell{
  grid-template-columns:minmax(0,1fr) 310px;
  gap:18px;
}
.calendar-workspace{
  padding:14px;
  border-color:#dce3de;
  border-radius:16px;
  box-shadow:0 1px 0 rgba(10,52,38,.02);
}
#fullCalendar{
  --fc-border-color:#e2e7e3;
  --fc-today-bg-color:rgba(171,194,167,.18);
  --fc-highlight-color:rgba(171,194,167,.18);
}
#fullCalendar .fc-scrollgrid,
#fullCalendar .fc-theme-standard td,
#fullCalendar .fc-theme-standard th{
  border-color:#e2e7e3 !important;
}
#fullCalendar .fc-toolbar{
  gap:12px;
  margin-bottom:16px;
  align-items:center;
}
#fullCalendar .fc-toolbar-title{
  font-family:"Montserrat",Arial,sans-serif;
  font-size:24px !important;
  font-weight:800;
  letter-spacing:-.035em;
  color:#17231d;
}
#fullCalendar .fc-button,
#fullCalendar .fc-button-primary{
  min-height:36px;
  padding:0 13px !important;
  border-radius:9px !important;
  font-family:"Montserrat",Arial,sans-serif;
  font-size:11px !important;
  font-weight:800 !important;
  box-shadow:none !important;
}
#fullCalendar .fc-button-group>.fc-button:not(:first-child){margin-left:1px}
#fullCalendar .fc-col-header-cell-cushion,
#fullCalendar .fc-daygrid-day-number{
  font-size:12px;
  font-weight:600;
}
#fullCalendar .fc-daygrid-day.fc-day-today,
#fullCalendar .fc-day-today{
  background:rgba(171,194,167,.18) !important;
}
#fullCalendar .fc-daygrid-day.fc-day-today .fc-daygrid-day-number{
  background:#0A3426 !important;
  color:#fff !important;
}
#fullCalendar .fc-event,
#fullCalendar .fc-h-event{
  border-radius:6px;
  font-size:11px !important;
  line-height:1.25;
}
#fullCalendar .fc-daygrid-event-dot,
#fullCalendar .fc-list-event-dot{
  border-color:#0A3426 !important;
}
.calendar-source-note{
  margin-top:10px;
  font-size:11px;
  color:#7a827e;
}

/* Banco lateral — menos backoffice, mais leitura. */
.calendar-sidebar{
  top:80px;
  padding:17px;
  border-color:#dce3de;
  border-radius:16px;
  background:#fbfcfa;
  box-shadow:0 1px 0 rgba(10,52,38,.02);
}
.calendar-sidebar h3{
  margin:7px 0 7px;
  font-family:"Gilda Display",Georgia,serif;
  font-size:20px;
  line-height:1.08;
  font-weight:400;
  color:#17231d;
}
.calendar-sidebar>p{
  margin:0 0 14px;
  font-size:12px;
  line-height:1.55;
  color:#68716b;
}
.calendar-bank-tools{
  gap:8px;
  margin-bottom:10px;
}
.calendar-bank-dropzone{
  padding:12px;
  border-color:#cdd6d0;
  border-radius:10px;
  background:transparent;
}
.calendar-bank-dropzone strong{
  font-size:12px;
  font-weight:700;
}
.calendar-bank-dropzone span{
  margin-top:3px;
  font-size:11px;
  line-height:1.4;
}
.calendar-undo-button{
  min-height:34px;
  border-radius:9px;
  font-size:11px;
}
.unscheduled-search{
  height:40px;
  margin-bottom:9px;
  padding:0 11px;
  border-color:#dce3de;
  border-radius:10px;
  background:#fff;
  font-size:12px;
}
.unscheduled-list{
  gap:0;
  padding:0 2px;
}
.unscheduled-card{
  padding:12px 2px;
  border:0;
  border-bottom:1px solid #e2e7e3;
  border-radius:0;
  background:transparent;
}
.unscheduled-card:hover{
  padding-left:8px;
  padding-right:8px;
  border-color:#d7dfd9;
  border-radius:9px;
  background:#fff;
}
.unscheduled-card strong{
  font-size:12px;
  line-height:1.35;
  color:#17231d;
}
.unscheduled-card span{
  margin-top:4px;
  font-size:11px;
  line-height:1.35;
  color:#747d78;
}
.unscheduled-card button{
  min-height:31px;
  margin-top:8px;
  padding:0 10px;
  border-color:#0A3426;
  border-radius:8px;
  background:#fff;
  color:#0A3426;
  font-size:11px;
  font-weight:700;
}
.unscheduled-card button:hover{
  background:#0A3426;
  color:#fff;
}

/* Cabeçalho — estados mais coerentes com o sistema visual. */
.shell-header{min-height:66px;border-bottom-color:#dce3de}
.main-nav{gap:19px}
.main-nav button.active{color:#0A3426}
.main-nav button.active::after{height:2px;background:#0A3426}
.user-select{min-height:36px;border-color:#dce3de;border-radius:10px}

@media(max-width:1080px){
  .calendar-shell{grid-template-columns:minmax(0,1fr) 280px;gap:14px}
}
@media(max-width:980px){
  .calendar-shell{grid-template-columns:1fr}
  .calendar-sidebar{position:static}
}
@media(max-width:760px){
  .calendar-workspace{padding:9px}
  #fullCalendar .fc-toolbar-title{font-size:21px !important}
  #fullCalendar .fc-toolbar{align-items:flex-start}
}
</style>`;

if (!html.includes('id="adapta-ui-polish-v1"')) {
  html = html.replace("</head>", `${css}</head>`);
}

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: acabamento de calendário, banco lateral e tipografia aplicado.");
