// Only the fixed publisher feeds below are fetched. No caller-supplied URLs.
export const SOURCES = [
  { id: 'reuters', name: 'Reuters', channel: 'UChqUTb7kYRX8-EiaN3XFrSQ', url: 'https://www.youtube.com/@Reuters' },
  { id: 'ap', name: 'Associated Press', channel: 'UC52X5wxOL_s5yw0dQk7NtgA', url: 'https://www.youtube.com/@AssociatedPress' }
];
export const REFRESH_MS = 5 * 60 * 1000;
export const MAX_STORY_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_VERSION = 'v2';
const inFlight = new Map();

function decode(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&#(x[\da-f]+|\d+);/gi, (_, code) => {
    const n = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
  }).replace(/&(amp|lt|gt|quot|apos);/g, (_, key) => ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[key])).trim();
}
const tag = (xml, name) => decode(xml.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>'))?.[1] || '');

export function parseFeed(xml, source, now = Date.now()) {
  if (xml.length > 250000 || /<!DOCTYPE|<!ENTITY/i.test(xml) || !xml.includes('<feed') || !xml.includes('</feed>')) throw Error('Invalid feed');
  const authorURI = tag(xml.split('<entry>')[0], 'uri');
  if (authorURI !== 'https://www.youtube.com/channel/' + source.channel) throw Error('Unexpected publisher');
  const seen = new Set();
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, entry]) => {
    const videoId = tag(entry, 'yt:videoId'), title = tag(entry, 'title'), publishedAt = tag(entry, 'published');
    const channel = tag(entry, 'yt:channelId');
    const age = now - Date.parse(publishedAt);
    if (!/^[\w-]{11}$/.test(videoId) || !title || title.length > 400 || !Number.isFinite(age) || age < -300000 || age > MAX_STORY_AGE_MS || seen.has(videoId) || ![source.channel,source.channel.slice(2)].includes(channel)) return null;
    seen.add(videoId);
    return { id: source.id+'-'+videoId, videoId, title, publishedAt: new Date(publishedAt).toISOString(), sourceId: source.id, sourcePublisher: source.name, sourceUrl: source.url, url: 'https://www.youtube.com/watch?v='+videoId, kind: 'video', region: 'world', category: 'news' };
  }).filter(Boolean).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}

async function remote(url, accept, fetcher) {
  const controller = new AbortController(), timer = setTimeout(()=>controller.abort(), 6500);
  try {
    const response = await fetcher(url, {signal:controller.signal, redirect:'manual',headers:{Accept:accept}});
    if (!response.ok) throw Error('Publisher HTTP '+response.status);
    if (Number(response.headers.get('content-length')) > 250000) throw Error('Oversized response');
    const text = await response.text();
    if (text.length > 250000) throw Error('Oversized response');
    return text;
  } finally { clearTimeout(timer); }
}

