const ROUTE_PREFIX = "/pautaoficialdiretoria+";
const ARCHIVE_PATH = "/arquivopautasdiretoria";

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
  const individual = value.match(/^(\d{2}-\d{2}-\d{4})\+([a-z0-9-]+)$/i);
  if (individual) return { date: individual[1], recipientSlug: individual[2].toLowerCase(), mode: "individual" };
  const archive = value.match(/^(\d{2}-\d{2}-\d{4})$/);
  if (archive) return { date: archive[1], recipientSlug: null, mode: "archive" };
  return null;
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
      protocol TEXT,
      PRIMARY KEY (meeting_date, recipient_id)
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_board_ack_meeting
      ON board_acknowledgements(meeting_date, acknowledged_at)`),
  ]);
  try { await env.DB.prepare("ALTER TABLE board_acknowledgements ADD COLUMN protocol TEXT").run(); } catch {}
}

function resolveRecipient(date, recipientSlug) {
  const meeting = MEETINGS[date];
  if (!meeting || !recipientSlug) return null;
  return meeting.recipients[recipientSlug] || null;
}

function meetingRecipients(date) {
  const meeting = MEETINGS[date];
  return meeting ? Object.values(meeting.recipients) : [];
}

async function seedMeeting(env, date) {
  await ensureSchema(env);
  const recipients = meetingRecipients(date);
  for (const recipient of recipients) {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO board_acknowledgements
        (meeting_date, recipient_id, recipient_label, acknowledged_at, protocol)
        VALUES (?, ?, ?, NULL, NULL)`
    ).bind(date, recipient.id, recipient.label).run();
  }
}

async function getRecord(env, date, recipient) {
  await seedMeeting(env, date);
  return env.DB.prepare(
    `SELECT meeting_date, recipient_id, recipient_label, acknowledged_at, protocol
       FROM board_acknowledgements
      WHERE meeting_date = ? AND recipient_id = ?`
  ).bind(date, recipient.id).first();
}

async function meetingStatus(env, date) {
  await seedMeeting(env, date);
  const recipients = meetingRecipients(date);
  const rows = await env.DB.prepare(
    `SELECT meeting_date, recipient_id, recipient_label, acknowledged_at, protocol
       FROM board_acknowledgements
      WHERE meeting_date = ?
      ORDER BY recipient_label COLLATE NOCASE`
  ).bind(date).all();
  const records = rows.results || [];
  const complete = recipients.length > 0 && records.length >= recipients.length && records.every(r => Boolean(r.acknowledged_at));
  return { complete, records };
}

function protocolFor(date, recipientId) {
  const compact = date.split("-").join("");
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  return `ADP-DIR-${compact}-${recipientId.toUpperCase()}-${stamp}`;
}

function baseStyles() {
  return `
    :root{color-scheme:light;--ink:#17231d;--muted:#66736c;--line:#dce3de;--paper:#f5f7f5;--card:#fff;--green:#163d2a;--green2:#24583e;--soft:#edf3ef}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;background:var(--paper);color:var(--ink);font-family:Montserrat,Arial,sans-serif;padding:24px}
    main{width:min(820px,100%);margin:28px auto;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:clamp(26px,5vw,46px);box-shadow:0 14px 45px rgba(23,35,29,.07)}
    .eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--green2);margin:0 0 15px}
    h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(30px,6vw,44px);font-weight:400;line-height:1.05;margin:0 0 10px}
    h2{font-family:Georgia,'Times New Roman',serif;font-weight:400;margin:32px 0 14px}
    .date,.muted{font-size:15px;color:var(--muted)}
    .date{margin:0 0 32px}
    .statement{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:26px 0;margin:0 0 28px;font-size:18px;line-height:1.55}
    button,.button{display:block;width:100%;border:0;border-radius:14px;padding:18px 22px;font:700 15px Montserrat,Arial,sans-serif;letter-spacing:.025em;background:var(--green);color:white;cursor:pointer;text-decoration:none;text-align:center}
    button:hover,.button:hover{background:var(--green2)} button:disabled{opacity:.55;cursor:wait}
    .fine{font-size:12px;line-height:1.5;color:var(--muted);margin:14px 0 0;text-align:center}
    .ok{font-size:54px;line-height:1;margin-bottom:18px}.done{font-size:18px;line-height:1.55;margin:0;color:var(--muted)}
    #msg{min-height:20px;color:#8a2f2f;font-size:13px;text-align:center;margin-top:12px}
    .signatures{display:grid;gap:10px;margin:18px 0 30px}
    .signature{display:flex;justify-content:space-between;gap:18px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:14px 16px;background:#fff}
    .seal{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--green2);color:var(--green2);border-radius:999px;padding:7px 10px;white-space:nowrap}
    .pending{border-color:#b9c2bc;color:var(--muted)}
    .protocol{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--muted);margin-top:4px}
    .archive-list{display:grid;gap:12px;margin-top:24px}
    .archive-item{display:block;border:1px solid var(--line);border-radius:16px;padding:18px;text-decoration:none;color:inherit;background:#fff}
    .archive-item:hover{background:var(--soft)}
    .archive-meta{display:flex;justify-content:space-between;gap:14px;align-items:center}
  `;
}

