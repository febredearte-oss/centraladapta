import baseWorker from "./worker-auto-seed.js";

const IMPORT_PATH = "/api/recover-holiday-local";
const RECORDS_PATH = "/api/holiday-records";
const RECORD_PATH = "/api/holiday-record";
const LOGS_PATH = "/api/holiday-logs";
const CLOCK_PATH = "/api/central-clock";
const SHARED_STATE_PATH = "/api/shared-state";
const ACTIVITY_LOGS_PATH = "/api/activity-logs";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json; charset=utf-8","cache-control":"no-store"}
  });
}

function clone(value){ return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value){ return Array.isArray(value) ? clone(value) : []; }
function validRecord(record){
  return record && typeof record === "object" && typeof record.feriado_id === "string" && record.feriado_id.trim();
}
function mergeHolidayItems(currentItems, incomingItems){
  const result = currentItems && typeof currentItems === "object" && !Array.isArray(currentItems) ? clone(currentItems) : {};
  const source = incomingItems && typeof incomingItems === "object" && !Array.isArray(incomingItems) ? incomingItems : {};
  for(const [id,item] of Object.entries(source)){
    if(item && typeof item === "object" && (item.source === "holiday" || id.startsWith("holiday-") || id.startsWith("holiday-content-") || id.startsWith("holiday-feed-"))){
      result[id] = clone(item);
    }
  }
  return result;
}
function mergeHolidayCalendarEntries(current, incoming){
  const base = asArray(current).filter(item => !(item && typeof item.id === "string" && item.id.startsWith("feriado-")));
  const local = asArray(incoming).filter(item => item && typeof item.id === "string" && item.id.startsWith("feriado-"));
  return base.concat(local);
}

