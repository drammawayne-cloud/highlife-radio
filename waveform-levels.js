'use strict';
(() => {
 function levelsAt(frames,time,count=28){
  if(!Array.isArray(frames)||!frames.length||!Number.isFinite(time))return Array(count).fill(0);
  let lo=0,hi=frames.length-1,index=-1;
  while(lo<=hi){const mid=(lo+hi)>>1;if(frames[mid][0]<=time){index=mid;lo=mid+1;}else hi=mid-1;}
  if(index<0||time-frames[index][0]>1500)return Array(count).fill(0);
  return Array.from({length:count},(_,i)=>{const value=Number(frames[Math.max(0,index-(count-1-i)*2)]?.[1]);return Number.isFinite(value)?Math.max(0,Math.min(255,value)):0;});
 }
 if(typeof module!=='undefined')module.exports={levelsAt};
 if(typeof window!=='undefined')window.HighLifeWaveform={levelsAt};
})();
