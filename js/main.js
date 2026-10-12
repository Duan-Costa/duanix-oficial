/* =====================================================
   DUANIX | Tecnologia & Automação  -  main.js
   Efeitos do site: luzes do logo, fundo animado, texto digitado,
   menu, cards conectados e ligações entre as seções.
   ===================================================== */
(function(){
'use strict';

function $(s,c){return (c||document).querySelector(s)}
function $$(s,c){return [].slice.call((c||document).querySelectorAll(s))}
function safe(fn){try{fn()}catch(e){if(window.console)console.error(e)}}

var reduced=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var finePointer=!!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);
var header=$('#header'), hero=$('#inicio'), stage=$('#logoStage'), btn=$('#logoBtn');
var L=1;              // nivel de luz atual (0 apagado, 1 aceso), usado tambem pelo fundo
var introStarted=false;

/* ---------- 1. LUZES DO LOGO ---------- */
safe(function(){
  var timer=null, busy=false, pending=null, lastEnd=0;

  function setLit(v,tr){
    L=v;
    hero.style.setProperty('--lit',v);
    hero.style.setProperty('--t',(tr==null?40:tr)+'ms');
  }
  function surge(strong){
    stage.classList.remove('surge','surge-strong');
    void stage.offsetWidth;
    stage.classList.add(strong?'surge-strong':'surge');
    setTimeout(function(){stage.classList.remove('surge','surge-strong')},1100);
  }
  // cada passo: [luz, tempo parado (ms), transicao (ms), efeito opcional]
  var SEQ=reduced?{
    intro:[[.25,0,0],[1,400,600]],
    hover:[[.6,0,250],[1,300,400]],
    click:[[.1,0,300],[.1,500,0],[1,0,700]]
  }:{
    intro:[[0,300,0],[.6,70],[.05,110],[1,90,40,'soft'],[.35,80],[1,0,420]],
    hover:[[.2,90],[1,100],[.45,70],[1,0,260]],
    click:[[0,520,30],[.6,70],[.05,110],[1,90,40,'strong'],[.3,80],[1,0,420]]
  };
  function play(seq){
    clearTimeout(timer);
    busy=true;
    var i=0;
    (function step(){
      if(i>=seq.length){
        busy=false; lastEnd=Date.now();
        if(pending){var p=pending; pending=null; play(SEQ[p]);}
        return;
      }
      var s=seq[i++];
      setLit(s[0],s[2]);
      if(s[3]) surge(s[3]==='strong');
      timer=setTimeout(step,s[1]);
    })();
  }

  setLit(0,0);
  introStarted=true;
  setTimeout(function(){play(SEQ.intro)},reduced?200:900);

  stage.addEventListener('pointerenter',function(e){
    if(e.pointerType==='touch') return;
    if(busy||Date.now()-lastEnd<500) return;
    play(SEQ.hover);
  });
  btn.addEventListener('click',function(){
    if(busy){pending='click';return;}
    play(SEQ.click);
  });

  // inclina o logo na direcao do mouse
  if(finePointer&&!reduced){
    stage.addEventListener('pointermove',function(e){
      if(e.pointerType!=='mouse') return;
      var r=stage.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      btn.style.setProperty('--ry',(x*14).toFixed(2)+'deg');
      btn.style.setProperty('--rx',(-y*14).toFixed(2)+'deg');
    });
    stage.addEventListener('pointerleave',function(){
      btn.style.setProperty('--rx','0deg');
      btn.style.setProperty('--ry','0deg');
    });
  }
});
// garantia: se algo falhar, o logo nunca fica apagado
setTimeout(function(){ if(!introStarted) hero.style.setProperty('--lit',1); },7000);

/* ---------- 2. FUNDO: REDE DE PONTOS ---------- */
safe(function(){
  var c=$('#bg'); if(!c||!c.getContext) return;
  var ctx=c.getContext('2d'), w=0,h=0,nodes=[],mx=-9999,my=-9999,running=true,pulses=[],lastP=0;
  function size(){
    var compact=window.matchMedia('(max-width: 760px)').matches;
    var dpr=Math.min(window.devicePixelRatio||1,compact?1.5:2);
    w=window.innerWidth; h=window.innerHeight;
    c.width=w*dpr; c.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var n=compact?Math.max(20,Math.min(45,Math.round(w*h/30000))):Math.max(28,Math.min(90,Math.round(w*h/16000)));
    nodes=[];
    for(var i=0;i<n;i++) nodes.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:Math.random()*1.4+.6});
  }
  function draw(move){
    ctx.clearRect(0,0,w,h);
    var f=.5+.5*L, max=130, max2=max*max, i, j, a, n, m, dx, dy, d2;
    for(i=0;i<nodes.length;i++){
      n=nodes[i];
      if(move){
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0)n.x=w; else if(n.x>w)n.x=0;
        if(n.y<0)n.y=h; else if(n.y>h)n.y=0;
      }
    }
    ctx.lineWidth=1;
    for(i=0;i<nodes.length;i++){
      n=nodes[i];
      for(j=i+1;j<nodes.length;j++){
        m=nodes[j]; dx=n.x-m.x; dy=n.y-m.y; d2=dx*dx+dy*dy;
        if(d2<max2){
          a=(1-d2/max2)*.4*f;
          ctx.strokeStyle='rgba(47,123,255,'+a.toFixed(3)+')';
          ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(m.x,m.y); ctx.stroke();
        }
      }
      dx=n.x-mx; dy=n.y-my; d2=dx*dx+dy*dy;
      if(d2<28900){
        a=(1-Math.sqrt(d2)/170)*.55*f;
        ctx.strokeStyle='rgba(34,211,238,'+a.toFixed(3)+')';
        ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(mx,my); ctx.stroke();
      }
    }
    if(move&&Date.now()-lastP>380&&pulses.length<9){
      lastP=Date.now();
      var p0=nodes[(Math.random()*nodes.length)|0], cand=[];
      for(j=0;j<nodes.length;j++){ m=nodes[j]; if(m===p0) continue; dx=p0.x-m.x; dy=p0.y-m.y; if(dx*dx+dy*dy<max2) cand.push(m); }
      if(cand.length) pulses.push({a:p0,b:cand[(Math.random()*cand.length)|0],t:0});
    }
    for(i=pulses.length-1;i>=0;i--){
      var q=pulses[i]; if(move) q.t+=.02;
      if(q.t>=1){pulses.splice(i,1);continue;}
      var px=q.a.x+(q.b.x-q.a.x)*q.t, py=q.a.y+(q.b.y-q.a.y)*q.t, al=Math.sin(q.t*3.1416)*f;
      ctx.fillStyle='rgba(34,211,238,'+(.2*al).toFixed(3)+')'; ctx.beginPath(); ctx.arc(px,py,7,0,6.2832); ctx.fill();
      ctx.fillStyle='rgba(190,240,255,'+(.95*al).toFixed(3)+')'; ctx.beginPath(); ctx.arc(px,py,2,0,6.2832); ctx.fill();
    }
    ctx.fillStyle='rgba(120,190,255,'+(.8*f).toFixed(3)+')';
    for(i=0;i<nodes.length;i++){
      n=nodes[i]; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,6.2832); ctx.fill();
    }
  }
  function loop(){ if(!running) return; draw(true); requestAnimationFrame(loop); }
  size();
  window.addEventListener('resize',function(){size(); if(reduced) draw(false);});
  window.addEventListener('pointermove',function(e){
    if(e.pointerType!=='mouse') return;
    mx=e.clientX;my=e.clientY;
  },{passive:true});
  document.addEventListener('pointerleave',function(){mx=my=-9999});
  document.addEventListener('visibilitychange',function(){
    running=!document.hidden;
    if(running&&!reduced) loop();
  });
  if(reduced) draw(false); else loop();
});

