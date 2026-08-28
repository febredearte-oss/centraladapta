import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const FILE = "public/index.html";
const LOGO_PAYLOAD = readFileSync("approved/adapta-logos-svg.b64", "utf8").trim();
const logos = JSON.parse(gunzipSync(Buffer.from(LOGO_PAYLOAD, "base64")).toString("utf8"));
const svg = logos["ultracompacta-claro"];
if (!svg) throw new Error("Logo oficial ultracompacta-claro não encontrado.");

mkdirSync("public/brand", { recursive: true });
writeFileSync("public/brand/adapta-favicon-current.svg", svg, "utf8");

let html = readFileSync(FILE, "utf8");
const href = "/brand/adapta-favicon-current.svg?v=20260828-3";
const links = `\n<link rel="icon" type="image/svg+xml" href="${href}">\n<link rel="shortcut icon" type="image/svg+xml" href="${href}">\n`;

html = html.replace(/<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]*>\s*/gi, "");
if (!html.includes("</head>")) throw new Error("public/index.html sem </head>");
html = html.replace("</head>", links + "</head>");

writeFileSync(FILE, html, "utf8");
console.log("Central Adapta: favicon gerado da mesma marca ultracompacta usada no cabeçalho publicado.");
