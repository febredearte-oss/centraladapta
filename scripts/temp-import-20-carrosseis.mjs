import { chromium } from "playwright";
import { execSync } from "node:child_process";
const executablePath=execSync("command -v google-chrome || command -v google-chrome-stable || command -v chromium",{encoding:"utf8"}).trim();
const browser=await chromium.launch({headless:true,executablePath,args:["--no-sandbox"]});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[]; page.on("pageerror",e=>errors.push(e.message));
await page.goto("https://centraladapta.febredearte.workers.dev",{waitUntil:"networkidle",timeout:60000});
await page.waitForFunction(()=>document.documentElement.dataset.centralState==="ready",{timeout:30000});
const inspect=await page.evaluate(()=>{
  const nav=[...document.querySelectorAll("[data-page]")].map(el=>({tag:el.tagName,text:(el.textContent||"").trim().replace(/\s+/g," ").slice(0,120),dataPage:el.getAttribute("data-page"),id:el.id,className:el.className}));
  const inputs=[...document.querySelectorAll("input")].map(el=>({placeholder:el.placeholder,id:el.id,type:el.type}));
  return {nav,inputs};
});
console.log("INSPECT",JSON.stringify(inspect,null,2));
const contentNav=inspect.nav.find(x=>/conteúdos/i.test(x.text));
if(contentNav){
  await page.locator(`[data-page="${contentNav.dataPage}"]`).first().click().catch(()=>{});
  await page.waitForTimeout(1200);
}
const after=await page.evaluate(()=>({active:[...document.querySelectorAll(".page.active")].map(x=>x.id),text:(document.body.innerText||"").slice(0,12000)}));
console.log("AFTER",JSON.stringify(after,null,2));
console.log("ERRORS",JSON.stringify(errors));
await browser.close();
