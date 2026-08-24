import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../public/guiadehash.html", import.meta.url);

const START_STYLE = "<!-- GUIADEHASH_MOBILE_FIT_STYLE_START -->";
const END_STYLE = "<!-- GUIADEHASH_MOBILE_FIT_STYLE_END -->";
const START_SCRIPT = "<!-- GUIADEHASH_MOBILE_FIT_SCRIPT_START -->";
const END_SCRIPT = "<!-- GUIADEHASH_MOBILE_FIT_SCRIPT_END -->";

let html = await readFile(file, "utf8");

html = html
  .replace(new RegExp(`${START_STYLE}[\\s\\S]*?${END_STYLE}`, "g"), "")
  .replace(new RegExp(`${START_SCRIPT}[\\s\\S]*?${END_SCRIPT}`, "g"), "")
  .replace(
    /<meta name="viewport" content="[^"]*">/i,
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  );

const mobileStyle = `${START_STYLE}
<style id="guiadehash-mobile-fit">
html.guide-mobile,
html.guide-mobile body{width:100%;height:100%;overflow:hidden;overscroll-behavior:none}
html.guide-mobile body{min-height:100dvh}
html.guide-mobile .shell{
  width:calc(100vw - 16px)!important;
  height:100dvh;
  margin:0 auto;
  padding:max(8px,env(safe-area-inset-top)) 0 max(7px,env(safe-area-inset-bottom));
  display:grid;
  grid-template-rows:auto auto minmax(0,1fr) auto;
  overflow:hidden;
}
html.guide-mobile .masthead{
  position:relative;
  grid-template-columns:minmax(0,1fr) auto;
  gap:8px;
  min-height:0;
  margin:0 0 6px;
  padding:0 0 7px;
}
html.guide-mobile .brand-lockup{grid-template-columns:34px minmax(0,1fr);gap:9px;align-items:start}
html.guide-mobile .brand-logo{width:34px;margin-top:1px}
html.guide-mobile .masthead .overline{margin-bottom:3px;font-size:6.6px;letter-spacing:.14em}
html.guide-mobile .masthead h1{
  max-width:calc(100vw - 118px);
  font-size:clamp(22px,6.5vw,29px);
  line-height:.94;
  letter-spacing:-.045em;
}
html.guide-mobile .masthead p{
  max-width:calc(100vw - 92px);
  margin-top:4px;
  font-size:9px;
  line-height:1.28;
}
html.guide-mobile .mast-actions{position:absolute;right:0;top:0;gap:6px;padding:0}
html.guide-mobile .lang-switch{padding:2px}
html.guide-mobile .lang-switch button{padding:4px 6px;font-size:7.4px}
html.guide-mobile .counter{font-size:13px}
html.guide-mobile .counter small{display:none}
html.guide-mobile .progress{
  display:grid!important;
  grid-template-columns:repeat(7,minmax(0,1fr));
  overflow:visible!important;
  margin:0 0 7px;
  border-bottom:1px solid var(--rule);
}
html.guide-mobile .progress button{
  min-width:0!important;
  margin:0!important;
  padding:3px 0 6px!important;
  text-align:center;
}
html.guide-mobile .progress button::after{left:12%;width:0;height:2px}
html.guide-mobile .progress button.active::after{width:76%}
html.guide-mobile .progress .label{display:none}
html.guide-mobile .progress .num{display:block;margin:0;font-size:7.8px;line-height:1;font-weight:900}
html.guide-mobile .stage,
html.guide-mobile .stage.final-stage{
  display:block;
  height:100%;
  min-height:0;
  overflow:hidden;
}
html.guide-mobile .rail{display:none!important}
html.guide-mobile .page:not(.final),
html.guide-mobile .page[data-step="0"]:not(.final),
html.guide-mobile .page[data-step="1"]:not(.final),
html.guide-mobile .page[data-step="2"]:not(.final),
html.guide-mobile .page[data-step="3"]:not(.final),
html.guide-mobile .page[data-step="4"]:not(.final),
html.guide-mobile .page[data-step="5"]:not(.final){
  width:100%;
  height:100%;
  min-height:0;
  display:grid!important;
  grid-template-columns:1fr!important;
  grid-template-rows:minmax(118px,29%) minmax(0,1fr);
  gap:9px!important;
  align-items:stretch;
  transform-origin:top left;
}
html.guide-mobile .media{
  width:100%;
  height:100%!important;
  min-height:0!important;
  margin:0!important;
  overflow:hidden;
  border-radius:11px;
}
html.guide-mobile .media>img{height:100%;object-fit:cover}
html.guide-mobile .story{
  min-height:0;
  padding:0 1px 2px;
  overflow:hidden;
  justify-content:flex-start;
}
html.guide-mobile .kicker{margin-bottom:4px;font-size:6.6px;letter-spacing:.14em}
html.guide-mobile .story h2{
  margin:0 0 7px;
  font-size:clamp(31px,9.8vw,41px);
  line-height:.91;
}
html.guide-mobile .lead{margin:0 0 7px;font-size:11.2px;line-height:1.34}
html.guide-mobile .key{
  margin:0 0 6px;
  padding:7px 0;
  font-size:13.2px;
  line-height:1.22;
}
html.guide-mobile .facts{min-height:0}
html.guide-mobile .fact{
  grid-template-columns:78px minmax(0,1fr);
  gap:9px;
  padding:4.5px 0;
}
html.guide-mobile .fact dt{font-size:6.6px;line-height:1.25;letter-spacing:.07em}
html.guide-mobile .fact dd{font-size:9.65px;line-height:1.28}
html.guide-mobile .controls{
  grid-template-columns:auto 1fr auto;
  gap:10px;
  margin:5px 0 0;
  padding:6px 0 0;
}
html.guide-mobile .ctrl{padding:3px 0;font-size:9px}
html.guide-mobile .instruction{font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

html.guide-mobile .page.final{width:100%;height:100%;min-height:0;display:block!important;transform-origin:top left}
html.guide-mobile .page:not(.final) .final-page{display:none!important}
html.guide-mobile .page.final .final-page{
  width:100%;
  height:100%;
  min-height:0;
  padding:0;
  display:grid!important;
  grid-template-rows:auto minmax(0,1fr) auto auto;
  overflow:hidden;
}
html.guide-mobile .final-top{
  display:grid;
  grid-template-columns:1fr;
  grid-template-areas:"kicker" "title" "lead" "rules";
  gap:0;
  padding:0 0 7px;
  border-bottom:1px solid var(--rule);
}
html.guide-mobile .final-top h2{
  max-width:none;
  margin:0 0 5px;
  font-size:clamp(29px,9.2vw,38px);
  line-height:.93;
}
html.guide-mobile .final-top .lead{max-width:none;margin:0 0 7px;font-size:9.8px;line-height:1.3}
html.guide-mobile .final-rules{
  margin:0;
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  border-top:1px solid var(--rule);
  border-bottom:1px solid var(--rule);
}
html.guide-mobile .rule-chip{min-width:0;padding:6px 7px}
html.guide-mobile .rule-chip + .rule-chip{border-top:0;border-left:1px solid var(--rule)}
html.guide-mobile .rule-chip strong{margin-bottom:2px;font-size:13px}
html.guide-mobile .rule-chip span{font-size:7.4px;line-height:1.2}
html.guide-mobile .flow-map{
  position:relative;
  min-height:0;
  margin:8px 0 5px;
  overflow:hidden!important;
  border:0;
}
html.guide-mobile .flow-head{display:none!important}
html.guide-mobile .flow-row{
  position:relative;
  min-width:0!important;
  min-height:0;
  height:100%;
  display:none!important;
  grid-template-columns:1fr 1fr!important;
  grid-template-rows:1fr 1fr;
  overflow:hidden;
  border:1px solid var(--rule);
  border-radius:18px;
  background:rgba(255,253,247,.46);
  isolation:isolate;
}
html.guide-mobile .flow-row.mobile-active{display:grid!important}
html.guide-mobile .flow-row.mobile-active::before{
  content:"";
  position:absolute;
  inset:15% 8%;
  z-index:-1;
  border-radius:42% 58% 63% 37% / 45% 39% 61% 55%;
  background:radial-gradient(circle at 28% 45%,rgba(107,138,122,.24),transparent 29%),radial-gradient(circle at 72% 58%,rgba(46,61,51,.17),transparent 31%),linear-gradient(115deg,rgba(214,227,214,.18),rgba(107,138,122,.2),rgba(214,227,214,.14));
  filter:blur(9px);
  animation:guideSap 4.8s ease-in-out infinite alternate;
  pointer-events:none;
}
html.guide-mobile .flow-cell{
  min-width:0;
  padding:9px 10px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  background:rgba(235,231,220,.52);
}
html.guide-mobile .flow-cell + .flow-cell{border-left:1px solid var(--rule-soft)}
html.guide-mobile .flow-cell:nth-child(3){border-left:0;border-top:1px solid var(--rule-soft)}
html.guide-mobile .flow-cell:nth-child(4){border-top:1px solid var(--rule-soft)}
html.guide-mobile .flow-cell:not(:last-child)::after{display:none}
html.guide-mobile .flow-label{margin-bottom:3px;font-size:6.2px;letter-spacing:.08em}
html.guide-mobile .flow-name,
html.guide-mobile .flow-name.small{font-size:clamp(15px,4.7vw,19px);line-height:1.03}
html.guide-mobile .flow-copy{margin-top:4px;font-size:7.9px;line-height:1.23}
html.guide-mobile .flow-empty{font-size:8px;line-height:1.2}
html.guide-mobile .mobile-flow-tabs{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:4px;
  margin:0 0 5px;
}
html.guide-mobile .mobile-flow-tabs button{
  min-width:0;
  border:1px solid var(--rule);
  border-radius:999px;
  background:transparent;
  color:var(--green-2);
  padding:5px 4px;
  font-size:7.6px;
  font-weight:900;
  line-height:1;
  cursor:pointer;
}
html.guide-mobile .mobile-flow-tabs button.active{background:var(--green);border-color:var(--green);color:var(--paper)}
html.guide-mobile .final-warning{max-width:none;margin:0;font-size:8.3px;line-height:1.25}
@keyframes guideSap{0%{transform:translate3d(-1.5%,1%,0) scale(.97);opacity:.72}100%{transform:translate3d(1.5%,-1%,0) scale(1.035);opacity:1}}

html.guide-mobile.guide-short .masthead p{display:none}
html.guide-mobile.guide-short .page:not(.final){grid-template-rows:minmax(96px,24%) minmax(0,1fr)}
html.guide-mobile.guide-short .story h2{font-size:clamp(28px,8.8vw,36px);margin-bottom:5px}
html.guide-mobile.guide-short .lead{font-size:10.2px;line-height:1.25;margin-bottom:5px}
html.guide-mobile.guide-short .key{padding:5px 0;font-size:11.6px;margin-bottom:4px}
html.guide-mobile.guide-short .fact{padding:3.5px 0}
html.guide-mobile.guide-short .fact dd{font-size:8.9px;line-height:1.2}
html.guide-mobile.guide-short .final-top .lead{display:none}
html.guide-mobile.guide-short .final-top h2{font-size:28px}
html.guide-mobile.guide-short .rule-chip{padding:5px 6px}
html.guide-mobile.guide-short .flow-copy{font-size:7.2px}

html.guide-mobile.guide-landscape .shell{width:calc(100vw - 18px)!important;padding-top:max(5px,env(safe-area-inset-top));padding-bottom:max(5px,env(safe-area-inset-bottom))}
html.guide-mobile.guide-landscape .masthead{margin-bottom:4px;padding-bottom:4px}
html.guide-mobile.guide-landscape .brand-lockup{grid-template-columns:28px minmax(0,1fr);gap:7px}
html.guide-mobile.guide-landscape .brand-logo{width:28px}
html.guide-mobile.guide-landscape .masthead .overline,
html.guide-mobile.guide-landscape .masthead p{display:none}
html.guide-mobile.guide-landscape .masthead h1{max-width:calc(100vw - 160px);font-size:19px;line-height:.95}
html.guide-mobile.guide-landscape .page:not(.final),
html.guide-mobile.guide-landscape .page[data-step="0"]:not(.final),
html.guide-mobile.guide-landscape .page[data-step="1"]:not(.final),
html.guide-mobile.guide-landscape .page[data-step="2"]:not(.final),
html.guide-mobile.guide-landscape .page[data-step="3"]:not(.final),
html.guide-mobile.guide-landscape .page[data-step="4"]:not(.final),
html.guide-mobile.guide-landscape .page[data-step="5"]:not(.final){
  grid-template-columns:minmax(0,.43fr) minmax(0,.57fr)!important;
  grid-template-rows:minmax(0,1fr);
  gap:12px!important;
}
html.guide-mobile.guide-landscape .story h2{font-size:31px}
html.guide-mobile.guide-landscape .lead{font-size:9.4px}
html.guide-mobile.guide-landscape .key{font-size:11px;padding:4px 0}
html.guide-mobile.guide-landscape .fact{grid-template-columns:68px minmax(0,1fr);padding:3px 0}
html.guide-mobile.guide-landscape .fact dd{font-size:8px;line-height:1.18}
html.guide-mobile.guide-landscape .final-top{grid-template-columns:minmax(0,.34fr) minmax(0,.66fr);grid-template-areas:"kicker rules" "title rules" "lead rules";column-gap:16px;align-items:end;padding-bottom:5px}
html.guide-mobile.guide-landscape .final-top h2{font-size:28px}
html.guide-mobile.guide-landscape .final-top .lead{display:block;font-size:8px;margin:0}
html.guide-mobile.guide-landscape .flow-row{grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:1fr}
html.guide-mobile.guide-landscape .flow-cell:nth-child(3),
html.guide-mobile.guide-landscape .flow-cell:nth-child(4){border-top:0;border-left:1px solid var(--rule-soft)}
html.guide-mobile.guide-landscape .flow-name,
html.guide-mobile.guide-landscape .flow-name.small{font-size:14px}
html.guide-mobile.guide-landscape .flow-copy{font-size:6.9px}
</style>
${END_STYLE}`;

