// @ts-nocheck -- verbatim vanilla-JS port from the source export; see note below.
/**
 * Ported verbatim from the approved Sketchbook Design Component export
 * (public/models/Sketchbook.zip -> _build/Sketchbook.dc.html).
 *
 * The interactive book (page-curl, drag, tilt, zoom, magnifier) is plain
 * DOM/CSS3D/vanilla-JS, exactly as authored in the source export. It is
 * mounted into a local, self-contained sandboxed iframe via `srcdoc` -- the
 * same mechanism the source export itself uses ("no CORS issues"). Nothing
 * here fetches an external site; the entire document, including the nine
 * Sadie Sink plate SVGs, is generated inline as data URIs.
 *
 * Do not hand-edit the plate/interaction logic below -- it is the literal
 * source-of-truth implementation, only mechanically adapted from a class
 * method (`this.props`) into a plain function taking explicit config.
 */

export interface SketchbookDocConfig {
  startPlate?: number;
  magnifier?: boolean;
  intro?: boolean;
}

interface SketchbookPage {
  title: string;
  place: string;
  url: string;
}

function spreads(): SketchbookPage[] {
    const W=1760,H=790,X0=40,X1=1720,Y0=42,Y1=748,G=880;
    const SER="Georgia,'Times New Roman',serif";
    const HAND="'Snell Roundhand','Apple Chancery','Segoe Script','Brush Script MT',cursive";
    const INK='#3b342b', SOFT='#6d6354', FAINT='#a0977f', RED='#9d3b30';
    const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const T=(x,y,t,o)=>{o=o||{};return '<text x="'+x+'" y="'+y+'" font-family="'+(o.f||SER)+'" font-size="'+(o.s||24)+'" fill="'+(o.c||INK)+'" letter-spacing="'+(o.ls||0)+'" text-anchor="'+(o.a||'start')+'" font-style="'+(o.i?'italic':'normal')+'" opacity="'+(o.o==null?1:o.o)+'">'+esc(t)+'</text>';};
    const kick=(x,y,t,o)=>T(x,y,t,Object.assign({s:18,ls:5.2,c:FAINT},o||{}));
    const hand=(x,y,arr,o)=>{o=o||{};let s='';arr.forEach((l,i)=>{s+=T(x,y+i*(o.dy||46),l,{f:HAND,s:o.s||31,c:o.c||SOFT});});return s;};
    const rule=(x,y,w,c,h)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+(h||1)+'" fill="'+(c||'#c9c0ad')+'"/>';
    const tape=(x,y,w,h,r)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#e7dcc2" opacity=".68" transform="rotate('+r+' '+(x+w/2)+' '+(y+h/2)+')"/>';
    const frame=(x,y,w,h,label,taped)=>{
      let s='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#f3ecdf" stroke="#cfc6b1" stroke-width="1"/>';
      const m=Math.round(Math.min(w,h)*0.055);
      s+='<rect x="'+(x+m)+'" y="'+(y+m)+'" width="'+(w-2*m)+'" height="'+(h-2*m)+'" fill="url(#tone)" stroke="#b9b0a0" stroke-width="1"/>';
      s+='<line x1="'+(x+m)+'" y1="'+(y+m)+'" x2="'+(x+w-m)+'" y2="'+(y+h-m)+'" stroke="#a89f8e" stroke-width="1" opacity=".28"/>';
      s+='<line x1="'+(x+w-m)+'" y1="'+(y+m)+'" x2="'+(x+m)+'" y2="'+(y+h-m)+'" stroke="#a89f8e" stroke-width="1" opacity=".28"/>';
      if(label) s+=T(x+w/2,y+h/2+6,label,{s:16,ls:4.4,c:'#8b8271',a:'middle'});
      if(taped){ s+=tape(x-26,y-16,96,34,-24)+tape(x+w-70,y+h-18,96,34,-24); }
      return s;
    };
    const swatch=(x,y,w,h,fill,label)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" opacity=".9"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="#00000018"/>'+T(x,y+h+34,label,{f:HAND,s:26,c:SOFT});
    const strip=(x,y,w,h,n)=>{
      let s='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#3a3630"/>';
      for(let i=0;i<Math.floor(w/44);i++){s+='<rect x="'+(x+12+i*44)+'" y="'+(y+9)+'" width="18" height="12" rx="2" fill="#efe9dd" opacity=".8"/>';s+='<rect x="'+(x+12+i*44)+'" y="'+(y+h-21)+'" width="18" height="12" rx="2" fill="#efe9dd" opacity=".8"/>';}
      const fw=(w-24-(n-1)*14)/n;
      for(let i=0;i<n;i++){s+='<rect x="'+(x+12+i*(fw+14))+'" y="'+(y+30)+'" width="'+fw+'" height="'+(h-60)+'" fill="url(#tone)"/>';}
      return s;
    };
    const folio=(x,y,t)=>T(x,y,t,{s:17,ls:2.4,c:FAINT});

    const plates=[
      {title:'Frontispiece', place:'Title Page', draw:()=>
        kick(160,372,'PLATE ONE')+
        T(160,486,'SADIE',{s:104})+T(160,596,'SINK',{s:104})+
        rule(160,636,236,RED,3)+
        T(160,708,'a sketchbook',{s:38,i:true,c:SOFT})+
        hand(160,790,['gathered notes, plates','& annotations'],{s:29})+
        frame(985,320,530,520,'PORTRAIT PLATE',true)+
        hand(985,900,['frontispiece — to be tipped in'],{s:27})},

      {title:'Portrait Study I', place:'Half-light', draw:()=>
        frame(160,318,580,560,'PLATE / PORTRAIT',true)+
        folio(160,918,'01')+
        kick(985,368,'STUDY I')+
        T(985,442,'Portrait, half-light',{s:48})+
        rule(985,470,300,'#cfc6b1')+
        hand(985,540,['quarter turn, chin low —','the lamp kept high and left,','the rest left to the paper.'],{s:30})+
        '<circle cx="1560" cy="392" r="24" fill="none" stroke="'+RED+'" stroke-width="1.6"/>'+T(1560,400,'01',{s:19,c:RED,a:'middle'})+
        rule(985,760,530,'#d5ccb9')+rule(985,812,530,'#d5ccb9')+rule(985,864,420,'#d5ccb9')},

      {title:'Colour Note', place:'Red', draw:()=>
        kick(160,372,'COLOUR NOTE')+
        T(160,470,'Red',{s:86})+
        rule(160,506,150,RED,2)+
        swatch(160,600,110,140,'#7c2b24','carmine')+
        swatch(292,600,110,140,'#a8443a','brick')+
        swatch(424,600,110,140,'#c25a44','ember')+
        swatch(556,600,110,140,'#8f5a4a','rust')+
        hand(985,420,['one red only, and not much of it.','the page carries the rest in','graphite and paper tone —','the red is punctuation.'],{s:30})+
        rule(985,700,530,'#d5ccb9')+
        frame(985,740,300,180,'SWATCH')+
        folio(1620,918,'02')},

      {title:'Screen Test', place:'Roll 04', draw:()=>
        kick(160,362,'SCREEN TEST')+T(160,428,'Roll 04',{s:44})+
        strip(160,480,580,220,3)+
        hand(160,780,['frames 4–6, no flash'],{s:28})+
        strip(985,480,530,220,3)+
        hand(985,780,['keep the third one'],{s:28})+
        '<circle cx="1560" cy="806" r="20" fill="none" stroke="'+RED+'" stroke-width="1.6"/>'+
        folio(1620,918,'03')},

      {title:'Stage Notes', place:'Wings', draw:()=>
        kick(160,372,'STAGE NOTES')+
        T(160,452,'From the wings',{s:52})+
        rule(160,486,340,'#cfc6b1')+
        rule(160,560,580,'#d5ccb9')+rule(160,614,580,'#d5ccb9')+rule(160,668,580,'#d5ccb9')+rule(160,722,460,'#d5ccb9')+
        hand(160,548,['half-hour call — everything still.'],{s:29})+
        hand(160,656,['light comes in from stage left'],{s:29})+
        frame(985,330,530,470,'PLATE / STAGE')+
        hand(985,868,['drawn between two cues'],{s:27})+
        folio(1620,918,'04')},

      {title:'Wardrobe', place:'Fitting Room', draw:()=>
        kick(160,372,'WARDROBE')+
        frame(160,420,180,300,'COAT')+frame(360,420,180,300,'SHIRT')+frame(560,420,180,300,'BOOT')+
        hand(160,800,['three looks, one palette'],{s:28})+
        T(985,400,'Fabric',{s:46})+
        swatch(985,450,100,120,'#8d8776','wool')+
        swatch(1105,450,100,120,'#c8c0ad','linen')+
        swatch(1225,450,100,120,'#4a463f','denim')+
        swatch(1345,450,100,120,'#9d3b30','silk')+
        hand(985,700,['thread sample stapled below —','matched to the silk.'],{s:29})+
        rule(985,790,530,RED,2)+
        folio(1620,918,'05')},

      {title:'Portrait Study II', place:'Late Afternoon', draw:()=>
        kick(160,372,'STUDY II')+
        T(160,446,'Late afternoon',{s:48})+
        hand(160,540,['four minutes of light left,','so: outline only.'],{s:30})+
        '<rect x="160" y="660" width="240" height="76" fill="none" stroke="'+RED+'" stroke-width="1.4"/>'+
        T(280,708,'OCT 24',{s:24,ls:4,c:RED,a:'middle'})+
        hand(160,830,['paper: cold press, warm tone'],{s:26})+
        frame(985,300,530,600,'PLATE / PORTRAIT',true)+
        folio(1620,940,'06')},

      {title:'Chronology', place:'Index', draw:()=>{
        let s=kick(160,362,'CHRONOLOGY')+T(160,434,'Index of plates',{s:46})+rule(160,468,580,'#cfc6b1');
        for(let i=0;i<5;i++){s+=folio(160,540+i*62,String(i+1).padStart(2,'0'))+rule(215,548+i*62,525,'#d9d0bd');}
        for(let i=0;i<4;i++){s+=folio(985,540+i*62,String(i+6).padStart(2,'0'))+rule(1040,548+i*62,475,'#d9d0bd');}
        return s+hand(985,860,['to be filled in','as they arrive'],{s:26,dy:38});}},

      {title:'Colophon', place:'End', draw:()=>
        '<circle cx="450" cy="620" r="150" fill="none" stroke="#cfc6b1" stroke-width="1" opacity=".6"/>'+
        T(450,632,'S · S',{s:44,c:FAINT,ls:8,a:'middle'})+
        kick(985,420,'COLOPHON')+
        T(985,510,'Set in Georgia',{s:38,i:true,c:SOFT})+
        hand(985,600,['nine plates, drawn on','cold-press paper.','photographs to be tipped in.'],{s:29})+
        rule(985,760,120,RED,2)+
        T(985,830,'END',{s:22,ls:7,c:FAINT})+
        folio(1620,940,'09')}
    ];

    const base=
      '<defs>'+
      '<linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#faf6ec"/><stop offset="1" stop-color="#efe8d9"/></linearGradient>'+
      '<linearGradient id="gutL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a6a4d" stop-opacity="0"/><stop offset="1" stop-color="#7a6a4d" stop-opacity=".30"/></linearGradient>'+
      '<linearGradient id="gutR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a6a4d" stop-opacity=".26"/><stop offset="1" stop-color="#7a6a4d" stop-opacity="0"/></linearGradient>'+
      '<linearGradient id="tone" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#dcd6c9"/><stop offset="1" stop-color="#c6bfb1"/></linearGradient>'+
      '<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>'+
      '</defs>';

    return plates.map(p=>{
      let s='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+base;
      s+='<rect x="'+(X0-7)+'" y="'+(Y0+9)+'" width="'+(X1-X0+14)+'" height="'+(Y1-Y0-4)+'" rx="7" fill="#ded6c4"/>';
      s+='<rect x="'+(X0-3)+'" y="'+(Y0+5)+'" width="'+(X1-X0+6)+'" height="'+(Y1-Y0-2)+'" rx="6" fill="#e8e1d0"/>';
      s+='<rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(Y1-Y0)+'" rx="4" fill="url(#pg)"/>';
      s+='<g transform="translate(-50,-228)">'+p.draw()+'</g>';
      s+='<rect x="'+(G-96)+'" y="'+Y0+'" width="96" height="'+(Y1-Y0)+'" fill="url(#gutL)"/>';
      s+='<rect x="'+G+'" y="'+Y0+'" width="90" height="'+(Y1-Y0)+'" fill="url(#gutR)"/>';
      s+='<rect x="'+(G-1)+'" y="'+Y0+'" width="2" height="'+(Y1-Y0)+'" fill="#8b7c5f" opacity=".28"/>';
      s+='<rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(Y1-Y0)+'" rx="4" fill="#8a7f66" opacity=".05" filter="url(#gr)"/>';
      s+='<rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(Y1-Y0)+'" rx="4" fill="none" stroke="#b6ab92" stroke-width="1" opacity=".7"/>';
      s+='</svg>';
      return {title:p.title, place:p.place, url:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)};
    });
  }


