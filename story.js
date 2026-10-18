window.setupStory=function(scope=document,storyURL=location.href){
 const storyPlay=scope.querySelector('#story-play'),storyAudio=scope.querySelector('#story-audio');
 if(storyPlay)storyPlay.onclick=async()=>{
  const persistent=document.getElementById('audio');if(persistent){document.querySelector('.player [data-play]')?.click();return;}
  const message=scope.querySelector('#story-radio-status');try{if(!storyAudio.paused){storyAudio.pause();storyPlay.textContent='▶ Listen Live';return;}if(!storyAudio.src){const r=await fetch(new URL('../../station.json',storyURL));if(!r.ok)throw Error();const config=await r.json();if(new URL(config.streamUrl).protocol!=='https:')throw Error();storyAudio.src=config.streamUrl;}await storyAudio.play();storyPlay.textContent='Ⅱ Pause Radio';message.textContent='Playing NYC High Life Radio';}catch{message.textContent='Stream unavailable. Please try again.';}
 };
 if(scope!==document)for(const img of scope.querySelectorAll('img[src]'))img.src=new URL(img.getAttribute('src'),storyURL).href;
 const canonical=scope.querySelector('link[rel=canonical]')?.href||storyURL;
 // Relative links in the in-page story overlay resolve against the story URL.
 if(scope!==document)for(const a of scope.querySelectorAll('a[href]'))a.href=new URL(a.getAttribute('href'),storyURL).href;
 const copy=scope.querySelector('#copy-story');if(copy)copy.onclick=async()=>{try{await navigator.clipboard.writeText(canonical);copy.textContent='Link copied';}catch{copy.textContent='Copy the story link from its title';}};
 const status=scope.querySelector('#notification-status');
 const enable=scope.querySelector('#enable-notifications');if(enable)enable.onclick=async()=>{
  if(!('Notification' in window)){status.textContent='This browser does not support notifications. Subscribe via RSS instead.';return;}
  try{const permission=await Notification.requestPermission();status.textContent=permission==='granted'?'Notifications are on while this site is open.':'Notifications are off. You can still subscribe via RSS.';if(permission==='granted'){localStorage.setItem('highlife-news-notify','on');}}catch{status.textContent='Notifications are unavailable. Subscribe via RSS instead.';}
 };
 window.setupCommunity?.(scope,storyURL);
 const related=scope.querySelector('#related-stories');if(related)fetch(new URL('../../news/index.json',storyURL)).then(r=>r.json()).then(stories=>{related.replaceChildren();for(const s of stories.filter(s=>!canonical.includes('/'+s.url)).slice(0,3)){const p=document.createElement('p'),a=document.createElement('a');a.href=new URL('../../'+s.url,storyURL);const image=document.createElement('img');image.src=new URL('../../'+(s.image||'assets/news-card.png'),storyURL);image.alt=s.imageAlt||'NYC High Life Radio editorial preview';image.width=1200;image.height=630;image.loading='lazy';image.className='related-news-image';const label=document.createElement('span');label.textContent=s.title;a.append(image,label);p.append(a);related.append(p);}}).catch(()=>{related.textContent='More stories coming soon.';});
};
window.setupStory();
async function checkNewsNotifications(){
 try{if(!('Notification' in window)||Notification.permission!=='granted'||localStorage.getItem('highlife-news-notify')!=='on')return;
 const r=await fetch(new URL('news/index.json',new URL(document.querySelector('script[src$="story.js"]')?.src||'../../',location.href)),{cache:'no-cache'});if(!r.ok)return;const list=await r.json(),latest=list[0];if(!latest)return;
 const previous=localStorage.getItem('highlife-news-last');localStorage.setItem('highlife-news-last',latest.url);
 if(previous&&previous!==latest.url){const n=new Notification('NYC High Life Radio',{body:latest.title});n.onclick=()=>{window.focus();location.href=new URL(latest.url,new URL('.',document.querySelector('script[src$="story.js"]').src));};}
 }catch{}
}
setInterval(checkNewsNotifications,15*60*1000);checkNewsNotifications();
