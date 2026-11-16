import { chromium } from "playwright";
import { execSync } from "node:child_process";
const executablePath=execSync("command -v google-chrome || command -v google-chrome-stable || command -v chromium",{encoding:"utf8"}).trim();
const browser=await chromium.launch({headless:true,executablePath,args:["--no-sandbox"]});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const pageErrors=[]; const consoleErrors=[];
page.on("pageerror",e=>pageErrors.push(e.message));
page.on("console",m=>{if(m.type()==="error")consoleErrors.push(m.text())});
await page.goto("https://centraladapta.febredearte.workers.dev",{waitUntil:"networkidle",timeout:60000});
await page.waitForFunction(()=>document.documentElement.dataset.centralState==="ready",{timeout:30000});
await page.waitForTimeout(1500);
const before=await page.evaluate(async()=>{
  const r=await (await fetch("/api/shared-state",{cache:"no-store"})).json();
  return {
    revision:r.revision,
    catalogCount:Array.isArray(r.state?.contentCatalog)?r.state.contentCatalog.length:0,
    itemsCount:r.state?.items?Object.keys(r.state.items).length:0,
    allPostsSource:typeof allPosts==="function"?allPosts.toString():""
  };
});
await page.locator('[data-page="contents"]').first().click();
await page.waitForTimeout(1200);
const ui=await page.evaluate(()=>{
  const text=document.body.innerText||"";
  return {
    active:document.querySelector(".page.active")?.id||null,
    first:text.includes("Como saber de onde veio o seu remédio?"),
    middle:text.includes("Quem realmente decide as regras da cannabis no Brasil?"),
    last:text.includes("Como saber se um tratamento está fazendo diferença na vida dos pacientes?"),
    baseLabel:text.includes("Carrosséis educativos")
  };
});
const result={before,ui,pageErrors,consoleErrors};
result.ok=before.revision>=45&&before.catalogCount===54&&before.itemsCount>=67&&before.allPostsSource.includes("state?.contentCatalog")&&ui.active==="page-contents"&&ui.first&&ui.middle&&ui.last&&pageErrors.length===0;
console.log(JSON.stringify(result,null,2));
await browser.close();
if(!result.ok)process.exit(1);
