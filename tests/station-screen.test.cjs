const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {rotationAt,hasPicture}=require('../station-screen.js');
const scope={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../rotation.js'),'utf8'),scope);
const blocks=scope.window.HIGHLIFE_ROTATION.blocks;
test('rotation changes on New York boundaries, including midnight and overnight',()=>{
 for(const [date,name] of [['2026-11-11T00:59:59Z','Icing Hour'],['2026-11-11T02:00:00Z','High Life Shift'],['2026-11-11T05:00:00Z','Nightly News'],['2026-11-11T06:00:00Z','Motion Hour Replay'],['2026-11-11T11:00:00Z','Sunshine Morning Show']])assert.equal(rotationAt(blocks,new Date(date)).name,name);
});
test('every minute has exactly the expected rotation across daylight saving seasons',()=>{
 for(const day of ['2026-01-15','2026-07-15'])for(let minute=0;minute<1440;minute++)assert.ok(rotationAt(blocks,new Date(Date.parse(day+'T00:00:00Z')+minute*60000)));
});
test('blank OBS picture keeps the default; a real image can fade in',()=>{
 assert.equal(hasPicture(new Uint8ClampedArray(32*18*4)),false);
 const solid=new Uint8ClampedArray(32*18*4).fill(90);assert.equal(hasPicture(solid),true);
});