/* ---------- 3. TEXTO DIGITADO ---------- */
safe(function(){
  var el=$('#typed'); if(!el||reduced) return;
  var words=['sites profissionais','landing pages','e-commerces','automações','soluções com IA','aplicativos'];
  var wi=0, ci=words[0].length, del=false;
  function tick(){
    var w=words[wi];
    if(!del){
      ci++; el.textContent=w.slice(0,ci);
      if(ci>=w.length){del=true; return setTimeout(tick,1800);}
      return setTimeout(tick,70);
    }
    ci--; el.textContent=w.slice(0,ci);
    if(ci<=0){del=false; wi=(wi+1)%words.length; return setTimeout(tick,300);}
    setTimeout(tick,35);
  }
  setTimeout(function(){del=true; tick();},2600);
});

/* ---------- 4. MENU: ITEM ATIVO, INDICADOR E CELULAR ---------- */
safe(function(){
  var links=$$('.menu a'), pill=$('.pill'), burger=$('#burger');
  var secs=links.map(function(a){return $(a.getAttribute('href'))});
  var current=-1, ticking=false;

  function movePill(a){
    if(!a||!pill) return;
    pill.style.width=a.offsetWidth+'px';
    pill.style.transform='translateX('+a.offsetLeft+'px)';
    pill.classList.add('ready');
  }
  function update(){
    ticking=false;
    var y=window.scrollY+window.innerHeight*.35, idx=0, i;
    for(i=0;i<secs.length;i++){
      if(secs[i].getBoundingClientRect().top+window.scrollY<=y) idx=i;
    }
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4) idx=secs.length-1;
    if(idx!==current){
      current=idx;
      links.forEach(function(a,k){
        a.classList.toggle('active',k===idx);
        if(k===idx) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
      });
      movePill(links[idx]);
    }
    header.classList.toggle('scrolled',window.scrollY>12);
  }
  function onScroll(){ if(!ticking){ticking=true; requestAnimationFrame(update);} }
  function closeMenu(){
    header.classList.remove('open');
    burger.setAttribute('aria-expanded','false');
    burger.setAttribute('aria-label','Abrir menu');
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){movePill(links[current]); update();});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){movePill(links[current])});
  update();

  burger.addEventListener('click',function(){
    var open=header.classList.toggle('open');
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  });
  $('#menu').addEventListener('click',function(e){
    if(e.target.closest&&e.target.closest('a')){
      closeMenu();
    }
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') closeMenu();
  });
});

