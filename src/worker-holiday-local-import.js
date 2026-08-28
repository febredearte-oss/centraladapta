import baseWorker from "./worker-auto-seed.js";

const IMPORT_PATH = "/api/recover-holiday-local";
const STATUS_PATH = "/__holiday-record-map-3ac91e";

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
async function requireCentralAuth(request, env, ctx){
  const probeUrl = new URL("/api/session", request.url);
  const probe = new Request(probeUrl.toString(), {method:"GET", headers:request.headers});
  const response = await baseWorker.fetch(probe,env,ctx);
  if(!response.ok) return {ok:false,response};
  let session=null;
  try { session=await response.clone().json(); } catch {}
  return {ok:true,email:session?.email || "authenticated"};
}

async function importLocalHolidayState(request, env, actor){
  let body;
  try { body = await request.json(); } catch { return json({error:"invalid_json"},400); }
  const local = body?.state;
  if(!local || typeof local !== "object") return json({error:"invalid_state"},400);

  const localRecords = asArray(local.holidayRecords).filter(validRecord);
  if(!localRecords.length) return json({error:"no_local_holiday_records"},400);

  const currentRow = await env.DB.prepare(
    "SELECT revision,state_json,updated_at,updated_by FROM app_state WHERE id=1"
  ).first();
  if(!currentRow?.state_json) return json({error:"no_current_state"},500);

  let current;
  try { current = JSON.parse(currentRow.state_json); } catch { return json({error:"invalid_current_state"},500); }

  const currentRecords = asArray(current.holidayRecords).filter(validRecord);
  if(currentRecords.length){
    return json({
      error:"central_already_has_holiday_records",
      currentRecords:currentRecords.length,
      revision:Number(currentRow.revision || 0)
    },409);
  }

  const recovered = clone(current);
  recovered.holidayRecords = localRecords;
  recovered.holidayCommunicationTasks = asArray(local.holidayCommunicationTasks);
  recovered.holidayContents = asArray(local.holidayContents);
  recovered.items = mergeHolidayItems(current.items, local.items);
  recovered.calendarEntries = mergeHolidayCalendarEntries(current.calendarEntries, local.calendarEntries);

  const currentRevision = Number(currentRow.revision || 0);
  const nextRevision = currentRevision + 1;
  const now = new Date().toISOString();
  const serialized = JSON.stringify(recovered);
  if(serialized.length > 1_500_000) return json({error:"state_too_large"},413);

  const update = await env.DB.prepare(
    "UPDATE app_state SET revision=?,state_json=?,updated_at=?,updated_by=? WHERE id=1 AND revision=?"
  ).bind(nextRevision,serialized,now,`holiday-local-recovery:${actor}`,currentRevision).run();
  if(!update.meta?.changes) return json({error:"revision_conflict"},409);

  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO state_history (revision,state_json,changed_at,changed_by) VALUES (?,?,?,?)"
    ).bind(currentRevision,currentRow.state_json,currentRow.updated_at || now,currentRow.updated_by || actor),
    env.DB.prepare(
      "DELETE FROM state_history WHERE id NOT IN (SELECT id FROM state_history ORDER BY id DESC LIMIT 50)"
    )
  ]);

  return json({
    ok:true,
    recoveredRecords:localRecords.length,
    previousRevision:currentRevision,
    revision:nextRevision,
    updatedAt:now
  });
}

async function holidayRecordMap(env){
  const row=await env.DB.prepare("SELECT revision,state_json,updated_at,updated_by FROM app_state WHERE id=1").first();
  if(!row?.state_json) return json({error:"no_state"},500);
  let state; try{state=JSON.parse(row.state_json)}catch{return json({error:"invalid_state"},500)}
  const records=asArray(state.holidayRecords).map(r=>({
    feriado_id:r.feriado_id,
    expediente:r.expediente,
    equipe_interna:r.equipe_interna,
    email_associados:r.email_associados,
    feed_editorial:r.feed_editorial,
    instagram:r.instagram,
    updated_at:r.updated_at,
    log_signer:r.log_signer
  }));
  const holidays=asArray(state.holidays).map(h=>({id:h.id,date:h.date,name:h.name,type:h.type}));
  return json({revision:Number(row.revision||0),updatedAt:row.updated_at,updatedBy:row.updated_by,records,holidays});
}

export default {
  async fetch(request, env, ctx){
    const url = new URL(request.url);
    if(url.pathname === STATUS_PATH && request.method === "GET") return holidayRecordMap(env);
    if(url.pathname === IMPORT_PATH && request.method === "POST"){
      const auth = await requireCentralAuth(request,env,ctx);
      if(!auth.ok) return auth.response;
      return importLocalHolidayState(request,env,auth.email);
    }
    return baseWorker.fetch(request,env,ctx);
  }
};
