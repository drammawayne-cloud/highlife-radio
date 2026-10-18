const newsRoot=new URL('/',location.origin);
if(document.querySelector('[data-category-heading]'))document.body.dataset.category=document.querySelector('[data-category-heading]').dataset.categoryHeading;
function newsLink(value){const url=new URL(value,newsRoot);if(url.origin!==location.origin)throw Error('Invalid story address');return url;}
window.openNewsStory=async function(url,event){
 if(event&&(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0))return;
 event?.preventDefault();
 try{const r=await fetch(url);if(!r.ok)throw Error();const page=new DOMParser().parseFromString(await r.text(),'text/html'),article=page.querySelector('.article-page');if(!article)throw Error();
 let dialog=document.getElementById('news-story');if(!dialog){dialog=document.createElement('dialog');dialog.id='news-story';document.body.append(dialog);}
 const close=document.createElement('button');close.textContent='Close story';close.addEventListener('click',()=>dialog.close());dialog.replaceChildren(close,article);dialog.showModal();window.setupStory?.(dialog,url.href);
 }catch{const status=document.getElementById('news-status');if(status)status.textContent='This story could not be opened. Please try again.';}
};
function pictureFor(story){const image=document.createElement('img');image.width=1200;image.height=630;image.decoding='async';image.loading='lazy';image.alt=story.imageAlt||'NYC High Life Radio editorial preview';const fallback=new URL('assets/news-card.png',newsRoot);try{image.src=newsLink(story.image||fallback).href;}catch{image.src=fallback;}image.onerror=()=>{image.onerror=null;if(story.url){image.removeAttribute('src');image.alt='Story picture temporarily unavailable';}else image.src=fallback;};return image;}
function storyAnchor(story){const a=document.createElement('a');a.href=newsLink(story.url);return a;}
function newsCard(story){const card=document.createElement('article');card.className='news-card';const imageLink=storyAnchor(story);imageLink.className='news-picture-link';if(story.imageLabel)imageLink.dataset.imageLabel=story.imageLabel;imageLink.setAttribute('aria-label','Read '+story.title);imageLink.append(pictureFor(story));const body=document.createElement('div');body.className='news-card-content';const source=document.createElement('p');source.className='news-source';source.textContent='NYC HIGH LIFE RADIO';const heading=document.createElement('h3'),a=storyAnchor(story);a.textContent=story.title;heading.append(a);const summary=document.createElement('p');summary.textContent=story.summary;body.append(source,heading,summary);card.append(imageLink,body);return card;}
function featuredNews(stories){
 const region=document.getElementById('featured-news');if(!region)return;
 const track=region.querySelector('.featured-track'),dots=region.querySelector('.featured-dots'),status=region.querySelector('.featured-count'),previous=region.querySelector('[data-slide=previous]'),next=region.querySelector('[data-slide=next]');
 const prior=region.dataset.active||'',selected=stories.findIndex(s=>s.url===prior);
 track.replaceChildren();dots.replaceChildren();const items=stories.slice(0,6);
 if(!items.length){const slide=document.createElement('div');slide.className='featured-slide';const img=pictureFor({});img.loading='eager';const body=document.createElement('div');body.className='featured-copy';const label=document.createElement('p');label.className='eyebrow';label.textContent='NYC HIGH LIFE RADIO NEWSROOM';const title=document.createElement('h2');title.textContent='The culture. The conversation. Your connection.';const p=document.createElement('p');p.textContent='Original stories are on the way. Explore our newsroom and subscribe so you stay connected.';const link=document.createElement('a');link.href=new URL('news/',newsRoot);link.className='light-button';link.textContent='Explore the newsroom ↗';body.append(label,title,p,link);slide.append(img,body);track.append(slide);status.textContent='Stories coming after editorial review';previous.disabled=next.disabled=true;return;}
 let active=selected>=0&&selected<items.length?selected:0;const update=()=>{region.dataset.active=items[active].url;status.textContent=(active+1)+' / '+items.length;[...dots.children].forEach((b,i)=>b.setAttribute('aria-current',i===active?'true':'false'));previous.disabled=next.disabled=items.length<2;};
 const go=index=>{active=(index+items.length)%items.length;track.scrollTo({left:active*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});update();};
 items.forEach((story,i)=>{const slide=document.createElement('article');slide.className='featured-slide';slide.setAttribute('aria-label',(i+1)+' of '+items.length);const visual=storyAnchor(story);visual.className='featured-visual';if(story.imageLabel)visual.dataset.imageLabel=story.imageLabel;visual.setAttribute('aria-label','Read '+story.title);const image=pictureFor(story);image.loading=i===0?'eager':'lazy';visual.append(image);const body=document.createElement('div');body.className='featured-copy';const label=document.createElement('p');label.className='eyebrow';label.textContent='FEATURED / NYC HIGH LIFE RADIO';const h=document.createElement('h2'),link=storyAnchor(story);link.textContent=story.title;h.append(link);const text=document.createElement('p');text.textContent=story.summary;const read=storyAnchor(story);read.className='light-button';read.textContent='Read the story ↗';body.append(label,h,text,read);slide.append(visual,body);track.append(slide);const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label','Go to story '+(i+1));dot.onclick=()=>go(i);dots.append(dot);});
 previous.onclick=()=>go(active-1);next.onclick=()=>go(active+1);region.onkeydown=event=>{if(event.target.matches('input,textarea'))return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();go(active+(event.key==='ArrowRight'?1:-1));}};
 let timer;track.onscroll=()=>{clearTimeout(timer);timer=setTimeout(()=>{active=Math.min(items.length-1,Math.round(track.scrollLeft/track.clientWidth));update();},100);};update();requestAnimationFrame(()=>track.scrollTo({left:active*track.clientWidth,behavior:'instant'}));
}
let currentStories=[];

const newsRegions=[['brooklyn','Brooklyn','OUR HOME / LOCAL NEWS'],['new-york','New York','LOCAL & BREAKING'],['guyana','Guyana','IN FOCUS'],['jamaica','Jamaica','KEEPING THE CONNECTION'],['saint-lucia','Saint Lucia','ISLAND VOICES'],['trinidad-tobago','Trinidad & Tobago','THE TWIN-ISLAND CONNECTION'],['haiti','Haiti','AYITI & THE DIASPORA'],['caribbean','Across the Caribbean','REGIONAL PERSPECTIVE'],['us','U.S. News','ACROSS THE UNITED STATES'],['world','World News','BEYOND OUR BORDERS']];
function activeBreaking(story){const age=Date.now()-Date.parse(story.publishedAt);return story.breaking===true&&Number.isFinite(age)&&age>=0&&age<24*60*60*1000;}
function renderRegionalNews(stories){
 for(const container of document.querySelectorAll('[data-regional-news]')){
  const selection=container.dataset.regionalNews;
  const regions=selection==='new-york'?newsRegions.slice(0,2):selection==='caribbean'?newsRegions.slice(2):newsRegions;
  container.replaceChildren();
  for(const [region,name,kicker]of regions){
   const section=document.createElement('section');section.className='regional-section';section.id='region-'+region;section.dataset.region=region;
   const heading=document.createElement('div');heading.className='regional-heading';
   const intro=document.createElement('div'),label=document.createElement('p'),title=document.createElement('h2');label.className='eyebrow';label.textContent=kicker;title.textContent=name;intro.append(label,title);
   const controls=document.createElement('div');controls.className='rail-controls';const prev=document.createElement('button'),next=document.createElement('button');prev.type=next.type='button';prev.textContent='←';next.textContent='→';prev.setAttribute('aria-label','Previous '+name+' stories');next.setAttribute('aria-label','Next '+name+' stories');controls.append(prev,next);heading.append(intro,controls);section.append(heading);
   const list=stories.filter(s=>(s.region||'caribbean')===region).sort((a,b)=>Number(activeBreaking(b))-Number(activeBreaking(a)));
   if(!list.length){const empty=document.createElement('p');empty.className='regional-empty';empty.textContent='Our newsroom is preparing original '+name+' stories. New posts appear after review.';section.append(empty);prev.disabled=next.disabled=true;}
   else{const track=document.createElement('div');track.className='news-rail';track.setAttribute('role','region');track.setAttribute('aria-label',name+' stories');track.tabIndex=0;
    for(const story of list){const card=newsCard(story);if(activeBreaking(story)){const badge=document.createElement('p');badge.className='breaking-label';badge.textContent='BREAKING • '+name;card.querySelector('.news-card-content').prepend(badge);}track.append(card);}
    const move=direction=>track.scrollBy({left:direction*Math.min(track.clientWidth,700),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    prev.onclick=()=>move(-1);next.onclick=()=>move(1);track.onkeydown=event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}};
    const update=()=>{prev.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;};track.onscroll=update;requestAnimationFrame(update);section.append(track);
   }
   container.append(section);
  }
 }
}

function renderGrid(){const feed=document.getElementById('news-feed');if(!feed)return;const term=document.getElementById('news-search')?.value.toLowerCase().trim()||'',region=document.getElementById('news-region-filter')?.value||'';const filtered=currentStories.filter(s=>(!region||s.region===region)&&(s.title+' '+s.summary).toLowerCase().includes(term));feed.replaceChildren();if(!filtered.length){feed.textContent=term?'No stories match your search.':'Our newsroom is preparing original NYC High Life Radio stories. New articles appear after editorial review.';return;}for(const story of filtered)feed.append(newsCard(story));}
async function loadNews(){try{const response=await fetch(new URL('news/index.json',newsRoot),{cache:'no-cache'});if(!response.ok)throw Error();const stories=await response.json();if(!Array.isArray(stories))throw Error();currentStories=stories.filter(s=>!document.body.dataset.category||(s.category||'news')===document.body.dataset.category);featuredNews(currentStories.filter(s=>s.featured!==false&&(!document.getElementById('featured-news')?.dataset.newsRegion||s.region===document.getElementById('featured-news').dataset.newsRegion)));renderRegionalNews(currentStories);renderGrid();}catch{const status=document.getElementById('news-status');if(status)status.textContent='The newsroom is temporarily unavailable. Please try again soon.';}}
document.getElementById('news-search')?.addEventListener('input',renderGrid);document.getElementById('news-region-filter')?.addEventListener('change',renderGrid);
loadNews();setInterval(loadNews,15*60*1000);
