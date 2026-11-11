'use strict';
(() => {
 const screen=document.querySelector('[data-station-screen]');if(!screen)return;
 let expanded=false,lastTap=0,lastX=0,lastY=0,lastToggle=-1000,previousOverflow='';
 screen.tabIndex=0;screen.setAttribute('role','button');screen.setAttribute('aria-label','Expand station picture');
 function collapse(){expanded=false;screen.classList.remove('is-expanded');document.body.style.overflow=previousOverflow;screen.setAttribute('aria-label','Expand station picture');}
 async function toggleFullscreen(){
  const now=performance.now();if(now-lastToggle<500)return;lastToggle=now;
  if(document.fullscreenElement===screen){await document.exitFullscreen();return;}
  if(expanded){collapse();return;}
  if(screen.requestFullscreen){try{await screen.requestFullscreen();screen.setAttribute('aria-label','Return from full screen');return;}catch{}}
  previousOverflow=document.body.style.overflow;expanded=true;screen.classList.add('is-expanded');document.body.style.overflow='hidden';screen.setAttribute('aria-label','Return from full screen');
 }
 screen.addEventListener('click',event=>{
  if(event.button!==0)return;
  const now=performance.now();
  if(now-lastTap<350&&Math.hypot(event.clientX-lastX,event.clientY-lastY)<45){lastTap=0;event.preventDefault();void toggleFullscreen();}
  else{lastTap=now;lastX=event.clientX;lastY=event.clientY;}
 });
 screen.addEventListener('dblclick',event=>{event.preventDefault();void toggleFullscreen();});
 screen.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();void toggleFullscreen();}});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&expanded)collapse();});
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)screen.setAttribute('aria-label','Expand station picture');});
})();
