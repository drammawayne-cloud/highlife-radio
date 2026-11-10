/* Publisher video remains in the official player, including its real preview image. */
(() => {
  const roots=[...document.querySelectorAll('[data-live-news]')];
  if(!roots.length)return;
  const refreshMs=300000;
  const sourceNames={reuters:'Reuters',ap:'Associated Press'};
  const timeFormat=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
  const format=value=>Number.isFinite(Date.parse(value))?timeFormat.format(new Date(value)):'Time unavailable';
  const text=(tag,value,cls)=>{const node=document.createElement(tag);node.textContent=value;if(cls)node.className=cls;return node;};
  const external=(url,label)=>{const a=text('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  const valid=s=>s&&sourceNames[s.sourceId]===s.sourcePublisher&&/^[\w-]{11}$/.test(s.videoId)&&typeof s.title==='string'&&s.title.length<401&&Number.isFinite(Date.parse(s.publishedAt));
  const states=new Map();
  let loading=false,lastData=null,linkedReportShown=false;

  function card(story){
    const article=document.createElement('article');article.className='live-news-card';article.id='report-'+story.videoId;
    const iframe=document.createElement('iframe');iframe.className='live-news-player';
    iframe.src='https://www.youtube-nocookie.com/embed/'+story.videoId+'?playsinline=1&rel=0';
    iframe.title=story.sourcePublisher+': '+story.title;
    iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';
    iframe.allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen';iframe.allowFullscreen=true;
    const body=document.createElement('div');body.className='live-news-copy';
    body.append(text('p',story.sourcePublisher+' / VIDEO REPORT','live-news-source'));
    const h=text('h3','');h.append(external('https://www.youtube.com/watch?v='+story.videoId,story.title));body.append(h);
    const date=text('time','Published '+format(story.publishedAt));date.dateTime=story.publishedAt;body.append(date);
    if(story.sourceStale)body.append(text('p','Saved report • publisher feed temporarily unavailable','live-news-notice'));
    body.append(external('https://www.youtube.com/watch?v='+story.videoId,'Watch on YouTube ↗'));
    article.append(iframe,body);return article;
  }

  function selection(stories,limit){
    // Reserve space for both independent publishers instead of letting the busier feed dominate.
    const each=Math.max(1,Math.floor(limit/2));
    return Object.keys(sourceNames).flatMap(id=>stories.filter(s=>s.sourceId===id).slice(0,each)).sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,limit);
  }

  function show(data){
    lastData=data;
    const stories=data.stories.filter(valid).filter(s=>Date.now()-Date.parse(s.publishedAt)<7*86400000);
    for(const root of roots){
      const state=states.get(root),items=selection(stories,Number(root.dataset.liveNews)||6);
      const signature=items.map(s=>s.videoId).join(',');
      const status=root.querySelector('[data-live-status]');
      const checked=data.sources.map(s=>s.checkedAt).filter(Boolean).sort()[0];
      const successes=data.sources.map(s=>s.successAt).filter(Boolean).sort()[0];
      const old=successes&&Date.now()-Date.parse(successes)>20*60000;
      const statusText=data.status==='ok'&&!old?'Feeds checked '+format(checked)+'. Refreshes automatically every 5 minutes.':items.length?'Publisher updates are delayed. Showing dated reports last retrieved '+format(successes)+'. Retrying automatically.':'Publisher feeds are temporarily unavailable. Use the official source links below or browse the reviewed background edition.';
      status.textContent=statusText;
      if(signature===state.signature)continue;
      // Do not interrupt a reader who is interacting with a video.
      if(state.engaged&&state.signature&&items.length){
        state.button.hidden=false;state.button.textContent='New reports available — show latest';continue;
      }
      state.list.replaceChildren(...items.map(card));state.signature=signature;state.button.hidden=true;
      state.list.hidden=!items.length;
    }
    if(!linkedReportShown && /^#report-[\w-]{11}$/.test(location.hash)){
      const target=document.getElementById(location.hash.slice(1));
      if(target){target.scrollIntoView({block:'start',behavior:'auto'});linkedReportShown=true;}
    }
  }

  for(const root of roots){
    const list=root.querySelector('[data-live-list]');
    const button=text('button','Show latest reports','live-news-refresh');button.type='button';button.hidden=true;
    root.querySelector('[data-live-status]').after(button);
    const state={list,button,signature:'',engaged:false};states.set(root,state);
    list.addEventListener('pointerdown',()=>state.engaged=true);
    list.addEventListener('pointerover',event=>{if(event.target.tagName==='IFRAME')state.engaged=true;});
    button.addEventListener('click',()=>{state.engaged=false;state.signature='';if(lastData)show(lastData);});
  }
  window.addEventListener('blur',()=>{
    const focused=document.activeElement;
    if(focused?.tagName==='IFRAME'){
      const state=states.get(focused.closest('[data-live-news]'));if(state)state.engaged=true;
    }
  });

  async function refresh(){
    if(loading||document.hidden)return;loading=true;
    try{
      const response=await fetch('/api/world-news',{cache:'no-store',signal:AbortSignal.timeout(18000)});
      if(!response.ok)throw Error('Feed unavailable');
      const data=await response.json();if(!Array.isArray(data.stories)||!Array.isArray(data.sources))throw Error('Invalid feed');
      show(data);
    }catch{
      for(const root of roots)root.querySelector('[data-live-status]').textContent='Updates are temporarily unavailable. '+(states.get(root).signature?'The displayed publication dates still apply. ':'Use the official source links below. ')+'Retrying automatically.';
    }finally{loading=false;}
  }
  refresh();setInterval(refresh,refreshMs);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