/* ---------- 5. APARECER AO ROLAR + BRILHO NOS CARDS ---------- */
safe(function(){
  $$('.grid').forEach(function(g){
    $$(':scope>.reveal',g).forEach(function(c,i){c.style.setProperty('--d',(i*80)+'ms')});
  });
  if(!('IntersectionObserver' in window)){
    $$('.reveal,.observe').forEach(function(el){el.classList.add('in')});
    return;
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(!en.isIntersecting) return;
      var el=en.target;
      el.classList.add('in');
      io.unobserve(el);
      setTimeout(function(){el.style.removeProperty('--d')},1500);
    });
  },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  $$('.reveal,.observe').forEach(function(el){io.observe(el)});

  document.addEventListener('pointermove',function(e){
    var card=e.target.closest&&e.target.closest('.card');
    if(!card) return;
    var r=card.getBoundingClientRect();
    card.style.setProperty('--mx',(e.clientX-r.left)+'px');
    card.style.setProperty('--my',(e.clientY-r.top)+'px');
  },{passive:true});
});

/* ---------- 6. FORMULARIO E RODAPE ---------- */
safe(function(){
  $('#ano').textContent = new Date().getFullYear();

  $('#form').addEventListener('submit', async function(e){
    e.preventDefault();

    var form = $('#form');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var botao = form.querySelector('button[type="submit"]');
    var textoOriginal = botao.textContent;

    botao.disabled = true;
    botao.textContent = 'Enviando...';

    var dados = {
      nome: $('#nome').value.trim(),
      telefone: $('#telefone').value.trim(),
      email: $('#email').value.trim(),
      servico: $('#servico').value || 'Não informado',
      mensagem: $('#msg').value.trim() || 'Não informada',
      _subject: 'Pedido de orçamento pelo site Duanix',
      _template: 'table',
      _captcha: 'false'
    };

    try {
      var resposta = await fetch(
        'https://formsubmit.co/ajax/duanixdigital@gmail.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(dados)
        }
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível enviar o formulário.');
      }

      var resultado = await resposta.json();

      if (resultado.success !== 'true' && resultado.success !== true) {
        throw new Error(
          typeof resultado.message === 'string'
            ? resultado.message
            : 'O serviço não confirmou o envio.'
        );
      }

      alert('Pedido enviado! Obrigado por entrar em contato com a Duanix.');

      form.reset();

    } catch (erro) {
      alert(
        'Não foi possível enviar agora. Tente novamente ou entre em contato pelo WhatsApp.'
      );
      console.error('Erro no formulário:', erro);

    } finally {
      botao.disabled = false;
      botao.textContent = textoOriginal;
    }
  });
});

/* ---------- CARDS CONECTADOS (computador/tablet) ---------- */
safe(function(){
  var grid=document.querySelector('.grid.g4'); if(!grid) return;
  var NS='http://www.w3.org/2000/svg', svg=null;
  function build(){
    if(svg){svg.remove(); svg=null;}
    var cards=[].slice.call(grid.querySelectorAll('.card')); if(cards.length<2) return;
    svg=document.createElementNS(NS,'svg');
    svg.setAttribute('class','net'); svg.setAttribute('aria-hidden','true');
    svg.setAttribute('width',grid.offsetWidth); svg.setAttribute('height',grid.offsetHeight);
    var R=cards.map(function(c){return {l:c.offsetLeft,t:c.offsetTop,r:c.offsetLeft+c.offsetWidth,b:c.offsetTop+c.offsetHeight,cx:c.offsetLeft+c.offsetWidth/2,cy:c.offsetTop+c.offsetHeight/2};});
    function add(d,pts){
      var b=document.createElementNS(NS,'path'); b.setAttribute('d',d); b.setAttribute('class','base'); svg.appendChild(b);
      var r=document.createElementNS(NS,'path'); r.setAttribute('d',d); r.setAttribute('class','run'); r.setAttribute('pathLength','100'); svg.appendChild(r);
      pts.forEach(function(p){var c=document.createElementNS(NS,'circle'); c.setAttribute('cx',p[0]); c.setAttribute('cy',p[1]); c.setAttribute('r',4); svg.appendChild(c);});
    }
    for(var i=0;i<R.length-1;i++){
      var a=R[i], b=R[i+1], d, pts;
      if(Math.abs(a.t-b.t)<6){
        d='M'+a.r+' '+a.cy+' L'+b.l+' '+b.cy; pts=[[a.r,a.cy],[b.l,b.cy]];
      }else{
        var my=(a.b+b.t)/2;
        d='M'+a.cx+' '+a.b+' L'+a.cx+' '+my+' L'+b.cx+' '+my+' L'+b.cx+' '+b.t; pts=[[a.cx,a.b],[b.cx,b.t]];
      }
      add(d,pts);
    }
    grid.appendChild(svg);
    grid.classList.add('has-net');
    var s2=svg;
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ setTimeout(function(){s2.classList.add('on')},500); io.disconnect(); } },{threshold:.15});
      io.observe(grid);
    }else{ s2.classList.add('on'); }
  }
  var t=null;
  function later(){clearTimeout(t); t=setTimeout(build,120);}
  window.addEventListener('resize',later);
  window.addEventListener('load',later);
  if(window.ResizeObserver) new ResizeObserver(later).observe(grid);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(later);
  build();
});

