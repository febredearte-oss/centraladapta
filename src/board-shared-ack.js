import { handleBoardAcknowledgement } from "./board-ack.js";

const ROUTE_PREFIX = "/pautaoficialdiretoria+";
const KNOWN_DATES = new Set(["27-08-2026", "04-09-2026"]);
const RECIPIENTS = {
  tonio: "Tonio",
  oton: "Oton",
  isabela: "Isabela Luiza",
  gabriela: "Gabriela Dias",
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

function parseSharedRoute(pathname) {
  if (!pathname.startsWith(ROUTE_PREFIX)) return null;
  const value = pathname.slice(ROUTE_PREFIX.length);
  const match = value.match(/^(\d{2}-\d{2}-\d{4})$/);
  if (!match || !KNOWN_DATES.has(match[1])) return null;
  return { date: match[1] };
}

async function ensureCredentialSchema(env) {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS director_credentials (
      recipient_id TEXT PRIMARY KEY,
      recipient_label TEXT NOT NULL,
      salt TEXT NOT NULL,
      secret_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS board_acknowledgements (
      meeting_date TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      recipient_label TEXT NOT NULL,
      acknowledged_at TEXT,
      protocol TEXT,
      PRIMARY KEY (meeting_date, recipient_id)
    )`),
  ]);
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function deriveSecret(secret, saltHex) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: hexToBytes(saltHex),
      iterations: 120000,
    },
    material,
    256
  );
  return bytesToHex(bits);
}

function newSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function protocolFor(date, recipientId) {
  const compact = date.replaceAll("-", "");
  const random = new Uint8Array(4);
  crypto.getRandomValues(random);
  return `ADP-DIR-${compact}-${recipientId.toUpperCase()}-${bytesToHex(random).toUpperCase()}`;
}

async function credentialFor(env, recipientId) {
  await ensureCredentialSchema(env);
  return env.DB.prepare(`SELECT recipient_id, recipient_label, salt, secret_hash, created_at FROM director_credentials WHERE recipient_id = ?`)
    .bind(recipientId).first();
}

async function acknowledgementRows(env, date) {
  await ensureCredentialSchema(env);
  const rows = await env.DB.prepare(`SELECT recipient_id, recipient_label, acknowledged_at, protocol FROM board_acknowledgements WHERE meeting_date = ? ORDER BY recipient_label COLLATE NOCASE`)
    .bind(date).all();
  const byId = new Map((rows.results || []).map(r => [r.recipient_id, r]));
  return Object.entries(RECIPIENTS).map(([id, label]) => byId.get(id) || { recipient_id: id, recipient_label: label, acknowledged_at: null, protocol: null });
}

async function statusHtml(env, date, lang) {
  const rows = await acknowledgementRows(env, date);
  return rows.map(r => {
    const signed = Boolean(r.acknowledged_at);
    let when = "";
    if (signed) {
      try {
        when = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "pt-BR", {
          timeZone: "America/Fortaleza",
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(r.acknowledged_at));
      } catch {}
    }
    return `<div class="signature"><div><strong>${escapeHtml(r.recipient_label)}</strong><div class="protocol">${signed ? `${escapeHtml(r.protocol || "")}${when ? ` · ${escapeHtml(when)}` : ""}` : (lang === "en" ? "Awaiting acknowledgement" : "Aguardando visto")}</div></div><span class="seal ${signed ? "" : "pending"}">${signed ? (lang === "en" ? "Electronic acknowledgement" : "Visto eletrônico") : (lang === "en" ? "Pending" : "Pendente")}</span></div>`;
  }).join("");
}

async function baseDocumentHtml(request, env, date, lang) {
  const url = new URL(request.url);
  url.pathname = `${ROUTE_PREFIX}${date}+gabriela`;
  url.searchParams.set("lang", lang);
  const fake = new Request(url.toString(), { method: "GET", headers: request.headers });
  const response = await handleBoardAcknowledgement(fake, env);
  if (!response || !response.ok) return null;
  const text = await response.text();
  const cut = text.indexOf("<h2>");
  if (cut === -1) return null;
  const bodyEnd = text.indexOf("</main>", cut);
  if (bodyEnd === -1) return null;
  return { beforeActions: text.slice(0, cut), afterMain: text.slice(bodyEnd + 7) };
}

async function sharedPage(request, env, date, lang) {
  const base = await baseDocumentHtml(request, env, date, lang);
  if (!base) return null;
  const rows = await acknowledgementRows(env, date);
  const complete = rows.every(r => Boolean(r.acknowledged_at));
  const statuses = await statusHtml(env, date, lang);
  const options = Object.entries(RECIPIENTS).map(([id, label]) => `<option value="${id}">${escapeHtml(label)}</option>`).join("");
  const action = complete ? `
    <section class="shared-ack"><h2>${lang === "en" ? "Record finalized" : "Registro finalizado"}</h2><p>${lang === "en" ? "All board acknowledgements have been recorded. This page remains available for consultation." : "Todos os vistos da Diretoria foram registrados. Esta página permanece disponível para consulta."}</p></section>` : `
    <section class="shared-ack">
      <h2>${lang === "en" ? "Add my acknowledgement" : "Adicionar meu visto"}</h2>
      <p>${lang === "en" ? "Select your name. On first use, create a personal passphrase known only to you. On future records, use the same passphrase." : "Selecione seu nome. No primeiro uso, crie uma palavra-chave pessoal conhecida apenas por você. Nas próximas pautas, use a mesma palavra-chave."}</p>
      <form id="ack-form">
        <label>${lang === "en" ? "Board member" : "Diretor(a)"}<select id="recipient" required><option value="">${lang === "en" ? "Select" : "Selecione"}</option>${options}</select></label>
        <label>${lang === "en" ? "Personal passphrase" : "Palavra-chave pessoal"}<input id="secret" type="password" minlength="6" autocomplete="current-password" required placeholder="${lang === "en" ? "Minimum 6 characters" : "Mínimo de 6 caracteres"}"></label>
        <p class="credential-note">${lang === "en" ? "If this is your first use, the passphrase will be created now. It is not stored in readable form and is not shown to the Central administrator." : "Se este for seu primeiro uso, a palavra-chave será criada agora. Ela não é armazenada de forma legível nem exibida à administração do Central."}</p>
        <button type="submit">${lang === "en" ? "REGISTER ACKNOWLEDGEMENT" : "REGISTRAR MEU VISTO"}</button>
        <div id="shared-msg" role="status"></div>
      </form>
    </section>
    <script>
      const form=document.getElementById('ack-form'),msg=document.getElementById('shared-msg');
      form.addEventListener('submit',async(e)=>{e.preventDefault();const btn=form.querySelector('button');btn.disabled=true;msg.textContent='';try{const r=await fetch(location.pathname+location.search,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({recipientId:document.getElementById('recipient').value,secret:document.getElementById('secret').value})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'error');location.reload();}catch(err){const code=String(err.message||'');msg.textContent=code==='invalid_secret'?'${lang === "en" ? "Incorrect passphrase for this name." : "Palavra-chave incorreta para este nome."}':code==='already_claimed'?'${lang === "en" ? "This name already has a personal passphrase." : "Este nome já possui uma palavra-chave pessoal."}':'${lang === "en" ? "Unable to register now. Please check your data and try again." : "Não foi possível registrar. Confira os dados e tente novamente."}';btn.disabled=false;}});
    </script>`;
  const extra = `
    <style>
      .shared-ack{margin-top:36px;padding-top:26px;border-top:2px solid #222}.shared-ack h2{margin-top:0}.shared-ack form{display:grid;gap:18px;margin-top:22px}.shared-ack label{display:grid;gap:7px;font:700 12px/1.4 Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase}.shared-ack select,.shared-ack input{width:100%;border:1px solid #777;border-radius:0;background:#fff;padding:13px 12px;font:400 15px/1.4 Georgia,serif;color:#111}.shared-ack button{border-radius:0;background:#111;color:#fff;border:1px solid #111}.credential-note{font-size:12px;line-height:1.55;color:#555;margin:0}.shared-ack #shared-msg{min-height:18px;margin-top:4px;font-size:12px;color:#7a1e1e}.shared-status-title{margin-top:34px}
    </style>
    <h2 class="shared-status-title">${lang === "en" ? "Board acknowledgements" : "Vistos da Diretoria"}</h2><div class="signatures">${statuses}</div>${action}</main>${base.afterMain}`;
  return html(base.beforeActions + extra);
}

async function registerSharedAck(request, env, date) {
  await ensureCredentialSchema(env);
  let payload;
  try { payload = await request.json(); } catch { return json({ error: "invalid_payload" }, 400); }
  const recipientId = String(payload?.recipientId || "").toLowerCase();
  const secret = String(payload?.secret || "");
  const label = RECIPIENTS[recipientId];
  if (!label || secret.length < 6 || secret.length > 128) return json({ error: "invalid_payload" }, 400);

  let credential = await credentialFor(env, recipientId);
  if (!credential) {
    const salt = newSalt();
    const secretHash = await deriveSecret(secret, salt);
    const createdAt = new Date().toISOString();
    try {
      await env.DB.prepare(`INSERT INTO director_credentials (recipient_id, recipient_label, salt, secret_hash, created_at) VALUES (?, ?, ?, ?, ?)`)
        .bind(recipientId, label, salt, secretHash, createdAt).run();
    } catch {
      credential = await credentialFor(env, recipientId);
    }
    if (!credential) credential = { recipient_id: recipientId, recipient_label: label, salt, secret_hash: secretHash, created_at: createdAt };
  }

  const computed = await deriveSecret(secret, credential.salt);
  if (computed !== credential.secret_hash) return json({ error: "invalid_secret" }, 403);

  const existing = await env.DB.prepare(`SELECT acknowledged_at, protocol FROM board_acknowledgements WHERE meeting_date = ? AND recipient_id = ?`)
    .bind(date, recipientId).first();
  if (existing?.acknowledged_at) return json({ ok: true, alreadyAcknowledged: true, protocol: existing.protocol, acknowledgedAt: existing.acknowledged_at });

  const now = new Date().toISOString();
  const protocol = protocolFor(date, recipientId);
  await env.DB.prepare(`INSERT INTO board_acknowledgements (meeting_date, recipient_id, recipient_label, acknowledged_at, protocol) VALUES (?, ?, ?, ?, ?) ON CONFLICT(meeting_date,recipient_id) DO UPDATE SET recipient_label=excluded.recipient_label, acknowledged_at=COALESCE(board_acknowledgements.acknowledged_at, excluded.acknowledged_at), protocol=COALESCE(board_acknowledgements.protocol, excluded.protocol)`)
    .bind(date, recipientId, label, now, protocol).run();
  return json({ ok: true, protocol, acknowledgedAt: now });
}

export async function handleSharedBoardAcknowledgement(request, env) {
  const url = new URL(request.url);
  const route = parseSharedRoute(url.pathname);
  if (!route) return null;
  const lang = url.searchParams.get("lang") === "en" ? "en" : "pt";
  if (request.method === "GET" || request.method === "HEAD") return sharedPage(request, env, route.date, lang);
  if (request.method === "POST") return registerSharedAck(request, env, route.date);
  return json({ error: "method_not_allowed" }, 405);
}