const mobileScript = `${START_SCRIPT}
<script id="guiadehash-mobile-fit-script">
(()=>{
  const root=document.documentElement;
  const page=document.getElementById('page');
  const stage=document.querySelector('.stage');
  const families=document.getElementById('families');
  if(!page||!stage) return;

  let activeFlow=0;
  let touchX=null;
  let raf=0;

  const isPhone=()=>{
    const touch=(navigator.maxTouchPoints||0)>0 || matchMedia('(pointer:coarse)').matches;
    return touch && Math.min(window.innerWidth,window.innerHeight)<=760;
  };

  const routeLabels=()=>document.documentElement.lang.toLowerCase().startsWith('pt')
    ? ['Seco','Água','Live','Flor']
    : ['Dry','Water','Live','Flower'];

  function syncFlow(){
    if(!families) return;
    const rows=[...families.querySelectorAll('.flow-row')];
    if(!rows.length) return;
    activeFlow=Math.max(0,Math.min(activeFlow,rows.length-1));
    rows.forEach((row,i)=>row.classList.toggle('mobile-active',i===activeFlow));

    let tabs=document.getElementById('mobileFlowTabs');
    if(!tabs){
      tabs=document.createElement('div');
      tabs.id='mobileFlowTabs';
      tabs.className='mobile-flow-tabs';
      families.insertAdjacentElement('afterend',tabs);
    }
    const labels=routeLabels();
    tabs.innerHTML=rows.map((row,i)=>{
      const routeName=(row.querySelector('.flow-name')?.textContent||labels[i]||String(i+1)).trim();
      const text=labels[i]||String(i+1);
      return '<button type="button" data-flow="'+i+'" class="'+(i===activeFlow?'active':'')+'" aria-label="'+routeName.replace(/"/g,'&quot;')+'">'+text+'</button>';
    }).join('');
    tabs.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      activeFlow=Number(button.dataset.flow)||0;
      syncFlow();
      fitSoon();
    }));
  }

  function fit(){
    cancelAnimationFrame(raf);
    page.style.zoom='';
    if(!root.classList.contains('guide-mobile')) return;
    const available=stage.clientHeight;
    const needed=page.scrollHeight;
    if(!available||!needed) return;
    const ratio=Math.min(1,available/needed);
    if(ratio<.997) page.style.zoom=String(Math.max(.82,ratio));
  }

  function fitSoon(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>requestAnimationFrame(fit));
  }

  function applyMode(){
    const mobile=isPhone();
    root.classList.toggle('guide-mobile',mobile);
    root.classList.toggle('guide-landscape',mobile&&innerWidth>innerHeight);
    root.classList.toggle('guide-short',mobile&&innerHeight<720);
    if(mobile) syncFlow();
    fitSoon();
  }

  if(families){
    new MutationObserver(()=>{syncFlow();fitSoon()}).observe(families,{childList:true});
    families.addEventListener('touchstart',event=>{touchX=event.changedTouches[0]?.clientX??null},{passive:true});
    families.addEventListener('touchend',event=>{
      if(touchX==null) return;
      const end=event.changedTouches[0]?.clientX??touchX;
      const delta=end-touchX;
      touchX=null;
      if(Math.abs(delta)<44) return;
      const rows=[...families.querySelectorAll('.flow-row')];
      if(!rows.length) return;
      activeFlow=(activeFlow+(delta<0?1:-1)+rows.length)%rows.length;
      syncFlow();
      fitSoon();
    },{passive:true});
  }

  new MutationObserver(fitSoon).observe(page,{attributes:true,attributeFilter:['class','data-step']});
  document.addEventListener('click',fitSoon,true);
  window.addEventListener('resize',applyMode,{passive:true});
  window.addEventListener('orientationchange',applyMode,{passive:true});
  window.visualViewport?.addEventListener('resize',applyMode,{passive:true});

  applyMode();
})();
</script>
${END_SCRIPT}`;

if (!html.includes("</head>")) throw new Error("/guiadehash is missing </head>");
if (!html.includes("</body>")) throw new Error("/guiadehash is missing </body>");

html = html.replace("</head>", `${mobileStyle}</head>`);
html = html.replace("</body>", `${mobileScript}</body>`);

await writeFile(file, html, "utf8");
console.log("Applied mobile viewport fit to /guiadehash");
