'use strict';
(() => {
 const minuteOf = value => { const [h,m]=value.split(':').map(Number);return h*60+m; };
 function rotationAt(blocks,date=new Date()) {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const minutes=Number(parts.find(p=>p.type==='hour').value)*60+Number(parts.find(p=>p.type==='minute').value);
  return blocks.find(block=>{const start=minuteOf(block.start),end=minuteOf(block.end);return end>start?minutes>=start&&minutes<end:minutes>=start||minutes<end;});
 }
 function hasPicture(rgba) {
  let total=0,squares=0,n=0;
  for(let i=0;i<rgba.length;i+=4){const v=(rgba[i]+rgba[i+1]+rgba[i+2])/3;total+=v;squares+=v*v;n++;}
  if(!n)return false;
  const mean=total/n,variance=Math.max(0,squares/n-mean*mean);
  return mean>12||(mean>6&&variance>12);
 }
 const api={rotationAt,hasPicture};
 if(typeof module!=='undefined')module.exports=api;
 if(typeof window!=='undefined')window.HighLifeStationScreen=api;
})();
