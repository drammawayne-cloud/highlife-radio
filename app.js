'use strict';
const $=id=>document.getElementById(id), audio=$('audio'), plays=[...document.querySelectorAll('[data-play]')];
const nav=[['Home','home'],['Listen Live','listen'],['Schedule','schedule'],['Shows','shows'],['DJs & Personalities','shows'],['Team Unstoppable','team'],['The Winning Team','/the-winning-team/'],['DJ Connect','/dj/'],['Music','music'],['Mixes','mixes'],['Podcasts','podcasts'],['Entertainment','entertainment'],['Events','events'],['News','/news/'],['Videos','videos'],['Gallery','gallery'],['Advertise','advertise'],['Submit Music','submit'],['About','about'],['Contact','contact']];
const details={team:['Team Unstoppable','Team Unstoppable is the integrated team and staff division within High Life Radio, owned by NYC High Life Entertainment. Official member names, portraits, biographies and roles have not yet been supplied. Future profiles will use the same staff records as the DJ directory.'],culture:['Two places. One powerful connection.','High Life Radio’s creative direction brings New York and Caribbean music culture into one space. This original editorial preview demonstrates an article presentation; it is not a published news report.'],selectors:['Behind the selection. Inside the sound.','A proposed series exploring how DJs build a set, discover records and connect with listeners. Interviews and approved features will replace this sample editorial.'],community:['The people make the movement.','A proposed editorial space for local voices and community stories. This is a sample feature, with approved contributors and reporting to follow.'],events:['Events at High Life Radio','High Life Events will include station, NYC High Life Entertainment and Team Unstoppable events. Sponsored Events will be submitted by external promoters and approved before publication. No event dates, tickets or purchases are available in this preview.'],submit:['Submit your music','Music submissions will enter a private review queue and will never publish automatically. The secure submission service is planned for the backend phase. This preview does not upload, collect or store music or personal information.'],advertise:['Book your radio spot','What’s your budget? Tell us whether you already have a finished commercial or need one produced, your campaign goals and dates, and the airtime or radio slot you’re looking for. Production, placement and pricing are tailored after a consultation. Placements are subject to availability and agreed before booking. Use Request a commercial consultation in the advertising section to open an email draft. No payment is collected on this website.'],contact:['Get in touch','Official business contact details are awaiting client confirmation. Contact forms and newsletter subscriptions will be connected to the private backend in a later phase. This preview collects no enquiries.'],music:['Music on the frequency','Tracks, artists, releases and approved playlists will live here. Listen to the station using the persistent player while the official music catalogue is prepared.'],mixes:['The mix archive','Approved DJ mixes and archived radio sets will appear here once supplied. No sample recordings are presented as official mixes.'],podcasts:['Conversations worth replaying','The planned podcast library will connect episodes to hosts and shows. Approved episodes, artwork and release dates are coming later.'],videos:['Watch the culture','Interviews, performances and station videos will appear here after approval. This staging preview does not embed unapproved media.'],gallery:['Life around the station','Approved photos from shows, events and the team will be published here. No stock portrait is presented as an official team member.']};
const rotation=window.HIGHLIFE_ROTATION||{blocks:[]};
for(const block of rotation.blocks)details['rotation-'+block.id]=[block.name,block.time+' · New York time. '+block.description+' Every hour opens with four commercial spots, totaling no more than 3 minutes 30 seconds. This is a station rotation block; individual DJs may use their own show names within it.'];
function openDetail(key){const d=details[key];if(!d)return;$('detail-title').textContent=d[0];$('detail-body').textContent=d[1];$('detail').showModal();}
document.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.detail)));
for(const container of [$('mobile-nav'),$('footer-links')])for(const [label,id]of nav){const a=document.createElement('a');a.textContent=label;a.href=id.startsWith('/')?id:'#'+id;if(details[id])a.addEventListener('click',e=>{e.preventDefault();openDetail(id);$('mobile-nav').hidden=true;$('menu').setAttribute('aria-expanded','false');});else a.addEventListener('click',()=>{$('mobile-nav').hidden=true;$('menu').setAttribute('aria-expanded','false');});container.append(a);}
$('menu').addEventListener('click',()=>{const opened=$('mobile-nav').hidden;$('mobile-nav').hidden=!opened;$('menu').setAttribute('aria-expanded',String(opened));});
$('close-detail').addEventListener('click',()=>$('detail').close());$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close();}});
const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function renderDay(day){
 document.querySelectorAll('.days button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===day)));
 $('slots').replaceChildren();
 for(const block of rotation.blocks){
  const card=document.createElement('details');card.className='slot';
  const summary=document.createElement('summary'),h=document.createElement('h3');
  const body=document.createElement('div');body.className='rotation-detail';
  const t=document.createElement('small'),p=document.createElement('p');
  h.textContent=block.name;t.textContent=day+' · '+block.time;p.textContent=block.description;
  summary.append(h);body.append(t,p);card.append(summary,body);$('slots').append(card);
 }
}
for(const day of days){const b=document.createElement('button');b.textContent=day;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>renderDay(day));document.querySelector('.days').append(b);}renderDay(new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:'America/New_York'}).format(new Date()));
document.querySelectorAll('[data-events]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-events]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const sponsored=b.dataset.events==='sponsored';$('event-tag').textContent=sponsored?'SPONSORED EVENTS / PREVIEW':'HIGH LIFE EVENTS / PREVIEW';$('event-title').textContent=sponsored?'Your event. Our community.':'The next link-up starts here.';$('event-copy').textContent=sponsored?'Approved promoter events will appear here. Event submissions will require staff review before publication.':'Our event calendar is taking shape. Official dates, venues and ticket links will appear after approval.';}));
audio.volume=.75;let config=null,pending=false,hasPlayed=false,track='High Life Radio · live stream';
function state(status){if(status==='PLAYING'&&(audio.muted||audio.volume===0))status='MUTED';$('player-status').textContent=status;document.body.classList.toggle('playing',!audio.paused);for(const b of plays){const playing=!audio.paused;b.textContent=b.classList.contains('round-play')?(playing?'Ⅱ':'▶'):(playing?'Ⅱ Pause Radio':'▶ Listen Live');b.setAttribute('aria-label',playing?'Pause High Life Radio':'Play High Life Radio');} }
// A listener's Play intent survives transient network failures, but never their Pause.
let wantsPlayback=false,reconnectTimer=0,stallTimer=0,retryCount=0,connectionGeneration=0;
function clearRecovery(){clearTimeout(reconnectTimer);clearTimeout(stallTimer);reconnectTimer=stallTimer=0;}
function recover(){
 if(!wantsPlayback||reconnectTimer||!config)return;
 clearTimeout(stallTimer);stallTimer=0;pending=false;state('RECONNECTING');$('player-track').textContent='Reconnecting to the live station…';
 reconnectTimer=setTimeout(()=>{reconnectTimer=0;void connectRadio();},Math.min(15000,1000*2**Math.min(retryCount++,4)));
}
async function connectRadio(){
 if(!wantsPlayback||!config)return;
 const generation=++connectionGeneration;pending=true;state('CONNECTING');clearTimeout(stallTimer);stallTimer=setTimeout(recover,12000);
 try{const url=new URL(config.streamUrl);url.searchParams.set('listener',Date.now().toString(36));if(window.HighLifeProgram)await window.HighLifeProgram.play(config,url.href);else{audio.src=url.href;audio.load();await audio.play();}}
 catch(error){if(generation===connectionGeneration&&wantsPlayback&&error?.name!=='AbortError')recover();}
 finally{if(generation===connectionGeneration)pending=false;}
}
async function toggle(){
 if(wantsPlayback){wantsPlayback=false;++connectionGeneration;pending=false;clearRecovery();window.HighLifeProgram?.cancel();audio.pause();state('PAUSED');return;}
 if(!config){state('CONNECTING');$('player-track').textContent='Loading station connection. Please try again.';return;}
 wantsPlayback=true;retryCount=0;await connectRadio();
}
plays.forEach(b=>b.addEventListener('click',toggle));
audio.addEventListener('playing',()=>{hasPlayed=true;retryCount=0;clearRecovery();state('PLAYING');$('player-track').textContent=track;});
audio.addEventListener('pause',()=>{if(wantsPlayback&&!pending&&!audio.error&&!audio.ended){wantsPlayback=false;clearRecovery();window.HighLifeProgram?.cancel();}if(!wantsPlayback)state('PAUSED');});
function buffering(){if(!wantsPlayback)return;state('BUFFERING');if(!stallTimer)stallTimer=setTimeout(recover,12000);}
audio.addEventListener('waiting',buffering);audio.addEventListener('stalled',buffering);
audio.addEventListener('error',()=>{pending=false;if(wantsPlayback)recover();});
audio.addEventListener('ended',()=>{if(wantsPlayback)recover();});
window.addEventListener('online',()=>{if(wantsPlayback){clearRecovery();void connectRadio();}});
$('volume').addEventListener('input',e=>audio.volume=Number(e.target.value));$('mute').addEventListener('click',()=>{audio.muted=!audio.muted;$('mute').setAttribute('aria-pressed',String(audio.muted));$('mute').setAttribute('aria-label',audio.muted?'Unmute audio':'Mute audio');$('mute').textContent=audio.muted?'◖×':'◖))';});
async function metadata(){if(!config)return;try{const response=await fetch(config.nowPlayingUrl,{signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Station API unavailable');const data=await response.json();const np=data.now_playing;const humanLive=data.live?.is_live===true;const stale=!humanLive&&(!np?.played_at||Date.now()/1000>np.played_at+Math.max(np.duration||0,300)+180);$('air-state').textContent=data.is_online?'STREAM ONLINE':'STREAM OFFLINE';$('song').textContent=stale?'High Life Radio live stream':np?.song?.title||'Live Broadcast';$('artist').textContent=stale?'Track metadata is delayed · press play to listen':np?.song?.artist||'NYC High Life Radio';track=stale?'High Life Radio · track metadata delayed':(np?.song?.artist||'NYC High Life Radio')+' — '+(np?.song?.title||'Live Broadcast');$('player-track').textContent=track;$('host-name').textContent=data.live?.is_live&&data.live.streamer_name?data.live.streamer_name:'Current DJ / show not supplied';$('show-name').textContent=data.live?.is_live?'Live broadcast':'Station rotation';$('next-song').textContent=humanLive?'Not announced during live broadcast':stale?'Awaiting current station metadata':data.playing_next?.song?.text||'Not announced';if(audio.paused&&!wantsPlayback)state(hasPlayed?'PAUSED':'READY');}catch{$('air-state').textContent='STATUS UNAVAILABLE';$('song').textContent='High Life Radio';$('artist').textContent='Station metadata unavailable · try Listen Live';}}
fetch('./station.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Missing configuration');return r.json();}).then(c=>{for(const key of ['streamUrl','nowPlayingUrl']){if(new URL(c[key]).protocol!=='https:')throw Error('HTTPS required');}config=c;metadata();setInterval(metadata,30000);}).catch(()=>{state('UNAVAILABLE');$('air-state').textContent='CONFIGURATION UNAVAILABLE';$('player-track').textContent='Station setup unavailable. Please try later.';});

// Display preferences do not touch the radio audio element.
const themeButton=$('theme-toggle');
function syncTheme(){const dark=document.documentElement.dataset.theme==='dark';themeButton.textContent=dark?'☀':'☾';themeButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');themeButton.title=themeButton.getAttribute('aria-label');document.querySelector('meta[name="theme-color"]').content=dark?'#090b0a':'#f5f2e8';}
syncTheme();themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('highlife-theme',theme);}catch{}syncTheme();});
// Decorative record rotation and side changes run automatically in CSS.

// Report actual progress rather than retaining PLAYING after a stalled decoder.
let progressTime=0,progressAt=0;
audio.addEventListener('loadstart',()=>{progressTime=0;progressAt=Date.now();});
audio.addEventListener('volumechange',()=>{if(wantsPlayback&&!audio.paused)state('PLAYING');});
setInterval(()=>{
 if(!wantsPlayback||audio.paused)return;
 if(audio.currentTime>progressTime+.05){progressTime=audio.currentTime;progressAt=Date.now();if(audio.readyState>=3&&$('player-status').textContent==='BUFFERING'){clearRecovery();state('PLAYING');}}
 else if(progressAt&&Date.now()-progressAt>5000){buffering();}
},1000);
if('mediaSession' in navigator){
 try{navigator.mediaSession.metadata=new MediaMetadata({title:'NYC High Life Radio',artist:'High Life Radio — Studio Live',artwork:[{src:new URL('radio-logo.png',document.baseURI).href,sizes:'512x512',type:'image/png'}]});navigator.mediaSession.setActionHandler('play',()=>{if(!wantsPlayback)void toggle();});navigator.mediaSession.setActionHandler('pause',()=>{if(wantsPlayback)void toggle();});}catch{}
 audio.addEventListener('playing',()=>{navigator.mediaSession.playbackState='playing';});audio.addEventListener('pause',()=>{navigator.mediaSession.playbackState='paused';});
}
