import baseWorker from "./worker-holiday-local-import.js";
import { handleBoardAcknowledgement } from "./board-ack.js";
import { handleSharedBoardAcknowledgement } from "./board-shared-ack.js";

function onboardingMarkup(request) {
  const url = new URL(request.url);
  const isSharedBoard = /^\/pautaoficialdiretoria\+\d{2}-\d{2}-\d{4}$/.test(url.pathname);
  if (!isSharedBoard || (request.method !== "GET" && request.method !== "HEAD")) return "";
  const en = url.searchParams.get("lang") === "en";
  const copy = en ? {
    kicker: "Pilot procedure · Board",
    title: "Before you continue",
    intro: "This is a pilot of a new way to operationalize the formal circulation and acknowledgement of Board meeting records.",
    body: "The purpose of this test is to assess whether this format is clear, practical and appropriate for documenting that each director has read the record, while preserving the history of acknowledgements and protocols in one place.",
    how: "In this test, everyone accesses the same document. At the end, select your name and register your acknowledgement. On your first use, you will create a personal passphrase known only to you; it will be used again while this pilot remains active.",
    note: "The acknowledgement records awareness of the document. It does not mean automatic agreement with every statement, opinion or position described in the meeting record.",
    button: "UNDERSTOOD · OPEN DOCUMENT"
  } : {
    kicker: "Procedimento em teste · Diretoria",
    title: "Antes de continuar",
    intro: "Este é um teste de uma nova forma de operacionalizar a circulação e a ciência formal dos registros das reuniões da Diretoria.",
    body: "A ideia é avaliar se este formato é claro, prático e adequado para registrar que cada diretor leu o documento, mantendo em um só lugar o histórico dos vistos e seus respectivos protocolos.",
    how: "Neste teste, todos acessam o mesmo documento. Ao final, basta selecionar seu nome e registrar o visto. No primeiro uso, você criará uma palavra-chave pessoal conhecida apenas por você; ela será reutilizada enquanto este formato estiver em teste.",
    note: "O visto registra ciência do conteúdo do documento. Ele não significa concordância automática com todas as falas, opiniões ou posições descritas no registro da reunião.",
    button: "ENTENDI · ACESSAR DOCUMENTO"
  };
  return `
  <div id="board-onboarding" class="board-onboarding" hidden>
    <div class="board-onboarding__sheet" role="dialog" aria-modal="true" aria-labelledby="board-onboarding-title">
      <p class="board-onboarding__kicker">${copy.kicker}</p>
      <h1 id="board-onboarding-title">${copy.title}</h1>
      <p class="board-onboarding__lead">${copy.intro}</p>
      <p>${copy.body}</p>
      <div class="board-onboarding__rule"></div>
      <p><strong>${en ? "How it works" : "Como funciona"}</strong><br>${copy.how}</p>
      <p class="board-onboarding__note">${copy.note}</p>
      <button id="board-onboarding-continue" type="button">${copy.button}</button>
    </div>
  </div>
  <style>
    .board-onboarding{position:fixed;inset:0;z-index:9999;background:rgba(20,20,20,.62);padding:24px;overflow:auto;display:grid;place-items:center}
    .board-onboarding[hidden]{display:none}
    .board-onboarding__sheet{width:min(700px,100%);background:#fff;color:#111;border:1px solid #111;padding:clamp(30px,6vw,58px);box-shadow:0 18px 70px rgba(0,0,0,.22);font:16px/1.65 Georgia,'Times New Roman',serif}
    .board-onboarding__sheet h1{font:700 clamp(28px,5vw,40px)/1.08 Georgia,'Times New Roman',serif;text-transform:uppercase;letter-spacing:.02em;margin:0 0 22px}
    .board-onboarding__kicker{font:700 11px/1.4 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;margin:0 0 18px;border-bottom:1px solid #111;padding-bottom:12px}
    .board-onboarding__lead{font-size:19px;line-height:1.55}
    .board-onboarding__rule{border-top:1px solid #aaa;margin:26px 0}
    .board-onboarding__note{font-size:13px;line-height:1.55;color:#444;border-left:3px solid #222;padding-left:14px;margin:28px 0}
    #board-onboarding-continue{width:100%;border:1px solid #111;border-radius:0;background:#111;color:#fff;padding:15px 18px;font:700 12px/1.2 Arial,sans-serif;letter-spacing:.08em;cursor:pointer}
    @media print{.board-onboarding{display:none!important}}
  </style>
  <script>
    (()=>{
      const key='central-adapta-board-onboarding-v1';
      const el=document.getElementById('board-onboarding');
      const button=document.getElementById('board-onboarding-continue');
      let seen=false;
      try{seen=localStorage.getItem(key)==='1'}catch{}
      if(!seen) el.hidden=false;
      button?.addEventListener('click',()=>{try{localStorage.setItem(key,'1')}catch{} el.hidden=true;});
    })();
  </script>`;
}

async function withBoardTheme(response, request) {
  if (!response) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  let text = await response.text();
  if (!text.includes("/board-officio.css")) {
    text = text.replace("</head>", '<link rel="stylesheet" href="/board-officio.css"></head>');
  }
  const onboarding = onboardingMarkup(request);
  if (onboarding && !text.includes('id="board-onboarding"')) {
    text = text.replace("<body>", `<body>${onboarding}`);
  }
  return new Response(text, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const sharedBoardResponse = await handleSharedBoardAcknowledgement(request, env);
    if (sharedBoardResponse) return withBoardTheme(sharedBoardResponse, request);
    const boardResponse = await handleBoardAcknowledgement(request, env);
    if (boardResponse) return withBoardTheme(boardResponse, request);
    return baseWorker.fetch(request, env, ctx);
  },
};
