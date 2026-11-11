import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {liveKey} from '../notifications/worker.mjs';
test('live alerts distinguish live DJs from AutoDJ and malformed station data',()=>{
 assert.equal(liveKey({live:{is_live:false,streamer_name:'Test'}}),'');
 assert.equal(liveKey({live:{is_live:true,streamer_name:'Drammawayne'}}),'Drammawayne');
 assert.equal(liveKey(null),'');
});
test('unconfigured live alerts do not accept subscriptions or claim availability',async()=>{
 const status=await worker.fetch(new Request('https://alerts/status'),{});
 assert.deepEqual(await status.json(),{available:false});
 const registration=await worker.fetch(new Request('https://alerts/subscription',{method:'POST',body:'{}'}),{});
 assert.equal(registration.status,503);
});
test('live alert registration rejects untrusted origins and malformed tokens',async()=>{
 const env={APNS_KEY:'key',APNS_KEY_ID:'id',APNS_TEAM_ID:'team'};
 const forbidden=await worker.fetch(new Request('https://alerts/subscription',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}),env);
 assert.equal(forbidden.status,403);
 const malformed=await worker.fetch(new Request('https://alerts/subscription',{method:'POST',body:JSON.stringify({token:'bad',secret:'bad'})}),env);
 assert.equal(malformed.status,400);
});
