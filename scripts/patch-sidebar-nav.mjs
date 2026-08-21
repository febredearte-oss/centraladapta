import { readFileSync, writeFileSync } from "node:fs";

const FILE = "public/index.html";
let html = readFileSync(FILE, "utf8");

const start = html.indexOf('<header class="shell-header">');
if (start < 0) throw new Error("Cabeçalho principal não encontrado.");
const end = html.indexOf("</header>", start);
if (end < 0) throw new Error("Fim do cabeçalho principal não encontrado.");

let header = html.slice(start, end + 9)
  .replace('<header class="shell-header">', '<aside class="app-sidebar" id="appSidebar" aria-label="Navegação principal">')
  .replace('</header>', '</aside>');

const trigger = `<button class="sidebar-toggle" id="sidebarToggle" type="button" aria-controls="appSidebar" aria-expanded="true" aria-label="Ocultar menu">
  <span></span><span></span><span></span>
</button><div class="sidebar-backdrop" id="sidebarBackdrop" hidden></div>`;

html = html.slice(0, start) + trigger + header + html.slice(end + 9);

const css = `<style id="adapta-hideable-sidebar">
:root{--sidebar-width:236px;--sidebar-gap:0px}
body{--app-sidebar-width:var(--sidebar-width);--main-pad-left:30px}
body.sidebar-closed{--app-sidebar-width:0px;--main-pad-left:72px}
.app-sidebar{
  position:fixed;inset:0 auto 0 0;z-index:80;
  width:var(--sidebar-width);height:100dvh;
  display:flex;flex-direction:column;gap:0;
  padding:18px 14px 14px;
  border-right:1px solid #dfe4df;
  background:rgba(250,251,248,.98);
  backdrop-filter:blur(14px);
  box-shadow:8px 0 28px rgba(18,43,31,.04);
  transition:transform .22s ease;
}
body.sidebar-closed .app-sidebar{transform:translateX(-100%)}
.app-sidebar .brand-official{display:flex;align-items:center;min-height:48px;padding:2px 8px 18px;border-bottom:1px solid #e4e8e3;margin-bottom:12px}
.app-sidebar .brand-official .brand-logo{display:none!important}
.app-sidebar .brand-official .brand-logo-horizontal{display:block!important;width:154px!important;max-height:40px!important}
.app-sidebar .main-nav{
  display:flex;flex:1;flex-direction:column;align-items:stretch;align-self:auto;
  gap:4px;overflow-y:auto;overflow-x:hidden;padding:2px 0 14px;
}
.app-sidebar .main-nav button{
  position:relative;width:100%;min-height:42px;
  display:flex;align-items:center;gap:11px;
  padding:0 12px;border:0;border-radius:10px;
  background:transparent;color:#66706a;
  font-family:"Montserrat",Arial,sans-serif;font-size:13px;font-weight:650;
  text-align:left;white-space:normal;
  transition:background .16s ease,color .16s ease;
}
.app-sidebar .main-nav button::after{display:none!important}
.app-sidebar .main-nav button:hover{background:#f0f3ef;color:#0A3426}
.app-sidebar .main-nav button.active{background:#e8efea;color:#0A3426;font-weight:750}
.app-sidebar .sidebar-nav-icon{width:18px;height:18px;display:grid;place-items:center;flex:0 0 18px;color:currentColor}
.app-sidebar .sidebar-nav-icon svg{width:17px;height:17px;stroke-width:1.8}

/* Hierarquia: Calendário > Conteúdos > Linhas editoriais; Calendário > Feriados e avisos. */
.app-sidebar .sidebar-nav-group{display:flex;flex-direction:column;gap:2px;margin:1px 0}
.app-sidebar .sidebar-nav-group>.sidebar-calendar-main{font-weight:700}
.app-sidebar .sidebar-subnav-level1{display:flex;flex-direction:column;gap:1px;margin:0 0 3px 29px;padding:2px 0 3px 10px;border-left:1px solid #d8e0da}
.app-sidebar .sidebar-subnav-level1>button,
.app-sidebar .sidebar-content-group>button{min-height:34px;padding:0 9px;border-radius:8px;font-size:12px;font-weight:600;color:#737d77}
.app-sidebar .sidebar-subnav-level1 button .sidebar-nav-icon{width:14px;height:14px;flex-basis:14px}
.app-sidebar .sidebar-subnav-level1 button .sidebar-nav-icon svg{width:13px;height:13px;stroke-width:1.8}
.app-sidebar .sidebar-subnav-level1 button:hover{background:#f1f4f1;color:#0A3426}
.app-sidebar .sidebar-subnav-level1 button.active{background:#edf2ee;color:#0A3426;font-weight:700}
.app-sidebar .sidebar-content-group{display:flex;flex-direction:column;gap:1px}
.app-sidebar .sidebar-subnav-level2{display:flex;flex-direction:column;margin:0 0 2px 20px;padding-left:9px;border-left:1px solid #e3e8e4}
.app-sidebar .sidebar-subnav-level2 button{min-height:31px;padding:0 8px;border-radius:7px;font-size:11px;font-weight:600;color:#7f8883}
.app-sidebar .sidebar-subnav-level2 button .sidebar-nav-icon{width:12px;height:12px;flex-basis:12px}
.app-sidebar .sidebar-subnav-level2 button .sidebar-nav-icon svg{width:11px;height:11px}
.app-sidebar .sidebar-content-group:has(.sidebar-subnav-level2 button.active)>button{color:#0A3426;background:#f3f6f3}
.app-sidebar .sidebar-nav-group:has(.sidebar-subnav-level1 button.active)>.sidebar-calendar-main{color:#0A3426;background:#f3f6f3}

.app-sidebar .header-spacer{display:none}
.app-sidebar .user-select{
  width:100%;min-height:40px;flex:none;margin-top:auto;
  padding:0 34px 0 12px;border:1px solid #dfe4df;border-radius:10px;
  background:#fff;color:#27342e;font-family:"Montserrat",Arial,sans-serif;font-size:12px;
}
.sidebar-toggle{
  position:fixed;z-index:95;top:14px;left:calc(var(--app-sidebar-width) + 14px);
  width:40px;height:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  border:1px solid #dfe4df;border-radius:11px;background:#fff;color:#0A3426;
  box-shadow:0 6px 18px rgba(18,43,31,.08);
  transition:left .22s ease,background .16s ease;
}
.sidebar-toggle:hover{background:#f1f5f1}
.sidebar-toggle span{display:block;width:16px;height:1.5px;border-radius:2px;background:currentColor}
.sidebar-backdrop{display:none}
.shell-main{
  width:auto!important;max-width:1440px;
  margin-left:var(--app-sidebar-width)!important;margin-right:auto!important;
  padding-left:var(--main-pad-left)!important;padding-right:30px!important;
  transition:margin-left .22s ease,padding-left .22s ease;
}
@media(max-width:840px){
  body,body.sidebar-closed{--app-sidebar-width:0px;--main-pad-left:58px}
  .app-sidebar{width:min(84vw,286px);transform:translateX(-100%);box-shadow:18px 0 50px rgba(18,43,31,.14)}
  body.sidebar-mobile-open .app-sidebar{transform:translateX(0)}
  .sidebar-toggle{left:14px}
  body.sidebar-mobile-open .sidebar-toggle{left:min(calc(84vw - 54px),232px)}
  .sidebar-backdrop{position:fixed;inset:0;z-index:70;background:rgba(15,26,20,.28);backdrop-filter:blur(2px)}
  body.sidebar-mobile-open .sidebar-backdrop{display:block}
  .shell-main{margin-left:0!important;padding-left:58px!important;padding-right:16px!important}
}
</style>`;
html = html.replace("</head>", `${css}</head>`);

