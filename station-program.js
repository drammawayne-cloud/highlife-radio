'use strict';
(() => {
 const audio=document.getElementById('audio'),screen=document.querySelector('[data-station-screen]');if(!audio||!screen)return;
 const video=screen.querySelector('video');const silencePicture=()=>{if(!video.muted)video.muted=true;if(video.volume!==0)video.volume=0;};silencePicture();video.addEventListener('volumechange',silencePicture);
 let audioHls=null,videoHls=null,failedUntil=0,usingProgram=false,generation=0,pictureGeneration=0,matched=false;
 const apple=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 function dateAt(element,engine){const d=engine?.playingDate;if(d&&Number.isFinite(d.getTime()))return d.getTime();try{const start=element.getStartDate?.();const value=start?.getTime()+element.currentTime*1000;if(Number.isFinite(value)&&Math.abs(Date.now()-value)<86400000)return value;}catch{}return null;}
 function destroy(){audioHls?.destroy();videoHls?.destroy();audioHls=videoHls=null;matched=false;}
 function hide(){screen.classList.remove('has-live-picture');screen.dataset.mode='station';}
 function load(element,url,isAudio){
  if(element.canPlayType('application/vnd.apple.mpegurl')&&(apple||!window.Hls?.isSupported())){element.src=url;element.load();return element.play();}
  if(!window.Hls?.isSupported())return Promise.reject(Error('HLS unavailable'));
  return new Promise((resolve,reject)=>{
   const engine=new Hls({enableWorker:true,lowLatencyMode:false,maxBufferLength:30,backBufferLength:15,liveSyncDuration:8,liveMaxLatencyDuration:30,maxLiveSyncPlaybackRate:1});
   if(isAudio)audioHls=engine;else videoHls=engine;
   const timer=setTimeout(()=>reject(Error('Program timeout')),12000);
   engine.on(Hls.Events.MANIFEST_PARSED,()=>{clearTimeout(timer);element.play().then(resolve,reject);});
   engine.on(Hls.Events.ERROR,(_event,data)=>{
    if(!data.fatal){if(isAudio&&data.details==='bufferStalledError')element.dispatchEvent(new Event('waiting'));return;}
    clearTimeout(timer);reject(Error('Program unavailable'));
    if(isAudio&&!audio.paused)audio.dispatchEvent(new Event('error'));else if(!isAudio)hide();
   });
   engine.loadSource(url);engine.attachMedia(element);
  });
 }
 async function picture(url,token){
  if(document.hidden||audio.paused||token!==generation)return;
  const attempt=++pictureGeneration;matched=false;hide();
  try{await load(video,url,false);if(token!==generation||attempt!==pictureGeneration||document.hidden)video.pause();}catch{hide();}
 }
 let currentUrl='';
 window.HighLifeProgram={
  playbackDate:()=>dateAt(audio,audioHls),
  cancel(){++generation;++pictureGeneration;video.pause();destroy();hide();},
  async play(config,radioUrl){
   const token=++generation;destroy();video.pause();hide();
   if(!config.programUrl||Date.now()<failedUntil){usingProgram=false;screen.dataset.mediaSource='radio-fallback';audio.src=radioUrl;audio.load();return audio.play();}
   usingProgram=true;screen.dataset.mediaSource='combined-program-background-audio';currentUrl=new URL(config.programUrl,document.baseURI).href;
   try{
    // The audio tag owns the audible programme and remains active when the picture is hidden.
    const started=load(audio,currentUrl,true);
    void started.then(()=>picture(currentUrl,token)).catch(()=>{});
    await started;
    if(token!==generation)audio.pause();
   }catch(error){
    if(token!==generation)return;failedUntil=Date.now()+60000;usingProgram=false;screen.dataset.mediaSource='radio-fallback';destroy();audio.src=radioUrl;audio.load();await audio.play();
   }
  }
 };
 audio.addEventListener('pause',()=>{video.pause();matched=false;hide();});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){++pictureGeneration;video.pause();videoHls?.destroy();videoHls=null;hide();}
  else if(usingProgram&&!audio.paused){if(videoHls){videoHls.startLoad(-1);void video.play().catch(hide);}else void picture(currentUrl,generation);}
 });
 const minute=value=>{const[h,m]=value.split(':').map(Number);return h*60+m;};
 function rotation(){const block=window.HighLifeStationScreen.rotationAt(window.HIGHLIFE_ROTATION?.blocks||[]);screen.querySelector('[data-rotation-name]').textContent=block?.name||'NYC High Life Radio';screen.querySelector('[data-rotation-time]').textContent=block?block.time+' · New York time':'From New York to the world.';}
 rotation();setInterval(rotation,15000);
 const canvas=document.createElement('canvas');canvas.width=32;canvas.height=18;const context=canvas.getContext('2d',{willReadFrequently:true});
 setInterval(()=>{
  if(audio.paused||document.hidden||video.paused||!usingProgram||video.readyState<2){hide();return;}
  const a=dateAt(audio,audioHls),v=dateAt(video,videoHls);let delta;
  if(a!==null&&v!==null)delta=(a-v)/1000;
  else if(audio.seekable.length&&video.seekable.length)delta=(video.seekable.end(video.seekable.length-1)-video.currentTime)-(audio.seekable.end(audio.seekable.length-1)-audio.currentTime);
  else{hide();return;}
  screen.dataset.pictureOffset=delta.toFixed(3);
  if(Math.abs(delta)>1){const target=video.currentTime+delta;if(target>=0&&((Number.isFinite(video.duration)&&target<video.duration-.1)||(video.seekable.length&&target>=video.seekable.start(0)&&target<video.seekable.end(video.seekable.length-1)-.1))&&!video.seeking)video.currentTime=target;matched=false;hide();return;}
  video.playbackRate=1+Math.max(-.08,Math.min(.08,delta*.3));
  if(Math.abs(delta)<.15)matched=true;else if(Math.abs(delta)>.35)matched=false;
  if(!matched){hide();return;}
  try{context.drawImage(video,0,0,32,18);if(window.HighLifeStationScreen.hasPicture(context.getImageData(0,0,32,18).data)){screen.classList.add('has-live-picture');screen.dataset.mode='live';screen.dataset.sync='shared-programme-time';}else hide();}catch{hide();}
 },300);
 // This is an output-only playback session, never a microphone/audio-capture session.
 try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
})();
