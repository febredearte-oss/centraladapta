import { chromium } from "playwright";
import { execSync } from "node:child_process";

const source = [{"section":"Origem e Qualidade","title":"Como saber de onde veio o seu remédio?","cards":["Como saber de onde veio o seu remédio?","Você compraria algo sem saber onde foi produzido? Com medicamentos, conhecer a origem é ainda mais importante.","Registros de origem, produção e lote ajudam a acompanhar o caminho do produto e investigar problemas.","Saber de onde veio também é uma forma de cuidado. Isso se chama rastreabilidade."],"motion":"Código de lote abre uma linha do tempo."},{"section":"Origem e Qualidade","title":"Duas flores iguais podem ser completamente diferentes.","cards":["Duas flores iguais podem ser completamente diferentes.","Duas flores podem parecer idênticas e, ainda assim, ter composições muito diferentes.","Testes laboratoriais podem medir componentes e, conforme a análise, investigar contaminantes. Aparência não revela tudo.","A aparência impressiona. A análise traz informações sobre o que foi testado."],"motion":"Flores iguais; laudos distintos aparecem."},{"section":"Origem e Qualidade","title":"Você sabe o que os números no frasco significam?","cards":["Você sabe o que os números no frasco significam?","30 mg/mL não significa 30 mL. É uma concentração: 30 miligramas de uma substância em cada mililitro.","Miligrama mede massa. Mililitro mede volume. E concentração não é a mesma coisa que a dose prescrita.","Entender o rótulo evita confusões. A dose deve seguir a prescrição."],"motion":"Zoom em 30 mg/mL com unidades separadas."},{"section":"Origem e Qualidade","title":"Por que as variedades de cannabis têm nomes tão estranhos?","cards":["Por que as variedades de cannabis têm nomes tão estranhos?","Nomes de doces, frutas e personagens ajudam a identificar e divulgar diferentes linhagens.","Mas o nome não garante composição nem efeito. Essas características podem variar entre produtos e lotes.","Nome curioso não substitui informação técnica."],"motion":"Nomes chamativos dão lugar a dados reais."},{"section":"Origem e Qualidade","title":"O que acontece com a cannabis depois da colheita?","cards":["O que acontece com a cannabis depois da colheita?","Colher a planta não significa que ela já esteja pronta para um uso medicinal.","Conforme o tipo de produto e as autorizações, podem existir etapas de secagem, processamento, formulação e testes.","Do cultivo ao produto final, qualidade depende de processo."],"motion":"Linha do tempo da colheita ao frasco."},{"section":"Regras e Direitos","title":"Por que enviar um remédio pode ser tão complicado?","cards":["Por que enviar um remédio pode ser tão complicado?","O produto precisa chegar à pessoa certa, nas condições adequadas e com a documentação necessária.","Exigências sanitárias, fiscais e de transporte podem fazer parte desse percurso. Erros podem causar atrasos.","Logística também influencia o acesso ao tratamento."],"motion":"Caixa encontra conferências no caminho."},{"section":"Regras e Direitos","title":"Como uma planta pode ser permitida e proibida ao mesmo tempo?","cards":["Como uma planta pode ser permitida e proibida ao mesmo tempo?","As regras podem variar conforme a finalidade e a atividade: pesquisa, cultivo, produção ou uso medicinal.","Uma autorização para determinada atividade não significa permissão automática para todas as outras.","A pergunta não é só “pode?”. É “em qual situação, e sob quais regras?”."],"motion":"Uma planta abre quatro caminhos com regras."},{"section":"Regras e Direitos","title":"Se a Justiça autorizou, por que ainda existe proibição?","cards":["Se a Justiça autorizou, por que ainda existe proibição?","Uma decisão judicial pode resolver o pedido de uma pessoa ou organização específica.","Isso não significa, necessariamente, que a mesma autorização valha para todo o país ou para qualquer situação.","Uma vitória judicial importa. Entender seu alcance também."],"motion":"Manchete se abre em “quem?” e “quando?”."},{"section":"Regras e Direitos","title":"Quem realmente decide as regras da cannabis no Brasil?","cards":["Quem realmente decide as regras da cannabis no Brasil?","Não existe um único botão que define tudo. Leis, decisões judiciais e regras sanitárias são coisas diferentes.","Congresso legisla; órgãos reguladores atuam dentro de suas competências; a Justiça decide conflitos.","Entender quem decide ajuda a saber de quem cobrar."],"motion":"Três blocos: Congresso, regulação, Justiça."},{"section":"Regras e Direitos","title":"O que acontece quando o governo e uma associação discordam?","cards":["O que acontece quando o governo e uma associação discordam?","Uma associação pode questionar a interpretação ou aplicação de uma exigência por um órgão público.","Dependendo do caso, há caminhos administrativos e judiciais para argumentar, pedir revisão e defender direitos.","Fiscalização e direito de defesa fazem parte do mesmo sistema."],"motion":"Dois documentos se cruzam; aparece “revisão”."},{"section":"Acesso e Continuidade","title":"Por que um remédio pode custar tão caro?","cards":["Por que um remédio pode custar tão caro?","O custo não é só o da matéria-prima. Há equipe, processamento, controles, infraestrutura e transporte.","Cada operação tem uma composição de custos. Olhar apenas o preço final não explica toda a cadeia.","Para discutir acesso, é preciso entender a conta inteira."],"motion":"Preço se divide em componentes de custo."},{"section":"Acesso e Continuidade","title":"Como saber quanto tempo um frasco vai durar?","cards":["Como saber quanto tempo um frasco vai durar?","A duração depende do volume do frasco e da dose prescrita. Um mesmo frasco pode durar tempos diferentes.","Concentração e modo de uso também importam. Não altere a dose por conta própria para fazer o produto render.","Antes de faltar, confira o planejamento com a equipe de cuidado."],"motion":"Calendário avança e nível do frasco desce."},{"section":"Acesso e Continuidade","title":"Por que alguns pacientes começam um tratamento e não continuam?","cards":["Por que alguns pacientes começam um tratamento e não continuam?","Começar o tratamento é uma etapa. Continuar pode depender de acesso, custo, resposta e efeitos adversos.","Uma interrupção não explica sozinha o motivo. É preciso conhecer a situação de cada pessoa.","Atrás de cada número existe uma trajetória."],"motion":"Gráfico vira caminhos de pessoas."},{"section":"Acesso e Continuidade","title":"Por que o remédio de uma pessoa pode não funcionar para outra?","cards":["Por que o remédio de uma pessoa pode não funcionar para outra?","Mesmo com diagnósticos parecidos, duas pessoas podem ter histórias e necessidades diferentes.","Formulação, outros medicamentos, objetivos clínicos e respostas individuais influenciam o acompanhamento.","O tratamento de alguém não é receita para todo mundo."],"motion":"Duas silhuetas seguem percursos diferentes."},{"section":"Acesso e Continuidade","title":"O que você precisa conferir antes de usar um óleo?","cards":["O que você precisa conferir antes de usar um óleo?","Veja identificação, concentração, lote, validade e orientações de conservação, quando aplicáveis.","Compare o produto com a prescrição. Se houver diferença ou dúvida, esclareça antes de usar.","Ler o rótulo faz parte do uso seguro."],"motion":"Checklist aparece sobre rótulo ampliado."},{"section":"História e Comunidade","title":"Maconha, cannabis e cânhamo são a mesma coisa?","cards":["Maconha, cannabis e cânhamo são a mesma coisa?","Cannabis é o nome do gênero botânico. Maconha é um termo popular; cânhamo costuma indicar certos usos ou variedades.","Os significados dependem do contexto cultural e regulatório. Nenhum desses nomes, sozinho, informa a composição.","Antes de debater, vale perguntar: de qual planta e uso estamos falando?"],"motion":"Palavras se transformam em verbetes."},{"section":"História e Comunidade","title":"A cannabis sempre foi proibida?","cards":["A cannabis sempre foi proibida?","Não. A planta já teve usos diferentes em muitas sociedades, inclusive em fibras e preparações tradicionais.","A proibição moderna surgiu em processos históricos, políticos e sociais que variaram conforme o país.","As regras de hoje não existiram desde sempre."],"motion":"Linha do tempo revela mudanças históricas."},{"section":"História e Comunidade","title":"Qual a diferença entre comprar um produto e fazer parte de uma associação?","cards":["Qual a diferença entre comprar um produto e fazer parte de uma associação?","Comprar é uma transação. Associar-se é integrar uma organização com objetivos e regras próprias.","De acordo com o estatuto, participar pode envolver direitos, deveres e atividades coletivas.","Uma associação pode ser muito mais que um ponto de entrega."],"motion":"Carrinho de compras vira rede de pessoas."},{"section":"História e Comunidade","title":"O que uma associação de cannabis faz além dos tratamentos?","cards":["O que uma associação de cannabis faz além dos tratamentos?","Associações podem promover informação, encontros, atividades educativas e defesa de interesses coletivos.","Projetos culturais e comunitários também podem fazer parte da atuação, conforme o estatuto e as regras aplicáveis.","Uma associação se fortalece pelo que constrói junto."],"motion":"Frasco se transforma em encontros e oficinas."},{"section":"História e Comunidade","title":"Como saber se um tratamento está fazendo diferença na vida dos pacientes?","cards":["Como saber se um tratamento está fazendo diferença na vida dos pacientes?","Não basta contar frascos. É importante acompanhar objetivos, sintomas, rotina e possíveis efeitos adversos.","Relatos dos pacientes são relevantes, mas precisam ser interpretados com cuidado, contexto e proteção dos dados.","Os números ajudam. Escuta e acompanhamento dão sentido a eles."],"motion":"Planilha se transforma em indicadores e perguntas."}];

