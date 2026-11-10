const ORIGINS = new Set(['https://mobile-app.highlife-radio.pages.dev','https://nychighliferadio.com']);
const json = (data,status=200,origin='') => Response.json(data,{status,headers:{'Access-Control-Allow-Origin':ORIGINS.has(origin)?origin:'https://mobile-app.highlife-radio.pages.dev','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store'}});
const hash = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
export function liveKey(value) { return value?.live?.is_live === true ? String(value.live.streamer_name || 'Live studio').slice(0,100) : ''; }
async function configured(env) { return !!(env.APNS_KEY && env.APNS_KEY_ID && env.APNS_TEAM_ID); }
function b64(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }
let jwtCache;
async function jwt(env) {
 if(jwtCache?.keyId===env.APNS_KEY_ID && jwtCache.until>Date.now())return jwtCache.value;
 const enc = value=>b64(new TextEncoder().encode(JSON.stringify(value)));
 const unsigned=enc({alg:'ES256',kid:env.APNS_KEY_ID})+'.'+enc({iss:env.APNS_TEAM_ID,iat:Math.floor(Date.now()/1000)});
 const der=Uint8Array.from(atob(env.APNS_KEY.replace(/-----[^-]+-----/g,'').replace(/\s/g,'')),c=>c.charCodeAt(0));
 const key=await crypto.subtle.importKey('pkcs8',der,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(unsigned));
 const value=unsigned+'.'+b64(new Uint8Array(sig));
 jwtCache={keyId:env.APNS_KEY_ID,until:Date.now()+45*60*1000,value};
 return value;
}
export default {
 async fetch(request,env) {
  const origin=request.headers.get('origin')||'';
  const path=new URL(request.url).pathname;
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':ORIGINS.has(origin)?origin:'https://mobile-app.highlife-radio.pages.dev','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
  if(path==='/status')return json({available:await configured(env)},200,origin);
  if(path!=='/subscription'||!['POST','DELETE'].includes(request.method))return json({error:'Not found'},404,origin);
  if(origin&&!ORIGINS.has(origin))return json({error:'Origin not allowed'},403,origin);
  if(!await configured(env))return json({error:'Live alerts are not available yet.'},503,origin);
  if(Number(request.headers.get('content-length')||0)>2048)return json({error:'Too large'},413,origin);
  let body;try {const raw=await request.text();if(raw.length>2048)throw Error();body=JSON.parse(raw);} catch{return json({error:'Invalid request'},400,origin);}
  if(!body||typeof body!=='object'||!/^[a-f0-9]{64}$/i.test(body.token)||!/^[a-zA-Z0-9-]{30,100}$/.test(body.secret))return json({error:'Invalid subscription'},400,origin);
  const secretHash=await hash(body.secret);
  const existing=await env.DB.prepare('SELECT secret_hash FROM highlife_alert_subscribers WHERE token=?').bind(body.token).first();
  if(existing&&existing.secret_hash!==secretHash)return json({error:'Subscription belongs to a different installation'},403,origin);
  if(request.method==='DELETE')await env.DB.prepare('DELETE FROM highlife_alert_subscribers WHERE token=? AND secret_hash=?').bind(body.token,secretHash).run();
  else await env.DB.prepare('INSERT OR IGNORE INTO highlife_alert_subscribers(token,secret_hash,created_at) VALUES(?,?,?)').bind(body.token,secretHash,Date.now()).run();
  return json({subscribed:request.method==='POST'},200,origin);
 },
 async scheduled(event,env) {
  if(!await configured(env))return;
  const res=await fetch('https://richrow-radio.129-213-164-255.sslip.io/api/nowplaying/rich_row_radio',{signal:AbortSignal.timeout(10000)});
  if(!res.ok)throw Error('Station status unavailable');
  const now=Date.now(), key=liveKey(await res.json());
  const previous=await env.DB.prepare('SELECT * FROM highlife_alert_state WHERE id=1').first();
  if(!previous){await env.DB.prepare('INSERT OR IGNORE INTO highlife_alert_state VALUES(1,?,?)').bind(key,now).run();return;}
  if(previous.live_key!==key){
   const changed=await env.DB.prepare('UPDATE highlife_alert_state SET live_key=?,updated_at=? WHERE id=1 AND updated_at=?').bind(key,now,previous.updated_at).run();
   if(key&&changed.meta.changes)await env.DB.prepare("INSERT OR IGNORE INTO highlife_alert_deliveries(event_id,token,created_at) SELECT ?,token,? FROM highlife_alert_subscribers").bind(String(now),now).run();
  }
  // Never send a stale alert after a show has ended, or to someone who opted out.
  if(!key){await env.DB.prepare("DELETE FROM highlife_alert_deliveries WHERE status='pending'").run();return;}
  const pending=await env.DB.prepare("SELECT d.* FROM highlife_alert_deliveries d JOIN highlife_alert_subscribers s ON s.token=d.token WHERE d.status='pending' AND d.created_at>? ORDER BY d.created_at LIMIT 40").bind(now-600000).all();
  if(!pending.results.length)return;
  const auth=await jwt(env);
  for(const item of pending.results){
   const response=await fetch('https://api.push.apple.com/3/device/'+item.token,{method:'POST',headers:{authorization:'bearer '+auth,'apns-topic':'com.nychighlife.highliferadio','apns-push-type':'alert','apns-priority':'10','apns-expiration':String(Math.floor((item.created_at+600000)/1000)),'apns-collapse-id':'highlife-live-'+item.event_id},body:JSON.stringify({aps:{alert:{title:'NYC High Life Radio is live',body:key+' is on air. Tap to open the radio.'},sound:'default'},url:'highliferadio:///'})});
   if(response.ok)await env.DB.prepare("UPDATE highlife_alert_deliveries SET status='sent' WHERE event_id=? AND token=?").bind(item.event_id,item.token).run();
   else if(response.status===410)await env.DB.prepare('DELETE FROM highlife_alert_subscribers WHERE token=?').bind(item.token).run();
  }
  await env.DB.prepare('DELETE FROM highlife_alert_deliveries WHERE created_at<?').bind(now-86400000).run();
 }
};