function signatureRows(records) {
  return records.map(r => {
    const signed = Boolean(r.acknowledged_at);
    let when = "";
    if (signed) {
      try {
        when = new Intl.DateTimeFormat("pt-BR", { timeZone:"America/Fortaleza", dateStyle:"short", timeStyle:"short" }).format(new Date(r.acknowledged_at));
      } catch {}
    }
    return `<div class="signature"><div><strong>${escapeHtml(r.recipient_label)}</strong>${signed ? `<div class="protocol">${escapeHtml(r.protocol || "protocolo registrado")}${when ? ` · ${escapeHtml(when)}` : ""}</div>` : `<div class="protocol">Aguardando visto</div>`}</div><span class="seal ${signed ? "" : "pending"}">${signed ? "Visto eletrônico" : "Pendente"}</span></div>`;
  }).join("");
}

async function activePage(env, date, recipient) {
  const safeDate = escapeHtml(formatDate(date));
  const safeName = escapeHtml(recipient.label);
  const status = await meetingStatus(env, date);
  return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pauta Oficial da Diretoria · Adapta</title><style>${baseStyles()}</style></head><body><main>
  <p class="eyebrow">Adapta · Diretoria</p><h1>Pauta Oficial da Diretoria</h1><p class="date">${safeName} · Reunião de ${safeDate}</p>
  <p class="statement">Confirmo que estou ciente dos direcionamentos gerais definidos na reunião de Diretoria da Adapta realizada nesta data.</p>
  <h2>Vistos da Diretoria</h2><div class="signatures">${signatureRows(status.records)}</div>
  <button id="ack" type="button">ADICIONAR MEU VISTO</button><p class="fine">O visto registra ciência da pauta e gera protocolo individual.</p><div id="msg" role="status"></div>
</main><script>const button=document.getElementById('ack'),msg=document.getElementById('msg');button.addEventListener('click',async()=>{button.disabled=true;msg.textContent='';try{const response=await fetch(location.pathname,{method:'POST',headers:{'content-type':'application/json'}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Erro');location.reload();}catch(error){msg.textContent='Não foi possível registrar agora. Tente novamente.';button.disabled=false;}});</script></body></html>`);
}

async function consumedPage(env, date, recipient, acknowledgedAt) {
  const safeDate = escapeHtml(formatDate(date));
  const safeName = escapeHtml(recipient.label);
  const status = await meetingStatus(env, date);
  const own = status.records.find(r => r.recipient_id === recipient.id);
  return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visto registrado · Adapta</title><style>${baseStyles()}</style></head><body><main>
  <div class="ok">✓</div><p class="eyebrow">Adapta · Diretoria</p><h1>Visto registrado.</h1><p class="date">${safeName} · Pauta Oficial da Diretoria · ${safeDate}</p>
  <p class="done">Seu visto eletrônico já consta nesta pauta.</p>${own?.protocol ? `<p class="protocol" style="margin-top:12px">Protocolo: ${escapeHtml(own.protocol)}</p>` : ""}
  <h2>Vistos da Diretoria</h2><div class="signatures">${signatureRows(status.records)}</div>
  ${status.complete ? `<a class="button" href="${ROUTE_PREFIX}${escapeHtml(date)}">CONSULTAR PAUTA FINALIZADA</a>` : ""}
</main></body></html>`);
}

function invalidPage() {
  return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Link indisponível · Adapta</title><style>${baseStyles()}</style></head><body><main><p class="eyebrow">Adapta · Diretoria</p><h1>Link indisponível.</h1><p class="done">Este endereço não corresponde a uma confirmação válida de pauta.</p></main></body></html>`, 404);
}

async function archivedMeetingPage(env, date) {
  if (!MEETINGS[date]) return invalidPage();
  const status = await meetingStatus(env, date);
  if (!status.complete) return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pauta em andamento · Adapta</title><style>${baseStyles()}</style></head><body><main><p class="eyebrow">Adapta · Diretoria</p><h1>Pauta ainda em coleta de vistos.</h1><p class="done">A versão de arquivo ficará disponível quando todos os diretores tiverem registrado ciência.</p></main></body></html>`, 409);
  return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pauta finalizada · Adapta</title><style>${baseStyles()}</style></head><body><main>
  <p class="eyebrow">Adapta · Arquivo da Diretoria</p><h1>Pauta Oficial da Diretoria</h1><p class="date">Reunião de ${escapeHtml(formatDate(date))} · Finalizada</p>
  <p class="statement">Registro consolidado de ciência dos direcionamentos gerais definidos na reunião de Diretoria da Adapta.</p>
  <h2>Vistos eletrônicos</h2><div class="signatures">${signatureRows(status.records)}</div>
  <a class="button" href="${ARCHIVE_PATH}">VOLTAR AO ARQUIVO</a>
</main></body></html>`);
}

async function archivePage(env) {
  const completed = [];
  for (const date of Object.keys(MEETINGS).sort().reverse()) {
    const status = await meetingStatus(env, date);
    if (status.complete) completed.push({ date, count: status.records.length });
  }
  const items = completed.length ? completed.map(item => `<a class="archive-item" href="${ROUTE_PREFIX}${escapeHtml(item.date)}"><div class="archive-meta"><div><strong>Pauta Oficial da Diretoria</strong><div class="muted">Reunião de ${escapeHtml(formatDate(item.date))}</div></div><span class="seal">Finalizada · ${item.count} vistos</span></div></a>`).join("") : `<p class="done">Ainda não há pautas finalizadas para consulta.</p>`;
  return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Arquivo de Pautas · Adapta</title><style>${baseStyles()}</style></head><body><main><p class="eyebrow">Adapta · Diretoria</p><h1>Arquivo de Pautas</h1><p class="date">Consulta de pautas oficiais com coleta de vistos concluída.</p><div class="archive-list">${items}</div></main></body></html>`);
}

export async function handleBoardAcknowledgement(request, env) {
  const url = new URL(request.url);
  if (url.pathname === ARCHIVE_PATH && (request.method === "GET" || request.method === "HEAD")) return archivePage(env);

  const route = parseRoute(url.pathname);
  if (!route) return null;
  if (route.mode === "archive") return archivedMeetingPage(env, route.date);

  const recipient = resolveRecipient(route.date, route.recipientSlug);
  if (!recipient) return invalidPage();
  const record = await getRecord(env, route.date, recipient);
  if (!record) return invalidPage();

  if (request.method === "GET" || request.method === "HEAD") {
    if (record.acknowledged_at) return consumedPage(env, route.date, recipient, record.acknowledged_at);
    return activePage(env, route.date, recipient);
  }

  if (request.method === "POST") {
    if (record.acknowledged_at) return json({ ok: true, alreadyAcknowledged: true, acknowledgedAt: record.acknowledged_at, protocol: record.protocol });
    const now = new Date().toISOString();
    const protocol = protocolFor(route.date, recipient.id);
    const result = await env.DB.prepare(`UPDATE board_acknowledgements SET acknowledged_at = ?, protocol = ? WHERE meeting_date = ? AND recipient_id = ? AND acknowledged_at IS NULL`).bind(now, protocol, route.date, recipient.id).run();
    if (!result.meta?.changes) {
      const latest = await getRecord(env, route.date, recipient);
      return json({ ok: true, alreadyAcknowledged: true, acknowledgedAt: latest?.acknowledged_at || null, protocol: latest?.protocol || null });
    }
    const status = await meetingStatus(env, route.date);
    return json({ ok: true, acknowledgedAt: now, protocol, meetingFinalized: status.complete });
  }

  return json({ error: "method_not_allowed" }, 405);
}
