import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

const href = "/brand/adapta-brand-icon-trim.png?v=20260828-2";
const links = `\n<link rel="icon" type="image/png" sizes="200x200" href="${href}">\n<link rel="shortcut icon" type="image/png" href="${href}">\n<link rel="apple-touch-icon" sizes="200x200" href="${href}">\n`;

html = html.replace(/<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]*>\s*/gi, "");
if (!html.includes("</head>")) throw new Error("public/index.html sem </head>");
html = html.replace("</head>", links + "</head>");

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: favicon compacto oficial com URL versionada.");