const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const makeBody=(entry)=>`<div class="post-body">
<div class="meta"><span class="tag batch-tag">Carrosséis educativos</span><span class="tag">Carrossel · 4 telas</span><span class="tag">${escapeHtml(entry.section)}</span></div>
<div class="block"><h3>Roteiro</h3><div class="cards">${entry.cards.map((card,i)=>`<div class="card"><b>Tela ${i+1}</b><div>${escapeHtml(card)}</div></div>`).join("")}</div></div>
<div class="block"><h3>Motion</h3><p>${escapeHtml(entry.motion)}</p></div>
<div class="block"><h3>Observação</h3><p>Texto-base para criação. Revisar afirmações técnicas e jurídicas antes de publicar.</p></div>
</div>`;

const executablePath=execSync("command -v google-chrome || command -v google-chrome-stable || command -v chromium",{encoding:"utf8"}).trim();
const browser=await chromium.launch({headless:true,executablePath,args:["--no-sandbox"]});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const pageErrors=[]; const consoleErrors=[];
page.on("pageerror",e=>pageErrors.push(e.message));
page.on("console",m=>{if(m.type()==="error")consoleErrors.push(m.text())});
await page.goto("https://centraladapta.febredearte.workers.dev",{waitUntil:"networkidle",timeout:60000});
await page.waitForFunction(()=>document.documentElement.dataset.centralState==="ready",{timeout:30000});