/* ---------- LIGACAO: ICONES DO TOPO -> BOTAO -> CARDS ---------- */
safe(function(){
  var main=document.querySelector('main'); if(!main) return;
  var NS='http://www.w3.org/2000/svg', svg=null, shown=false;
  function pos(el){
    var x=0,y=0,e=el;
    while(e&&e!==main){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent;}
    return {l:x,t:y,w:el.offsetWidth,h:el.offsetHeight};
  }
  function build(){
    if(svg){svg.remove(); svg=null;}
    var row=document.querySelector('.svc-row'), lead=document.querySelector('.hero .lead'),
        cta=document.querySelector('#servicos .cta-pill'), card=document.querySelector('#servicos .card');
    if(!row||!cta||!card) return;
    var R=pos(row), L=lead?pos(lead):null, C=pos(cta), K=pos(card);
    var cx=R.l+R.w/2;
    svg=document.createElementNS(NS,'svg');
    svg.setAttribute('class','net2'); svg.setAttribute('aria-hidden','true');
    svg.setAttribute('width',main.offsetWidth); svg.setAttribute('height',main.offsetHeight);
    function add(d,pts){
      var b=document.createElementNS(NS,'path'); b.setAttribute('d',d); b.setAttribute('class','base'); svg.appendChild(b);
      var r=document.createElementNS(NS,'path'); r.setAttribute('d',d); r.setAttribute('class','run'); r.setAttribute('pathLength','100'); svg.appendChild(r);
      pts.forEach(function(p){var c=document.createElementNS(NS,'circle'); c.setAttribute('cx',p[0]); c.setAttribute('cy',p[1]); c.setAttribute('r',4); svg.appendChild(c);});
    }
    var y0=R.t+R.h+4, y1, ccx=C.l+C.w/2;
    if(L){
      y1=L.t-6;
      if(y1>y0+8) add('M'+cx+' '+y0+' L'+cx+' '+y1,[[cx,y0],[cx,y1]]);
      y0=L.t+L.h+6;
    }
    var y2=C.t-4;
    if(y2>y0+8){
      if(Math.abs(cx-ccx)<2) add('M'+cx+' '+y0+' L'+cx+' '+y2,[[cx,y0],[cx,y2]]);
      else{var m=(y0+y2)/2; add('M'+cx+' '+y0+' L'+cx+' '+m+' L'+ccx+' '+m+' L'+ccx+' '+y2,[[cx,y0],[ccx,y2]]);}
    }
    var y3=C.t+C.h+4, y4=K.t-4, kcx=K.l+K.w/2;
    if(y4>y3+8){
      if(Math.abs(ccx-kcx)<2) add('M'+ccx+' '+y3+' L'+ccx+' '+y4,[[ccx,y3],[ccx,y4]]);
      else{var m2=(y3+y4)/2; add('M'+ccx+' '+y3+' L'+ccx+' '+m2+' L'+kcx+' '+m2+' L'+kcx+' '+y4,[[ccx,y3],[kcx,y4]]);}
    }
    main.appendChild(svg);
    if(shown) svg.classList.add('on');
  }
  var t=null;
  function later(){clearTimeout(t); t=setTimeout(build,120);}
  window.addEventListener('resize',later);
  window.addEventListener('load',later);
  if(window.ResizeObserver) new ResizeObserver(later).observe(main);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(later);
  build();
  setTimeout(function(){shown=true; if(svg) svg.classList.add('on');},2600);
});

})();
