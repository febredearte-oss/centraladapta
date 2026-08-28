import baseWorker from "./worker-auto-seed.js";

const PATH = "/__diag-hist-7f3b9c2a";
const TERMS = ["holiday","feriad","expediente","feed_editorial","equipe_interna","recesso","ponto facultativo"];

function parseState(text){ try { return JSON.parse(text); } catch { return null; } }
function hasTerm(s){ const x=String(s||"").toLowerCase(); return TERMS.some(t=>x.includes(t)); }
function collectMatches(value, path="", out=[], depth=0){
  if (depth>8 || out.length>=120) return out;
  if (Array.isArray(value)) {
    value.forEach((v,i)=>collectMatches(v, `${path}[${i}]`, out, depth+1));
    return out;
  }
  if (value && typeof value === "object") {
    for (const [k,v] of Object.entries(value)) {
      const p=path?`${path}.${k}`:k;
      if (hasTerm(k) || (typeof v === "string" && hasTerm(v))) {
        let preview=v;
        if (typeof v === "object") preview=JSON.stringify(v);
        out.push({path:p, value:String(preview).slice(0,500)});
        if (out.length>=120) break;
      }
      collectMatches(v,p,out,depth+1);
      if (out.length>=120) break;
    }
  }
  return out;
}
function diffTop(a,b){
  const keys=new Set([...Object.keys(a||{}),...Object.keys(b||{})]);
  const changed=[];
  for(const k of keys){ if(JSON.stringify(a?.[k])!==JSON.stringify(b?.[k])) changed.push(k); }
  return changed;
}

export default {
  async fetch(request, env, ctx){
    const url=new URL(request.url);
    if(url.pathname!==PATH) return baseWorker.fetch(request,env,ctx);

    const current=await env.DB.prepare("SELECT revision,state_json,updated_at,updated_by FROM app_state WHERE id=1").first();
    const hist=await env.DB.prepare("SELECT id,revision,state_json,changed_at,changed_by FROM state_history ORDER BY id DESC LIMIT 50").all();
    const rows=[
      {kind:"current", id:null, revision:current?.revision, at:current?.updated_at, by:current?.updated_by, state:parseState(current?.state_json)},
      ...(hist.results||[]).map(r=>({kind:"history",id:r.id,revision:r.revision,at:r.changed_at,by:r.changed_by,state:parseState(r.state_json)}))
    ];
    const summary=[];
    for(let i=0;i<rows.length;i++){
      const r=rows[i]; const next=rows[i+1];
      const activity=Array.isArray(r.state?.activity)?r.state.activity:[];
      const activityMatches=activity.filter(x=>hasTerm(JSON.stringify(x))).slice(-20);
      summary.push({
        kind:r.kind,id:r.id,revision:r.revision,at:r.at,by:r.by,
        topLevelChangedVsPrevious: next?.state?diffTop(r.state,next.state):[],
        holidayLike:collectMatches(r.state).slice(0,80),
        activityMatches
      });
    }
    return new Response(JSON.stringify({count:rows.length,summary}),{headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
  }
};
