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
 if(typeof module!=='undefined')module.exports={rotationAt,hasPicture};
 if(typeof document==='undefined')return;
 const screen=document.querySelector('[data-station-screen]');if(!screen)return;
 const video=screen.querySelector('video'),name=screen.querySelector('[data-rotation-name]'),time=screen.querySelector('[data-rotation-time]');
 function updateRotation(){const block=rotationAt(window.HIGHLIFE_ROTATION?.blocks||[]);name.textContent=block?.name||'NYC High Life Radio';time.textContent=block?block.time+' · New York time':'From New York to the world.';}
 updateRotation();setInterval(updateRotation,15000);
 const canvas=document.createElement('canvas');canvas.width=32;canvas.height=18;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 let hls,retry=0,sampling=0,good=0,lastPicture=0,lastMediaTime=-1,lastAdvance=0;
 const mute=()=>{if(!video.muted)video.muted=true;if(video.volume!==0)video.volume=0;};
 mute();video.addEventListener('volumechange',mute);
 const fallback=()=>{screen.classList.remove('has-live-picture');screen.dataset.mode='station';good=0;};
 function sample(){
  if(document.hidden||video.readyState<2||!video.videoWidth){if(Date.now()-lastPicture>6000)fallback();return;}
  if(video.currentTime!==lastMediaTime){lastMediaTime=video.currentTime;lastAdvance=Date.now();}
  if(Date.now()-lastAdvance>6000){fallback();return;}
  try{
   ctx.drawImage(video,0,0,32,18);
   if(hasPicture(ctx.getImageData(0,0,32,18).data)){
    lastPicture=Date.now();if(++good>=2){screen.classList.add('has-live-picture');screen.dataset.mode='live';}
   }else{good=0;if(Date.now()-lastPicture>6000)fallback();}
  }catch{fallback();}
 }
 const playPicture=()=>{mute();void video.play().catch(fallback);};
 function failed(){
  fallback();if(hls){hls.destroy();hls=null;}video.removeAttribute('src');video.load();
  clearTimeout(retry);retry=setTimeout(connect,30000);
 }
 function connect(){
  if(document.hidden){retry=setTimeout(connect,30000);return;}
  mute();const url=screen.dataset.videoUrl;
  if(window.Hls?.isSupported()){
   hls=new window.Hls({maxBufferLength:12,backBufferLength:5,enableWorker:true,lowLatencyMode:true});
   hls.on(window.Hls.Events.ERROR,(_event,data)=>{if(data.fatal)failed();});
   hls.on(window.Hls.Events.MANIFEST_PARSED,playPicture);hls.loadSource(url);hls.attachMedia(video);
  }else if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url;playPicture();}
 }
 video.addEventListener('error',()=>{if(!hls)failed();});
 video.addEventListener('playing',()=>{lastAdvance=Date.now();if(!sampling)sampling=setInterval(sample,1500);});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){video.pause();hls?.stopLoad();fallback();}
  else{updateRotation();if(hls){hls.startLoad(-1);playPicture();}else{clearTimeout(retry);connect();}}
 });
 // Picture only. The existing radio audio element and its Play controls are never touched.
 connect();
})();
