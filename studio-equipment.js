/* Decorative equipment lighting, aligned to the studio photograph, not audio metering. */
(()=>{
  'use strict';
  const mount=()=>{
    if(document.querySelector('.studio-equipment'))return;
    const ns='http://www.w3.org/2000/svg';
    const layer=document.createElement('div');layer.className='studio-equipment';layer.setAttribute('aria-hidden','true');
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1672 941');svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    const rect=(x,y,w,h,color,kind,delay)=>{const r=document.createElementNS(ns,'rect');for(const[k,v]of Object.entries({x,y,width:w,height:h,rx:.7,fill:color,class:kind}))r.setAttribute(k,String(v));r.style.animationDelay=`${delay}s`;svg.append(r);return r;};
    // Match the small meter windows above the photographed mixing console.
    [[504,729],[643,721],[799,713],[965,702],[1140,701]].forEach(([x,y],i)=>{
      for(let col=0;col<3;col++){
        const bar=rect(x+col*5,y,3,24,'#8bff50','studio-meter',-(i*.43+col*.27));
        bar.style.transformOrigin=`${x+col*5+1.5}px ${y+24}px`;bar.style.animationDuration=`${1.8+(i+col)%4*.37}s`;
        rect(x+col*5,y-4,3,2,'#ffd75a','studio-peak',-(i*.5+col*.21));
      }
    });
    // Rack status lamps and console channel buttons stay attached to the equipment.
    [[63,786],[89,784],[116,781],[144,778],[173,775],[202,772],[1478,653],[1510,653],[1540,650],[1570,648],[1600,645],
      [519,826],[586,820],[675,813],[760,810],[843,798],[934,792],[1030,785],[1112,783],[1201,777],[1280,775]].forEach(([x,y],i)=>{
      const r=rect(x,y,i<11?5:7,3,i%4===0?'#ffb954':i%5===0?'#ff7863':'#83ff9b','studio-status',-i*.29);r.style.animationDuration=`${2.2+i%5*.41}s`;
    });
    layer.append(svg);document.body.prepend(layer);
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
    const button=document.createElement('button');button.type='button';button.className='studio-light-toggle';
    const update=()=>{document.documentElement.classList.toggle('studio-lights-paused',paused);button.setAttribute('aria-pressed',String(!paused));button.setAttribute('aria-label',paused?'Start studio equipment lights':'Pause studio equipment lights');button.title=paused?'Start studio equipment lights':'Pause studio equipment lights';button.textContent=paused?'◌':'◉';};
    button.addEventListener('click',()=>{paused=!paused;update();});
    reduced.addEventListener('change',event=>{paused=event.matches;update();});
    (document.querySelector('.head-actions')||document.querySelector('footer')||document.body).append(button);
    update();
    document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('studio-lights-hidden',document.hidden));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
