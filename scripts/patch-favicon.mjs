import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

const href = "/brand/adapta-brand-icon-trim.png";
const links = `\n<link rel="icon" type="image/png" href="${href}">\n<link rel="shortcut icon" type="image/png" href="${href}">\n<link rel="apple-touch-icon" href="${href}">\n`;

html = html.replace(/<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]*>\s*/gi, "");
if (!html.includes("</head>")) throw new Error("public/index.html sem </head>");
html = html.replace("</head>", links + "</head>");

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: favicon atualizado para o ícone compacto oficial da Adapta.");
