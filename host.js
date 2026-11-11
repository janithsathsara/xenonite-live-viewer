import {createViewerEmbed,lazyViewer} from './embed.js';
const origin=location.origin, base=new URL('.',location.href).href;
const query=new URLSearchParams(location.search), live=query.has('server');
const server=live?new URL(query.get('server')):null;
const assets=live?(query.get('assets')||(server.protocol==='wss:'?'https://':'http://')+server.hostname+':8080'):base;
const token=query.get('token')||server?.searchParams.get('token');
const catalog=await fetch(new URL(live?'/catalog':'artifacts/catalog.json',assets),{headers:token?{Authorization:'Bearer '+token}:{}}).then(r=>{
 if(!r.ok)throw Error('Catalog unavailable ('+r.status+')');return r.json();
}).catch(e=>{document.querySelector('[role=status]').textContent=e.message;throw e;});
const item=document.querySelector('#item'),size=document.querySelector('#size');
for(const g of catalog.garments)item.add(new Option(g.displayName,g.id));
function sizes(){size.replaceChildren();for(const s of catalog.garments.find(g=>g.id===item.value).sizes)size.add(new Option(s,s));size.value='M';}
sizes();let api;
function wear(){api?.send({type:'wear',garment:item.value,size:size.value});}
item.onchange=()=>{sizes();wear();};size.onchange=wear;
lazyViewer(document.querySelector('#open'),()=>{
 const frame=document.createElement('iframe');frame.title='Virtual try-on';frame.allow='fullscreen';
 query.set('ui','minimal');query.set('garment',item.value);query.set('size',size.value);frame.src=base+'?'+query;
 api=createViewerEmbed({iframe:frame,origin,onEvent:e=>{if(e.type==='ready')document.querySelector('[role=status]').textContent='Viewer ready';if(e.type==='error')document.querySelector('[role=status]').textContent=e.message;}});
 document.querySelector('#frame').append(frame);document.querySelector('#open').hidden=true;
});

