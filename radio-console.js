'use strict';
(() => {
 const audio=document.getElementById('audio');if(!audio)return;
 const waves=[...document.querySelectorAll('[data-audio-wave]')].map(el=>({el,bars:Array.from({length:28},()=>{const bar=document.createElement('i');el.append(bar);return bar;})}));
 const scenes=[...document.querySelectorAll('.night-vision-scene')],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let animation=0,lastFrame=0,data=null,fetching=false;
 const reset=()=>{for(const wave of waves)for(const bar of wave.bars)bar.style.setProperty('--level','3px');for(const scene of scenes)scene.style.backgroundPosition='0% 0%';};
 async function measure(){
  if(audio.paused||document.hidden||fetching)return;fetching=true;
  try{const response=await fetch('/api/radio-waveform',{cache:'no-store',signal:AbortSignal.timeout(3500)});if(!response.ok)throw Error('Meter unavailable');const next=await response.json();if(Array.isArray(next.frames)&&Number.isFinite(next.updated))data=next;}catch{}finally{fetching=false;}
 }
 function animate(now){
  if(audio.paused||audio.ended||document.hidden){animation=0;reset();return;}
  animation=requestAnimationFrame(animate);if(now-lastFrame<(reduced.matches?250:45))return;lastFrame=now;
  if(!data||Date.now()-data.updated>6000){reset();return;}
  let stamp=window.HighLifeProgram?.playbackDate();
  if(!Number.isFinite(stamp)){const end=audio.seekable.length?audio.seekable.end(audio.seekable.length-1):audio.currentTime;stamp=Date.now()-Math.max(0,end-audio.currentTime)*1000;}
  const levels=window.HighLifeWaveform.levelsAt(data.frames,stamp);
  for(const wave of waves){wave.el.dataset.waveformMode='station-audio';for(let j=0;j<wave.bars.length;j++)wave.bars[j].style.setProperty('--level',(3+levels[j]/255*49).toFixed(1)+'px');}
  if(!reduced.matches&&levels.some(value=>value>20)){const frame=Math.floor(audio.currentTime*8)%16;for(const scene of scenes)scene.style.backgroundPosition=`${(frame%4)*100/3}% ${Math.floor(frame/4)*100/3}%`;}
 }
 const start=()=>{void measure();if(!animation&&!document.hidden)animation=requestAnimationFrame(animate);};
 setInterval(measure,1000);audio.addEventListener('playing',start);audio.addEventListener('pause',reset);audio.addEventListener('ended',reset);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!audio.paused)start();});
 const status=document.getElementById('player-status'),track=document.getElementById('player-track');
 function sync(){
  const state=status?.textContent||'READY';const label=document.querySelector('.console-status');if(label)label.textContent=state==='PLAYING'?'● ON AIR':state==='READY'?'LIVE RADIO':state;
  const title=document.querySelector('.console-track');if(title)title.textContent=track?.textContent||'Ready when you are';
  const artist=document.querySelector('.console-artist');if(artist)artist.textContent=audio.paused?'New York energy. Caribbean soul.':'Streaming live';
  const playLabel=document.querySelector('.console-play-label');if(playLabel)playLabel.textContent=audio.paused?'PRESS PLAY':'TAP TO PAUSE';
 }
 if(status)new MutationObserver(sync).observe(status,{childList:true,subtree:true,characterData:true});
 if(track)new MutationObserver(sync).observe(track,{childList:true,subtree:true,characterData:true});
 audio.addEventListener('playing',sync);audio.addEventListener('pause',sync);sync();reset();
})();