export function buildSketchbookDoc(config: SketchbookDocConfig): string {
  const pages = spreads();
  const cfg = {
    start: Math.max(0, Math.min(pages.length - 1, config.startPlate ?? 0)),
    intro: config.intro ?? true,
    loupe: config.magnifier ?? true,
  };
  const js = `
const CFG=${JSON.stringify(cfg)};
const PAGES=${JSON.stringify(pages)};
const M=PAGES.length, LAND=6;

const wrap=document.getElementById('sbWrap');
const stage=document.getElementById('sbStage');
const sb3d=document.getElementById('sb3d');
const book=document.getElementById('sbBook');
const capBox=document.getElementById('sbCaptions');
const hint=document.getElementById('sbHint');
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------ the turning leaf */
const N=18;            /* strips — enough for a smooth curve          */
const SPAN=0.449;      /* gutter to outer page edge, as a fraction     */
const BETA=0.60;       /* peak curl of the arc, radians               */
let idx=0, turn=null;
let strips=[];

function el(t,c){const e=document.createElement(t);if(c)e.className=c;return e}
function imgEl(i,side){
  const im=new Image();im.className='sb-half-img '+side;
  im.draggable=false;im.alt='';im.src=PAGES[i].url;return im;
}
function halfEl(pos,i){
  const d=el('div','sb-half '+pos);
  d.appendChild(imgEl(i,pos));
  d.appendChild(el('div','gutter-shade '+pos));
  return d;
}
function buildCurl(dir,from,to){
  strips=[];
  const c=el('div','curl '+dir);
  c.style.setProperty('--n',N);
  c.style.setProperty('--span',SPAN);
  let host=c;
  for(let i=0;i<N;i++){
    const s=el('div','strip');
    s.style.setProperty('--i',i);
    const gut='calc(var(--bw) * 0.5)';
    const sw='calc(var(--bw) * '+SPAN+' / '+N+')';
    const A='calc(-1 * ('+gut+' + '+i+' * '+sw+'))';
    const B='calc('+(i+1)+' * '+sw+' - '+gut+')';
    const f=el('div','face front'), b=el('div','face back');
    const dress=(e,url,px)=>{
      e.style.backgroundImage='url("'+url+'")';
      e.style.backgroundPositionX=px;
    };
    dress(f,PAGES[from].url, dir==='next'?A:B);
    dress(b,PAGES[to].url,   dir==='next'?B:A);
    f.appendChild(el('div','sh'));f.appendChild(el('div','gl'));
    b.appendChild(el('div','sh'));b.appendChild(el('div','gl'));
    s.appendChild(f);s.appendChild(b);
    if(i===N-1)s.classList.add('edge');
    host.appendChild(s);host=s;
    strips.push(s);
  }
  return c;
}
function applyTurn(t){
  const th=Math.PI*t;
  const beta=BETA*Math.sin(Math.PI*t);
  const D=180/Math.PI;
  const tt=th+beta, td=2*beta/N;
  sb3d.style.setProperty('--tt',(tt*D).toFixed(2)+'deg');
  sb3d.style.setProperty('--td',(td*D).toFixed(3)+'deg');
  sb3d.style.setProperty('--shade',Math.sin(Math.PI*t).toFixed(3));
  fadeCaption(t);
  for(let i=0;i<strips.length;i++){
    const l1=Math.abs(Math.cos(tt-i*td));
    const l2=Math.abs(Math.cos(tt-(i+1)*td));
    const st=strips[i].style;
    st.setProperty('--lit',l1.toFixed(3));
    st.setProperty('--a1',((1-l1)*.62).toFixed(3));
    st.setProperty('--a2',((1-l2)*.62).toFixed(3));
  }
}
function paint(){
  book.textContent='';
  if(!turn){
    const f=el('div','sb-full');
    const im=new Image();im.src=PAGES[idx].url;im.alt=PAGES[idx].title;
    im.draggable=false;
    f.appendChild(im);book.appendChild(f);
    sb3d.style.setProperty('--shade','0');
  }else{
    const next=turn.dir==='next';
    book.appendChild(halfEl('left', next?turn.from:turn.to));
    book.appendChild(halfEl('right',next?turn.to:turn.from));
    book.appendChild(buildCurl(turn.dir,turn.from,turn.to));
    applyTurn(turn.t);
  }
  const a=el('button','sb-zone sb-prev'),b=el('button','sb-zone sb-next');
  a.setAttribute('aria-label','previous page');b.setAttribute('aria-label','next page');
  book.appendChild(a);book.appendChild(b);
  layout();
  caption();
  marks();
  if(typeof syncZoomLayer==='function')syncZoomLayer();
  if(typeof placeLoupe==='function')placeLoupe();
}
function caption(){
  capBox.textContent='';
  capOut=capIn=null;
  if(turn){
    capOut=el('p','sb-caption live');capOut.textContent=PAGES[turn.from].title;capBox.appendChild(capOut);
    capIn=el('p','sb-caption live');capIn.textContent=PAGES[turn.to].title;capBox.appendChild(capIn);
    fadeCaption(turn.t);
  }else{
    const p=el('p','sb-caption');p.textContent=PAGES[idx].title;capBox.appendChild(p);
  }
}
let capOut=null,capIn=null;
function fadeCaption(t){
  if(!capOut||!capIn)return;
  const out=1-Math.max(0,Math.min(1,(t-0.10)/0.28));
  const inn=Math.max(0,Math.min(1,(t-0.56)/0.30));
  capOut.style.opacity=out.toFixed(3);
  capIn.style.opacity=inn.toFixed(3);
}
function layout(){
  sb3d.style.setProperty('--bw',book.clientWidth+'px');
}
addEventListener('resize',layout);

/* ------------------------------------------------------ spring loop */
let spring=null;
function animateTo(target,onDone,stiff,damp){
  spring={kind:'spring',v:0,target:target,done:onDone,k:stiff||150,c:damp||22};
  kick();
}
function tweenTo(target,dur,onDone){
  spring={kind:'tween',from:turn?turn.t:0,target:target,dur:dur,e:0,done:onDone};
  kick();
}
let raf=null,last=0;
function tick(now){
  raf=null;
  const dt=Math.min(0.032,(now-last)/1000||0.016);last=now;
  if(spring&&turn){
    const s=spring;
    if(s.kind==='tween'){
      s.e+=dt;
      const k=Math.min(1,s.e/s.dur);
      turn.t=s.from+(s.target-s.from)*k;
      applyTurn(turn.t);
      if(k>=1){spring=null;const d=s.done;d&&d();}
    }else{
      const x=turn.t-s.target;
      s.v+= (-s.k*x - s.c*s.v)*dt;
      turn.t+=s.v*dt;
      if(Math.abs(turn.t-s.target)<0.002&&Math.abs(s.v)<0.02){
        turn.t=s.target;spring=null;
        applyTurn(turn.t);
        const d=s.done;d&&d();
      }else applyTurn(turn.t);
    }
  }
  viewSpring();
  const lmoved=loupeEase();
  if((spring||viewActive||lmoved)&&raf===null) raf=requestAnimationFrame(tick);
}
function kick(){ if(raf===null){last=performance.now();raf=requestAnimationFrame(tick);} }

/* ------------------------------------------- tilt + zoom of the book */
const TILT_X=4.5, TILT_Y=7;
const ZOOM_MIN=0.9, ZOOM_MAX=1.5;
const view={rx:0,ry:0,z:1, trx:0,try_:0,tz:1};
let viewActive=false;
let lastZ=1;
function applyView(){
  sb3d.style.setProperty('--rx',view.rx.toFixed(2)+'deg');
  sb3d.style.setProperty('--ry',view.ry.toFixed(2)+'deg');
  sb3d.style.setProperty('--zoom',view.z.toFixed(3));
  if(view.z!==lastZ){lastZ=view.z;if(typeof placeLoupe==='function')placeLoupe();}
}
function viewSpring(){
  const e=0.14;
  let moved=false;
  for(const [k,t] of [['rx','trx'],['ry','try_'],['z','tz']]){
    const d=view[t]-view[k];
    if(Math.abs(d)>0.0006){view[k]+=d*e;moved=true;}
    else view[k]=view[t];
  }
  if(moved)applyView();
  viewActive=moved;
  return moved;
}
function setView(rx,ry,z){
  view.trx=Math.max(-TILT_X,Math.min(TILT_X,rx));
  view.try_=Math.max(-TILT_Y,Math.min(TILT_Y,ry));
  view.tz=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,z));
  viewActive=true;kick();
  if(typeof syncZoom==='function')syncZoom();
}
function tiltTo(cx,cy){
  if(drag)return;
  const r=book.getBoundingClientRect();
  if(!r.width)return;
  const nx=Math.max(-1,Math.min(1,(cx-(r.left+r.width/2))/(r.width*0.62)));
  const ny=Math.max(-1,Math.min(1,(cy-(r.top+r.height/2))/(r.height*0.9)));
  setView(-ny*TILT_X, nx*TILT_Y, view.tz);
}
addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  tiltTo(e.clientX,e.clientY);
},{passive:true});
addEventListener('pointerout',e=>{if(!e.relatedTarget)setView(0,0,view.tz)});
addEventListener('blur',()=>setView(0,0,view.tz));
stage.addEventListener('dblclick',()=>setView(view.trx,view.try_,1));

/* ------------------------------------------------------- pointer work */
let drag=null;
function bookRect(){return book.getBoundingClientRect()}
function hideHint(){hint.classList.add('gone')}

stage.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  e.preventDefault();
  const onBook=e.target.closest('.sb-zone');
  stage.setPointerCapture(e.pointerId);
  hideHint();
  if(!onBook||introOn)return;
  const r=bookRect();
  const dir=(e.clientX-r.left)/r.width>0.5?'next':'prev';
  startTurn(dir,0);
  drag={dir:dir,x0:e.clientX,w:r.width,moved:0,vel:0,tPrev:performance.now()};
});
stage.addEventListener('pointermove',e=>{
  if(!drag)return;
  const dx=e.clientX-drag.x0;
  drag.moved=Math.max(drag.moved,Math.abs(dx));
  const raw=(drag.dir==='next'? -dx : dx)/(drag.w*0.62);
  const t=Math.max(0,Math.min(1,raw));
  const now=performance.now();
  drag.vel=(t-(turn?turn.t:0))/Math.max(0.001,(now-drag.tPrev)/1000);
  drag.tPrev=now;
  if(turn){turn.t=t;applyTurn(t);}
});
function endDrag(e){
  if(!drag)return;
  const d=drag;drag=null;
  if(!turn)return;
  if(d.moved<6){commit();return;}
  const go = turn.t>0.42 || d.vel>1.1;
  if(go)commit(); else cancel();
}
stage.addEventListener('dragstart',e=>e.preventDefault());
stage.addEventListener('selectstart',e=>e.preventDefault());
stage.addEventListener('pointerup',endDrag);
stage.addEventListener('pointercancel',endDrag);

/* ------------------------------------------------------ turn control */
function startTurn(dir,t){
  spring=null;
  if(turn){idx=turn.to;turn=null;}
  if(typeof shoveLoupe==='function')shoveLoupe(dir);
  const from=idx;
  turn={dir:dir,from:from,to:dir==='next'?(from+1)%M:(from-1+M)%M,t:t||0};
  paint();
}
function commit(){
  if(!turn)return;
  if(REDUCED){idx=turn.to;turn=null;paint();return;}
  animateTo(1,()=>{idx=turn.to;turn=null;paint();},170,26);
  kick();
}
function cancel(){
  if(!turn)return;
  animateTo(0,()=>{turn=null;paint();},150,24);
  kick();
}
function step(dir){
  if(introOn)endIntro();
  if(turn){ idx=turn.to;turn=null; }
  startTurn(dir,0);commit();
}
function goTo(i){
  if(introOn)endIntro();
  if(i===idx)return;
  if(turn){idx=turn.to;turn=null;}
  const fwd=(i-idx+M)%M, back=(idx-i+M)%M;
  if(Math.min(fwd,back)===1){step(fwd===1?'next':'prev');return;}
  idx=i;paint();
}
document.getElementById('sbLeft').onclick=()=>step('prev');
document.getElementById('sbRight').onclick=()=>step('next');
addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  e.preventDefault();hideHint();
  step(e.key==='ArrowRight'?'next':'prev');
});

/* --------------------------------------------------- loupe + controls */
const loupe=document.getElementById('loupe');
const lens=document.getElementById('loupeLens');
const zRead=document.getElementById('zRead');
const loupeBtn=document.getElementById('loupeBtn');
const zInBtn=document.getElementById('zIn'), zOutBtn=document.getElementById('zOut');
const MAG=2.3;
let loupeOn=CFG.loupe, lx=null, ly=null, lgrab=null, lTarget=null;
loupeBtn.setAttribute('aria-pressed',String(loupeOn));

function loupeSize(){return Math.round(Math.max(88,Math.min(148,book.clientWidth*0.20)));}
function bookBox(){
  return {x:0,y:0,w:book.clientWidth,h:book.clientHeight};
}
function restLoupe(){
  const b=bookBox();
  lx=b.x+b.w*0.855; ly=b.y+b.h*0.74;
  placeLoupe();
}
const zoomWrap=document.getElementById('zoomWrap');
const zoomInner=document.getElementById('zoomInner');
function syncZoomLayer(){
  zoomInner.textContent='';
  for(const c of book.children){
    if(c.classList.contains('sb-zone'))continue;
    zoomInner.appendChild(c.cloneNode(true));
  }
}
function placeLoupe(){
  if(lx===null)return;
  const B=bookBox(), bw=B.w, bh=B.h;
  if(!bw)return;
  const R=loupeSize()/2, bez=R*2*0.058;
  loupe.style.setProperty('--lr',R*2+'px');
  loupe.style.transform='translate3d('+(lx-R).toFixed(1)+'px,'+(ly-R).toFixed(1)+'px,0)';
  if(loupeOn)loupe.classList.add('on');

  const z=view.z, cx=bw/2, cy=bh/2;
  const x0=cx+(bw*.023-cx)*z, x1=cx+(bw*.977-cx)*z;
  const y0=cy+(bh*.053-cy)*z, y1=cy+(bh*.947-cy)*z;
  const nx=Math.max(x0,Math.min(lx,x1));
  const ny=Math.max(y0,Math.min(ly,y1));
  const inside=(lx>x0&&lx<x1&&ly>y0&&ly<y1)
    ? Math.min(lx-x0, x1-lx, ly-y0, y1-ly)
    : -Math.hypot(lx-nx,ly-ny);
  const k=Math.max(0,Math.min(1,(inside+R*0.30)/(R*0.55)));

  zoomWrap.style.opacity=(loupeOn?k:0).toFixed(3);
  if(k<=0.002)return;
  const r=(R-bez).toFixed(1);
  const mask='radial-gradient(circle '+r+'px at '+lx.toFixed(1)+'px '+ly.toFixed(1)+'px,'
    +'#000 calc(100% - 1px),transparent 100%)';
  zoomWrap.style.webkitMaskImage=mask;
  zoomWrap.style.maskImage=mask;
  const px=cx+(lx-cx)/z, py=cy+(ly-cy)/z, s=MAG*z;
  zoomInner.style.transform='translate('+(lx-px*s).toFixed(1)+'px,'+(ly-py*s).toFixed(1)+'px) '
    +'scale('+s.toFixed(4)+')';
}
function shoveLoupe(dir){
  if(!loupeOn||lx===null||lgrab)return;
  const b=bookBox();
  const nx=(b.w/2+(lx-b.x-b.w/2)/view.z)/b.w, ny=(b.h/2+(ly-b.y-b.h/2)/view.z)/b.h;
  if(nx<0.02||nx>0.98||ny<0.04||ny>0.96)return;
  lTarget={x:b.x+b.w*(dir==='next'?0.145:0.855), y:b.y+b.h*0.74};
  kick();
}
function loupeEase(){
  if(!lTarget)return false;
  if(lgrab){lTarget=null;return false;}
  const dx=lTarget.x-lx, dy=lTarget.y-ly;
  if(Math.abs(dx)<0.5&&Math.abs(dy)<0.5){lx=lTarget.x;ly=lTarget.y;lTarget=null;placeLoupe();return false;}
  lx+=dx*0.17;ly+=dy*0.17;placeLoupe();
  return true;
}
loupe.addEventListener('pointerdown',e=>{
  if(!loupeOn||e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  lTarget=null;
  lgrab={cx:e.clientX,cy:e.clientY,lx0:lx,ly0:ly};
  loupe.classList.add('held');
  loupe.setPointerCapture(e.pointerId);
  hideHint();
});
loupe.addEventListener('pointermove',e=>{
  if(!lgrab)return;
  const b=bookBox(), R=loupeSize()/2;
  lx=Math.max(b.x-R*0.7,Math.min(b.x+b.w+R*0.7, lgrab.lx0+(e.clientX-lgrab.cx)));
  ly=Math.max(b.y-R*0.7,Math.min(b.y+b.h+R*1.0, lgrab.ly0+(e.clientY-lgrab.cy)));
  placeLoupe();
});
function dropLoupe(){lgrab=null;loupe.classList.remove('held');}
loupe.addEventListener('pointerup',dropLoupe);
loupe.addEventListener('pointercancel',dropLoupe);
loupeBtn.onclick=()=>{
  loupeOn=!loupeOn;
  loupeBtn.setAttribute('aria-pressed',String(loupeOn));
  loupe.classList.toggle('on',loupeOn);
  if(loupeOn&&lx===null)restLoupe();
  if(!loupeOn)zoomWrap.style.opacity='0';
};
addEventListener('resize',()=>{lx=null;restLoupe();});

function syncZoom(){
  zRead.textContent=Math.round(view.tz*100)+'%';
  zOutBtn.disabled=view.tz<=ZOOM_MIN+0.001;
  zInBtn.disabled=view.tz>=ZOOM_MAX-0.001;
}
zInBtn.onclick=()=>{setView(view.trx,view.try_,view.tz*1.16);hideHint();};
zOutBtn.onclick=()=>{setView(view.trx,view.try_,view.tz/1.16);hideHint();};

/* --------------------------------------------------------- the index */
const plateList=document.getElementById('plateList');
PAGES.forEach((p,i)=>{
  const li=el('li');
  const b=el('button','plate');
  b.innerHTML='<span class="n"></span><span class="t"></span><span class="p"></span>';
  b.querySelector('.n').textContent=String(i+1).padStart(2,'0');
  b.querySelector('.t').textContent=p.title;
  b.querySelector('.p').textContent=p.place;
  b.onclick=()=>goTo(i);
  li.appendChild(b);plateList.appendChild(li);
});
function marks(){
  const cur=turn?turn.to:idx;
  plateList.querySelectorAll('.plate').forEach((b,i)=>b.setAttribute('aria-current',i===cur?'true':'false'));
}

/* ---------------------------------------------------------- the riffle */
let riffle=null,riffleAt=0,introOn=false;
function endIntro(){
  introOn=false;wrap.classList.remove('intro','b2');
}
function riffleStep(){
  const s=riffle[riffleAt];
  wrap.classList.toggle('b2',s.bell>0.55);
  startTurn('next',0);
  tweenTo(1,s.dur,()=>{
    idx=turn.to;turn=null;
    riffleAt++;
    if(introOn&&riffleAt<riffle.length){paint();riffleStep();}
    else{endIntro();paint();}
  });
}
function startIntro(){
  const coarse=matchMedia('(max-width: 640px), (pointer: coarse)').matches;
  if(coarse||REDUCED||!CFG.intro){paint();return;}
  const steps=M+LAND;
  riffle=[];
  for(let r=0;r<steps;r++){
    const bell=Math.sin(Math.PI*(r/(steps-1)));
    riffle.push({bell:bell,dur:0.26-0.19*bell});
  }
  riffleAt=0;introOn=true;wrap.classList.add('intro');
  riffleStep();
}

/* ------------------------------------------------------------- boot */
(async function boot(){
  idx=CFG.start;
  paint();applyView();
  await Promise.all(PAGES.map(p=>{
    const im=new Image();im.src=p.url;
    return im.decode?im.decode().catch(()=>{}):new Promise(r=>{im.onload=im.onerror=r});
  }));
  if(document.fonts&&document.fonts.ready)await document.fonts.ready.catch(()=>{});
  syncZoom();if(loupeOn)restLoupe();
  document.body.dataset.ready='1';
  setTimeout(startIntro,220);
})();
`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sketchbook</title>
<style>
:root{
  --paper:#ece7dc;
  --ink:#2b2721;
  --ink-soft:rgba(43,39,33,.58);
  --ink-faint:rgba(43,39,33,.36);
  --hairline:rgba(43,39,33,.14);
  --earth:#9a6a3e;
  --font:"New York",Georgia,'Times New Roman',serif;
  --track-caps:.24em;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:transparent}
body{font-family:var(--font);color:var(--ink);-webkit-font-smoothing:antialiased}
button{font:inherit}
.wash{display:none}
.hero{width:100%;height:100%;display:grid;justify-items:center;align-content:center;padding:4px 6px}
.sb-hint{display:none}
.hero,.hero *{-webkit-user-select:none;-moz-user-select:none;user-select:none}
.hero img{-webkit-user-drag:none;user-drag:none}
.sb-wrap{display:grid;justify-items:center;gap:6px;width:100%;position:relative;z-index:2}

.sb-stage{display:flex;align-items:center;justify-content:center;width:100%;position:relative;touch-action:pan-y}
.sb-arrow{flex:none;display:inline-flex;align-items:center;justify-content:center;padding:6px 2px;
  border:0;background:transparent;color:var(--ink-faint);cursor:pointer;transition:color .2s;
  -webkit-tap-highlight-color:transparent;z-index:8}
.sb-arrow:hover{color:var(--ink)}
.sb-3d{position:relative;flex:1 1;min-width:0;max-width:100%;
  perspective:1500px;perspective-origin:50% 50%}
.sb-tilt{position:relative;transform-style:preserve-3d;
  transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--zoom,1));will-change:transform}
