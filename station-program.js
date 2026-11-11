'use strict';
(() => {
 const video=document.getElementById('audio'),screen=document.querySelector('[data-station-screen]');
 if(!video||!screen)return;
 let hls=null,failedUntil=0,usingProgram=false,playGeneration=0;
 screen.dataset.hlsSupported=String(window.Hls?.isSupported());
 const fallback=()=>{usingProgram=false;screen.dataset.mediaSource='radio-fallback';};
 function destroy(){if(hls){hls.destroy();hls=null;}}
 async function plain(url){destroy();fallback();video.src=url;video.load();await video.play();}
 window.HighLifeProgram={
  playbackDate(){
   const date=hls?.playingDate;if(date&&Number.isFinite(date.getTime()))return date.getTime();
   try{const start=video.getStartDate?.();const value=start?.getTime()+video.currentTime*1000;if(Number.isFinite(value)&&Math.abs(Date.now()-value)<86400000)return value;}catch{}
   return null;
  },
  cancel(){++playGeneration;destroy();video.pause();},
  async play(config,radioUrl){
   const generation=++playGeneration;const current=()=>generation===playGeneration;
   const radioFallback=async()=>{if(current())await plain(radioUrl);};
   screen.dataset.programConfigured=String(!!config.programUrl);if(!config.programUrl||Date.now()<failedUntil)return radioFallback();
   destroy();usingProgram=true;screen.dataset.mediaSource='combined-program';
   const url=new URL(config.programUrl,document.baseURI);url.searchParams.set('listener',Date.now().toString(36));
   if(!window.Hls?.isSupported()&&video.canPlayType('application/vnd.apple.mpegurl')){video.src=url.href;video.load();return video.play();}
   if(!window.Hls?.isSupported())return radioFallback();
   try{
    await new Promise((resolve,reject)=>{
     hls=new Hls({enableWorker:true,lowLatencyMode:true,maxBufferLength:15,backBufferLength:5,liveSyncDuration:3,liveMaxLatencyDuration:15,maxLiveSyncPlaybackRate:1});
     const timer=setTimeout(()=>reject(Error('Program timeout')),10000);
     hls.on(Hls.Events.MANIFEST_PARSED,()=>{clearTimeout(timer);resolve();});
     hls.on(Hls.Events.ERROR,(_event,data)=>{screen.dataset.programEvent=data.details;if(data.fatal&&current()){clearTimeout(timer);failedUntil=Date.now()+60000;reject(Error('Program unavailable'));if(!video.paused)video.dispatchEvent(new Event('error'));}});
     hls.loadSource(url.href);hls.attachMedia(video);
    });
    if(current())await video.play();
   }catch(error){if(!current())return;screen.dataset.programFailure=error.message;failedUntil=Date.now()+60000;await radioFallback();}
  }
 };
 video.addEventListener('error',()=>{if(usingProgram)failedUntil=Date.now()+60000;});
 function rotation(){const block=window.HighLifeStationScreen.rotationAt(window.HIGHLIFE_ROTATION?.blocks||[]);screen.querySelector('[data-rotation-name]').textContent=block?.name||'NYC High Life Radio';screen.querySelector('[data-rotation-time]').textContent=block?block.time+' · New York time':'From New York to the world.';}
 rotation();setInterval(rotation,15000);
 const canvas=document.createElement('canvas');canvas.width=32;canvas.height=18;const context=canvas.getContext('2d',{willReadFrequently:true});
 function hide(){screen.classList.remove('has-live-picture');screen.dataset.mode='station';}
 function picture(){
  if(video.paused||video.readyState<2||!video.videoWidth||!usingProgram){hide();return;}
  try{context.drawImage(video,0,0,32,18);const pixels=context.getImageData(0,0,32,18).data;if(window.HighLifeStationScreen.hasPicture(pixels)){screen.classList.add('has-live-picture');screen.dataset.mode='live';screen.dataset.sync='single-media-clock';}else hide();}catch{hide();}
 }
 setInterval(picture,300);video.addEventListener('pause',hide);video.addEventListener('emptied',hide);
})();
