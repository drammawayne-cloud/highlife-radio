'use strict';
(() => {
 const ignored='script,style,noscript,textarea,input,option,svg,canvas,.warm-white-text';
 function tint(root){
  if(!root?.isConnected)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),texts=[];
  for(let node=walker.nextNode();node;node=walker.nextNode())texts.push(node);
  for(const node of texts){
   const parent=node.parentElement;if(!parent||!node.textContent.trim()||parent.closest(ignored))continue;
   const style=getComputedStyle(parent);if(style.webkitTextFillColor==='rgba(0, 0, 0, 0)')continue;
   const rgb=style.color.match(/[\d.]+/g)?.map(Number);if(!rgb||rgb.length<3||(rgb.length>3&&rgb[3]<.3))continue;
   const values=rgb.slice(0,3);if(Math.min(...values)<150||Math.max(...values)-Math.min(...values)>65)continue;
   const span=document.createElement('span');span.className='warm-white-text';node.replaceWith(span);span.append(node);
  }
 }
 tint(document.body);
 const pending=new Set();let frame=0;
 new MutationObserver(records=>{
  for(const record of records){
   if(record.target.parentElement?.closest('.warm-white-text'))continue;
   if(record.type==='characterData')pending.add(record.target.parentElement);
   for(const node of record.addedNodes)if(node.nodeType===1&&!node.classList.contains('warm-white-text'))pending.add(node);else if(node.nodeType===3)pending.add(node.parentElement);
  }
  if(!frame&&pending.size)frame=requestAnimationFrame(()=>{frame=0;for(const root of pending)tint(root);pending.clear();});
 }).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