const importResult=await page.evaluate(async({source})=>{
  const remote=await (await fetch("/api/shared-state",{cache:"no-store"})).json();
  const state=remote.state||{};
  const catalog=Array.isArray(state.contentCatalog)?structuredClone(state.contentCatalog):[];
  const items=state.items&&typeof state.items==="object"?structuredClone(state.items):{};
  const existingTitles=new Set(catalog.map(x=>String(x.title||"").trim().toLowerCase()));
  const usedIds=new Set([...catalog.map(x=>x.id),...Object.keys(items)]);
  const nums=[...usedIds].map(id=>/^post-(\d+)$/.exec(String(id))?.[1]).filter(Boolean).map(Number);
  let nextNum=(nums.length?Math.max(...nums):0)+1;
  const added=[];
  const now=new Date().toISOString();
  const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const makeBody=(entry)=>`<div class="post-body">
<div class="meta"><span class="tag batch-tag">Carrosséis educativos</span><span class="tag">Carrossel · 4 telas</span><span class="tag">${escapeHtml(entry.section)}</span></div>
<div class="block"><h3>Roteiro</h3><div class="cards">${entry.cards.map((card,i)=>`<div class="card"><b>Tela ${i+1}</b><div>${escapeHtml(card)}</div></div>`).join("")}</div></div>
<div class="block"><h3>Motion</h3><p>${escapeHtml(entry.motion)}</p></div>
<div class="block"><h3>Observação</h3><p>Texto-base para criação. Revisar afirmações técnicas e jurídicas antes de publicar.</p></div>
</div>`;
  for(const entry of source){
    const key=entry.title.trim().toLowerCase();
    if(existingTitles.has(key)) continue;
    let id;
    do{id="post-"+String(nextNum++).padStart(2,"0")}while(usedIds.has(id));
    usedIds.add(id);
    catalog.push({id,number:catalog.length+1,title:entry.title,base:"Carrosséis educativos",tags:["Carrosséis educativos","Carrossel · 4 telas",entry.section],bodyHtml:makeBody(entry)});
    items[id]={stage:"ideas",assignedTo:"",date:"",formats:"Carrossel · 4 telas",finalUrl:"",notes:`Bloco: ${entry.section}. Motion: ${entry.motion}`,lineId:"",behavior:"main",natures:[],priority:"normal",stageChangedAt:now,updatedAt:now};
    added.push({id,title:entry.title});
    existingTitles.add(key);
  }
  let save={ok:true,revision:remote.revision,unchanged:true};
  if(added.length){
    const response=await fetch("/api/shared-state",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({area:"Conteúdos · Importação 20 carrosséis",declaredBy:"Gaby",patches:[{path:["contentCatalog"],value:catalog,remove:false},{path:["items"],value:items,remove:false}]})});
    save=await response.json();
    if(!response.ok) throw new Error("save_failed "+response.status+" "+JSON.stringify(save));
  }
  return {added,save};
},{source});