const js = `<script id="adapta-sidebar-runtime">
(function(){
  var body=document.body;
  var sidebar=document.getElementById('appSidebar');
  var toggle=document.getElementById('sidebarToggle');
  var backdrop=document.getElementById('sidebarBackdrop');
  if(!sidebar||!toggle)return;
  var mobile=window.matchMedia('(max-width:840px)');
  var nav=sidebar.querySelector('.main-nav');

  // Arquitetura solicitada: Calendário > Conteúdos > Linhas editoriais; Calendário > Feriados e avisos.
  if(nav){
    var calendarBtn=nav.querySelector('button[data-page="calendar"]');
    var contentsBtn=nav.querySelector('button[data-page="contents"]');
    var linesBtn=nav.querySelector('button[data-page="lines"]');
    var holidaysBtn=nav.querySelector('button[data-page="holidays"]');
    if(calendarBtn&&(contentsBtn||linesBtn||holidaysBtn)&&!nav.querySelector('.sidebar-nav-group')){
      var first=[calendarBtn,contentsBtn,linesBtn,holidaysBtn].filter(Boolean).sort(function(a,b){return Array.prototype.indexOf.call(nav.children,a)-Array.prototype.indexOf.call(nav.children,b);})[0];
      var group=document.createElement('div');
      group.className='sidebar-nav-group';
      first.parentNode.insertBefore(group,first);
      calendarBtn.classList.add('sidebar-calendar-main');
      group.appendChild(calendarBtn);

      var level1=document.createElement('div');
      level1.className='sidebar-subnav-level1';

      if(contentsBtn){
        contentsBtn.dataset.sidebarLabel='Conteúdos';
        var contentGroup=document.createElement('div');
        contentGroup.className='sidebar-content-group';
        contentGroup.appendChild(contentsBtn);
        if(linesBtn){
          linesBtn.dataset.sidebarLabel='Linhas editoriais';
          var level2=document.createElement('div');
          level2.className='sidebar-subnav-level2';
          level2.appendChild(linesBtn);
          contentGroup.appendChild(level2);
        }
        level1.appendChild(contentGroup);
      }else if(linesBtn){
        linesBtn.dataset.sidebarLabel='Linhas editoriais';
        level1.appendChild(linesBtn);
      }

      if(holidaysBtn){
        holidaysBtn.dataset.sidebarLabel='Feriados e avisos';
        level1.appendChild(holidaysBtn);
      }
      group.appendChild(level1);
    }
  }

  var icons={overview:'layout-dashboard',contents:'files',calendar:'calendar-days',lines:'rows-3',holidays:'calendar-heart',design:'palette'};
  sidebar.querySelectorAll('.main-nav button[data-page]').forEach(function(btn){
    if(btn.dataset.sidebarLabel){
      Array.from(btn.childNodes).forEach(function(node){if(node.nodeType===3&&node.textContent.trim())node.textContent=' '+btn.dataset.sidebarLabel;});
    }
    if(btn.querySelector('.sidebar-nav-icon'))return;
    var icon=document.createElement('span');
    icon.className='sidebar-nav-icon';
    icon.innerHTML='<i data-lucide="'+(icons[btn.dataset.page]||'circle')+'"></i>';
    btn.prepend(icon);
  });
  if(window.lucide&&window.lucide.createIcons)window.lucide.createIcons();
  function isOpen(){return mobile.matches?body.classList.contains('sidebar-mobile-open'):!body.classList.contains('sidebar-closed');}
  function apply(open,persist){
    if(mobile.matches){
      body.classList.toggle('sidebar-mobile-open',open);
      body.classList.remove('sidebar-closed');
      if(backdrop){backdrop.hidden=!open;}
    }else{
      body.classList.remove('sidebar-mobile-open');
      body.classList.toggle('sidebar-closed',!open);
      if(backdrop){backdrop.hidden=true;}
      if(persist!==false){try{localStorage.setItem('adapta-sidebar',open?'open':'closed')}catch(e){}}
    }
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Ocultar menu':'Mostrar menu');
  }
  function initial(){
    if(mobile.matches){apply(false,false);return;}
    var saved=null;try{saved=localStorage.getItem('adapta-sidebar')}catch(e){}
    apply(saved!=='closed',false);
  }
  toggle.addEventListener('click',function(){apply(!isOpen());});
  if(backdrop)backdrop.addEventListener('click',function(){apply(false,false);});
  sidebar.querySelectorAll('.main-nav button[data-page]').forEach(function(btn){btn.addEventListener('click',function(){if(mobile.matches)apply(false,false);});});
  mobile.addEventListener&&mobile.addEventListener('change',initial);
  window.addEventListener('keydown',function(e){if(e.key==='Escape'&&mobile.matches&&isOpen())apply(false,false);});
  initial();
})();
</script>`;
html = html.replace("</body>", `${js}</body>`);

writeFileSync(FILE, html, "utf8");
console.log("Adapta: menu lateral em Calendário > Conteúdos > Linhas editoriais e Calendário > Feriados e avisos.");
