const ROUTE_PREFIX = "/pautaoficialdiretoria+";

const MEETINGS = {
  "04-09-2026": {
    recipients: {
      tonio: { id: "tonio", label: "Tonio" },
      oton: { id: "oton", label: "Oton" },
      isabela: { id: "isabela", label: "Isabela" },
      gabriela: { id: "gabriela", label: "Gabriela" },
    },
  },
};

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      "x-robots-tag": "noindex, nofollow, noarchive",
      "referrer-policy": "no-referrer",
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseRoute(pathname) {
  if (!pathname.startsWith(ROUTE_PREFIX)) return null;
  const value = pathname.slice(ROUTE_PREFIX.length);
  const match = value.match(/^(\d{2}-\d{2}-\d{4})\+([a-z0-9-]+)$/i);
  if (!match) return null;
  return { date: match[1], recipientSlug: match[2].toLowerCase() };
}

function formatDate(date) {
  const [day, month, year] = date.split("-");
  return `${day}/${month}/${year}`;
}

async function ensureSchema(env) {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS board_acknowledgements (
      meeting_date TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      recipient_label TEXT NOT NULL,
      acknowledged_at TEXT,
      PRIMARY KEY (meeting_date, recipient_id)
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_board_ack_meeting
      ON board_acknowledgements(meeting_date, acknowledged_at)`),
  ]);
}

function resolveRecipient(date, recipientSlug) {
  const meeting = MEETINGS[date];
  if (!meeting || !recipientSlug) return null;
  return meeting.recipients[recipientSlug] || null;
}

async function getRecord(env, date, recipient) {
  await ensureSchema(env);
  await env.DB.prepare(
    `INSERT OR IGNORE INTO board_acknowledgements
      (meeting_date, recipient_id, recipient_label, acknowledged_at)
      VALUES (?, ?, ?, NULL)`
  ).bind(date, recipient.id, recipient.label).run();

  return env.DB.prepare(
    `SELECT meeting_date, recipient_id, recipient_label, acknowledged_at
       FROM board_acknowledgements
      WHERE meeting_date = ? AND recipient_id = ?`
  ).bind(date, recipient.id).first();
}

function baseStyles() {
  return `
    :root{color-scheme:light;--ink:#17231d;--muted:#66736c;--line:#dce3de;--paper:#f5f7f5;--card:#fff;--green:#163d2a;--green2:#24583e}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;background:var(--paper);color:var(--ink);font-family:Montserrat,Arial,sans-serif;display:grid;place-items:center;padding:24px}
    main{width:min(620px,100%);background:var(--card);border:1px solid var(--line);border-radius:20px;padding:clamp(26px,5vw,46px);box-shadow:0 14px 45px rgba(23,35,29,.07)}
    .eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--green2);margin:0 0 15px}
    h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(30px,6vw,44px);font-weight:400;line-height:1.05;margin:0 0 10px}
    .date{font-size:15px;color:var(--muted);margin:0 0 32px}
    .statement{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:26px 0;margin:0 0 28px;font-size:18px;line-height:1.55}
    button{width:100%;border:0;border-radius:14px;padding:18px 22px;font:700 15px Montserrat,Arial,sans-serif;letter-spacing:.025em;background:var(--green);color:white;cursor:pointer}
    button:hover{background:var(--green2)} button:disabled{opacity:.55;cursor:wait}
    .fine{font-size:12px;line-height:1.5;color:var(--muted);margin:14px 0 0;text-align:center}
    .ok{font-size:54px;line-height:1;margin-bottom:18px}.done{font-size:18px;line-height:1.55;margin:0;color:var(--muted)}
    #msg{min-height:20px;color:#8a2f2f;font-size:13px;text-align:center;margin-top:12px}
  `;
}

function activePage(date, recipient) {
  const safeDate = escapeHtml(formatDate(date));
  const safeName = escapeHtml(recipient.label);
  return html(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pauta Oficial da Diretoria · Adapta</title>
<style>${baseStyles()}</style>
</head>
<body><main>
  <p class="eyebrow">Adapta · Diretoria</p>
  <h1>Pauta Oficial da Diretoria</h1>
  <p class="date">${safeName} · Reunião de ${safeDate}</p>
  <p class="statement">Confirmo que estou ciente dos direcionamentos gerais definidos na reunião de Diretoria da Adapta realizada nesta data.</p>
  <button id="ack" type="button">OK, CIENTE</button>
  <p class="fine">Este link é individual. A confirmação será registrada uma única vez.</p>
  <div id="msg" role="status"></div>
</main>
<script>
const button=document.getElementById('ack');
const msg=document.getElementById('msg');
button.addEventListener('click',async()=>{
  button.disabled=true; msg.textContent='';
  try{
    const response=await fetch(location.pathname,{method:'POST',headers:{'content-type':'application/json'}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||'Não foi possível registrar.');
    location.reload();
  }catch(error){msg.textContent='Não foi possível registrar agora. Tente novamente.';button.disabled=false;}
});
</script></body></html>`);
}

function consumedPage(date, recipient, acknowledgedAt) {
  const safeDate = escapeHtml(formatDate(date));
  const safeName = escapeHtml(recipient.label);
  let time = "";
  if (acknowledgedAt) {
    try {
      time = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Fortaleza",
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(acknowledgedAt));
    } catch {}
  }
  return html(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ciência registrada · Adapta</title><style>${baseStyles()}</style></head>
<body><main>
  <div class="ok">✓</div>
  <p class="eyebrow">Adapta · Diretoria</p>
  <h1>Ciência registrada.</h1>
  <p class="date">${safeName} · Pauta Oficial da Diretoria · ${safeDate}</p>
  <p class="done">Este link já cumpriu sua finalidade${time ? ` em ${escapeHtml(time)}` : ""} e não permite uma nova confirmação.</p>
</main></body></html>`);
}

function invalidPage() {
  return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Link indisponível · Adapta</title><style>${baseStyles()}</style></head><body><main><p class="eyebrow">Adapta · Diretoria</p><h1>Link indisponível.</h1><p class="done">Este endereço não corresponde a uma confirmação válida de pauta.</p></main></body></html>`, 404);
}

export async function handleBoardAcknowledgement(request, env) {
  const url = new URL(request.url);
  const route = parseRoute(url.pathname);
  if (!route) return null;

  const recipient = resolveRecipient(route.date, route.recipientSlug);
  if (!recipient) return invalidPage();

  const record = await getRecord(env, route.date, recipient);
  if (!record) return invalidPage();

  if (request.method === "GET" || request.method === "HEAD") {
    if (record.acknowledged_at) return consumedPage(route.date, recipient, record.acknowledged_at);
    return activePage(route.date, recipient);
  }

  if (request.method === "POST") {
    if (record.acknowledged_at) {
      return json({ ok: true, alreadyAcknowledged: true, acknowledgedAt: record.acknowledged_at });
    }
    const now = new Date().toISOString();
    const result = await env.DB.prepare(
      `UPDATE board_acknowledgements
          SET acknowledged_at = ?
        WHERE meeting_date = ? AND recipient_id = ? AND acknowledged_at IS NULL`
    ).bind(now, route.date, recipient.id).run();

    if (!result.meta?.changes) {
      const latest = await getRecord(env, route.date, recipient);
      return json({ ok: true, alreadyAcknowledged: true, acknowledgedAt: latest?.acknowledged_at || null });
    }
    return json({ ok: true, acknowledgedAt: now });
  }

  return json({ error: "method_not_allowed" }, 405);
}
