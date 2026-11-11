const {test}=require('node:test');
const assert=require('node:assert/strict');
const {levelsAt}=require('../waveform-levels');
test('waveform follows measurements at the listener playback time',()=>{
 const frames=Array.from({length:100},(_,i)=>[1000+i*20,i]);
 assert.deepEqual(levelsAt(frames,2000,4),[44,46,48,50]);
 assert.deepEqual(levelsAt(frames,2400,4),[64,66,68,70]);
});
test('silence, missing measurements and stale measurements stay flat',()=>{
 assert.deepEqual(levelsAt([[1000,0],[1020,0]],1020,3),[0,0,0]);
 assert.deepEqual(levelsAt([],1000,3),[0,0,0]);
 assert.deepEqual(levelsAt([[1000,150]],3000,3),[0,0,0]);
 assert.deepEqual(levelsAt([[1000,150]],500,3),[0,0,0]);
});
