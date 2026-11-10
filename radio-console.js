'use strict';
(() => {
 const audio=document.getElementById('audio');
 if(!audio)return;
 const waves=[...document.querySelectorAll('[data-audio-wave]')].map(el=>{
  const bars=Array.from({length:28},()=>{const bar=document.createElement('i');el.append(bar);return bar;});return {el,bars};
 });
 const scenes=[...document.querySelectorAll('.night-vision-scene')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let context,analyser,source,pcm,animation=0,lastFrame=0;
 const reset=()=>{for(const wave of waves)for(const bar of wave.bars)bar.style.setProperty('--level','3px');for(const scene of scenes)scene.style.backgroundPosition='0% 0%';};
 function animate(now){
  if(audio.paused||audio.ended||document.hidden||reduced.matches){animation=0;reset();return;}
  animation=requestAnimationFrame(animate);
  if(!analyser||now-lastFrame<65)return;
  lastFrame=now;analyser.getByteTimeDomainData(pcm);
  let total=0;
  for(let j=0;j<28;j++){
   const begin=Math.floor(j*pcm.length/28),end=Math.floor((j+1)*pcm.length/28);let sum=0;
   for(let i=begin;i<end;i++){const sample=(pcm[i]-128)/128;sum+=sample*sample;}
   total+=sum;const level=Math.min(52,3+Math.sqrt(sum/Math.max(1,end-begin))*140);
   for(const wave of waves)wave.bars[j].style.setProperty('--level',level.toFixed(1)+'px');
  }
  if(Math.sqrt(total/pcm.length)>.008){const frame=Math.floor(audio.currentTime*8)%16;for(const scene of scenes)scene.style.backgroundPosition=`${(frame%4)*100/3}% ${Math.floor(frame/4)*100/3}%`;}
 }
 const start=()=>{if(!animation&&!reduced.matches&&!document.hidden)animation=requestAnimationFrame(animate);};
 // Resume AudioContext in the Play gesture, never request microphone permission.
 document.addEventListener('click',event=>{
  if(!event.target.closest('[data-play]')||!audio.paused)return;
  try {
   if(!context){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;context=new AudioContext();analyser=context.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.7;pcm=new Uint8Array(analyser.fftSize);source=context.createMediaElementSource(audio);source.connect(analyser);analyser.connect(context.destination);}
   void context.resume().then(start).catch(()=>{});
  }catch{reset();}
 },true);
 audio.addEventListener('playing',start);audio.addEventListener('pause',reset);audio.addEventListener('ended',reset);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!audio.paused)start();});
 reduced.addEventListener('change',()=>{if(reduced.matches)reset();else if(!audio.paused)start();});
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