export async function refreshSource(source, previous, fetcher = fetch, now = Date.now()) {
  const checkedAt = new Date(now).toISOString();
  try {
    const xml = await remote('https://www.youtube.com/feeds/videos.xml?channel_id='+source.channel, 'application/atom+xml', fetcher);
    const candidates = parseFeed(xml, source, now).slice(0, 6);
    const checked = await Promise.all(candidates.map(async story => {
      try {
        const embed = JSON.parse(await remote('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(story.url), 'application/json', fetcher));
        // An oEmbed denial excludes the item. The publisher can still withdraw it later.
        if (typeof embed.html !== 'string' || !embed.html.includes('/embed/'+story.videoId)) return null;
        return story;
      } catch { return null; }
    }));
    const items = checked.filter(Boolean).slice(0, 4);
    if (!items.length) throw Error('No currently embeddable reports');
    return { id:source.id, name:source.name, url:source.url, checkedAt, successAt:checkedAt, status:'ok', items };
  } catch (error) {
    console.warn('News source refresh failed:',source.id,error.name,error.message);
    return { id:source.id, name:source.name, url:source.url, checkedAt, successAt:previous?.successAt||null, status:'unavailable', items:(previous?.items||[]).filter(s=>now-Date.parse(s.publishedAt)<=MAX_STORY_AGE_MS) };
  }
}

async function sourceState(source, origin, cache, now) {
  const key = new Request(origin+'/__news-cache/'+CACHE_VERSION+'/'+source.id);
  let previous;
  try { previous = await (await cache.match(key))?.json(); } catch {}
  if (previous && now-Date.parse(previous.checkedAt) < REFRESH_MS) return previous;
  const lockKey=origin+source.id;
  if (!inFlight.has(lockKey)) inFlight.set(lockKey,(async()=>{
    const state = await refreshSource(source, previous, fetch, now);
    await cache.put(key,new Response(JSON.stringify(state),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=604800'}}));
    return state;
  })().finally(()=>inFlight.delete(lockKey)));
  return inFlight.get(lockKey);
}

export function payload(states, now = Date.now()) {
  const available = states.filter(s=>s.status==='ok');
  return {
    generatedAt:new Date(now).toISOString(), refreshSeconds:REFRESH_MS/1000,
    status:available.length===states.length?'ok':available.length?'partial':'unavailable',
    sources:states.map(({items,...metadata})=>metadata),
    stories:states.flatMap(s=>s.items.map(item=>({...item,sourceStale:s.status!=='ok',lastVerifiedAt:s.successAt}))).filter(s=>now-Date.parse(s.publishedAt)<=MAX_STORY_AGE_MS).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt))
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if(url.pathname==='/api/radio-waveform'){
      if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
      try{const response=await fetch('https://richrow-radio.129-213-164-255.sslip.io/highlife-waveform.json',{signal:AbortSignal.timeout(3500)});if(!response.ok)throw Error('Meter unavailable');return new Response(request.method==='HEAD'?null:response.body,{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=1','X-Content-Type-Options':'nosniff'}});}catch{return new Response('{}',{status:503,headers:{'Cache-Control':'no-store'}});}
    }
    if(url.pathname.startsWith('/radio-program/')){
      if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
      const file=url.pathname.slice('/radio-program/'.length);
      if(!/^[a-zA-Z0-9_.-]+\.(m3u8|mp4|m4s|ts)$/.test(file))return new Response('Not found',{status:404});
      const upstream=new URL('https://richrow-radio.129-213-164-255.sslip.io:8443/highlife-radio/'+file);
      for(const key of ['session','cookieCheck','_HLS_msn','_HLS_part','_HLS_skip']){const value=url.searchParams.get(key);if(value&&value.length<128)upstream.searchParams.set(key,value);}
      try{
        const response=await fetch(upstream,{method:request.method,redirect:'manual',headers:{Accept:'*/*'},signal:AbortSignal.timeout(15000)});
        const headers=new Headers();for(const key of ['content-type','content-length','content-range'])if(response.headers.has(key))headers.set(key,response.headers.get(key));
        headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');
        const location=response.headers.get('location');
        if(location){const next=new URL(location,upstream);if(next.origin!==upstream.origin||!next.pathname.startsWith('/highlife-radio/'))return new Response('Invalid upstream redirect',{status:502});headers.set('Location','/radio-program/'+next.pathname.split('/').pop()+next.search);}
        return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers});
      }catch{return new Response('Program temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
    }
    if (url.pathname !== '/api/world-news') return env.ASSETS.fetch(request);
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
    try {
      const states = await Promise.all(SOURCES.map(s=>sourceState(s,url.origin,caches.default,Date.now())));
      const data = payload(states);
      return new Response(request.method==='HEAD'?null:JSON.stringify(data),{headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    } catch {
      return new Response(JSON.stringify({status:'unavailable',stories:[],sources:[],refreshSeconds:300}),{status:503,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'}});
    }
  }
};