await page.waitForTimeout(1800);
const verify=await page.evaluate(async(titles)=>{
  const remote=await (await fetch("/api/shared-state",{cache:"no-store"})).json();
  const s=remote.state||{};
  const catalog=Array.isArray(s.contentCatalog)?s.contentCatalog:[];
  const byTitle=new Map(catalog.map(x=>[x.title,x]));
  const imported=titles.map(t=>byTitle.get(t)).filter(Boolean);
  return {
    revision:remote.revision,
    catalogCount:catalog.length,
    itemsCount:Object.keys(s.items||{}).length,
    foundCount:imported.length,
    missing:titles.filter(t=>!byTitle.has(t)),
    importedIds:imported.map(x=>x.id),
    operationalReady:imported.every(x=>s.items?.[x.id]?.stage==="ideas"&&s.items?.[x.id]?.date===""&&s.items?.[x.id]?.formats==="Carrossel · 4 telas")
  };
},source.map(x=>x.title));

const contents=page.getByText("Conteúdos",{exact:true}).first();
if(await contents.count()){await contents.click().catch(()=>{}); await page.waitForTimeout(1000);}
const ui=await page.evaluate(titles=>{const text=document.body.innerText||"";return{firstTitleVisible:text.includes(titles[0]),lastTitleVisible:text.includes(titles[titles.length-1])}},source.map(x=>x.title));
const result={importResult,verify,ui,pageErrors,consoleErrors};
result.ok=verify.foundCount===20&&verify.missing.length===0&&verify.operationalReady&&pageErrors.length===0;
console.log(JSON.stringify(result,null,2));
await browser.close();
if(!result.ok)process.exit(1);
