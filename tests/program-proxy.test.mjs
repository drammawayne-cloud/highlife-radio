import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../_worker.js';

test('program proxy preserves the public HLS cookie-check redirect without forwarding browser cookies',async t=>{
 let seen;
 t.mock.method(globalThis,'fetch',async(url,options)=>{seen={url:new URL(url),options};return new Response(null,{status:302,headers:{Location:'/highlife-program/index.m3u8?cookieCheck=1'}});});
 const response=await worker.fetch(new Request('https://nychighliferadio.com/radio-program/index.m3u8?cookieCheck=1&url=https://private.invalid',{headers:{Cookie:'private=do-not-forward'}}),{});
 assert.equal(response.status,302);assert.equal(response.headers.get('Location'),'/radio-program/index.m3u8?cookieCheck=1');
 assert.equal(seen.url.origin,'https://richrow-radio.129-213-164-255.sslip.io');assert.equal(seen.url.search,'?cookieCheck=1');assert.equal(seen.options.headers.Cookie,undefined);
});
test('program proxy rejects writes and paths outside the published program',async()=>{
 assert.equal((await worker.fetch(new Request('https://nychighliferadio.com/radio-program/index.m3u8',{method:'POST'}),{})).status,405);
 assert.equal((await worker.fetch(new Request('https://nychighliferadio.com/radio-program/private/config.json'),{})).status,404);
});
test('program proxy rejects a redirect to another server',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:302,headers:{Location:'https://private.invalid/secret'}}));
 assert.equal((await worker.fetch(new Request('https://nychighliferadio.com/radio-program/index.m3u8'),{})).status,502);
});