.sb-book{position:relative;width:100%;aspect-ratio:1760/790;transform-style:preserve-3d;z-index:1}
.sb-cast{position:absolute;pointer-events:none;z-index:0}
.sb-cast.ambient{left:1%;right:1%;top:4%;bottom:-12%;
  background:radial-gradient(50% 50% at 50% 58%,rgba(58,44,26,.34) 0%,rgba(58,44,26,.19) 40%,rgba(58,44,26,0) 74%);
  filter:blur(26px);opacity:calc(1 - var(--shade,0) * .42)}
.sb-cast.contact{left:5%;right:5%;top:62%;bottom:-9%;
  background:radial-gradient(50% 44% at 50% 42%,rgba(44,32,14,.40) 0%,rgba(44,32,14,.17) 48%,rgba(44,32,14,0) 78%);
  filter:blur(11px);opacity:calc(1 - var(--shade,0) * .5)}
.sb-cast.hair{left:9%;right:9%;top:84%;bottom:-4%;
  background:radial-gradient(50% 52% at 50% 40%,rgba(40,28,10,.34) 0%,rgba(40,28,10,0) 76%);
  filter:blur(4px);opacity:calc(1 - var(--shade,0) * .62)}
.sb-full{position:absolute;inset:0}
.sb-full img{width:100%;height:auto;display:block}
.sb-half{position:absolute;top:0;bottom:0;width:50%;overflow-x:clip;overflow-y:visible}
.sb-half.left{left:0}
.sb-half.right{left:50%}
.sb-half-img{width:200%;max-width:none;height:auto;display:block}
.sb-half-img.right{margin-left:-100%}
.gutter-shade{position:absolute;top:var(--pg,5.3%);bottom:var(--pg,5.3%);width:46%;
  pointer-events:none;opacity:calc(var(--shade,0) * .62);
  -webkit-mask-image:linear-gradient(180deg,transparent 0,#000 5.2%,#000 94.8%,transparent 100%);
  mask-image:linear-gradient(180deg,transparent 0,#000 5.2%,#000 94.8%,transparent 100%)}
.gutter-shade.left{right:0;background:linear-gradient(270deg,rgba(52,38,20,.30),rgba(52,38,20,0) 82%)}
.gutter-shade.right{left:0;background:linear-gradient(90deg,rgba(52,38,20,.24),rgba(52,38,20,0) 82%)}
.curl{position:absolute;top:0;height:100%;width:calc(var(--bw,0px) * var(--span));
  transform-style:preserve-3d;z-index:6}
.curl.next{left:50%;transform-origin:left center;transform:rotateY(calc(-1 * var(--tt,0deg)))}
.curl.prev{right:50%;transform-origin:right center;transform:rotateY(var(--tt,0deg))}
.strip{position:absolute;top:0;height:100%;
  width:calc(var(--bw,0px) * var(--span) / var(--n));transform-style:preserve-3d}
.curl.next .strip{transform-origin:left center}
.curl.prev .strip{transform-origin:right center}
.curl.next>.strip{left:0}
.curl.prev>.strip{right:0;left:auto}
.curl.next .strip .strip{left:100%;transform:rotateY(var(--td,0deg))}
.curl.prev .strip .strip{right:100%;transform:rotateY(calc(-1 * var(--td,0deg)))}
.face{position:absolute;top:0;bottom:0;left:0;right:-1.1px;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;
  background-repeat:no-repeat;background-size:var(--bw,0px) auto}
.face.back{transform:rotateY(180deg)}
.face .sh,.face .gl{
  -webkit-mask-image:linear-gradient(180deg,transparent 0,#000 5.2%,#000 94.8%,transparent 100%);
  mask-image:linear-gradient(180deg,transparent 0,#000 5.2%,#000 94.8%,transparent 100%)}
.strip.edge .face .sh,.strip.edge .face .gl{
  -webkit-mask-image:linear-gradient(180deg,transparent 0,#000 9%,#000 91%,transparent 100%),var(--hf);
  mask-image:linear-gradient(180deg,transparent 0,#000 9%,#000 91%,transparent 100%),var(--hf);
  -webkit-mask-composite:source-in;mask-composite:intersect}
.curl.next .strip.edge .face.front,.curl.prev .strip.edge .face.back{--hf:linear-gradient(90deg,#000 0 22%,transparent 96%)}
.curl.next .strip.edge .face.back,.curl.prev .strip.edge .face.front{--hf:linear-gradient(270deg,#000 0 22%,transparent 96%)}
.face .sh{position:absolute;left:0;right:0;top:var(--pg,5.3%);bottom:var(--pg,5.3%);pointer-events:none}
.curl.next .face.front .sh,.curl.prev .face.back .sh{background:linear-gradient(90deg,rgba(58,43,20,var(--a1,0)),rgba(58,43,20,var(--a2,0)))}
.curl.next .face.back .sh,.curl.prev .face.front .sh{background:linear-gradient(90deg,rgba(58,43,20,var(--a2,0)),rgba(58,43,20,var(--a1,0)))}
.face .gl{position:absolute;left:0;right:0;top:var(--pg,5.3%);bottom:var(--pg,5.3%);
  pointer-events:none;background:#fffaf0;
  opacity:calc(var(--shade,0) * var(--lit,1) * var(--lit,1) * .20)}
.loupe{position:absolute;left:0;top:0;width:var(--lr,270px);height:var(--lr,270px);
  pointer-events:none;z-index:80;opacity:0;transition:opacity .25s ease;will-change:transform}
.loupe.on{opacity:1}
.loupe.held .ring{cursor:grabbing}
.loupe .ring{position:absolute;inset:0;border-radius:50%;pointer-events:auto;cursor:grab;
  padding:calc(var(--lr,270px) * .058);
  box-shadow:0 1px 2px rgba(58,44,26,.30),0 10px 18px rgba(58,44,26,.24),
    0 26px 40px rgba(58,44,26,.20),0 48px 66px rgba(58,44,26,.13)}
.loupe .ring:before{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;
  background:linear-gradient(146deg,#fdf7e9 0%,#e6d7b4 14%,#b69d70 32%,#7d6740 50%,#cdbb92 66%,#f4ead3 80%,#9b8459 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.8),inset 0 -2px 3px rgba(70,52,26,.5);
  -webkit-mask-image:radial-gradient(circle closest-side at 50% 50%,transparent 0 88.2%,#000 89.8% 100%);
  mask-image:radial-gradient(circle closest-side at 50% 50%,transparent 0 88.2%,#000 89.8% 100%)}
.loupe .grip{position:absolute;left:50%;top:50%;
  width:calc(var(--lr,270px) * .74);height:calc(var(--lr,270px) * .125);
  transform-origin:0 50%;transform:rotate(40deg) translate(calc(var(--lr,270px) * .33),-50%);
  border-radius:calc(var(--lr,270px) * .06);pointer-events:auto;cursor:grab;
  background:linear-gradient(180deg,rgba(255,255,255,.46) 0 13%,rgba(255,255,255,0) 44%,rgba(0,0,0,.26) 100%),
    linear-gradient(90deg,#d9bd82 0 14%,#a9884e 14% 20%,#6d4c2b 20% 62%,#5a3d22 62% 92%,#7a563180 92% 100%);
  box-shadow:0 8px 15px rgba(58,44,26,.26),0 18px 26px rgba(58,44,26,.14)}
.lens{position:relative;display:block;width:100%;height:100%;border-radius:50%;
  background-repeat:no-repeat;overflow:hidden;
  box-shadow:inset 0 0 0 1px rgba(52,40,22,.55),inset 0 4px 12px rgba(40,30,14,.28),
    inset 0 -7px 16px rgba(255,250,240,.14)}
.lens .mag{display:none}
.zoomwrap{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2;opacity:0}
.zoominner{position:absolute;inset:0;transform-origin:0 0}
.lens:before,.lens:after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none}
.lens:before{z-index:1;background:radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 54%,rgba(58,44,26,.10) 76%,rgba(46,34,16,.34) 100%);
  box-shadow:inset 0 0 0 2px rgba(130,162,196,.26),inset 0 0 0 4px rgba(206,158,112,.15)}
.lens:after{z-index:2;background:
  radial-gradient(36% 26% at 29% 19%,rgba(255,255,255,.30),rgba(255,255,255,0) 76%),
  radial-gradient(24% 16% at 74% 86%,rgba(255,255,255,.12),rgba(255,255,255,0) 80%),
  linear-gradient(150deg,rgba(255,255,255,.06) 0 18%,rgba(255,255,255,0) 42%)}
.sb-tools{display:flex;align-items:center;gap:6px;border:1px solid var(--hairline);border-radius:999px;
  padding:5px 7px;background:rgba(250,246,238,.62);
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.tool{width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;
  border:0;border-radius:50%;background:transparent;color:var(--ink-soft);cursor:pointer;
  transition:background-color .18s ease,color .18s ease}
.tool:hover{background:rgba(255,252,244,.9);color:var(--ink)}
.tool[aria-pressed="true"]{background:rgba(154,106,62,.16);color:var(--earth)}
.tool:disabled{opacity:.32;cursor:default;background:transparent}
.tool svg{width:15px;height:15px;display:block}
.tool-sep{width:1px;height:17px;background:var(--hairline);margin:0 2px}
.zoom-read{font-size:11px;letter-spacing:.1em;color:var(--ink-faint);min-width:40px;text-align:center;font-variant-numeric:tabular-nums}
@media (pointer:coarse){.loupe{display:none}}
.sb-zone{position:absolute;top:0;bottom:0;border:0;background:transparent;cursor:grab;z-index:60;-webkit-tap-highlight-color:transparent}
.sb-zone:active{cursor:grabbing}
.sb-prev{left:0;width:50%}
.sb-next{right:0;width:50%}
.sb-captions{display:none}
.sb-captions>*{grid-area:1/1;margin:0}
.sb-caption{font-size:13px;letter-spacing:var(--track-caps);text-transform:uppercase;color:var(--ink-soft);
  animation:sb-cap-in .5s ease both}
.sb-caption.live{animation:none}
@keyframes sb-cap-in{0%{opacity:0}}
.sb-hint{margin:0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);transition:opacity .4s ease}
.sb-hint.gone{opacity:0}
.sb-wrap.intro .sb-full img,.sb-wrap.intro .sb-half-img{filter:url(#sb-mblur-1)}
.sb-wrap.intro.b2 .sb-full img,.sb-wrap.intro.b2 .sb-half-img{filter:url(#sb-mblur-2)}
.sb-wrap.intro .sb-caption{animation:none}
#plateList{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media(max-width:380px){
  .sb-wrap{gap:4px}
  .sb-arrow{padding:6px 0}
  .sb-arrow svg{width:10px;height:30px}
}
</style>
</head>
<body>
<div class="wash" aria-hidden="true"></div>
<section id="sketchbook" class="hero">
  <div class="sb-wrap" id="sbWrap">
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <filter id="sb-mblur-1"><feGaussianBlur stdDeviation="5 0"/></filter>
      <filter id="sb-mblur-2"><feGaussianBlur stdDeviation="14 0"/></filter>
    </svg>
    <div class="sb-stage" id="sbStage">
      <button class="sb-arrow left" id="sbLeft" aria-label="previous page">
        <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true"><polyline points="11,3 3,22 11,41" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="sb-3d" id="sb3d">
        <div class="sb-tilt" id="sbTilt">
          <div class="sb-cast ambient" aria-hidden="true"></div>
          <div class="sb-cast contact" aria-hidden="true"></div>
          <div class="sb-cast hair" aria-hidden="true"></div>
          <div class="sb-book" id="sbBook"></div>
        </div>
        <div class="zoomwrap" id="zoomWrap" aria-hidden="true"><div class="zoominner" id="zoomInner"></div></div>
        <div class="loupe" id="loupe"><span class="grip"></span><span class="ring"><span class="lens" id="loupeLens"><span class="mag" id="loupeMag"></span></span></span></div>
      </div>
      <button class="sb-arrow right" id="sbRight" aria-label="next page">
        <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true"><polyline points="3,3 11,22 3,41" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <div class="sb-captions" id="sbCaptions"></div>
    <div class="sb-tools" role="group" aria-label="view controls">
      <button class="tool" id="zOut" aria-label="zoom out"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8.6" cy="8.6" r="5.6"/><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8"/></svg></button>
      <span class="zoom-read" id="zRead">100%</span>
      <button class="tool" id="zIn" aria-label="zoom in"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8.6" cy="8.6" r="5.6"/><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8M8.6 6.2v4.8"/></svg></button>
      <span class="tool-sep" aria-hidden="true"></span>
      <button class="tool" id="loupeBtn" aria-label="magnifier" aria-pressed="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8.8" cy="8.8" r="5.8"/><path d="M13 13l4.4 4.4"/><path d="M6.4 7.2a3.2 3.2 0 0 1 2.4-1.4" opacity=".55"/></svg></button>
    </div>
    <p class="sb-hint" id="sbHint">Drag the page to turn &middot; Drag the glass across it</p>
    <ol id="plateList" aria-label="plates"></ol>
  </div>
</section>
<script>${js}</script>
</body></html>
`;
}
