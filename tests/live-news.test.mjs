import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{SOURCES,parseFeed,refreshSource,payload,MAX_STORY_AGE_MS,REFRESH_MS} from '../_worker.js';
const now=Date.parse('2026-11-09T19:00:00Z'), source=SOURCES[0];
function entry(id='abcdefghijk',date='2026-11-09T18:00:00Z',title='A &amp; B',channel=source.channel){return `<entry><yt:videoId>${id}</yt:videoId><yt:channelId>${channel}</yt:channelId><title>${title}</title><published>${date}</published></entry>`;}
function feed(entries){return `<feed><author><uri>https://www.youtube.com/channel/${source.channel}</uri></author>${entries}</feed>`;}
test('orders unsorted publisher entries, decodes text and removes duplicate/invalid items',()=>{
 const stories=parseFeed(feed(entry()+entry('zyxwvutsrqp','2026-11-09T18:30:00Z')+entry()+entry('../../bad')+entry('fghijklmnop','invalid')+entry('ghijklmnopq','2026-11-10T18:00:00Z')+entry('hijklmnopqr','2026-10-01T18:00:00Z')+entry('ijklmnopqrs','2026-11-09T18:00:00Z','test','wrong')),source,now);
 assert.equal(stories.length,2);assert.equal(stories[0].videoId,'zyxwvutsrqp');assert.equal(stories[0].title,'A & B');assert.ok(stories[0].url.startsWith('https://www.youtube.com/watch?v='));
});
test('rejects wrong publisher, entity declarations and oversized feeds',()=>{
 assert.throws(()=>parseFeed(feed(entry()).replace(source.channel,'bad'),source,now));
 assert.throws(()=>parseFeed('<!DOCTYPE feed>'+feed(entry()),source,now));
 assert.throws(()=>parseFeed('x'.repeat(250001),source,now));
});
test('failed publisher retains dated reports without advancing last successful retrieval',async()=>{
 const previous={successAt:'2026-11-09T18:00:00Z',items:parseFeed(feed(entry()),source,now)};
 const state=await refreshSource(source,previous,async()=>{throw Error('offline');},now);
 assert.equal(state.status,'unavailable');assert.equal(state.successAt,previous.successAt);assert.equal(state.items.length,1);
 const data=payload([state],now);assert.equal(data.status,'unavailable');assert.equal(data.stories[0].sourceStale,true);
 assert.equal(payload([state],now+MAX_STORY_AGE_MS).stories.length,0);
});
test('oEmbed denial excludes video; an explicit embed is needed before publishing',async()=>{
 const fetcher=async url=>new Response(url.includes('/feeds/')?feed(entry()+entry('zyxwvutsrqp')):url.includes('abcdefghijk')?JSON.stringify({html:'<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>'}):'{}');
 const state=await refreshSource(source,null,fetcher,now);
 assert.equal(state.status,'ok');assert.equal(state.items.length,1);assert.equal(state.items[0].videoId,'abcdefghijk');
});
test('partial outage is visible rather than marked as a complete update',()=>{
 const a={id:'reuters',name:'Reuters',status:'ok',checkedAt:new Date(now).toISOString(),successAt:new Date(now).toISOString(),items:parseFeed(feed(entry()),source,now)};
 const b={id:'ap',name:'Associated Press',status:'unavailable',checkedAt:new Date(now).toISOString(),successAt:null,items:[]};
 assert.equal(payload([a,b],now).status,'partial');
});
test('endpoint caches briefly, fetches new reports after expiry and preserves static routing',async()=>{
 const actualFetch=globalThis.fetch, actualCaches=globalThis.caches, actualNow=Date.now;
 let clock=now,calls=0,video='abcdefghijk';const saved=new Map();
 Date.now=()=>clock;
 globalThis.caches={default:{match:async req=>saved.get(req.url)?.clone(),put:async(req,res)=>saved.set(req.url,res.clone())}};
 globalThis.fetch=async url=>{
  calls++;
  if(url.includes('/oembed'))return new Response(JSON.stringify({html:`<iframe src="https://www.youtube.com/embed/${video}"></iframe>`}));
  const selected=SOURCES.find(s=>url.includes(s.channel));
  return new Response(feed(entry(video,new Date(clock-60000).toISOString())).replaceAll(source.channel,selected.channel));
 };
 try{
  const request=new Request('https://example.test/api/world-news');
  const env={ASSETS:{fetch:async()=>new Response('existing radio page')}};
  const firstResponse=await worker.fetch(request,env);assert.equal(firstResponse.headers.get('Access-Control-Allow-Origin'),'*');let result=await firstResponse.json();assert.equal(result.status,'ok');assert.equal(result.stories.length,2);
  const initialCalls=calls;
  await worker.fetch(request,env);assert.equal(calls,initialCalls);
  clock+=REFRESH_MS+1;video='zyxwvutsrqp';
  result=await (await worker.fetch(request,env)).json();assert.ok(calls>initialCalls);assert.ok(result.stories.every(s=>s.videoId===video));assert.ok(result.sources.every(s=>s.checkedAt===new Date(clock).toISOString()));
  assert.equal(await (await worker.fetch(new Request('https://example.test/'),env)).text(),'existing radio page');
  assert.equal((await worker.fetch(new Request(request,{method:'POST'}),env)).status,405);
 }finally{globalThis.fetch=actualFetch;globalThis.caches=actualCaches;Date.now=actualNow;}
});