async function ensureAuditSchema(env){
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS holiday_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      revision INTEGER NOT NULL,
      feriado_id TEXT NOT NULL,
      field_name TEXT NOT NULL,
      before_value TEXT,
      after_value TEXT,
      declared_by TEXT NOT NULL,
      changed_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS activity_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      revision INTEGER NOT NULL,
      area TEXT,
      field_path TEXT NOT NULL,
      before_value TEXT,
      after_value TEXT,
      declared_by TEXT NOT NULL,
      changed_at TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_activity_audit_revision ON activity_audit_log(revision DESC)`)
  ]);
}

async function readCurrentState(env){
  const row = await env.DB.prepare("SELECT revision,state_json,updated_at,updated_by FROM app_state WHERE id=1").first();
  if(!row?.state_json) return {error:json({error:"no_current_state"},500)};
  try {
    return {row,state:JSON.parse(row.state_json)};
  } catch {
    return {error:json({error:"invalid_current_state"},500)};
  }
}

function serverClock(){
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA",{
    timeZone:"America/Fortaleza",year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"
  }).formatToParts(now);
  const p = Object.fromEntries(parts.filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
  const date = `${p.year}-${p.month}-${p.day}`;
  const time = `${p.hour}:${p.minute}:${p.second}`;
  return json({timeZone:"America/Fortaleza",date,time,iso:now.toISOString(),source:"cloudflare-worker"});
}

function logValue(value){
  if(value === undefined) return null;
  if(value === null) return "null";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 2000 ? text.slice(0,1997)+"..." : text;
}

function applyPatch(target,path,value,remove){
  if(!Array.isArray(path) || !path.length) return;
  let cursor=target;
  for(let i=0;i<path.length-1;i++){
    const key=path[i];
    if(cursor[key] == null || typeof cursor[key] !== "object") cursor[key] = typeof path[i+1] === "number" ? [] : {};
    cursor=cursor[key];
  }
  const leaf=path[path.length-1];
  if(remove){
    if(Array.isArray(cursor) && typeof leaf === "number") cursor.splice(leaf,1);
    else delete cursor[leaf];
  }else cursor[leaf]=clone(value);
}
function readPath(target,path){
  let cursor=target;
  for(const key of path){ if(cursor==null) return undefined; cursor=cursor[key]; }
  return clone(cursor);
}

async function getSharedState(env){
  const current=await readCurrentState(env);
  if(current.error) return current.error;
  return json({state:current.state,revision:Number(current.row.revision||0),updatedAt:current.row.updated_at,updatedBy:current.row.updated_by});
}

async function patchSharedState(request,env){
  let body; try{body=await request.json()}catch{return json({error:"invalid_json"},400)}
  const declaredBy=String(body?.declaredBy||"").trim();
  const area=String(body?.area||"Central").trim().slice(0,120);
  const patches=Array.isArray(body?.patches)?body.patches:[];
  if(!declaredBy) return json({error:"declared_by_required"},400);
  if(!patches.length || patches.length>200) return json({error:"invalid_patches"},400);
  await ensureAuditSchema(env);

  for(let attempt=0;attempt<3;attempt++){
    const current=await readCurrentState(env); if(current.error)return current.error;
    const currentRevision=Number(current.row.revision||0);
    const next=clone(current.state);
    const changes=[];
    for(const patch of patches){
      if(!Array.isArray(patch?.path)||!patch.path.length||patch.path.length>8) continue;
      const path=patch.path.map(v=>typeof v==="number"?v:String(v));
      const before=readPath(next,path);
      applyPatch(next,path,patch.value,Boolean(patch.remove));
      const after=readPath(next,path);
      if(JSON.stringify(before)!==JSON.stringify(after)) changes.push({path,before,after});
    }
    if(!changes.length) return json({ok:true,revision:currentRevision,unchanged:true});
    const serialized=JSON.stringify(next);
    if(serialized.length>1_500_000) return json({error:"state_too_large"},413);
    const now=new Date().toISOString();
    const nextRevision=currentRevision+1;
    const update=await env.DB.prepare(
      "UPDATE app_state SET revision=?,state_json=?,updated_at=?,updated_by=? WHERE id=1 AND revision=?"
    ).bind(nextRevision,serialized,now,`declared:${declaredBy}`,currentRevision).run();
    if(!update.meta?.changes) continue;
    const statements=[
      env.DB.prepare("INSERT INTO state_history (revision,state_json,changed_at,changed_by) VALUES (?,?,?,?)")
        .bind(currentRevision,current.row.state_json,current.row.updated_at||now,current.row.updated_by||`declared:${declaredBy}`),
      env.DB.prepare("DELETE FROM state_history WHERE id NOT IN (SELECT id FROM state_history ORDER BY id DESC LIMIT 50)")
    ];
    for(const change of changes){
      statements.push(env.DB.prepare(
        "INSERT INTO activity_audit_log (revision,area,field_path,before_value,after_value,declared_by,changed_at) VALUES (?,?,?,?,?,?,?)"
      ).bind(nextRevision,area,change.path.join("."),logValue(change.before),logValue(change.after),declaredBy,now));
    }
    await env.DB.batch(statements);
    return json({ok:true,revision:nextRevision,updatedAt:now,updatedBy:`declared:${declaredBy}`,loggedChanges:changes.length});
  }
  return json({error:"revision_conflict"},409);
}

async function activityLogs(env){
  await ensureAuditSchema(env);
  const rows=await env.DB.prepare("SELECT id,revision,area,field_path,before_value,after_value,declared_by,changed_at FROM activity_audit_log ORDER BY id DESC LIMIT 500").all();
  return json({logs:rows.results||[]});
}

async function holidayRecords(env){
  const current = await readCurrentState(env);
  if(current.error) return current.error;
  return json({
    revision:Number(current.row.revision || 0),
    updatedAt:current.row.updated_at,
    updatedBy:current.row.updated_by,
    holidayRecords:asArray(current.state.holidayRecords),
    holidayCommunicationTasks:asArray(current.state.holidayCommunicationTasks),
    holidayContents:asArray(current.state.holidayContents)
  });
}

const AUDITED_FIELDS = [
  "expediente","horario_escala","equipe_interna","equipe_acolhimento","equipe_expedicao",
  "email_associados","feed_editorial","instagram","observacao"
];

async function saveHolidayRecord(request, env){
  let body;
  try { body = await request.json(); } catch { return json({error:"invalid_json"},400); }
  const incoming = body?.record;
  const declaredBy = String(body?.declaredBy || incoming?.log_signer || "").trim();
  if(!validRecord(incoming)) return json({error:"invalid_record"},400);
  if(!declaredBy) return json({error:"declared_by_required"},400);

  await ensureAuditSchema(env);
  for(let attempt=0;attempt<3;attempt++){
    const current = await readCurrentState(env);
    if(current.error) return current.error;
    const currentRevision = Number(current.row.revision || 0);
    const records = asArray(current.state.holidayRecords);
    const index = records.findIndex(item => item?.feriado_id === incoming.feriado_id);
    const before = index >= 0 ? records[index] : {};
    const now = new Date().toISOString();
    const stored = {
      ...before,...clone(incoming),feriado_id:incoming.feriado_id,log_signer:declaredBy,updated_at:now,
      __backendId:incoming.__backendId || before.__backendId || incoming.feriado_id
    };
    const changes = AUDITED_FIELDS
      .filter(field => JSON.stringify(before?.[field]) !== JSON.stringify(stored?.[field]))
      .map(field => ({field,before:logValue(before?.[field]),after:logValue(stored?.[field])}));
    if(index >= 0) records[index] = stored; else records.push(stored);
    const nextState = clone(current.state); nextState.holidayRecords = records;
    const nextRevision = currentRevision + 1;
    const serialized = JSON.stringify(nextState);
    if(serialized.length > 1_500_000) return json({error:"state_too_large"},413);
    const update = await env.DB.prepare(
      "UPDATE app_state SET revision=?,state_json=?,updated_at=?,updated_by=? WHERE id=1 AND revision=?"
    ).bind(nextRevision,serialized,now,`declared:${declaredBy}`,currentRevision).run();
    if(!update.meta?.changes) continue;
    const statements = [
      env.DB.prepare("INSERT INTO state_history (revision,state_json,changed_at,changed_by) VALUES (?,?,?,?)")
        .bind(currentRevision,current.row.state_json,current.row.updated_at || now,current.row.updated_by || `declared:${declaredBy}`),
      env.DB.prepare("DELETE FROM state_history WHERE id NOT IN (SELECT id FROM state_history ORDER BY id DESC LIMIT 50)")
    ];
    for(const change of changes){
      statements.push(env.DB.prepare(
        "INSERT INTO holiday_audit_log (revision,feriado_id,field_name,before_value,after_value,declared_by,changed_at) VALUES (?,?,?,?,?,?,?)"
      ).bind(nextRevision,incoming.feriado_id,change.field,change.before,change.after,declaredBy,now));
    }
    await env.DB.batch(statements);
    return json({ok:true,revision:nextRevision,updatedAt:now,updatedBy:`declared:${declaredBy}`,record:stored,holidayRecords:records,loggedChanges:changes.length});
  }
  return json({error:"revision_conflict"},409);
}

async function holidayLogs(env){
  await ensureAuditSchema(env);
  const rows = await env.DB.prepare(
    "SELECT id,revision,feriado_id,field_name,before_value,after_value,declared_by,changed_at FROM holiday_audit_log ORDER BY id DESC LIMIT 200"
  ).all();
  return json({logs:rows.results || []});
}

async function importLocalHolidayState(request, env, actor){
  let body;
  try { body = await request.json(); } catch { return json({error:"invalid_json"},400); }
  const local = body?.state;
  if(!local || typeof local !== "object") return json({error:"invalid_state"},400);
  const localRecords = asArray(local.holidayRecords).filter(validRecord);
  if(!localRecords.length) return json({error:"no_local_holiday_records"},400);
  const current = await readCurrentState(env); if(current.error) return current.error;
  const currentRow=current.row, currentState=current.state;
  const currentRecords = asArray(currentState.holidayRecords).filter(validRecord);
  if(currentRecords.length) return json({error:"central_already_has_holiday_records",currentRecords:currentRecords.length,revision:Number(currentRow.revision || 0)},409);
  const recovered = clone(currentState);
  recovered.holidayRecords = localRecords;
  recovered.holidayCommunicationTasks = asArray(local.holidayCommunicationTasks);
  recovered.holidayContents = asArray(local.holidayContents);
  recovered.items = mergeHolidayItems(currentState.items, local.items);
  recovered.calendarEntries = mergeHolidayCalendarEntries(currentState.calendarEntries, local.calendarEntries);
  const currentRevision = Number(currentRow.revision || 0), nextRevision = currentRevision + 1, now = new Date().toISOString();
  const serialized = JSON.stringify(recovered);
  if(serialized.length > 1_500_000) return json({error:"state_too_large"},413);
  const update = await env.DB.prepare("UPDATE app_state SET revision=?,state_json=?,updated_at=?,updated_by=? WHERE id=1 AND revision=?")
    .bind(nextRevision,serialized,now,`holiday-local-recovery:${actor}`,currentRevision).run();
  if(!update.meta?.changes) return json({error:"revision_conflict"},409);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO state_history (revision,state_json,changed_at,changed_by) VALUES (?,?,?,?)")
      .bind(currentRevision,currentRow.state_json,currentRow.updated_at || now,currentRow.updated_by || actor),
    env.DB.prepare("DELETE FROM state_history WHERE id NOT IN (SELECT id FROM state_history ORDER BY id DESC LIMIT 50)")
  ]);
  return json({ok:true,recoveredRecords:localRecords.length,previousRevision:currentRevision,revision:nextRevision,updatedAt:now});
}

export default {
  async fetch(request, env, ctx){
    const url = new URL(request.url);
    if(url.pathname === CLOCK_PATH && request.method === "GET") return serverClock();
    if(url.pathname === SHARED_STATE_PATH && request.method === "GET") return getSharedState(env);
    if(url.pathname === SHARED_STATE_PATH && request.method === "PATCH") return patchSharedState(request,env);
    if(url.pathname === ACTIVITY_LOGS_PATH && request.method === "GET") return activityLogs(env);
    if(url.pathname === RECORDS_PATH && request.method === "GET") return holidayRecords(env);
    if(url.pathname === RECORD_PATH && request.method === "PUT") return saveHolidayRecord(request,env);
    if(url.pathname === LOGS_PATH && request.method === "GET") return holidayLogs(env);
    if(url.pathname === IMPORT_PATH && request.method === "POST") return importLocalHolidayState(request,env,"declared-recovery");
    return baseWorker.fetch(request,env,ctx);
  }
};
