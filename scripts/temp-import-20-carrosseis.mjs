import { chromium } from "playwright";
import { execSync } from "node:child_process";
const executablePath=execSync("command -v google-chrome || command -v google-chrome-stable || command -v chromium",{encoding:"utf8"}).trim();
const browser=await chromium.launch({headless:true,executablePath,args:["--no-sandbox"]});
const page=await browser.newPage();
await page.goto("https://centraladapta.febredearte.workers.dev",{waitUntil:"networkidle",timeout:60000});
await page.waitForFunction(()=>document.documentElement.dataset.centralState==="ready",{timeout:30000});
const result=await page.evaluate(()=>{
  const matches={};
  for(const key of Object.getOwnPropertyNames(window)){
    let v; try{v=window[key]}catch{continue}
    if(typeof v!=="function")continue;
    let src=""; try{src=Function.prototype.toString.call(v)}catch{continue}
    if(/contentCatalog|CONTENT_CATALOG|allPosts\(|renderIdeas|renderContents/i.test(src))matches[key]=src;
  }
  const globals={};
  for(const name of ["contentCatalog","CONTENT_CATALOG","CONTENT_CATALOG_BASE","allPosts","renderIdeas","renderWorkflow","renderPublished","renderAll"]){
    try{
      const v=eval(name);
      globals[name]=typeof v==="function"?Function.prototype.toString.call(v):(Array.isArray(v)?{type:"array",length:v.length,sample:v.slice(-3)}:typeof v);
    }catch(e){globals[name]="unavailable"}
  }
  return {globals,matches};
});
console.log(JSON.stringify(result,null,2));
await browser.close();
